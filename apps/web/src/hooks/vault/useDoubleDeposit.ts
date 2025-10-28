import { type Address, type Hex, encodeFunctionData } from "viem"
import { useAccount, useSimulateContract, useWaitForTransactionReceipt, useWriteContract } from "wagmi"
import { useMemo } from "react"
import { CONTRACTS_ADDRESS } from "../../config/contractsAddress"
import { currentChain } from "../../config/wagmi"
import { StickyVaultRouter } from "../../config/abis/StickyVaultRouter"
import { autowinABI } from "../../config/abis/AutowinRouter"
import { useTokenAllowance } from "./useTokenAllowance"
import { useVaultQuote } from "./useVaultQuote"
import { useSlippage } from "./useSlippage"
import { useAutoWinQuote } from "./useAutoWinQuote"

interface UseDoubleDepositParams {
  vault: Address
  token0: Address
  token1: Address
  amount0: bigint
  amount1: bigint
  slippageBps: number
  autoWin?: {
    vaultAddress: Address
    slippageBps: number
  }
}

export interface UseDoubleDepositReturn {
  // Quote data
  quote: {
    amount0Max: bigint | null
    amount0Min: bigint | null
    amount1Max: bigint | null
    amount1Min: bigint | null
    minShares: bigint | null
  }
  isQuoted: boolean
  isQuoteLoading: boolean

  // Allowances
  t0Allowance: {
    isNeed: boolean
    current?: bigint
    allow: () => void
    isLoading: boolean
    isApprove: boolean
    hash?: Hex
    refetch: () => void
  }
  t1Allowance: {
    isNeed: boolean
    current?: bigint
    allow: () => void
    isLoading: boolean
    isApprove: boolean
    hash?: Hex
    refetch: () => void
  }
  isAllow: boolean

  // Deposit action
  deposite: {
    depose: () => void
    isPending: boolean
    isLoading: boolean
    isSuccess: boolean
    hash?: Hex
    reset: () => void
  }
}

export const useDoubleDeposit = ({
  vault,
  token0,
  token1,
  amount0,
  amount1,
  slippageBps,
  autoWin
}: UseDoubleDepositParams): UseDoubleDepositReturn => {
  const { address } = useAccount()
  const { calculateMinAmount } = useSlippage(slippageBps)

  const isReady = !!address && !!vault && !!token0 && !!token1 && amount0 > 0n && amount1 > 0n

  // Get vault quote
  const { quote, isLoading: isQuoteLoading } = useVaultQuote({
    vaultAddress: vault,
    amount0,
    amount1,
    enabled: isReady
  })
  // Calculate minimum amounts with slippage
  const [amount0Min, amount1Min, minShares] = useMemo(() => {
    if (!quote) return [null, null, null]
    return [
      calculateMinAmount(quote.amount0, slippageBps),
      calculateMinAmount(quote.amount1, slippageBps),
      calculateMinAmount(quote.shares, slippageBps)
    ]
  }, [quote, calculateMinAmount, slippageBps])

  const isQuoted = !!amount0Min && !!amount1Min && !!minShares

  // Get AutoWin quote if AutoWin is enabled
  const { minShares: minAutoWinShares } = useAutoWinQuote({
    autoWinVault: autoWin?.vaultAddress,
    stickyShares: minShares || undefined,
    slippageBps: autoWin?.slippageBps || 100
  })

  // Determine router and spender based on AutoWin configuration
  const routerAddress = autoWin ? CONTRACTS_ADDRESS.AUTOWIN_ROUTER : CONTRACTS_ADDRESS.STICKYVAULT_ROUTER
  const routerABI = autoWin ? autowinABI : StickyVaultRouter

  // Token0 allowance management
  const t0Allowance = useTokenAllowance({
    tokenAddress: token0,
    spenderAddress: routerAddress,
    amount: amount0,
    enabled: isQuoted
  })

  // Token1 allowance management
  const t1Allowance = useTokenAllowance({
    tokenAddress: token1,
    spenderAddress: routerAddress,
    amount: amount1,
    enabled: isQuoted
  })

  const isAllow = !t0Allowance.isNeedApproval && !t1Allowance.isNeedApproval

  // Prepare transaction config based on AutoWin configuration
  const transactionConfig = useMemo(() => {
    if (!isQuoted || !isAllow || !address) return null

    if (autoWin && autoWin.vaultAddress && minAutoWinShares) {
      // Prepare multicall for AutoWin
      const addLiquidityCalldata = encodeFunctionData({
        abi: autowinABI,
        functionName: 'addLiquidity',
        args: [vault, amount0, amount1, amount0Min!, amount1Min!, minShares!, CONTRACTS_ADDRESS.AUTOWIN_ROUTER]
      })

      const depositIntoAutoWinCalldata = encodeFunctionData({
        abi: autowinABI,
        functionName: 'depositIntoAutoWinSelf',
        args: [autoWin.vaultAddress, minAutoWinShares, address]
      })

      return {
        address: CONTRACTS_ADDRESS.AUTOWIN_ROUTER,
        abi: autowinABI,
        functionName: 'multicall' as const,
        args: [[addLiquidityCalldata, depositIntoAutoWinCalldata]] as const
      }
    } else {
      // Standard StickyVault deposit
      return {
        address: routerAddress,
        abi: routerABI,
        functionName: 'addLiquidity' as const,
        args: [vault, amount0, amount1, amount0Min!, amount1Min!, minShares!, address] as const
      }
    }
  }, [isQuoted, isAllow, address, autoWin, minAutoWinShares, vault, amount0, amount1, amount0Min, amount1Min, minShares, routerAddress, routerABI])
  // Simulate and execute deposit transaction

  const { data: depositConfig } = useSimulateContract({
    ...transactionConfig,
    chainId: currentChain.id,
    query: {
      enabled: !!transactionConfig
    }
  } as any)

  const {
    data: depositHash,
    writeContract: writeDeposit,
    isPending: isDepositing,
    reset: resetDeposit
  } = useWriteContract()

  // Wait for transaction receipt
  const {
    isLoading: isDepositLoading,
    isSuccess: isDepositSuccess
  } = useWaitForTransactionReceipt({
    hash: depositHash,
    query: {
      enabled: !!depositHash
    }
  })

  const handleDeposit = () => {
    if (!depositConfig?.request) return
    writeDeposit(depositConfig.request)
  }

  const handleReset = () => {
    resetDeposit()
  }

  return {
    quote: {
      amount0Max: quote?.amount0 || amount0,
      amount0Min,
      amount1Max: quote?.amount1 || amount1,
      amount1Min,
      minShares
    },
    isQuoted,
    isQuoteLoading,
    t0Allowance: {
      isNeed: t0Allowance.isNeedApproval,
      current: t0Allowance.allowance,
      allow: t0Allowance.approve,
      isLoading: t0Allowance.isLoading,
      isApprove: t0Allowance.isApproving,
      hash: t0Allowance.approveHash,
      refetch: t0Allowance.refetch
    },
    t1Allowance: {
      isNeed: t1Allowance.isNeedApproval,
      current: t1Allowance.allowance,
      allow: t1Allowance.approve,
      isLoading: t1Allowance.isLoading,
      isApprove: t1Allowance.isApproving,
      hash: t1Allowance.approveHash,
      refetch: t1Allowance.refetch
    },
    isAllow,
    deposite: {
      depose: handleDeposit,
      isPending: isDepositing,
      isLoading: isDepositLoading,
      isSuccess: isDepositSuccess,
      hash: depositHash,
      reset: handleReset
    }
  }
}