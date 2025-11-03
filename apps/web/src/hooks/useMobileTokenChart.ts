import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

export type MobileChartInterval = '1H' | '1D' | '1W' | '1M' | '1Y' | 'ALL';

export interface MobileChartPoint {
  time: number;
  value: number;
}

export interface MobileChartStats {
  currentPrice: number;
  priceChange: number;
  priceChangePercent: number;
  high24h: number;
  low24h: number;
}

export interface MobileChartData {
  points: MobileChartPoint[];
  tokenSymbol: string;
  tokenName: string;
}

interface TokenDayData {
  date: number;
  priceUSD: string;
}

interface TokenHourData {
  periodStartUnix: number;
  priceUSD: string;
}

// Configuration des intervalles pour mobile
const MOBILE_INTERVAL_CONFIG = {
  '1H': { period: 'hour' as const, limit: 24, label: '1 Hour' },
  '1D': { period: 'hour' as const, limit: 24, label: '1 Day' },
  '1W': { period: 'day' as const, limit: 7, label: '1 Week' },
  '1M': { period: 'day' as const, limit: 30, label: '1 Month' },
  '1Y': { period: 'day' as const, limit: 365, label: '1 Year' },
  'ALL': { period: 'day' as const, limit: 1000, label: 'All Time' },
};

// Query GraphQL pour récupérer l'historique des prix d'un token + symbole
const buildTokenPriceQuery = (
  tokenAddress: string,
  interval: MobileChartInterval
) => {
  const config = MOBILE_INTERVAL_CONFIG[interval];
  const dataType = config.period === 'hour' ? 'tokenHourDatas' : 'tokenDayDatas';
  const timeField = config.period === 'hour' ? 'periodStartUnix' : 'date';

  return `
    query GetTokenPriceHistory {
      token(id: "${tokenAddress}") {
        id
        symbol
        name
      }
      ${dataType}(
        where: { token: "${tokenAddress}" }
        orderBy: "${timeField}"
        orderDirection: "desc"
        limit: ${config.limit}
      ) {
        items {
          ${timeField}
          priceUSD
        }
      }
    }
  `;
};

// Fonction pour calculer les statistiques
const calculateStats = (data: MobileChartPoint[]): MobileChartStats | null => {
  if (!data || data.length === 0) return null;

  const currentPrice = data[data.length - 1]?.value || 0;
  const previousPrice = data[data.length - 2]?.value || currentPrice;
  const priceChange = currentPrice - previousPrice;
  const priceChangePercent = previousPrice !== 0 ? (priceChange / previousPrice) * 100 : 0;

  // Calculer high/low des dernières 24h (dernier point)
  const last24hData = data.slice(-1);
  const high24h = Math.max(...last24hData.map(p => p.value));
  const low24h = Math.min(...last24hData.map(p => p.value));

  return {
    currentPrice,
    priceChange,
    priceChangePercent,
    high24h,
    low24h,
  };
};

/**
 * Hook simplifié pour récupérer les données de prix d'un token (mobile)
 * - Fetch tokenDayDatas ou tokenHourDatas selon l'intervalle
 * - Retourne le prix USD historique
 * - Optimisé pour mobile (données légères)
 */
export function useMobileTokenChart(
  tokenAddress: string | null,
  interval: MobileChartInterval = '1M'
) {
  const config = MOBILE_INTERVAL_CONFIG[interval];

  const query = useQuery({
    queryKey: ['mobile-token-chart', tokenAddress, interval],
    enabled: !!tokenAddress,
    queryFn: async () => {
      if (!tokenAddress) throw new Error('Token address is required');

      const graphqlUrl = import.meta.env.VITE_GRAPHQL_URL || 'http://localhost:42069/';
      const finalUrl = graphqlUrl.endsWith('/graphql')
        ? graphqlUrl
        : `${graphqlUrl.replace(/\/$/, '')}/graphql`;

      const graphqlQuery = buildTokenPriceQuery(tokenAddress, interval);

      const response = await fetch(finalUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: graphqlQuery,
        }),
      });

      if (!response.ok) {
        throw new Error(`GraphQL error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();

      if (result.errors) {
        console.error('GraphQL Errors:', result.errors);
        throw new Error(result.errors[0].message);
      }

      const tokenInfo = result.data.token;

      // Récupérer les données selon le type (hour ou day)
      const rawData: (TokenDayData | TokenHourData)[] =
        config.period === 'hour'
          ? (result.data.tokenHourDatas?.items || [])
          : (result.data.tokenDayDatas?.items || []);

      // DEBUG: Afficher les données reçues
      console.log('[MobileTokenChart] Token:', tokenAddress);
      console.log('[MobileTokenChart] Interval:', interval, '- Period:', config.period);
      console.log('[MobileTokenChart] Token Info:', tokenInfo);
      console.log('[MobileTokenChart] Raw data:', rawData);
      console.log('[MobileTokenChart] Data length:', rawData.length);

      if (!tokenInfo) {
        console.warn('[MobileTokenChart] Token not found:', tokenAddress);
        throw new Error('Token not found in Ponder');
      }

      if (rawData.length === 0) {
        console.warn('[MobileTokenChart] No data found for token:', tokenAddress);
        console.warn('[MobileTokenChart] Make sure this token is indexed by Ponder');
      }

      // Trier par ordre chronologique croissant (du plus ancien au plus récent)
      const sortedData = [...rawData].sort((a, b) => {
        const timeA = 'periodStartUnix' in a ? a.periodStartUnix : a.date;
        const timeB = 'periodStartUnix' in b ? b.periodStartUnix : b.date;
        return timeA - timeB;
      });

      // Convertir en format chart
      const chartPoints: MobileChartPoint[] = sortedData.map(item => ({
        time: 'periodStartUnix' in item ? item.periodStartUnix : item.date,
        value: parseFloat(item.priceUSD),
      }));

      console.log('[MobileTokenChart] Chart data points:', chartPoints.length);
      if (chartPoints.length > 0) {
        console.log('[MobileTokenChart] First point:', chartPoints[0]);
        console.log('[MobileTokenChart] Last point:', chartPoints[chartPoints.length - 1]);
      }

      return {
        points: chartPoints,
        tokenSymbol: tokenInfo.symbol,
        tokenName: tokenInfo.name,
      } as MobileChartData;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchInterval: 10 * 60 * 1000, // Refresh toutes les 10 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Calculer les stats
  const stats = useMemo(() => {
    return query.data?.points ? calculateStats(query.data.points) : null;
  }, [query.data]);

  return {
    data: query.data?.points || [],
    tokenSymbol: query.data?.tokenSymbol || '',
    tokenName: query.data?.tokenName || '',
    isLoading: query.isLoading,
    error: query.error,
    stats,
  };
}

