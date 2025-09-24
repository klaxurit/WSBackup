import { useCallback, useMemo } from "react"
import { erc20Abi, type Address, type Hex } from "viem"
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi"

interface UseTokenApprovalParams {
  tokenAddress: Address
  spenderAddress?: Address  // SwapRouter02 or UniversalRouter according to route
  amountNeeded: bigint
  enabled?: boolean
}

interface UseTokenApprovalReturn {
  // Current state
  allowance: bigint
  needsApproval: boolean

  // Actions
  approve: () => Promise<void>
  reset: () => void

  // Transaction states
  isApproving: boolean
  approveTxHash?: Hex
  approveError: Error | null

  // Utils
  refresh: () => void
}

/**
 * Hook for managing token approvals and allowances.
 * Extracted from the original useSwap.ts - handles ERC20 token approval workflow.
 *
 * @param params - Configuration for token approval
 * @returns Token approval state and actions
 */
export const useTokenApproval = ({
  tokenAddress,
  spenderAddress,
  amountNeeded,
  enabled = true
}: UseTokenApprovalParams): UseTokenApprovalReturn => {
  const { address } = useAccount()

  // Read current allowance
  const { data: allowance = 0n, refetch: refetchAllowance } = useReadContract({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: 'allowance',
    args: address && spenderAddress ? [address, spenderAddress] : undefined,
    query: {
      enabled: !!address && !!tokenAddress && !!spenderAddress && enabled,
      refetchInterval: 2000 // Auto refresh every 2s like original
    }
  })

  // Check if approval is needed
  const needsApproval = useMemo(() => {
    return enabled && allowance < amountNeeded && amountNeeded > 0n
  }, [allowance, amountNeeded, enabled])

  // Write contract hook for approval
  const {
    writeContract: executeApprove,
    data: approveTxHash,
    isPending: isApproving,
    error: writeError,
    reset: resetApprove
  } = useWriteContract()

  // Wait for transaction receipt
  const { isLoading: isApprovingTxPending } = useWaitForTransactionReceipt({
    hash: approveTxHash
  })

  // Combined loading state
  const isApprovingCombined = isApproving || isApprovingTxPending

  // Approve function with max approval (like original)
  const approve = useCallback(async () => {
    if (!address) {
      throw new Error('Cannot approve: wallet not connected')
    }
    if (!needsApproval) {
      throw new Error('Cannot approve: no approval needed')
    }
    if (!tokenAddress) {
      throw new Error('Cannot approve: missing token address')
    }
    if (!spenderAddress) {
      throw new Error('Cannot approve: missing spender address (route not ready)')
    }

    try {
      await executeApprove({
        address: tokenAddress,
        abi: erc20Abi,
        functionName: "approve",
        args: [spenderAddress, 2n ** 256n - 1n], // Max approval like original
      })
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : 'Token approval failed'
      )
    }
  }, [address, needsApproval, tokenAddress, spenderAddress, executeApprove])

  // Refresh allowance
  const refresh = useCallback(() => {
    refetchAllowance()
  }, [refetchAllowance])

  // Reset function
  const reset = useCallback(() => {
    resetApprove()
  }, [resetApprove])

  return {
    // Current state
    allowance,
    needsApproval,

    // Actions
    approve,
    reset,

    // Transaction states
    isApproving: isApprovingCombined,
    approveTxHash,
    approveError: writeError,

    // Utils
    refresh
  }
}