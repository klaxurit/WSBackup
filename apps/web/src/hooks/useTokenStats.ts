import { useQuery } from '@tanstack/react-query'
import type { Address } from 'viem'
import { getStatsAddress } from '../utils/tokenMapping'

interface TokenStats {
  price?: number
  priceChange24h?: number
  volume24h?: number
  marketCap?: number
}

export function useTokenStats(displayTokenAddress: Address | null) {
  const statsAddress = displayTokenAddress ? getStatsAddress(displayTokenAddress) : null
  const { data: allTokens } = useQuery({
    queryKey: ['tokens'],
    queryFn: async () => {
      const resp = await fetch(`${import.meta.env.VITE_API_URL}/stats/tokens`)
      if (!resp.ok) return []
      return resp.json()
    },
    staleTime: 30000
  })

  return useQuery({
    queryKey: ['token-stats', statsAddress],
    enabled: !!statsAddress,
    queryFn: async (): Promise<TokenStats> => {
      if (!statsAddress) throw new Error('No stats address')

      try {
        if (allTokens) {
          const token = allTokens.find((t: any) =>
            t.address?.toLowerCase() === statsAddress.toLowerCase()
          )

          if (token) {
            const latestStat = token.Statistic?.[0]
            return {
              price: latestStat?.priceUSD || 0,
              priceChange24h: 0,
              volume24h: 0,
              marketCap: 0
            }
          }
        }
        const response = await fetch(`${import.meta.env.VITE_API_URL}/stats/token/${statsAddress}`)

        if (!response.ok) {
          return { price: 0 }
        }

        const priceHistory = await response.json()
        const latestPrice = priceHistory.length > 0 ? priceHistory[priceHistory.length - 1] : null

        return {
          price: latestPrice?.price || 0,
          priceChange24h: 0,
          volume24h: 0,
          marketCap: 0
        }
      } catch (error) {
        console.error('Error fetching token stats:', error)
        return { price: 0 }
      }
    },
    staleTime: 30000
  })
}