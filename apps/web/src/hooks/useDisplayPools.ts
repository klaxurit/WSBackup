import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import type { Address } from 'viem'
import { getPoolDisplayToken } from '../utils/tokenMapping'
import { useTokenCache } from './useTokenCache'
import { isPoolBlacklisted } from '../config/poolBlacklist'

interface RawPoolData {
  id: string
  address: Address
  token0: {
    address: Address
    symbol?: string
    name?: string
    decimals: number
    logoUri?: string
  }
  token1: {
    address: Address
    symbol?: string
    name?: string
    decimals: number
    logoUri?: string
  }
  fee: number
  liquidity: string
  volume24h: string
  tvl: string
  apr: string
}

interface DisplayPoolToken {
  address: Address
  originalAddress: Address
  symbol: string
  name: string
  decimals: number
  logoUri: string
}

export interface DisplayPool {
  id: string
  address: Address
  displayToken0: DisplayPoolToken
  displayToken1: DisplayPoolToken
  token0: RawPoolData['token0']
  token1: RawPoolData['token1']
  fee: number
  liquidity: string
  volume24h: string
  tvl: string
  apr: string
  displayName: string
  isBeraPool: boolean
}

/**
 * Hook pour récupérer et transformer les pools pour l'affichage
 */
export function useDisplayPools() {
  const { getTokenInfo } = useTokenCache()
  const poolsQuery = useQuery({
    queryKey: ['pools'],
    queryFn: async (): Promise<RawPoolData[]> => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/pool`)

        if (!response.ok) {
          throw new Error(`Failed to fetch pools: ${response.statusText}`)
        }

        return response.json()
      } catch (error) {
        console.error('Error fetching pools:', error)
        throw error
      }
    }
  })

  const displayPools = useMemo(() => {
    if (!poolsQuery.data) return []

    // Filter out blacklisted pools before transformation
    return poolsQuery.data
      .filter((pool) => !isPoolBlacklisted(pool.address))
      .map((pool): DisplayPool => {
      try {
        const displayToken0Info = getPoolDisplayToken(pool.token0.address)
        const displayToken1Info = getPoolDisplayToken(pool.token1.address)
        const displayToken0: DisplayPoolToken = {
          address: displayToken0Info.address,
          originalAddress: displayToken0Info.originalAddress,
          symbol: displayToken0Info.symbol || pool.token0.symbol || 'UNKNOWN',
          name: displayToken0Info.name || pool.token0.name || 'Unknown Token',
          decimals: pool.token0.decimals,
          logoUri: displayToken0Info.logoUri || pool.token0.logoUri || '/default-token.png'
        }
        const displayToken1: DisplayPoolToken = {
          address: displayToken1Info.address,
          originalAddress: displayToken1Info.originalAddress,
          symbol: displayToken1Info.symbol || pool.token1.symbol || 'UNKNOWN',
          name: displayToken1Info.name || pool.token1.name || 'Unknown Token',
          decimals: pool.token1.decimals,
          logoUri: displayToken1Info.logoUri || pool.token1.logoUri || '/default-token.png'
        }
        const displayName = `${displayToken0.symbol}/${displayToken1.symbol}`
        const isBeraPool = displayToken0.symbol === 'BERA' || displayToken1.symbol === 'BERA'

        return {
          ...pool,
          displayToken0,
          displayToken1,
          displayName,
          isBeraPool
        }
      } catch (error) {
        return {
          ...pool,
          displayToken0: {
            address: pool.token0.address,
            originalAddress: pool.token0.address,
            symbol: pool.token0.symbol || 'UNKNOWN',
            name: pool.token0.name || 'Unknown Token',
            decimals: pool.token0.decimals,
            logoUri: pool.token0.logoUri || '/default-token.png'
          },
          displayToken1: {
            address: pool.token1.address,
            originalAddress: pool.token1.address,
            symbol: pool.token1.symbol || 'UNKNOWN',
            name: pool.token1.name || 'Unknown Token',
            decimals: pool.token1.decimals,
            logoUri: pool.token1.logoUri || '/default-token.png'
          },
          displayName: `${pool.token0.symbol || 'UNKNOWN'}/${pool.token1.symbol || 'UNKNOWN'}`,
          isBeraPool: false
        } as DisplayPool
      }
    })
  }, [poolsQuery.data, getTokenInfo])

  return {
    data: displayPools,
    isLoading: poolsQuery.isLoading,
    error: poolsQuery.error,
    refetch: poolsQuery.refetch
  }
}

/**
 * Hook pour filtrer les pools populaires/recommandés
 */
export function usePopularPools(limit: number = 6) {
  const { data: allPools, ...rest } = useDisplayPools()

  const popularPools = useMemo(() => {
    if (!allPools) return []

    return allPools
      .sort((a: DisplayPool, b: DisplayPool) => {
        if (a.isBeraPool && !b.isBeraPool) return -1
        if (!a.isBeraPool && b.isBeraPool) return 1
        return parseFloat(b.tvl) - parseFloat(a.tvl)
      })
      .slice(0, limit)
  }, [allPools, limit])

  return {
    data: popularPools,
    ...rest
  }
}
