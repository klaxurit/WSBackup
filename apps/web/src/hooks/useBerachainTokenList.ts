import React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export interface BerachainToken {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logoUri: string | null;
  totalSupply: string;
  lastPrice: number;
  status: string;
  balance?: string;
  priceUSD?: number;
  balanceUSD?: number;
}

export const useBerachainTokenList = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['berachainTokenList'],
    queryFn: async () => {
      const response = await fetch('https://raw.githubusercontent.com/berachain/metadata/main/src/tokens/berachain.tokenlist.json');
      if (!response.ok) {
        throw new Error('Failed to fetch token list');
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000,
  });

  return { data, isLoading, error };
};

const DEFAULT_TOKENS: BerachainToken[] = [
  {
    address: '0x0000000000000000000000000000000000000000',
    symbol: 'BERA',
    name: 'Bera',
    decimals: 18,
    logoUri: null,
    totalSupply: '0',
    lastPrice: 0,
    status: 'IN_POOL'
  },
  {
    address: '0x6969696969696969696969696969696969696969',
    symbol: 'wBERA',
    name: 'Wrapped Bera',
    decimals: 18,
    logoUri: null,
    totalSupply: '0',
    lastPrice: 0,
    status: 'IN_POOL'
  },
  {
    address: '0xFCBD14DC51f0A4d49d5E53C2E0950e0bC26d0Dce',
    symbol: 'HONEY',
    name: 'Honey',
    decimals: 18,
    logoUri: null,
    totalSupply: '0',
    lastPrice: 0,
    status: 'IN_POOL'
  }
];

export const useTokens = () => {
  const queryClient = useQueryClient();
  React.useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ['tokens'] });
  }, [queryClient]);

  const { data, isLoading, error } = useQuery({
    queryKey: ['tokens'],
    queryFn: async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/token/list`);
        if (!response.ok) {
          throw new Error('Failed to fetch tokens');
        }
        const result = await response.json();

        const tokensArray = Array.isArray(result) ? result : (result?.data || []);

        if (tokensArray.length === 0) {
          return DEFAULT_TOKENS;
        }

        return tokensArray;
      } catch (error) {
        return DEFAULT_TOKENS;
      }
    },
    staleTime: 0,
    gcTime: 0,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    refetchOnWindowFocus: true,
  });

  return { data, isLoading, error };
};

