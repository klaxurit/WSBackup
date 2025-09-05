import { useQuery } from "@tanstack/react-query";
import { useAccount } from "wagmi";

const GET_USER_POSITIONS = `
  query GetUserPositions($owner: String!) {
    positions(where: { owner: $owner }) {
      totalCount
      pageInfo {
        endCursor
        hasNextPage
        hasPreviousPage
        startCursor
      }
      items {
        id
        owner
        token0
        token1
        tickLower
        tickUpper
        liquidity
        depositedToken0
        depositedToken1
        withdrawnToken0
        withdrawnToken1
        collectedFeesToken0
        collectedFeesToken1
        tokenId
        poolRef {
          id
          token0
          token1
          feeTier
          liquidity
          sqrtPrice
          tick
          totalValueLockedUSD
          token0Ref {
            id
            symbol
            name
            decimals
            logoUri
            tokenDayData(limit: 1, orderBy: "date", orderDirection: "desc") {
              items {
                priceUSD
              }
            }
          }
          token1Ref {
            id
            symbol
            name
            decimals
            logoUri
            tokenDayData(limit: 1, orderBy: "date", orderDirection: "desc") {
              items {
                priceUSD
              }
            }
          }
          poolDayData(limit: 1, orderBy: "date", orderDirection: "desc") {
            items {
              apr
              volumeUSD
            }
          }
        }
      }
    }
  }
`;


// Interfaces pour les données GraphQL
interface GraphQLPosition {
  id: string;
  owner: string;
  token0: string;
  token1: string;
  tickLower: string;
  tickUpper: string;
  liquidity: string;
  depositedToken0: string;
  depositedToken1: string;
  withdrawnToken0: string;
  withdrawnToken1: string;
  collectedFeesToken0: string;
  collectedFeesToken1: string;
  tokenId: string;
  poolRef: {
    id: string;
    token0: string;
    token1: string;
    feeTier: number;
    liquidity: string;
    sqrtPrice: string;
    tick: number;
    totalValueLockedUSD: number;
    token0Ref: {
      id: string;
      symbol: string;
      name: string;
      decimals: number;
      logoUri?: string;
      tokenDayData: {
        items: Array<{
          priceUSD: number;
        }>;
      };
    };
    token1Ref: {
      id: string;
      symbol: string;
      name: string;
      decimals: number;
      logoUri?: string;
      tokenDayData: {
        items: Array<{
          priceUSD: number;
        }>;
      };
    };
    poolDayData: {
      items: Array<{
        apr: number | string;
        volumeUSD: number;
      }>;
    };
  };
}

interface GraphQLPositionsResponse {
  positions: {
    totalCount: number;
    pageInfo: {
      endCursor: string;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
      startCursor: string;
    };
    items: GraphQLPosition[];
  };
}

export interface Position {
  amount0: string;
  amount1: string;
  createdAt: string;
  liquidity: string;
  owner: string;
  poolAddress: string;
  tickLower: number;
  tickUpper: number;
  tokenId: string;
  updatedAt: string;
}

export interface Token {
  TokenPrice: Array<{
    createdAt: string;
    price: number;
    priceSource: string;
    tokenAddress: string;
    volumeUSD: number;
  }>;
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logoUri?: string;
}

export interface Pool {
  address: string;
  apr: number;
  createdAt: string;
  fee: number;
  liquidity: string;
  sqrtPriceX96: string;
  tick: number;
  token0: Token;
  token1: Token;
  totalValueLockedUSD: number;
  volumeUSD: number;
}

export interface PositionData {
  position: Position;
  pool: Pool;
}

const transformGraphQLPositionToPositionData = (
  graphqlPosition: GraphQLPosition
): PositionData => {
  const amount0 = graphqlPosition.depositedToken0;
  const amount1 = graphqlPosition.depositedToken1;

  const token0Price = graphqlPosition.poolRef.token0Ref.tokenDayData.items[0]?.priceUSD || 0;
  const token1Price = graphqlPosition.poolRef.token1Ref.tokenDayData.items[0]?.priceUSD || 0;

  const latestDayData = graphqlPosition.poolRef.poolDayData.items[0];

  const position: Position = {
    amount0,
    amount1,
    createdAt: new Date().toISOString(),
    liquidity: graphqlPosition.liquidity,
    owner: graphqlPosition.owner,
    poolAddress: graphqlPosition.poolRef.id,
    tickLower: parseInt(graphqlPosition.tickLower),
    tickUpper: parseInt(graphqlPosition.tickUpper),
    tokenId: graphqlPosition.tokenId,
    updatedAt: new Date().toISOString(),
  };

  const pool: Pool = {
    address: graphqlPosition.poolRef.id,
    apr: typeof latestDayData?.apr === 'number'
      ? latestDayData.apr
      : (typeof latestDayData?.apr === 'string' ? parseFloat(latestDayData.apr) : 0),
    createdAt: new Date().toISOString(),
    fee: graphqlPosition.poolRef.feeTier / 10000,
    liquidity: graphqlPosition.poolRef.liquidity,
    sqrtPriceX96: graphqlPosition.poolRef.sqrtPrice,
    tick: graphqlPosition.poolRef.tick,
    token0: {
      TokenPrice: token0Price > 0 ? [{
        createdAt: new Date().toISOString(),
        price: token0Price,
        priceSource: 'ponder',
        tokenAddress: graphqlPosition.poolRef.token0Ref.id,
        volumeUSD: 0,
      }] : [],
      address: graphqlPosition.poolRef.token0Ref.id,
      symbol: graphqlPosition.poolRef.token0Ref.symbol,
      name: graphqlPosition.poolRef.token0Ref.name,
      decimals: graphqlPosition.poolRef.token0Ref.decimals,
      logoUri: graphqlPosition.poolRef.token0Ref.logoUri,
    },
    token1: {
      TokenPrice: token1Price > 0 ? [{
        createdAt: new Date().toISOString(),
        price: token1Price,
        priceSource: 'ponder',
        tokenAddress: graphqlPosition.poolRef.token1Ref.id,
        volumeUSD: 0,
      }] : [],
      address: graphqlPosition.poolRef.token1Ref.id,
      symbol: graphqlPosition.poolRef.token1Ref.symbol,
      name: graphqlPosition.poolRef.token1Ref.name,
      decimals: graphqlPosition.poolRef.token1Ref.decimals,
      logoUri: graphqlPosition.poolRef.token1Ref.logoUri,
    },
    totalValueLockedUSD: graphqlPosition.poolRef.totalValueLockedUSD,
    volumeUSD: latestDayData?.volumeUSD || 0,
  };

  return { position, pool };
};

export const usePositionsGraphQL = () => {
  const { address } = useAccount();

  const { data: positionsData, isLoading, error, refetch } = useQuery({
    queryKey: ['positions-ponder', address],
    queryFn: async (): Promise<GraphQLPositionsResponse> => {
      if (!address) throw new Error('No address');

      const response = await fetch(`${import.meta.env.VITE_GRAPHQL_URL}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: GET_USER_POSITIONS,
          variables: { owner: address.toLowerCase() }
        }),
      });

      const data = await response.json();
      if (data.errors) {
        throw new Error(data.errors[0].message);
      }

      return data.data as GraphQLPositionsResponse;
    },
    enabled: !!address,
    staleTime: 30000,
  });

  const positions: PositionData[] = positionsData?.positions.items.map(pos =>
    transformGraphQLPositionToPositionData(pos)
  ) || [];

  return {
    positions,
    isLoading,
    error,
    refetch
  };
};
