import { useState, useMemo, useCallback, useEffect } from "react"
import { type Address, encodeFunctionData } from "viem"
import { useAccount, useSimulateContract, useWriteContract, useWaitForTransactionReceipt, useReadContract, usePublicClient } from "wagmi"
import { CONTRACTS_ADDRESS } from "../../config/contractsAddress"
import { POSITION_MANAGER_ABI } from "../../config/abis/positionManagerABI"
import type { Position } from "./usePositionDatas"
import type { Pool } from "../../pages/PoolPage/page"

interface UseDecreasePositionParams {
  position: Position
  pool: Pool
  isModalOpen: boolean
}

interface ValidationError {
  field: 'percentage' | 'general'
  message: string
}

export const useDecreasePosition = ({ position, pool, isModalOpen }: UseDecreasePositionParams) => {
  const { address } = useAccount()
  const publicClient = usePublicClient()

  const { data: freshPositionData, refetch: refetchPosition } = useReadContract({
    address: CONTRACTS_ADDRESS.positionManager,
    abi: POSITION_MANAGER_ABI,
    functionName: 'positions',
    args: [BigInt(position.tokenId)],
    query: {
      enabled: isModalOpen,
      refetchInterval: false,
      refetchOnWindowFocus: false,
    }
  })

  const currentLiquidity = useMemo(() => {
    if (freshPositionData && Array.isArray(freshPositionData)) {
      return freshPositionData[7] as bigint
    }
    return BigInt(position.liquidity)
  }, [freshPositionData, position.liquidity])

  const [percentage, setPercentageState] = useState<number>(0)
  const [slippageTolerance, setSlippageToleranceState] = useState<number>(3.0)

  useEffect(() => {
    if (!isModalOpen) {
      setPercentageState(0)
      setSlippageToleranceState(3.0)
    }
  }, [isModalOpen])

  useEffect(() => {
    if (isModalOpen) {
      refetchPosition()
    }
  }, [isModalOpen, refetchPosition])

  const liquidityToWithdraw = useMemo(() => {
    if (percentage === 0) return 0n
    return (currentLiquidity * BigInt(percentage)) / 100n
  }, [percentage, currentLiquidity])

  const [exactAmounts, setExactAmounts] = useState<{ token0Amount: bigint, token1Amount: bigint }>({
    token0Amount: 0n,
    token1Amount: 0n
  })

  useEffect(() => {
    const simulateDecrease = async () => {
      if (!publicClient || !address || liquidityToWithdraw === 0n) {
        setExactAmounts({ token0Amount: 0n, token1Amount: 0n })
        return
      }

      try {
        const result = await publicClient.simulateContract({
          address: CONTRACTS_ADDRESS.positionManager,
          abi: POSITION_MANAGER_ABI,
          functionName: 'decreaseLiquidity',
          args: [{
            tokenId: BigInt(position.tokenId),
            liquidity: liquidityToWithdraw,
            amount0Min: 0n,
            amount1Min: 0n,
            deadline: BigInt(Math.floor(Date.now() / 1000) + 1200)
          }],
          account: address
        })

        if (result.result && Array.isArray(result.result)) {
          setExactAmounts({
            token0Amount: result.result[0] as bigint,
            token1Amount: result.result[1] as bigint
          })
        }
      } catch (error) {
        console.error('Failed to simulate decreaseLiquidity:', error)
        setExactAmounts({ token0Amount: 0n, token1Amount: 0n })
      }
    }

    simulateDecrease()
  }, [publicClient, address, liquidityToWithdraw, position.tokenId])

  const estimatedAmounts = exactAmounts
  const validationErrors = useMemo((): ValidationError[] => {
    const errors: ValidationError[] = []

    if (!address) {
      errors.push({ field: 'general', message: 'Please connect your wallet' })
      return errors
    }

    if (percentage === 0) {
      errors.push({ field: 'percentage', message: 'Select percentage to withdraw' })
      return errors
    }

    if (percentage < 0 || percentage > 100) {
      errors.push({ field: 'percentage', message: 'Percentage must be between 0 and 100' })
      return errors
    }

    // Check if position belongs to user
    if (position.owner?.toLowerCase() !== address?.toLowerCase()) {
      errors.push({ field: 'general', message: 'Position does not belong to you' })
    }

    if (currentLiquidity === 0n) {
      errors.push({ field: 'general', message: 'Position has no liquidity to withdraw' })
    }

    return errors
  }, [address, percentage, position.owner, currentLiquidity])

  const canSubmit = validationErrors.length === 0 && percentage > 0

  const multicallData = useMemo(() => {
    if (!canSubmit || liquidityToWithdraw === 0n) return undefined

    const slippageMultiplier = BigInt(Math.floor((100 - slippageTolerance) * 100))
    const amount0Min = (exactAmounts.token0Amount * slippageMultiplier) / 10000n
    const amount1Min = (exactAmounts.token1Amount * slippageMultiplier) / 10000n

    console.log('🔍 Decrease position:', {
      percentage,
      liquidityToWithdraw: liquidityToWithdraw.toString(),
      currentLiquidity: currentLiquidity.toString(),
      cachedLiquidity: position.liquidity,
      exactToken0Amount: exactAmounts.token0Amount.toString(),
      exactToken1Amount: exactAmounts.token1Amount.toString(),
      amount0Min: amount0Min.toString(),
      amount1Min: amount1Min.toString(),
      slippageTolerance
    })

    const decreaseLiquidityData = encodeFunctionData({
      abi: POSITION_MANAGER_ABI,
      functionName: 'decreaseLiquidity',
      args: [{
        tokenId: BigInt(position.tokenId),
        liquidity: liquidityToWithdraw,
        amount0Min,
        amount1Min,
        deadline: BigInt(Math.floor(Date.now() / 1000) + 1200)
      }]
    })

    const collectData = encodeFunctionData({
      abi: POSITION_MANAGER_ABI,
      functionName: 'collect',
      args: [{
        tokenId: BigInt(position.tokenId),
        recipient: address as Address,
        amount0Max: BigInt("340282366920938463463374607431768211455"),
        amount1Max: BigInt("340282366920938463463374607431768211455")
      }]
    })

    return [decreaseLiquidityData, collectData]
  }, [canSubmit, liquidityToWithdraw, exactAmounts, slippageTolerance, position.tokenId, address, percentage, currentLiquidity])

  const { data: decreaseConfig, isLoading: isSimulating, error: simulateError } = useSimulateContract({
    address: CONTRACTS_ADDRESS.positionManager,
    abi: POSITION_MANAGER_ABI,
    functionName: "multicall",
    args: multicallData ? [multicallData] : undefined,
    query: {
      enabled: canSubmit && !!multicallData,
      retry: false
    }
  })

  const { data: decreaseHash, writeContract: decreaseLiquidity, isPending: isDecreasing, error: decreaseError, reset: resetDecrease } = useWriteContract()
  const { data: decreaseReceipt, isLoading: waitingDecreaseReceipt } = useWaitForTransactionReceipt({
    hash: decreaseHash
  })

  const handleDecreaseLiquidity = useCallback(() => {
    if (!decreaseConfig?.request) return
    decreaseLiquidity(decreaseConfig.request)
  }, [decreaseConfig, decreaseLiquidity])

  const setPercentage = useCallback((newPercentage: number) => {
    setPercentageState(Math.max(0, Math.min(100, newPercentage)))
  }, [])

  const setSlippageTolerance = useCallback((tolerance: number) => {
    setSlippageToleranceState(tolerance)
  }, [])

  const reset = useCallback(() => {
    resetDecrease()
    setPercentageState(0)
    setSlippageToleranceState(3.0)
  }, [resetDecrease])

  const status = useMemo(() => {
    if (waitingDecreaseReceipt) return 'waitingDecrease'
    if (isDecreasing) return 'decreasing'
    if (isSimulating) return 'simulating'
    if (decreaseReceipt) return 'success'
    return 'idle'
  }, [waitingDecreaseReceipt, isDecreasing, isSimulating, decreaseReceipt])

  return {
    percentage,
    slippageTolerance,
    liquidityToWithdraw,
    estimatedAmounts,
    validationErrors,
    canSubmit,
    status,
    isLoading: status !== 'idle' && status !== 'success',
    isSuccess: status === 'success',
    setPercentage,
    setSlippageTolerance,
    decreaseLiquidity: handleDecreaseLiquidity,
    reset,
    decreaseHash,
    decreaseReceipt,
    errors: {
      simulate: simulateError,
      decrease: decreaseError,
    },
    canDecrease: !!decreaseConfig?.request,
  }
}