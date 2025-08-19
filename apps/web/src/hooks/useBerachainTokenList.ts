import { useQuery } from '@tanstack/react-query';

export interface BerachainToken {
  id: string;
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logoUri?: string;
  website?: string;
  twitter?: string;
  description?: string;
  coingeckoId?: string;
  totalSupply?: string;
  lastPrice?: number;
  inPool?: boolean;
}

export const useTokens = () => {
  return useQuery({
    queryKey: ['tokens'],
    queryFn: async () => {
      const resp = await fetch(`${import.meta.env.VITE_API_URL}/token/`);
      if (!resp.ok) return { data: [], pagination: {} };
      const result = await resp.json();
      // Retourne directement les données, pas l'objet complet
      return result.data || [];
    },
    staleTime: 5 * 60 * 1000,
  });
};

