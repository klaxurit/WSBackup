import { useCallback, useEffect, useState } from "react"
import { formatUnits, type Address } from "viem"
import { usePublicClient } from "wagmi"
import { useTokenCache } from "../useTokenCache"
import { type SingleRoute, type OptimizedRoute } from "./types"
import { ORDER_SPLIT_THRESHOLD, DEFAULT_GAS_PRICE } from "./constants"
import { calculatePriceImpact } from "../../utils/swap"
import { encodePath } from "../../utils/swap"
import { QuoterV2ABI } from "../../config/abis/QuoterV2"
import { CONTRACTS_ADDRESS } from "../../config/contractsAddress"

/**
 * Parameters for useSwapOptimizer hook
 */
export interface UseSwapOptimizerParams {
  routes: SingleRoute[]
  amountIn: bigint
  enabled?: boolean
}

/**
 * Return type for useSwapOptimizer hook
 */
export interface UseSwapOptimizerReturn {
  optimizedRoute: OptimizedRoute | null
  isLoading: boolean
  error: Error | null
}

/**
 * Hook for optimizing swap routes (single vs split), calculating price impact
 * Works without wallet connection for route optimization
 * Extracts optimization logic from the original useSwap hook
 */
export const useSwapOptimizer = (params: UseSwapOptimizerParams): UseSwapOptimizerReturn => {
  const { routes, amountIn, enabled = true } = params
  const publicClient = usePublicClient()
  const { getTokenInfo } = useTokenCache()

  const [state, setState] = useState<{
    optimizedRoute: OptimizedRoute | null
    isLoading: boolean
    error: Error | null
  }>({
    optimizedRoute: null,
    isLoading: false,
    error: null
  })

  /**
   * Quote a route with QuoterV2 - helper for split testing
   */
  const quoteRoute = useCallback(async (
    tokens: Address[],
    fees: number[],
    amountInWei: bigint
  ): Promise<{ quote: bigint, gasEstimate: bigint } | null> => {
    if (!publicClient || !amountInWei || amountInWei === 0n) return null

    try {
      if (tokens.length === 2) {
        // Single hop
        const result = await publicClient.readContract({
          address: CONTRACTS_ADDRESS.quoterV2,
          abi: QuoterV2ABI,
          functionName: 'quoteExactInputSingle',
          args: [{
            tokenIn: tokens[0],
            tokenOut: tokens[1],
            amountIn: amountInWei,
            fee: fees[0],
            sqrtPriceLimitX96: 0n
          }]
        })

        return {
          quote: result[0] as bigint,
          gasEstimate: result[3] as bigint
        }
      } else {
        // Multi-hop
        const path = encodePath(tokens, fees)
        const result = await publicClient.readContract({
          address: CONTRACTS_ADDRESS.quoterV2,
          abi: QuoterV2ABI,
          functionName: "quoteExactInput",
          args: [path, amountInWei]
        })

        return {
          quote: result[0] as bigint,
          gasEstimate: result[3] as bigint
        }
      }
    } catch (error) {
      console.error('Quote failed for route optimization:', { tokens, fees, error })
      return null
    }
  }, [publicClient])

  /**
   * Test order splitting optimization
   * Extracted from original useSwap.testOrderSplitting
   */
  const testOrderSplitting = useCallback(async (
    routesToTest: SingleRoute[],
    amountToSplit: bigint
  ): Promise<OptimizedRoute[]> => {
    if (routesToTest.length < 2 || amountToSplit < ORDER_SPLIT_THRESHOLD) {
      return []
    }

    const splitRoutes: OptimizedRoute[] = []
    const topRoutes = routesToTest.slice(0, 3) // Only test top 3 routes

    // Test different distribution percentages
    const distributions = [
      [70, 30],
      [60, 40],
      [50, 50],
      [80, 20],
      [40, 60]
    ]

    for (const dist of distributions) {
      if (topRoutes.length < 2) break

      try {
        const amount1 = (amountToSplit * BigInt(dist[0])) / 100n
        const amount2 = (amountToSplit * BigInt(dist[1])) / 100n

        // Get quotes for both parts in parallel
        const [quote1, quote2] = await Promise.all([
          quoteRoute(
            topRoutes[0].path.map(t => t.address),
            topRoutes[0].fees,
            amount1
          ),
          quoteRoute(
            topRoutes[1].path.map(t => t.address),
            topRoutes[1].fees,
            amount2
          )
        ])

        if (quote1 && quote2 && quote1.quote > 0n && quote2.quote > 0n) {
          const totalQuote = quote1.quote + quote2.quote
          const totalGas = quote1.gasEstimate + quote2.gasEstimate

          // Get output token info for formatting
          const outputTokenInfo = topRoutes[0].path[topRoutes[0].path.length - 1]

          const splitRoute: OptimizedRoute = {
            type: "split",
            totalQuote,
            totalGasEstimate: totalGas,
            quoteFormatted: formatUnits(totalQuote, outputTokenInfo.decimals),
            priceImpact: calculatePriceImpact(
              amountToSplit,
              totalQuote,
              topRoutes[0].pools[0]?.sqrtPriceX96 || 1n,
              topRoutes[0].path[0].decimals,
              outputTokenInfo.decimals
            ),
            routes: [
              {
                route: topRoutes[0],
                percentage: dist[0],
                amount: amount1,
                quote: quote1.quote
              },
              {
                route: topRoutes[1],
                percentage: dist[1],
                amount: amount2,
                quote: quote2.quote
              }
            ],
            transactionData: null // Will be set by transaction executor
          }

          splitRoutes.push(splitRoute)
        }
      } catch (error) {
        console.error('Split route calculation failed:', error)
        // Continue with other distributions
      }
    }

    return splitRoutes
  }, [quoteRoute])

  /**
   * Optimize routes by comparing single vs split options
   * Extracted from original useSwap.optimizeRoutes
   */
  const optimizeRoutes = useCallback(async (
    routesToOptimize: SingleRoute[],
    currentAmountIn: bigint
  ): Promise<OptimizedRoute | null> => {
    if (routesToOptimize.length === 0 || !currentAmountIn || currentAmountIn === 0n) {
      return null
    }

    try {
      // 1. Create best single route option
      const bestSingleRoute = routesToOptimize[0]
      const tokenOutInfo = await getTokenInfo(
        bestSingleRoute.path[bestSingleRoute.path.length - 1].address
      )

      if (!tokenOutInfo) {
        throw new Error('Cannot resolve output token information')
      }

      const singleOptimized: OptimizedRoute = {
        type: "single",
        totalQuote: bestSingleRoute.quote,
        totalGasEstimate: bestSingleRoute.gasEstimate,
        quoteFormatted: formatUnits(bestSingleRoute.quote, tokenOutInfo.decimals),
        priceImpact: calculatePriceImpact(
          currentAmountIn,
          bestSingleRoute.quote,
          bestSingleRoute.pools[0]?.sqrtPriceX96 || 1n,
          bestSingleRoute.path[0].decimals,
          bestSingleRoute.path[bestSingleRoute.path.length - 1].decimals
        ),
        routes: [{
          route: bestSingleRoute,
          percentage: 100,
          amount: currentAmountIn,
          quote: bestSingleRoute.quote
        }],
        transactionData: null // Will be set by transaction executor
      }

      // 2. Test split route options if amount is large enough
      let splitOptions: OptimizedRoute[] = []
      if (currentAmountIn >= ORDER_SPLIT_THRESHOLD) {
        splitOptions = await testOrderSplitting(routesToOptimize, currentAmountIn)
      }

      // 3. Compare all options and select the best one
      const allOptions = [singleOptimized, ...splitOptions]

      const bestOption = allOptions.reduce((best, current) => {
        // Calculate net output after gas costs
        const bestNet = best.totalQuote - (best.totalGasEstimate * DEFAULT_GAS_PRICE)
        const currentNet = current.totalQuote - (current.totalGasEstimate * DEFAULT_GAS_PRICE)

        return currentNet > bestNet ? current : best
      })

      return bestOption

    } catch (error) {
      console.error('Route optimization failed:', error)
      throw new Error(
        error instanceof Error ? error.message : 'Failed to optimize routes'
      )
    }
  }, [getTokenInfo, testOrderSplitting])

  /**
   * Run optimization process
   */
  const runOptimization = useCallback(async () => {
    if (!enabled || routes.length === 0 || !amountIn || amountIn === 0n) {
      setState(prev => ({ ...prev, optimizedRoute: null, error: null }))
      return
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      const optimized = await optimizeRoutes(routes, amountIn)

      setState({
        optimizedRoute: optimized,
        isLoading: false,
        error: null
      })
    } catch (error) {
      console.error('Failed to optimize routes:', error)
      setState({
        optimizedRoute: null,
        isLoading: false,
        error: error instanceof Error ? error : new Error('Route optimization failed')
      })
    }
  }, [enabled, routes, amountIn, optimizeRoutes])

  // Auto-run optimization when parameters change
  useEffect(() => {
    runOptimization()
  }, [runOptimization])

  return {
    optimizedRoute: state.optimizedRoute,
    isLoading: state.isLoading,
    error: state.error
  }
}