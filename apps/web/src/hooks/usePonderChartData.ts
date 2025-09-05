import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import type {
  ChartType,
  ChartInterval,
  ChartMetric,
  LineChartPoint,
  CandlestickPoint,
  PoolDayData,
  PoolHourData,
  TokenDayData,
  TokenHourData,
  ChartStats
} from '../types/chart';

// Configuration des intervalles
const INTERVAL_CONFIG = {
  '1H': {
    period: 'hour' as const,
    limit: 24, // 24 heures
    staleTime: 60 * 1000, // 1 minute
    refetchInterval: 60 * 1000
  },
  '4H': {
    period: 'hour' as const,
    limit: 168, // 7 jours (168h / 4h = 42 points)
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000
  },
  '1D': {
    period: 'day' as const,
    limit: 7, // 7 jours
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchInterval: 10 * 60 * 1000
  },
  '1W': {
    period: 'day' as const,
    limit: 30, // 30 jours (4 semaines)
    staleTime: 30 * 60 * 1000, // 30 minutes
    refetchInterval: 30 * 60 * 1000
  },
  '1M': {
    period: 'day' as const,
    limit: 90, // 90 jours (3 mois)
    staleTime: 60 * 60 * 1000, // 1 heure
    refetchInterval: 60 * 60 * 1000
  },
  '1Y': {
    period: 'day' as const,
    limit: 365, // 365 jours (1 an)
    staleTime: 2 * 60 * 60 * 1000, // 2 heures
    refetchInterval: 2 * 60 * 60 * 1000
  }
};

// Fonction pour construire les requêtes GraphQL
const buildPoolQuery = (poolAddress: string, _metric: ChartMetric, interval: ChartInterval, limit: number) => {
  const config = INTERVAL_CONFIG[interval];
  const dataType = config.period === 'hour' ? 'poolHourDatas' : 'poolDayDatas';
  const timeField = config.period === 'hour' ? 'periodStartUnix' : 'date';

  return `
    query GetPoolChartData {
      ${dataType}(
        where: { pool: "${poolAddress}" }
        orderBy: "${timeField}"
        orderDirection: "desc"
        limit: ${limit}
      ) {
        items {
          id
          ${timeField}
          pool {
            id
            token0
            token1
            feeTier
            token0Ref {
              symbol
              name
            }
            token1Ref {
              symbol
              name
            }
          }
          tvlUSD
          volumeUSD
          feesUSD
          open
          high
          low
          close
        }
      }
    }
  `;
};

const buildTokenQuery = (tokenAddress: string, _metric: ChartMetric, interval: ChartInterval, limit: number) => {
  const config = INTERVAL_CONFIG[interval];
  const dataType = config.period === 'hour' ? 'tokenHourDatas' : 'tokenDayDatas';
  const timeField = config.period === 'hour' ? 'periodStartUnix' : 'date';

  return `
    query GetTokenChartData {
      ${dataType}(
        where: { token: "${tokenAddress}" }
        orderBy: "${timeField}"
        orderDirection: "desc"
        limit: ${limit}
      ) {
        items {
          id
          ${timeField}
          token {
            id
            symbol
            name
          }
          priceUSD
          volumeUSD
          totalValueLockedUSD
          feesUSD
          open
          high
          low
          close
        }
      }
    }
  `;
};

// Fonction pour traiter les données de pool
const processPoolData = (
  data: PoolDayData[] | PoolHourData[],
  metric: ChartMetric,
  chartType: ChartType
): LineChartPoint[] | CandlestickPoint[] => {
  if (!data || data.length === 0) return [];

  const sortedData = [...data].reverse(); // Trier par ordre chronologique

  if (chartType === 'candlestick') {
    return sortedData.map(item => ({
      time: 'periodStartUnix' in item ? item.periodStartUnix : item.date,
      open: parseFloat(item.open),
      high: parseFloat(item.high),
      low: parseFloat(item.low),
      close: parseFloat(item.close),
    })) as CandlestickPoint[];
  }

  return sortedData.map(item => {
    let value = 0;
    switch (metric) {
      case 'tvl':
        value = parseFloat(item.tvlUSD);
        break;
      case 'volume':
        value = parseFloat(item.volumeUSD);
        break;
      case 'fees':
        value = parseFloat(item.feesUSD);
        break;
      case 'price':
      default:
        value = parseFloat(item.close);
        break;
    }

    return {
      time: 'periodStartUnix' in item ? item.periodStartUnix : item.date,
      value,
    };
  }) as LineChartPoint[];
};

// Fonction pour traiter les données de token
const processTokenData = (
  data: TokenDayData[] | TokenHourData[],
  metric: ChartMetric,
  chartType: ChartType
): LineChartPoint[] | CandlestickPoint[] => {
  if (!data || data.length === 0) return [];

  const sortedData = [...data].reverse(); // Trier par ordre chronologique

  if (chartType === 'candlestick') {
    return sortedData.map(item => ({
      time: 'periodStartUnix' in item ? item.periodStartUnix : item.date,
      open: parseFloat(item.open),
      high: parseFloat(item.high),
      low: parseFloat(item.low),
      close: parseFloat(item.close),
    })) as CandlestickPoint[];
  }

  return sortedData.map(item => {
    let value = 0;
    switch (metric) {
      case 'tvl':
        value = parseFloat(item.totalValueLockedUSD);
        break;
      case 'volume':
        value = parseFloat(item.volumeUSD);
        break;
      case 'fees':
        value = parseFloat(item.feesUSD);
        break;
      case 'price':
      default:
        value = parseFloat(item.priceUSD);
        break;
    }

    return {
      time: 'periodStartUnix' in item ? item.periodStartUnix : item.date,
      value,
    };
  }) as LineChartPoint[];
};

// Fonction pour calculer les statistiques
const calculateStats = (data: LineChartPoint[] | CandlestickPoint[]): ChartStats | null => {
  if (!data || data.length === 0) return null;

  const values = data.map(point =>
    'value' in point ? point.value : point.close
  );

  const min = Math.min(...values);
  const max = Math.max(...values);
  const avg = values.reduce((sum, val) => sum + val, 0) / values.length;

  const firstValue = values[0];
  const lastValue = values[values.length - 1];
  const change = lastValue - firstValue;
  const changePercent = firstValue !== 0 ? (change / firstValue) * 100 : 0;

  return {
    min,
    max,
    avg,
    change,
    changePercent,
  };
};

// Hook principal pour les données de chart
export function usePonderChartData(
  poolAddress: string | null,
  tokenAddress: string | null,
  metric: ChartMetric = 'price',
  chartType: ChartType = 'area',
  interval: ChartInterval = '1D'
) {
  const config = INTERVAL_CONFIG[interval];
  const isPoolData = !!poolAddress;
  const address = poolAddress || tokenAddress;

  const query = useQuery({
    queryKey: ['ponder-chart-data', address, metric, chartType, interval],
    enabled: !!address,
    queryFn: async () => {
      if (!address) throw new Error('Address is required');

      const graphqlUrl = import.meta.env.VITE_GRAPHQL_URL || 'http://localhost:42069/graphql';

      const graphqlQuery = isPoolData
        ? buildPoolQuery(address, metric, interval, config.limit)
        : buildTokenQuery(address, metric, interval, config.limit);

      const response = await fetch(graphqlUrl, {
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

      const data = isPoolData
        ? result.data.poolDayDatas?.items || result.data.poolHourDatas?.items || []
        : result.data.tokenDayDatas?.items || result.data.tokenHourDatas?.items || [];

      return isPoolData
        ? processPoolData(data as PoolDayData[] | PoolHourData[], metric, chartType)
        : processTokenData(data as TokenDayData[] | TokenHourData[], metric, chartType);
    },
    staleTime: config.staleTime,
    refetchInterval: config.refetchInterval,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const stats = useMemo(() => {
    return query.data ? calculateStats(query.data) : null;
  }, [query.data]);

  return {
    ...query,
    stats,
  };
}

// Hook spécialisé pour les données de pool
export function usePoolChartData(
  poolAddress: string | null,
  metric: ChartMetric = 'price',
  chartType: ChartType = 'area',
  interval: ChartInterval = '1D'
) {
  return usePonderChartData(poolAddress, null, metric, chartType, interval);
}

// Hook spécialisé pour les données de token
export function useTokenChartData(
  tokenAddress: string | null,
  metric: ChartMetric = 'price',
  chartType: ChartType = 'area',
  interval: ChartInterval = '1D'
) {
  return usePonderChartData(null, tokenAddress, metric, chartType, interval);
}

// Hook pour trouver une pool par tokens
export function usePoolByTokens(
  token0Address: string | null,
  token1Address: string | null,
  feeTier?: number
) {
  return useQuery({
    queryKey: ['pool-by-tokens', token0Address, token1Address, feeTier],
    enabled: !!(token0Address && token1Address),
    queryFn: async () => {
      if (!token0Address || !token1Address) return null;

      const query = `
        query GetPoolByTokens {
          pools(
            where: { 
              token0: "${token0Address}", 
              token1: "${token1Address}"
              ${feeTier ? `, feeTier: ${feeTier}` : ''}
            }
            limit: 1
          ) {
            items {
              id
              token0
              token1
              feeTier
              totalValueLockedUSD
              volumeUSD
              feesUSD
              token0Ref {
                symbol
                name
              }
              token1Ref {
                symbol
                name
              }
            }
          }
        }
      `;

      const response = await fetch(import.meta.env.VITE_GRAPHQL_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        throw new Error(`GraphQL error: ${response.status}`);
      }

      const result = await response.json();

      if (result.errors) {
        throw new Error(result.errors[0].message);
      }

      return result.data.pools.items[0] || null;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
