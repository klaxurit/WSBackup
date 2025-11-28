import { useCallback, useEffect, useState } from "react"
import { zeroAddress, type Address } from "viem"
import { usePublicClient } from "wagmi"
import { useTokenCache } from "../useTokenCache"
import { type RawRoute, type SingleRoute, type PoolInfo } from "./types"
import { encodePath } from "../../utils/swap"
import { QuoterV2ABI } from "../../config/abis/QuoterV2"
import { PoolABI } from "../../config/abis/poolABI"
import { v3CoreFactoryContract } from "../../config/abis/v3CoreFactoryContractABI"
import { CONTRACTS_ADDRESS } from "../../config/contractsAddress"

/**
 * Parameters for useSwapQuoter hook
 */
export interface UseSwapQuoterParams {
  routes: RawRoute[]
  amountIn: bigint
  enabled?: boolean
}

/**
 * Return type for useSwapQuoter hook
 */
export interface UseSwapQuoterReturn {
  quotedRoutes: SingleRoute[]
  isLoading: boolean
  error: Error | null
  refresh: () => void
}

/**
 * Hook for getting quotes from QuoterV2 contract for discovered routes
 * Works without wallet connection for price estimation
 * Extracts quoting logic from the original useSwap hook
 */
export const useSwapQuoter = (params: UseSwapQuoterParams): UseSwapQuoterReturn => {
  const { routes, amountIn, enabled = true } = params
  const publicClient = usePublicClient()
  const { getTokenInfo } = useTokenCache()

  const [state, setState] = useState<{
    quotedRoutes: SingleRoute[]
    isLoading: boolean
    error: Error | null
  }>({
    quotedRoutes: [],
    isLoading: false,
    error: null
  })

  /**
   * Check if a pool exists and return its address
   * Helper function extracted from useSwap
   */
  const checkPoolExists = useCallback(async (
    tokenA: Address,
    tokenB: Address,
    fee: number
  ): Promise<Address | null> => {
    if (!publicClient) return null

    try {
      const poolAddress = await publicClient.readContract({
        address: CONTRACTS_ADDRESS.v3CoreFactory,
        abi: v3CoreFactoryContract,
        functionName: 'getPool',
        args: [tokenA, tokenB, fee]
      })

      return poolAddress === zeroAddress ? null : (poolAddress as Address)
    } catch {
      return null
    }
  }, [publicClient])

  /**
   * Get pool information (liquidity, price, etc.)
   * Extracted from original useSwap.getPoolInfo
   */
  const getPoolInfo = useCallback(async (
    poolAddress: Address,
    fee: number
  ): Promise<PoolInfo | null> => {
    if (!publicClient) return null

    try {
      const [slot0Result, liquidity, token0, token1] = await Promise.all([
        publicClient.readContract({
          address: poolAddress,
          abi: PoolABI,
          functionName: 'slot0'
        }),
        publicClient.readContract({
          address: poolAddress,
          abi: PoolABI,
          functionName: 'liquidity'
        }),
        publicClient.readContract({
          address: poolAddress,
          abi: PoolABI,
          functionName: 'token0'
        }),
        publicClient.readContract({
          address: poolAddress,
          abi: PoolABI,
          functionName: 'token1'
        }),
      ])

      return {
        token0: token0 as Address,
        token1: token1 as Address,
        fee,
        liquidity: liquidity as bigint,
        sqrtPriceX96: (slot0Result as any)[0]
      }
    } catch (error) {
      console.error('Failed to get pool info:', error)
      return null
    }
  }, [publicClient])

  /**
   * Quote a specific route using QuoterV2
   * Extracted from original useSwap.quoteRoute with improvements
   */
  const quoteRoute = useCallback(async (
    tokens: Address[],
    fees: number[],
    amountInWei: bigint
  ): Promise<{ quote: bigint, gasEstimate: bigint } | null> => {
    if (!publicClient || !amountInWei || amountInWei === 0n) return null

    try {
      if (tokens.length === 2) {
        // Single hop quote
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
        // Multi-hop quote
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
      console.error('Quote failed for route:', { tokens, fees, error })
      return null
    }
  }, [publicClient])

  /**
   * Quote all provided routes and return complete SingleRoute objects
   */
  const quoteAllRoutes = useCallback(async (): Promise<SingleRoute[]> => {
    if (!enabled || !publicClient || routes.length === 0 || !amountIn || amountIn === 0n) {
      return []
    }

    try {
      // Quote all routes in parallel for better performance
      const quotePromises = routes.map(async (route): Promise<SingleRoute | null> => {
        try {
          // 1. Get quote from QuoterV2
          const quoteResult = await quoteRoute(route.tokens, route.fees, amountIn)
          if (!quoteResult || quoteResult.quote === 0n) {
            return null
          }

          // 2. Get pool information for each hop
          const pools: PoolInfo[] = []
          const poolPromises = route.fees.map(async (fee, index) => {
            const poolAddress = await checkPoolExists(
              route.tokens[index],
              route.tokens[index + 1],
              fee
            )
            if (poolAddress) {
              return getPoolInfo(poolAddress, fee)
            }
            return null
          })

          const poolResults = await Promise.all(poolPromises)
          poolResults.forEach(pool => {
            if (pool) pools.push(pool)
          })

          // Skip if we couldn't get pool info (indicates invalid route)
          if (pools.length !== route.fees.length) {
            return null
          }

          // 3. Get token info for the path
          const pathTokenInfo = await Promise.all(
            route.tokens.map(token => getTokenInfo(token))
          )

          // Skip if we couldn't resolve all token info
          if (pathTokenInfo.some(token => !token)) {
            return null
          }

          return {
            path: pathTokenInfo,
            fees: route.fees,
            pools,
            quote: quoteResult.quote,
            gasEstimate: quoteResult.gasEstimate
          } as SingleRoute

        } catch (error) {
          console.error('Failed to quote route:', route, error)
          return null
        }
      })

      const quotedRoutes = await Promise.all(quotePromises)

      // Filter out failed quotes and sort by best output (accounting for gas costs)
      const validRoutes = quotedRoutes
        .filter((route): route is SingleRoute => route !== null && route.quote > 0n)
        .sort((a, b) => {
          // Sort by net output (quote - estimated gas cost)
          // Using a simple gas price estimation for comparison
          const gasPrice = 1000000000n // 1 gwei
          const aNet = a.quote - (a.gasEstimate * gasPrice)
          const bNet = b.quote - (b.gasEstimate * gasPrice)
          return aNet > bNet ? -1 : 1
        })

      return validRoutes

    } catch (error) {
      console.error('Failed to quote routes:', error)
      throw new Error(
        error instanceof Error ? error.message : 'Failed to get route quotes'
      )
    }
  }, [enabled, publicClient, routes, amountIn, quoteRoute, checkPoolExists, getPoolInfo, getTokenInfo])

  /**
   * Load quotes for all routes
   */
  const loadQuotes = useCallback(async () => {
    if (!enabled || routes.length === 0) {
      setState(prev => ({ ...prev, quotedRoutes: [], error: null }))
      return
    }

    // Si amountIn est 0 ou manquant, on peut quand même charger des routes avec un montant par défaut pour estimation
    if (!amountIn || amountIn === 0n) {
      setState(prev => ({ ...prev, quotedRoutes: [], error: null }))
      return
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      const quoted = await quoteAllRoutes()

      setState({
        quotedRoutes: quoted,
        isLoading: false,
        error: null
      })
    } catch (error) {
      console.error('Failed to load quotes:', error)
      setState({
        quotedRoutes: [],
        isLoading: false,
        error: error instanceof Error ? error : new Error('Quote loading failed')
      })
    }
  }, [enabled, routes, amountIn, quoteAllRoutes])

  /**
   * Refresh quotes manually
   */
  const refresh = useCallback(() => {
    loadQuotes()
  }, [loadQuotes])

  // Auto-load quotes when parameters change
  useEffect(() => {
    loadQuotes()
  }, [loadQuotes])

  return {
    quotedRoutes: state.quotedRoutes,
    isLoading: state.isLoading,
    error: state.error,
    refresh
  }
}