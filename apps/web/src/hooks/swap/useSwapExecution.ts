import { useCallback, useMemo } from "react"
import { zeroAddress, type Address, type Hex } from "viem"
import { useAccount, useSimulateContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi"

import { calculateSlippageAmount, encodePath } from "../../utils/swap"
import { CONTRACTS_ADDRESS } from "../../config/contractsAddress"
import { SwapRouteV2ABI } from "../../config/abis/swapRouter"
import type { OptimizedRoute, TransactionData } from "./types"

interface UseSwapExecutionParams {
  optimizedRoute: OptimizedRoute | null
  amountIn: bigint
  slippageTolerance: number
  deadline: number
  recipient?: Address
  enabled?: boolean
}

interface UseSwapExecutionReturn {
  // Transaction data
  transactionData: TransactionData | null

  // Actions
  executeSwap: () => Promise<void>
  reset: () => void

  // Transaction states
  isExecuting: boolean
  executeTxHash?: Hex
  executeError: Error | null
  simulateError: Error | null
  isExecuteSuccess: boolean

  // Simulation state (for validation before execution)
  simulationConfig: unknown // useSimulateContract result
  canExecute: boolean
}

/**
 * Hook for generating transaction calldata and executing swaps.
 * Extracted from the original useSwap.ts - handles transaction data generation and execution.
 * Supports both SwapRouter02 for simple routes and UniversalRouter for split routes.
 *
 * @param params - Configuration for swap execution
 * @returns Swap execution state and actions
 */
export const useSwapExecution = ({
  optimizedRoute,
  amountIn,
  slippageTolerance,
  deadline,
  recipient,
  enabled = true
}: UseSwapExecutionParams): UseSwapExecutionReturn => {
  const { address } = useAccount()

  // Generate transaction data from optimized route
  const transactionData = useMemo((): TransactionData | null => {
    if (!optimizedRoute || !enabled) return null

    // Pour l'estimation sans wallet, utiliser une adresse par défaut
    const targetAddress = address || zeroAddress

    try {
      if (optimizedRoute.type === "single") {
        // Simple transaction with SwapRouter02
        const singleRoute = optimizedRoute.routes[0].route
        const amountOutMinimum = calculateSlippageAmount(optimizedRoute.totalQuote, slippageTolerance)

        if (singleRoute.path.length === 2) {
          // Single hop
          const params = {
            tokenIn: singleRoute.path[0].address,
            tokenOut: singleRoute.path[1].address,
            fee: singleRoute.fees[0],
            recipient: recipient || targetAddress,
            amountIn,
            amountOutMinimum,
            sqrtPriceLimitX96: 0n
          }

          return {
            to: CONTRACTS_ADDRESS.swapRouter02,
            abi: SwapRouteV2ABI,
            functionName: "exactInputSingle",
            args: [params],
            value: singleRoute.path[0].address === zeroAddress ? amountIn : 0n
          }
        } else {
          // Multi-hop - Using correct struct/tuple parameters
          const path = encodePath(
            singleRoute.path.map(t => t.address),
            singleRoute.fees
          )

          const params = {
            path,
            recipient: recipient || targetAddress,
            amountIn,
            amountOutMinimum
          }

          return {
            to: CONTRACTS_ADDRESS.swapRouter02,
            abi: SwapRouteV2ABI,
            functionName: 'exactInput',
            args: [params],
            value: 0n // Always 0n for ERC20 token swaps
          }
        }
      }
    } catch (error) {
      console.error('Failed to generate transaction data:', error)
      return null
    }

    return null
  }, [optimizedRoute, address, enabled, deadline, slippageTolerance, recipient, amountIn])

  // Simulate transaction for validation
  const { data: simulationConfig, error: simuError } = useSimulateContract({
    address: transactionData?.to,
    abi: transactionData?.abi,
    functionName: transactionData?.functionName,
    args: transactionData?.args,
    value: transactionData?.value || 0n,
    query: {
      enabled: !!transactionData && !!address && enabled,
      retry: false
    }
  })

  // Check if we can execute
  const canExecute = useMemo(() => {
    return !!simulationConfig?.request && !!transactionData && !!address
  }, [simulationConfig, transactionData, address])

  // Execute swap transaction
  const {
    writeContract: writeSwap,
    data: executeTxHash,
    isPending: isExecutePending,
    error: executeWriteError,
    reset: resetSwap
  } = useWriteContract()

  const {
    isLoading: isExecuteTxPending,
    isSuccess: isExecuteSuccess
  } = useWaitForTransactionReceipt({
    hash: executeTxHash
  })

  // Combined execution state
  const isExecuting = isExecutePending || isExecuteTxPending

  // Execute swap function
  const executeSwap = useCallback(async () => {
    if (!simulationConfig?.request || !address || !transactionData) {
      throw new Error('Cannot execute swap: missing configuration or wallet not connected')
    }

    if (amountIn <= 0n) {
      throw new Error('Cannot execute swap: amount must be greater than 0')
    }

    try {
      await writeSwap(simulationConfig.request)
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : 'Token swap execution failed'
      )
    }
  }, [simulationConfig, address, transactionData, amountIn, writeSwap])

  // Reset function
  const reset = useCallback(() => {
    resetSwap()
  }, [resetSwap])

  return {
    // Transaction data
    transactionData,

    // Actions
    executeSwap,
    reset,

    // Transaction states
    isExecuting,
    executeTxHash,
    simulateError: simuError,
    executeError: executeWriteError,
    isExecuteSuccess,

    // Simulation state
    simulationConfig,
    canExecute
  }
}