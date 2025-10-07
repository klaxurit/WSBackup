import { type Address, type Hex } from "viem"
import { useAccount, useSimulateContract, useWaitForTransactionReceipt, useWriteContract } from "wagmi"
import { CONTRACTS_ADDRESS } from "../../config/contractsAddress"
import { currentChain } from "../../config/wagmi"
import { StickyVaultRouter } from "../../config/abis/StickyVaultRouter"
import { useTokenAllowance } from "./useTokenAllowance"
import { useSlippage } from "./useSlippage"

interface UseVaultWithdrawParams {
  vaultAddress: Address | undefined
  burnAmount: bigint
  slippageBps: number
  enabled?: boolean
}

export interface UseVaultWithdrawReturn {
  // Estimated amounts to receive
  estimatedAmounts: {
    amount0: bigint
    amount1: bigint
  } | undefined

  // Vault token allowance
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

  // Withdraw action
  withdraw: {
    execute: () => void
    isPending: boolean
    isLoading: boolean
    isSuccess: boolean
    hash?: Hex
    reset: () => void
  }
}

/**
 * Hook for withdrawing liquidity from a vault
 * Handles vault token approval and withdrawal execution
 */
export const useVaultWithdraw = ({
  vaultAddress,
  burnAmount,
  slippageBps,
  enabled = true
}: UseVaultWithdrawParams): UseVaultWithdrawReturn => {
  const { address } = useAccount()
  const { calculateMinAmount } = useSlippage(slippageBps)

  const isReady = enabled &&
    !!address &&
    !!vaultAddress &&
    burnAmount > 0n

  // Vault token (shares) allowance management
  const vaultAllowance = useTokenAllowance({
    tokenAddress: vaultAddress,
    spenderAddress: CONTRACTS_ADDRESS.STICKYVAULT_ROUTER,
    amount: burnAmount,
    enabled: isReady
  })

  const isAllow = !vaultAllowance.isNeedApproval

  // Simulate withdrawal to get expected amounts
  const { data: withdrawConfig } = useSimulateContract({
    address: CONTRACTS_ADDRESS.STICKYVAULT_ROUTER,
    abi: StickyVaultRouter,
    functionName: "removeLiquidity",
    args: [vaultAddress!, burnAmount, 0n, 0n, address!],
    chainId: currentChain.id,
    query: {
      enabled: isReady && isAllow
    }
  })

  // Extract estimated amounts from simulation result
  const estimatedAmounts = withdrawConfig?.result
    ? {
      amount0: withdrawConfig.result[0],
      amount1: withdrawConfig.result[1]
    }
    : undefined

  // Write withdrawal transaction
  const {
    data: withdrawHash,
    writeContract: writeWithdraw,
    isPending: isWithdrawing,
    reset: resetWithdraw
  } = useWriteContract()

  // Wait for transaction receipt
  const {
    isLoading: isWithdrawLoading,
    isSuccess: isWithdrawSuccess
  } = useWaitForTransactionReceipt({
    hash: withdrawHash,
    query: {
      enabled: !!withdrawHash
    }
  })

  const handleWithdraw = () => {
    if (!withdrawConfig?.request || !estimatedAmounts) return

    // Calculate minimum amounts with slippage protection
    const min0 = calculateMinAmount(estimatedAmounts.amount0, slippageBps)
    const min1 = calculateMinAmount(estimatedAmounts.amount1, slippageBps)

    // Execute withdrawal with slippage protection
    writeWithdraw({
      ...withdrawConfig.request,
      args: [vaultAddress!, burnAmount, min0, min1, address!]
    })
  }

  const handleReset = () => {
    resetWithdraw()
  }

  return {
    estimatedAmounts,
    allowance: {
      isNeed: vaultAllowance.isNeedApproval,
      current: vaultAllowance.allowance,
      allow: vaultAllowance.approve,
      isLoading: vaultAllowance.isLoading,
      isApprove: vaultAllowance.isApproving,
      hash: vaultAllowance.approveHash,
      refetch: vaultAllowance.refetch
    },
    isAllow,
    withdraw: {
      execute: handleWithdraw,
      isPending: isWithdrawing,
      isLoading: isWithdrawLoading,
      isSuccess: isWithdrawSuccess,
      hash: withdrawHash,
      reset: handleReset
    }
  }
}