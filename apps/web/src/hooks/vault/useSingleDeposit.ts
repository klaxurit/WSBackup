import { type Address, type Hex, encodeFunctionData } from "viem"
import { useAccount, useSimulateContract, useWaitForTransactionReceipt, useWriteContract } from "wagmi"
import { useMemo } from "react"
import { CONTRACTS_ADDRESS } from "../../config/contractsAddress"
import { autowinABI } from "../../config/abis/AutowinRouter"
import { useTokenAllowance } from "./useTokenAllowance"
import { useVaultQuote } from "./useVaultQuote"
import { useSlippage } from "./useSlippage"
import { useSwap } from "../swap/useSwap"
import { useAutoWinQuote } from "./useAutoWinQuote"

interface UseSingleDepositParams {
  vault: Address
  tokenIn: Address  // Token being deposited
  tokenOut: Address // Other token in the pair
  amount: bigint    // Amount of tokenIn to deposit
  isToken0: boolean // Is tokenIn token0 in the pair
  slippageBps: number
  autoWin?: {
    vaultAddress: Address
    slippageBps: number
  }
}

export interface UseSingleDepositReturn {
  // Swap data
  swapQuote: {
    amountIn: bigint
    amountOut: bigint | undefined
    isLoading: boolean
  }

  // Vault quote
  vaultQuote: {
    minShares: bigint | null
  }
  isQuoted: boolean

  // Allowance
  allowance: {
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
  deposit: {
    execute: () => void
    isPending: boolean
    isLoading: boolean
    isSuccess: boolean
    hash?: Hex
    error: any
    reset: () => void
  }
}

export const useSingleDeposit = ({
  vault,
  tokenIn,
  tokenOut,
  amount,
  isToken0,
  slippageBps,
  autoWin
}: UseSingleDepositParams): UseSingleDepositReturn => {
  const { address } = useAccount()
  const { calculateMinAmount } = useSlippage(slippageBps)

  const isReady = !!address && !!vault && !!tokenIn && !!tokenOut && amount > 0n

  // Split amount for swap (50% will be swapped to the other token)
  const swapAmount = amount / 2n
  const keepAmount = amount - swapAmount

  // Get swap quote for half the amount
  const swap = useSwap({
    tokenIn,
    tokenOut,
    amountIn: swapAmount,
  })

  // Prepare swap data for the router
  const swapData = useMemo(() => {
    if (swap.status !== "ready" || !swap?.quote?.amountOut || !swap.optimizedRoute?.transactionData?.args) {
      return null
    }

    const functionName = swap.optimizedRoute?.transactionData?.functionName
    const to = swap.optimizedRoute?.transactionData?.to
    if (!functionName || !to) return null

    const abi = swap.optimizedRoute?.transactionData?.abi.filter((a: any) => a.name === functionName)
    if (!abi[0].inputs) return null

    const routeDataCalldata = encodeFunctionData({
      abi: abi,
      functionName: functionName,
      args: swap.optimizedRoute.transactionData.args
    })

    return {
      router: to,
      amountIn: swapAmount,
      minAmountOut: calculateMinAmount(swap.quote.amountOutMinimum, 100), // Additional 1% slippage for swap
      zeroForOne: isToken0, // Swap direction
      routeData: routeDataCalldata
    }
  }, [swap, swapAmount, isToken0, calculateMinAmount])

  // Get vault quote based on expected amounts after swap
  const { quote: vaultQuote } = useVaultQuote({
    vaultAddress: vault,
    amount0: isToken0 ? keepAmount : (swap.quote?.amountOut ?? 0n),
    amount1: isToken0 ? (swap.quote?.amountOut ?? 0n) : keepAmount,
    enabled: isReady && !!swap.quote && !!swapData
  })

  const minShares = vaultQuote ? calculateMinAmount(vaultQuote.shares, slippageBps) : null
  const isQuoted = !!minShares && !!swapData

  // Get AutoWin quote if AutoWin is enabled
  const { minShares: minAutoWinShares } = useAutoWinQuote({
    autoWinVault: autoWin?.vaultAddress,
    stickyShares: minShares || undefined,
    slippageBps: autoWin?.slippageBps || 100
  })

  // Always use AutoWin router (it exposes same methods as StickyVault router)
  const routerAddress = CONTRACTS_ADDRESS.AUTOWIN_ROUTER

  // Token allowance management
  const tokenAllowance = useTokenAllowance({
    tokenAddress: tokenIn,
    spenderAddress: routerAddress,
    amount,
    enabled: isReady
  })

  const isAllow = !tokenAllowance.isNeedApproval

  // Prepare transaction config based on AutoWin configuration
  const transactionConfig = useMemo(() => {
    if (!isQuoted || !isAllow || !address) return null

    if (autoWin && autoWin.vaultAddress && minAutoWinShares) {
      // Prepare multicall for AutoWin: addLiquiditySingle + depositIntoAutoWin
      const addLiquiditySingleCalldata = encodeFunctionData({
        abi: autowinABI,
        functionName: 'addLiquiditySingle',
        args: [vault, amount, minShares!, BigInt(slippageBps), swapData!, CONTRACTS_ADDRESS.AUTOWIN_ROUTER]
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
        args: [[addLiquiditySingleCalldata, depositIntoAutoWinCalldata]] as const
      }
    } else {
      // Standard StickyVault deposit using AutoWin router
      return {
        address: CONTRACTS_ADDRESS.AUTOWIN_ROUTER,
        abi: autowinABI,
        functionName: 'addLiquiditySingle' as const,
        args: [vault, amount, minShares!, BigInt(slippageBps), swapData!, address] as const
      }
    }
  }, [isQuoted, isAllow, address, autoWin, minAutoWinShares, vault, amount, minShares, slippageBps, swapData])

  // Simulate and execute single-sided deposit
  const {
    data: depositConfig,
    error: simError
  } = useSimulateContract({
    ...transactionConfig,
    query: {
      enabled: !!transactionConfig
    }
  } as any)

  const {
    data: depositHash,
    writeContract: writeDeposit,
    isPending: isDepositing,
    error: writeError,
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
    swapQuote: {
      amountIn: swapAmount,
      amountOut: swap.quote?.amountOut,
      isLoading: swap.status === "loading-routes" || swap.status === "quoting" || swap.status === "optimizing"
    },
    vaultQuote: {
      minShares
    },
    isQuoted,
    allowance: {
      isNeed: tokenAllowance.isNeedApproval,
      current: tokenAllowance.allowance,
      allow: tokenAllowance.approve,
      isLoading: tokenAllowance.isLoading,
      isApprove: tokenAllowance.isApproving,
      hash: tokenAllowance.approveHash,
      refetch: tokenAllowance.refetch
    },
    isAllow,
    deposit: {
      execute: handleDeposit,
      isPending: isDepositing,
      isLoading: isDepositLoading,
      isSuccess: isDepositSuccess,
      hash: depositHash,
      error: simError || writeError,
      reset: handleReset
    }
  }
}