import { useQuery } from '@tanstack/react-query';

export interface BerachainToken {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logoUri: string | null;
  totalSupply: string;
  lastPrice: number;
  status: string; // Nouvelle propriété du backend
  // Propriétés supprimées qui n'existent plus
  // id: string;
  // chainId: number;
  // isVerified: boolean;
  // coingeckoId: string | null;
  // inPool: boolean;
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
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return { data, isLoading, error };
};

export const useTokens = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['tokens'],
    queryFn: async () => {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/token/list`);
      if (!response.ok) {
        throw new Error('Failed to fetch tokens');
      }
      const result = await response.json();
      return result; // Retourner directement le tableau
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  return { data, isLoading, error };
};

