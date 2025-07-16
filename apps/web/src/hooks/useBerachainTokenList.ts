import type { Address } from 'viem';
import { useQuery, type UseQueryResult } from '@tanstack/react-query';

export interface BerachainToken {
  id: number;
  symbol: string;
  name: string;
  address: Address;
  decimals: number;
  chainId: number;
  logoUri?: string;
  isVerified: boolean;
  coingeckoId?: string | null;
}

export const useTokens = (): UseQueryResult<BerachainToken[], Error> => {
  return useQuery({
    queryKey: ['tokens'],
    queryFn: async () => {
      const url = `${import.meta.env.VITE_API_URL}/tokens`
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error('Can\'t fetch token list')
      }

      const result = await response.json()
      return result.map((t: any): BerachainToken => ({ ...t, isVerified: t.isVerified === 1 }))
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false
  })
}

