import { useState, useMemo, useCallback, useEffect } from "react"
import { type Address, encodeFunctionData, parseUnits } from "viem"
import { useAccount, useSimulateContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi"
import { CONTRACTS_ADDRESS } from "../../config/contractsAddress"
import { POSITION_MANAGER_ABI } from "../../config/abis/positionManagerABI"
import type { Position, usePositionDatas } from "./usePositionDatas"
import type { Pool } from "../../pages/PoolPage/page"

interface UseDecreasePositionParams {
  position: Position
  pool: Pool
  isModalOpen: boolean
  posData: ReturnType<typeof usePositionDatas>
}

interface ValidationError {
  field: 'percentage' | 'general'
  message: string
}

export const useDecreasePosition = ({ position, pool, posData, isModalOpen }: UseDecreasePositionParams) => {
  const { address } = useAccount()

  // Form state
  const [percentage, setPercentageState] = useState<number>(0)
  const [slippageTolerance, setSlippageToleranceState] = useState<number>(3.0)

  // Reset form when modal closes
  useEffect(() => {
    if (!isModalOpen) {
      setPercentageState(0)
      setSlippageToleranceState(3.0)
    }
  }, [isModalOpen])

  // Calculate liquidity to withdraw
  const liquidityToWithdraw = useMemo(() => {
    if (percentage === 0) return 0n
    const totalLiquidity = BigInt(position.liquidity)
    return (totalLiquidity * BigInt(percentage)) / 100n
  }, [percentage, position.liquidity])

  // Estimate amounts to receive (simplified calculation)
  const estimatedAmounts = useMemo(() => {
    if (percentage === 0 || !posData.positionDetails?.token0Amount || !posData.positionDetails?.token1Amount) {
      return { token0Amount: 0n, token1Amount: 0n }
    }

    // Simplified estimation based on deposited amounts and percentage
    // In a real implementation, this would need price calculation
    const token0Deposited = parseUnits(posData.positionDetails.token0Amount, pool.token0Ref.decimals)
    const token1Deposited = parseUnits(posData.positionDetails.token1Amount, pool.token1Ref.decimals)

    const token0Amount = (token0Deposited * BigInt(percentage)) / 100n
    const token1Amount = (token1Deposited * BigInt(percentage)) / 100n

    return { token0Amount, token1Amount }
  }, [percentage, posData.positionDetails, pool.token0Ref.decimals, pool.token1Ref.decimals])

  // Validation
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

    // Check if position has liquidity
    if (BigInt(position.liquidity) === 0n) {
      errors.push({ field: 'general', message: 'Position has no liquidity to withdraw' })
    }

    return errors
  }, [address, percentage, position.owner, position.liquidity])

  const canSubmit = validationErrors.length === 0 && percentage > 0

  // Prepare multicall data
  const multicallData = useMemo(() => {
    if (!canSubmit || liquidityToWithdraw === 0n) return undefined

    // Calculate slippage amounts
    const slippageMultiplier = BigInt(Math.floor((100 - slippageTolerance) * 100))
    const amount0Min = (estimatedAmounts.token0Amount * slippageMultiplier) / 10000n
    const amount1Min = (estimatedAmounts.token1Amount * slippageMultiplier) / 10000n

    // Encode decreaseLiquidity call
    const decreaseLiquidityData = encodeFunctionData({
      abi: POSITION_MANAGER_ABI,
      functionName: 'decreaseLiquidity',
      args: [{
        tokenId: BigInt(position.tokenId),
        liquidity: liquidityToWithdraw,
        amount0Min,
        amount1Min,
        deadline: BigInt(Math.floor(Date.now() / 1000) + 1200) // 20 minutes
      }]
    })

    // Encode collect call
    const collectData = encodeFunctionData({
      abi: POSITION_MANAGER_ABI,
      functionName: 'collect',
      args: [{
        tokenId: BigInt(position.tokenId),
        recipient: address as Address,
        amount0Max: BigInt("340282366920938463463374607431768211455"), // type(uint128).max
        amount1Max: BigInt("340282366920938463463374607431768211455")  // type(uint128).max
      }]
    })

    return [decreaseLiquidityData, collectData]
  }, [canSubmit, liquidityToWithdraw, estimatedAmounts, slippageTolerance, position.tokenId, address])

  // Decrease + Collect Simulation
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

  // Execute Decrease + Collect
  const { data: decreaseHash, writeContract: decreaseLiquidity, isPending: isDecreasing, error: decreaseError, reset: resetDecrease } = useWriteContract()
  const { data: decreaseReceipt, isLoading: waitingDecreaseReceipt } = useWaitForTransactionReceipt({
    hash: decreaseHash
  })

  const handleDecreaseLiquidity = useCallback(() => {
    if (!decreaseConfig?.request) return
    decreaseLiquidity(decreaseConfig.request)
  }, [decreaseConfig, decreaseLiquidity])

  // Utility functions
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

  // Status for UI
  const status = useMemo(() => {
    if (waitingDecreaseReceipt) return 'waitingDecrease'
    if (isDecreasing) return 'decreasing'
    if (isSimulating) return 'simulating'
    if (decreaseReceipt) return 'success'
    return 'idle'
  }, [
    waitingDecreaseReceipt,
    isDecreasing,
    isSimulating,
    decreaseReceipt
  ])

  return {
    // Form state
    percentage,
    slippageTolerance,
    liquidityToWithdraw,
    estimatedAmounts,

    // Validation
    validationErrors,
    canSubmit,

    // Status
    status,
    isLoading: status !== 'idle' && status !== 'success',
    isSuccess: status === 'success',

    // Actions
    setPercentage,
    setSlippageTolerance,
    decreaseLiquidity: handleDecreaseLiquidity,
    reset,

    // Transaction data
    decreaseHash,
    decreaseReceipt,

    // Errors
    errors: {
      simulate: simulateError,
      decrease: decreaseError,
    },

    // Capabilities
    canDecrease: !!decreaseConfig?.request,
  }
}