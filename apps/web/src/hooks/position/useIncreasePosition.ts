import { useState, useMemo, useCallback, useEffect } from "react"
import { erc20Abi, type Address } from "viem"
import { useAccount, useReadContracts, useSimulateContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi"
import { CONTRACTS_ADDRESS } from "../../config/contractsAddress"
import { POSITION_MANAGER_ABI } from "../../config/abis/positionManagerABI"
import type { Position } from "./usePositionDatas"
import type { Pool } from "../../pages/PoolPage/page"

interface UseIncreasePositionParams {
  position: Position
  pool: Pool
  isModalOpen: boolean
}


interface ValidationError {
  field: 'token0' | 'token1' | 'general'
  message: string
}

export const useIncreasePosition = ({ position, pool, isModalOpen }: UseIncreasePositionParams) => {
  const { address } = useAccount()

  // Form state - storing as strings for bigint amounts
  const [token0AmountString, setToken0AmountString] = useState<string>('0')
  const [token1AmountString, setToken1AmountString] = useState<string>('0')
  const [slippageTolerance, setSlippageToleranceState] = useState<number>(3.0)

  // Reset form when modal closes
  useEffect(() => {
    if (!isModalOpen) {
      setToken0AmountString('0')
      setToken1AmountString('0')
      setSlippageToleranceState(0.5)
    }
  }, [isModalOpen])

  // Token addresses
  const token0Address = pool.token0Ref.id as Address
  const token1Address = pool.token1Ref.id as Address

  // Get user balances
  const { data: balances, refetch: refetchBalances } = useReadContracts({
    contracts: [
      {
        address: token0Address,
        abi: erc20Abi,
        functionName: "balanceOf",
        args: address ? [address] : undefined,
      },
      {
        address: token1Address,
        abi: erc20Abi,
        functionName: "balanceOf",
        args: address ? [address] : undefined
      }
    ],
    query: { enabled: !!address }
  })

  const token0Balance = balances?.[0].status === "success" ? balances[0].result : 0n
  const token1Balance = balances?.[1].status === "success" ? balances[1].result : 0n

  // Get allowances
  const { data: allowances, refetch: refetchAllowances } = useReadContracts({
    contracts: [
      {
        address: token0Address,
        abi: erc20Abi,
        functionName: "allowance",
        args: address ? [address, CONTRACTS_ADDRESS.positionManager] : undefined,
      },
      {
        address: token1Address,
        abi: erc20Abi,
        functionName: "allowance",
        args: address ? [address, CONTRACTS_ADDRESS.positionManager] : undefined
      }
    ],
    query: { enabled: !!address }
  })

  const token0Allowance = allowances?.[0].status === "success" ? allowances[0].result : 0n
  const token1Allowance = allowances?.[1].status === "success" ? allowances[1].result : 0n

  // Get token prices for 50/50 ratio calculation
  const token0PriceUSD = useMemo(() => {
    return parseFloat(pool.token0Ref.tokenDayData?.items?.[0]?.priceUSD || "0")
  }, [pool.token0Ref.tokenDayData])

  const token1PriceUSD = useMemo(() => {
    return parseFloat(pool.token1Ref.tokenDayData?.items?.[0]?.priceUSD || "0")
  }, [pool.token1Ref.tokenDayData])

  // Calculate token amounts for 50/50 ratio
  const calculateToken1FromToken0 = useCallback((token0Amount: string): string => {
    if (!token0Amount || token0Amount === '0' || token0PriceUSD === 0 || token1PriceUSD === 0) {
      return '0'
    }

    try {
      const token0AmountBigInt = BigInt(token0Amount)
      const token0Decimals = pool.token0Ref.decimals
      const token1Decimals = pool.token1Ref.decimals

      // Convert token0 amount to USD value
      const token0ValueUSD = Number(token0AmountBigInt) / Math.pow(10, token0Decimals) * token0PriceUSD

      // Calculate equivalent token1 amount for same USD value
      const token1AmountFloat = token0ValueUSD / token1PriceUSD
      const token1AmountBigInt = BigInt(Math.floor(token1AmountFloat * Math.pow(10, token1Decimals)))

      return token1AmountBigInt.toString()
    } catch (error) {
      console.error('Error calculating token1 from token0:', error)
      return '0'
    }
  }, [token0PriceUSD, token1PriceUSD, pool.token0Ref.decimals, pool.token1Ref.decimals])

  const calculateToken0FromToken1 = useCallback((token1Amount: string): string => {
    if (!token1Amount || token1Amount === '0' || token0PriceUSD === 0 || token1PriceUSD === 0) {
      return '0'
    }

    try {
      const token1AmountBigInt = BigInt(token1Amount)
      const token0Decimals = pool.token0Ref.decimals
      const token1Decimals = pool.token1Ref.decimals

      // Convert token1 amount to USD value
      const token1ValueUSD = Number(token1AmountBigInt) / Math.pow(10, token1Decimals) * token1PriceUSD

      // Calculate equivalent token0 amount for same USD value
      const token0AmountFloat = token1ValueUSD / token0PriceUSD
      const token0AmountBigInt = BigInt(Math.floor(token0AmountFloat * Math.pow(10, token0Decimals)))

      return token0AmountBigInt.toString()
    } catch (error) {
      console.error('Error calculating token0 from token1:', error)
      return '0'
    }
  }, [token0PriceUSD, token1PriceUSD, pool.token0Ref.decimals, pool.token1Ref.decimals])

  // Parse amounts from bigint strings
  const parsedToken0Amount = useMemo(() => {
    try {
      return BigInt(token0AmountString || '0')
    } catch {
      return 0n
    }
  }, [token0AmountString])

  const parsedToken1Amount = useMemo(() => {
    try {
      return BigInt(token1AmountString || '0')
    } catch {
      return 0n
    }
  }, [token1AmountString])

  // Check if approvals are needed
  const token0NeedsApproval = useMemo(() => {
    if (parsedToken0Amount === 0n) return false
    return token0Allowance < parsedToken0Amount * 105n / 100n // 5% buffer
  }, [token0Allowance, parsedToken0Amount])

  const token1NeedsApproval = useMemo(() => {
    if (parsedToken1Amount === 0n) return false
    return token1Allowance < parsedToken1Amount * 105n / 100n // 5% buffer
  }, [token1Allowance, parsedToken1Amount])

  // Validation
  const validationErrors = useMemo((): ValidationError[] => {
    const errors: ValidationError[] = []

    if (!address) {
      errors.push({ field: 'general', message: 'Please connect your wallet' })
      return errors
    }

    if (parsedToken0Amount === 0n && parsedToken1Amount === 0n) {
      errors.push({ field: 'general', message: 'Enter token amounts' })
      return errors
    }

    if (parsedToken0Amount > token0Balance) {
      errors.push({
        field: 'token0',
        message: `Insufficient ${pool.token0Ref.symbol} balance`
      })
    }

    if (parsedToken1Amount > token1Balance) {
      errors.push({
        field: 'token1',
        message: `Insufficient ${pool.token1Ref.symbol} balance`
      })
    }

    // Check if position belongs to user
    if (position.owner?.toLowerCase() !== address?.toLowerCase()) {
      errors.push({ field: 'general', message: 'Position does not belong to you' })
    }

    return errors
  }, [address, parsedToken0Amount, parsedToken1Amount, token0Balance, token1Balance, pool, position.owner])

  const canSubmit = validationErrors.length === 0 &&
    (parsedToken0Amount > 0n || parsedToken1Amount > 0n)

  // Approve Token0
  const { data: approveToken0Hash, writeContract: approveToken0, isPending: isApprovingToken0, error: approveToken0Error } = useWriteContract()
  const { isLoading: waitingApproveToken0Receipt, status: approveToken0Status } = useWaitForTransactionReceipt({
    hash: approveToken0Hash
  })

  const handleApproveToken0 = useCallback(() => {
    if (!address || parsedToken0Amount === 0n) return

    approveToken0({
      address: token0Address,
      abi: erc20Abi,
      functionName: 'approve',
      args: [CONTRACTS_ADDRESS.positionManager, parsedToken0Amount * 105n / 100n] // 5% buffer
    })
  }, [address, parsedToken0Amount, token0Address, approveToken0])

  // Approve Token1
  const { data: approveToken1Hash, writeContract: approveToken1, isPending: isApprovingToken1, error: approveToken1Error } = useWriteContract()
  const { isLoading: waitingApproveToken1Receipt, status: approveToken1Status } = useWaitForTransactionReceipt({
    hash: approveToken1Hash
  })

  const handleApproveToken1 = useCallback(() => {
    if (!address || parsedToken1Amount === 0n) return

    approveToken1({
      address: token1Address,
      abi: erc20Abi,
      functionName: 'approve',
      args: [CONTRACTS_ADDRESS.positionManager, parsedToken1Amount * 105n / 100n] // 5% buffer
    })
  }, [address, parsedToken1Amount, token1Address, approveToken1])

  // Refetch allowances after approvals
  useEffect(() => {
    if (approveToken0Status === "success" || approveToken1Status === "success") {
      refetchAllowances()
    }
  }, [approveToken0Status, approveToken1Status, refetchAllowances])

  // Increase Liquidity Simulation
  const { data: increaseLiquidityConfig, isLoading: isSimulating, error: simulateError } = useSimulateContract({
    address: CONTRACTS_ADDRESS.positionManager,
    abi: POSITION_MANAGER_ABI,
    functionName: "increaseLiquidity",
    args: (() => {
      if (!canSubmit || token0NeedsApproval || token1NeedsApproval) return undefined

      // Calculate slippage amounts
      const slippageMultiplier = BigInt(Math.floor((100 - slippageTolerance) * 100))
      const amount0Min = parsedToken0Amount * slippageMultiplier / 10000n
      const amount1Min = parsedToken1Amount * slippageMultiplier / 10000n

      return [{
        tokenId: BigInt(position.tokenId),
        amount0Desired: parsedToken0Amount,
        amount1Desired: parsedToken1Amount,
        amount0Min,
        amount1Min,
        deadline: BigInt(Math.floor(Date.now() / 1000) + 1200) // 20 minutes
      }]
    })(),
    query: {
      enabled: canSubmit &&
        !token0NeedsApproval &&
        !token1NeedsApproval &&
        parsedToken0Amount > 0n &&
        parsedToken1Amount > 0n,
      retry: false
    }
  })

  // Execute Increase Liquidity
  const { data: increaseLiquidityHash, writeContract: increaseLiquidity, isPending: isIncreasing, error: increaseError, reset: resetIncrease } = useWriteContract()
  const { data: increaseLiquidityReceipt, isLoading: waitingIncreaseReceipt } = useWaitForTransactionReceipt({
    hash: increaseLiquidityHash
  })

  // Refetch balances after successful increase liquidity transaction
  useEffect(() => {
    if (increaseLiquidityReceipt) {
      refetchBalances()
    }
  }, [increaseLiquidityReceipt, refetchBalances])

  const handleIncreaseLiquidity = useCallback(() => {
    if (!increaseLiquidityConfig?.request) return
    increaseLiquidity(increaseLiquidityConfig.request)
  }, [increaseLiquidityConfig, increaseLiquidity])

  // Utility functions with automatic ratio calculation
  const setToken0Amount = useCallback((amount: string) => {
    setToken0AmountString(amount)

    // Auto-calculate token1 amount for 50/50 ratio
    if (amount && amount !== '0' && token0PriceUSD > 0 && token1PriceUSD > 0) {
      const calculatedToken1Amount = calculateToken1FromToken0(amount)
      setToken1AmountString(calculatedToken1Amount)
    } else if (!amount || amount === '0') {
      setToken1AmountString('0')
    }
  }, [calculateToken1FromToken0, token0PriceUSD, token1PriceUSD])

  const setToken1Amount = useCallback((amount: string) => {
    setToken1AmountString(amount)

    // Auto-calculate token0 amount for 50/50 ratio
    if (amount && amount !== '0' && token0PriceUSD > 0 && token1PriceUSD > 0) {
      const calculatedToken0Amount = calculateToken0FromToken1(amount)
      setToken0AmountString(calculatedToken0Amount)
    } else if (!amount || amount === '0') {
      setToken0AmountString('0')
    }
  }, [calculateToken0FromToken1, token0PriceUSD, token1PriceUSD])

  const setSlippageTolerance = useCallback((tolerance: number) => {
    setSlippageToleranceState(tolerance)
  }, [])

  const reset = useCallback(() => {
    resetIncrease()
    setToken0AmountString('0')
    setToken1AmountString('0')
    setSlippageToleranceState(0.5)
  }, [resetIncrease])

  // Status for UI
  const status = useMemo(() => {
    if (waitingApproveToken0Receipt || waitingApproveToken1Receipt) return 'waitingApproval'
    if (isApprovingToken0 || isApprovingToken1) return 'approving'
    if (waitingIncreaseReceipt) return 'waitingIncrease'
    if (isIncreasing) return 'increasing'
    if (isSimulating) return 'simulating'
    if (increaseLiquidityReceipt) return 'success'
    return 'idle'
  }, [
    waitingApproveToken0Receipt,
    waitingApproveToken1Receipt,
    isApprovingToken0,
    isApprovingToken1,
    waitingIncreaseReceipt,
    isIncreasing,
    isSimulating,
    increaseLiquidityReceipt
  ])

  return {
    // Parsed amounts for LiquidityInput
    parsedToken0Amount,
    parsedToken1Amount,
    slippageTolerance,

    // Balances
    token0Balance,
    token1Balance,

    // Approvals
    token0NeedsApproval,
    token1NeedsApproval,

    // Validation
    validationErrors,
    canSubmit,

    // Status
    status,
    isLoading: status !== 'idle' && status !== 'success',
    isSuccess: status === 'success',

    // Actions
    setToken0Amount,
    setToken1Amount,
    setSlippageTolerance,
    approveToken0: handleApproveToken0,
    approveToken1: handleApproveToken1,
    increaseLiquidity: handleIncreaseLiquidity,
    reset,

    // Transaction data
    increaseLiquidityHash,
    increaseLiquidityReceipt,

    // Errors
    errors: {
      approveToken0: approveToken0Error,
      approveToken1: approveToken1Error,
      simulate: simulateError,
      increase: increaseError,
    },

    // Capabilities
    canApproveToken0: !!address && parsedToken0Amount > 0n && token0NeedsApproval,
    canApproveToken1: !!address && parsedToken1Amount > 0n && token1NeedsApproval,
    canIncrease: !!increaseLiquidityConfig?.request,
  }
}