import { useCallback, useEffect, useState } from "react"
import { zeroAddress, type Address } from "viem"
import { usePublicClient } from "wagmi"
import { COMMON_BASES, FEE_TIERS, MAX_HOPS } from "./constants"
import { type RawRoute } from "./types"
import { v3CoreFactoryContract } from "../../config/abis/v3CoreFactoryContractABI"
import { CONTRACTS_ADDRESS } from "../../config/contractsAddress"

/**
 * Parameters for useSwapRouter hook
 */
export interface UseSwapRouterParams {
  tokenIn: Address
  tokenOut: Address
  enabled?: boolean
}

/**
 * Return type for useSwapRouter hook
 */
export interface UseSwapRouterReturn {
  routes: RawRoute[]
  isLoading: boolean
  error: Error | null
  refresh: () => void
}

/**
 * Hook for discovering possible swap routes between two tokens
 * Works without wallet connection for route estimation
 * Extracts route discovery logic from the original useSwap hook
 */
export const useSwapRouter = (params: UseSwapRouterParams): UseSwapRouterReturn => {
  const { tokenIn, tokenOut, enabled = true } = params
  const publicClient = usePublicClient()

  const [state, setState] = useState<{
    routes: RawRoute[]
    isLoading: boolean
    error: Error | null
  }>({
    routes: [],
    isLoading: false,
    error: null
  })

  /**
   * Check if a pool exists between two tokens with a specific fee
   * Extracted from original useSwap.checkPoolExists
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
   * Find all possible routes between two tokens
   * Extracted from original useSwap.findRoutes with optimization
   */
  const findRoutes = useCallback(async (
    tokenA: Address,
    tokenB: Address,
    maxHops: number = MAX_HOPS
  ): Promise<RawRoute[]> => {
    const routes: RawRoute[] = []

    try {
      // 1. Direct routes - check all fee tiers
      const directRoutePromises = FEE_TIERS.map(async (fee) => {
        const poolAddress = await checkPoolExists(tokenA, tokenB, fee)
        if (poolAddress) {
          return {
            tokens: [tokenA, tokenB],
            fees: [fee]
          }
        }
        return null
      })

      const directRoutes = (await Promise.all(directRoutePromises)).filter(
        (route): route is NonNullable<typeof route> => route !== null
      )
      routes.push(...directRoutes)

      // 2. Multi-hop routes through common bases (if needed and maxHops >= 2)
      if (maxHops >= 2) {
        const bases = COMMON_BASES.filter(base => base !== tokenA && base !== tokenB)

        const multiHopPromises = bases.map(async (base) => {
          const baseRoutes: RawRoute[] = []

          // Check all fee tier combinations for 2-hop routes
          const fee1Promises = FEE_TIERS.map(async (fee1) => {
            const pool1 = await checkPoolExists(tokenA, base, fee1)
            if (!pool1) return []

            const fee2Promises = FEE_TIERS.map(async (fee2) => {
              const pool2 = await checkPoolExists(base, tokenB, fee2)
              if (pool2) {
                return {
                  tokens: [tokenA, base, tokenB],
                  fees: [fee1, fee2]
                }
              }
              return null
            })

            const validRoutes = (await Promise.all(fee2Promises)).filter(
              (route): route is NonNullable<typeof route> => route !== null
            )

            return validRoutes
          })

          const allFee1Results = await Promise.all(fee1Promises)
          baseRoutes.push(...allFee1Results.flat())

          return baseRoutes
        })

        const multiHopResults = await Promise.all(multiHopPromises)
        routes.push(...multiHopResults.flat())
      }

      // 3. Three-hop routes (only if no routes found and maxHops >= 3)
      if (maxHops >= 3 && routes.length === 0) {
        const bases = COMMON_BASES.filter(base => base !== tokenA && base !== tokenB)

        for (let i = 0; i < bases.length && routes.length === 0; i++) {
          for (let j = 0; j < bases.length && routes.length === 0; j++) {
            if (i === j) continue

            const base1 = bases[i]
            const base2 = bases[j]

            // Use fixed fee tiers for 3-hop routes to reduce complexity
            const [pool1, pool2, pool3] = await Promise.all([
              checkPoolExists(tokenA, base1, 3000),
              checkPoolExists(base1, base2, 500),
              checkPoolExists(base2, tokenB, 3000)
            ])

            if (pool1 && pool2 && pool3) {
              routes.push({
                tokens: [tokenA, base1, base2, tokenB],
                fees: [3000, 500, 3000]
              })
              break
            }
          }
        }
      }

      return routes
    } catch (error) {
      console.error('Route discovery failed:', error)
      throw new Error(
        error instanceof Error ? error.message : 'Failed to discover routes'
      )
    }
  }, [checkPoolExists])

  /**
   * Load routes for the current token pair
   */
  const loadRoutes = useCallback(async () => {
    if (!enabled || !tokenIn || !tokenOut || !publicClient) {
      setState(prev => ({ ...prev, routes: [], error: null }))
      return
    }

    // Skip if tokens are the same
    if (tokenIn === tokenOut) {
      setState(prev => ({ ...prev, routes: [], error: null }))
      return
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      const discoveredRoutes = await findRoutes(tokenIn, tokenOut)

      setState({
        routes: discoveredRoutes,
        isLoading: false,
        error: null
      })
    } catch (error) {
      console.error('Failed to load routes:', error)
      setState({
        routes: [],
        isLoading: false,
        error: error instanceof Error ? error : new Error('Route loading failed')
      })
    }
  }, [enabled, tokenIn, tokenOut, publicClient, findRoutes])

  /**
   * Refresh routes manually
   */
  const refresh = useCallback(() => {
    loadRoutes()
  }, [loadRoutes])

  // Auto-load routes when parameters change
  useEffect(() => {
    loadRoutes()
  }, [loadRoutes])

  return {
    routes: state.routes,
    isLoading: state.isLoading,
    error: state.error,
    refresh
  }
}