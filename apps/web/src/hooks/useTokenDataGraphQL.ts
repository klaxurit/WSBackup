import { useQuery } from '@tanstack/react-query';

// Types basés sur le schéma GraphQL
interface TokenDayData {
  priceUSD: string;
  marketCap: string;
  volume24hUSD: string;
  oneDayEvo: string;
  oneMonthEvo: string;
  fdv: string;
}

interface TokenData {
  id: string;
  symbol: string;
  name: string;
  decimals: number;
  logoUri: string | null;
  totalValueLockedUSD: string;
  tokenDayData: {
    items: TokenDayData[];
  };
}

interface TokensDataResponse {
  tokens: {
    items: TokenData[];
  };
}

const GET_TOKENS_DATA = `
  query GetTokensData {
    tokens(
      orderBy: "totalValueLockedUSD"
      orderDirection: "desc"
      limit: 100
    ) {
      items {
        id
        symbol
        name
        decimals
        logoUri
        totalValueLockedUSD
        tokenDayData(limit: 1, orderBy: "date", orderDirection: "desc") {
          items {
            priceUSD
            marketCap
            volume24hUSD
            oneDayEvo
            oneMonthEvo
            fdv
          }
        }
      }
    }
  }
`;

/**
 * Hook pour récupérer les données des tokens via GraphQL
 * Remplace les appels API REST par des requêtes GraphQL plus rapides
 */
export const useTokenDataGraphQL = () => {
  return useQuery<TokensDataResponse>({
    queryKey: ['tokensDataGraphQL'],
    queryFn: async () => {
      const response = await fetch(`${import.meta.env.VITE_GRAPHQL_URL}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: GET_TOKENS_DATA,
        }),
      });

      const data = await response.json();

      if (data.errors) {
        throw new Error(data.errors[0].message);
      }

      return data.data;
    },
    staleTime: 30_000, // 30 secondes
    enabled: true,
  });
};

/**
 * Utilitaire pour obtenir les données d'un token spécifique
 */
export const getTokenDataByAddress = (
  tokensData: TokenData[] | undefined,
  address: string
): TokenData | undefined => {
  if (!tokensData) return undefined;

  return tokensData.find(token =>
    token.id.toLowerCase() === address.toLowerCase()
  );
};

/**
 * Utilitaire pour obtenir le prix d'un token
 */
export const getTokenPrice = (tokenData: TokenData | undefined): number => {
  if (!tokenData?.tokenDayData?.items?.[0]?.priceUSD) return 0;
  return parseFloat(tokenData.tokenDayData.items[0].priceUSD);
};

/**
 * Utilitaire pour obtenir la market cap d'un token
 */
export const getTokenMarketCap = (tokenData: TokenData | undefined): number => {
  if (!tokenData?.tokenDayData?.items?.[0]?.marketCap) return 0;
  return parseFloat(tokenData.tokenDayData.items[0].marketCap);
};

/**
 * Utilitaire pour obtenir le volume 24h d'un token
 */
export const getTokenVolume24h = (tokenData: TokenData | undefined): number => {
  if (!tokenData?.tokenDayData?.items?.[0]?.volume24hUSD) return 0;
  return parseFloat(tokenData.tokenDayData.items[0].volume24hUSD);
};

/**
 * Utilitaire pour obtenir la TVL d'un token
 */
export const getTokenTVL = (tokenData: TokenData | undefined): number => {
  if (!tokenData?.totalValueLockedUSD) return 0;
  return parseFloat(tokenData.totalValueLockedUSD);
};

