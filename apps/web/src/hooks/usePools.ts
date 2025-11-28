import { useQuery } from "@tanstack/react-query";
import { isPoolBlacklisted } from '../config/poolBlacklist';

const GET_POOLS = `
  query GetPools {
    pools {
      totalCount
      pageInfo {
        endCursor
        hasNextPage
        hasPreviousPage
        startCursor
      }
      items {
        feeTier
        id
        liquidity
        token0Ref {
          name
          id
          symbol
          logoUri
        }
        token1Ref {
          id
          name
          symbol
          logoUri
        }
        totalValueLockedBERA
        totalValueLockedUSD
        volumeUSD
      }
    }
  }`;

export interface Pool {
  id: string;
  feeTier: number;
  liquidity: string;
  token0Ref: {
    name: string;
    id: string;
    symbol: string;
    logoUri?: string;
  };
  token1Ref: {
    id: string;
    name: string;
    symbol: string;
    logoUri?: string;
  };
  totalValueLockedBERA: string;
  totalValueLockedUSD: string;
  volumeUSD: string;
}

export interface PoolsResponse {
  pools: {
    totalCount: number;
    pageInfo: {
      endCursor: string;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
      startCursor: string;
    };
    items: Pool[];
  };
}

export function usePools() {
  return useQuery({
    queryKey: ['pools'],
    queryFn: async (): Promise<Pool[]> => {
      const response = await fetch(`${import.meta.env.VITE_GRAPHQL_URL}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: GET_POOLS
        }),
      });

      const data = await response.json();

      if (data.errors) {
        throw new Error(data.errors[0].message);
      }

      const pools = data.data.pools.items || [];
      // Filter out blacklisted pools
      return pools.filter((pool: Pool) => !isPoolBlacklisted(pool.id));
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false
  });
}
