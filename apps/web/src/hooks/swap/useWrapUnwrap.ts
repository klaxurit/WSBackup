import { useCallback } from "react"
import { type Hex } from "viem"
import { useAccount, useSimulateContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi"
import { WBERA_ADDRESS } from "./constants"
import { wBeraABI } from "../../config/abis/wBeraABI"

interface UseWrapUnwrapParams {
  amount: bigint
  enabled?: boolean
}

interface UseWrapUnwrapReturn {
  // Actions
  wrap: () => Promise<void>
  unwrap: () => Promise<void>
  reset: () => void

  // Transaction states
  isWrapping: boolean
  isUnwrapping: boolean
  wrapTxHash?: Hex
  unwrapTxHash?: Hex
  wrapError: Error | null
  unwrapError: Error | null

  // Success states for refresh
  isWrapSuccess: boolean
  isUnwrapSuccess: boolean
}

/**
 * Hook for wrapping BERA → WBERA and unwrapping WBERA → BERA.
 * Extracted from the original useSwap.ts - handles native token wrapping/unwrapping.
 *
 * @param params - Configuration for wrap/unwrap operations
 * @returns Wrap/unwrap state and actions
 */
export const useWrapUnwrap = ({
  amount,
  enabled = true
}: UseWrapUnwrapParams): UseWrapUnwrapReturn => {
  const { address } = useAccount()

  // Wrap simulation and execution
  const { data: wrapConfig } = useSimulateContract({
    address: WBERA_ADDRESS,
    abi: wBeraABI,
    functionName: "deposit",
    value: amount,
    query: {
      enabled: enabled && !!address && amount > 0n
    }
  })

  const {
    writeContract: executeWrap,
    isPending: isWrappingPending,
    data: wrapTxHash,
    error: wrapWriteError,
    reset: resetWrap
  } = useWriteContract()

  const {
    isLoading: isWrapTxPending,
    isSuccess: isWrapSuccess
  } = useWaitForTransactionReceipt({
    hash: wrapTxHash
  })

  // Unwrap simulation and execution
  const { data: unwrapConfig } = useSimulateContract({
    address: WBERA_ADDRESS,
    abi: wBeraABI,
    functionName: "withdraw",
    args: [amount],
    query: {
      enabled: enabled && !!address && amount > 0n
    }
  })

  const {
    writeContract: executeUnwrap,
    isPending: isUnwrappingPending,
    data: unwrapTxHash,
    error: unwrapWriteError,
    reset: resetUnwrap
  } = useWriteContract()

  const {
    isLoading: isUnwrapTxPending,
    isSuccess: isUnwrapSuccess
  } = useWaitForTransactionReceipt({
    hash: unwrapTxHash
  })

  // Combined loading states
  const isWrapping = isWrappingPending || isWrapTxPending
  const isUnwrapping = isUnwrappingPending || isUnwrapTxPending

  // Wrap function
  const wrap = useCallback(async () => {
    if (!wrapConfig?.request || !address) {
      throw new Error('Cannot wrap: missing configuration or wallet not connected')
    }

    if (amount <= 0n) {
      throw new Error('Cannot wrap: amount must be greater than 0')
    }

    try {
      await executeWrap(wrapConfig.request)
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : 'BERA wrapping failed'
      )
    }
  }, [wrapConfig, address, amount, executeWrap])

  // Unwrap function
  const unwrap = useCallback(async () => {
    if (!unwrapConfig?.request || !address) {
      throw new Error('Cannot unwrap: missing configuration or wallet not connected')
    }

    if (amount <= 0n) {
      throw new Error('Cannot unwrap: amount must be greater than 0')
    }

    try {
      await executeUnwrap(unwrapConfig.request)
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : 'BERA unwrapping failed'
      )
    }
  }, [unwrapConfig, address, amount, executeUnwrap])

  // Reset function
  const reset = useCallback(() => {
    resetWrap()
    resetUnwrap()
  }, [resetWrap, resetUnwrap])

  return {
    // Actions
    wrap,
    unwrap,
    reset,

    // Transaction states
    isWrapping,
    isUnwrapping,
    wrapTxHash,
    unwrapTxHash,
    wrapError: wrapWriteError,
    unwrapError: unwrapWriteError,

    // Success states for refresh
    isWrapSuccess,
    isUnwrapSuccess
  }
}