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
    limit: 1000, // Maximum autorisé par l'API (1000 heures = ~42 jours)
    groupBy: 1, // 1 heure par point
    staleTime: 60 * 1000, // 1 minute
    refetchInterval: 60 * 1000
  },
  '4H': {
    period: 'hour' as const,
    limit: 1000, // Maximum autorisé par l'API (1000 heures = ~42 jours)
    groupBy: 4, // 4 heures par point
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000
  },
  '1D': {
    period: 'day' as const,
    limit: 90, // 3 mois de données daily
    groupBy: 1, // 1 jour par point
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchInterval: 10 * 60 * 1000
  },
  '1W': {
    period: 'day' as const,
    limit: 90, // 3 mois de données daily
    groupBy: 7, // 7 jours par point
    staleTime: 30 * 60 * 1000, // 30 minutes
    refetchInterval: 30 * 60 * 1000
  },
  '1M': {
    period: 'day' as const,
    limit: 90, // 3 mois de données daily
    groupBy: 30, // 30 jours par point
    staleTime: 60 * 60 * 1000, // 1 heure
    refetchInterval: 60 * 60 * 1000
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
          token0Price
          token1Price
          t0open
          t0high
          t0low
          t0close
          t1open
          t1high
          t1low
          t1close
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

// Fonction pour grouper les données de pool selon l'intervalle
const groupPoolDataByInterval = (
  data: PoolDayData[] | PoolHourData[],
  interval: ChartInterval
): (PoolDayData | PoolHourData)[] => {
  const config = INTERVAL_CONFIG[interval];

  if (config.groupBy === 1) {
    // Pas de groupement nécessaire
    return data;
  }

  const groupedData: (PoolDayData | PoolHourData)[] = [];
  const sortedData = [...data].sort((a, b) => {
    const timeA = 'periodStartUnix' in a ? a.periodStartUnix : a.date;
    const timeB = 'periodStartUnix' in b ? b.periodStartUnix : b.date;
    return timeA - timeB;
  });

  for (let i = 0; i < sortedData.length; i += config.groupBy) {
    const group = sortedData.slice(i, i + config.groupBy);
    if (group.length === 0) continue;

    // Prendre le premier élément comme base
    const baseItem = { ...group[0] };

    // Ajuster le timestamp pour représenter le début de la période groupée
    if ('periodStartUnix' in baseItem) {
      // Pour les données hourly, ajuster selon l'intervalle
      if (config.period === 'hour') {
        if (config.groupBy === 4) {
          // Pour 4H, arrondir à l'heure la plus proche divisible par 4
          const hour = Math.floor(baseItem.periodStartUnix / 3600);
          const roundedHour = Math.floor(hour / 4) * 4;
          baseItem.periodStartUnix = roundedHour * 3600;
        }
      }
    } else if ('date' in baseItem) {
      // Pour les données daily, ajuster selon l'intervalle
      if (config.period === 'day') {
        if (config.groupBy === 7) {
          // Pour 1W, arrondir au début de la semaine (lundi)
          const date = new Date(baseItem.date * 1000);
          const dayOfWeek = date.getDay();
          const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // 0 = dimanche, 1 = lundi
          date.setDate(date.getDate() - daysToMonday);
          baseItem.date = Math.floor(date.getTime() / 1000);
        } else if (config.groupBy === 30) {
          // Pour 1M, arrondir au premier du mois
          const date = new Date(baseItem.date * 1000);
          date.setDate(1);
          baseItem.date = Math.floor(date.getTime() / 1000);
        }
      }
    }

    // Calculer les moyennes pour les métriques numériques
    baseItem.tvlUSD = (group.reduce((sum, item) => sum + parseFloat(item.tvlUSD), 0) / group.length).toString();
    baseItem.volumeUSD = (group.reduce((sum, item) => sum + parseFloat(item.volumeUSD), 0) / group.length).toString();
    baseItem.feesUSD = (group.reduce((sum, item) => sum + parseFloat(item.feesUSD), 0) / group.length).toString();
    baseItem.token0Price = (group.reduce((sum, item) => sum + parseFloat(item.token0Price), 0) / group.length).toString();
    baseItem.token1Price = (group.reduce((sum, item) => sum + parseFloat(item.token1Price), 0) / group.length).toString();

    // Pour les données OHLC, prendre le premier open, le max high, le min low, et le dernier close
    baseItem.t0open = group[0].t0open;
    baseItem.t0high = Math.max(...group.map(item => parseFloat(item.t0high))).toString();
    baseItem.t0low = Math.min(...group.map(item => parseFloat(item.t0low))).toString();
    baseItem.t0close = group[group.length - 1].t0close;

    baseItem.t1open = group[0].t1open;
    baseItem.t1high = Math.max(...group.map(item => parseFloat(item.t1high))).toString();
    baseItem.t1low = Math.min(...group.map(item => parseFloat(item.t1low))).toString();
    baseItem.t1close = group[group.length - 1].t1close;

    groupedData.push(baseItem);
  }

  return groupedData;
};

// Fonction pour grouper les données de token selon l'intervalle
const groupTokenDataByInterval = (
  data: TokenDayData[] | TokenHourData[],
  interval: ChartInterval
): (TokenDayData | TokenHourData)[] => {
  const config = INTERVAL_CONFIG[interval];

  if (config.groupBy === 1) {
    // Pas de groupement nécessaire
    return data;
  }

  const groupedData: (TokenDayData | TokenHourData)[] = [];
  const sortedData = [...data].sort((a, b) => {
    const timeA = 'periodStartUnix' in a ? a.periodStartUnix : a.date;
    const timeB = 'periodStartUnix' in b ? b.periodStartUnix : b.date;
    return timeA - timeB;
  });

  for (let i = 0; i < sortedData.length; i += config.groupBy) {
    const group = sortedData.slice(i, i + config.groupBy);
    if (group.length === 0) continue;

    // Prendre le premier élément comme base
    const baseItem = { ...group[0] };

    // Ajuster le timestamp pour représenter le début de la période groupée
    if ('periodStartUnix' in baseItem) {
      // Pour les données hourly, ajuster selon l'intervalle
      if (config.period === 'hour') {
        if (config.groupBy === 4) {
          // Pour 4H, arrondir à l'heure la plus proche divisible par 4
          const hour = Math.floor(baseItem.periodStartUnix / 3600);
          const roundedHour = Math.floor(hour / 4) * 4;
          baseItem.periodStartUnix = roundedHour * 3600;
        }
      }
    } else if ('date' in baseItem) {
      // Pour les données daily, ajuster selon l'intervalle
      if (config.period === 'day') {
        if (config.groupBy === 7) {
          // Pour 1W, arrondir au début de la semaine (lundi)
          const date = new Date(baseItem.date * 1000);
          const dayOfWeek = date.getDay();
          const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // 0 = dimanche, 1 = lundi
          date.setDate(date.getDate() - daysToMonday);
          baseItem.date = Math.floor(date.getTime() / 1000);
        } else if (config.groupBy === 30) {
          // Pour 1M, arrondir au premier du mois
          const date = new Date(baseItem.date * 1000);
          date.setDate(1);
          baseItem.date = Math.floor(date.getTime() / 1000);
        }
      }
    }

    // Calculer les moyennes pour les métriques numériques
    baseItem.priceUSD = (group.reduce((sum, item) => sum + parseFloat(item.priceUSD), 0) / group.length).toString();
    baseItem.volumeUSD = (group.reduce((sum, item) => sum + parseFloat(item.volumeUSD), 0) / group.length).toString();
    baseItem.totalValueLockedUSD = (group.reduce((sum, item) => sum + parseFloat(item.totalValueLockedUSD), 0) / group.length).toString();
    baseItem.feesUSD = (group.reduce((sum, item) => sum + parseFloat(item.feesUSD), 0) / group.length).toString();

    // Pour les données OHLC, prendre le premier open, le max high, le min low, et le dernier close
    baseItem.open = group[0].open;
    baseItem.high = Math.max(...group.map(item => parseFloat(item.high))).toString();
    baseItem.low = Math.min(...group.map(item => parseFloat(item.low))).toString();
    baseItem.close = group[group.length - 1].close;

    groupedData.push(baseItem);
  }

  return groupedData;
};

// Fonction pour traiter les données de pool
const processPoolData = (
  data: PoolDayData[] | PoolHourData[],
  metric: ChartMetric,
  chartType: ChartType,
  interval: ChartInterval
): LineChartPoint[] | CandlestickPoint[] => {
  if (!data || data.length === 0) return [];

  // Grouper les données selon l'intervalle
  const groupedData = groupPoolDataByInterval(data, interval);
  // Trier par ordre chronologique croissant (du plus ancien au plus récent)
  const sortedData = [...groupedData].sort((a, b) => {
    const timeA = 'periodStartUnix' in a ? a.periodStartUnix : a.date;
    const timeB = 'periodStartUnix' in b ? b.periodStartUnix : b.date;
    return timeA - timeB;
  });

  // Dédupliquer les données avec le même timestamp (garder la plus récente)
  const uniqueData = sortedData.reduce((acc, current) => {
    const currentTime = 'periodStartUnix' in current ? current.periodStartUnix : current.date;
    const existingIndex = acc.findIndex(item => {
      const itemTime = 'periodStartUnix' in item ? item.periodStartUnix : item.date;
      return itemTime === currentTime;
    });

    if (existingIndex === -1) {
      acc.push(current);
    } else {
      // Remplacer par la version la plus récente (en gardant la même logique de tri)
      acc[existingIndex] = current;
    }

    return acc;
  }, [] as typeof sortedData);

  if (chartType === 'candlestick') {
    // Utilisons les données OHLC réelles de Ponder
    // Pour les pools, nous avons t0open/t0high/t0low/t0close et t1open/t1high/t1low/t1close
    // Nous utiliserons t1close comme prix de base (token1 = HONEY) pour afficher le prix de HONEY en WBERA
    return uniqueData.map(item => {
      const t1open = parseFloat(item.t1open);
      const t1high = parseFloat(item.t1high);
      const t1low = parseFloat(item.t1low);
      const t1close = parseFloat(item.t1close);

      return {
        time: 'periodStartUnix' in item ? item.periodStartUnix : item.date,
        open: t1open,
        high: t1high,
        low: t1low,
        close: t1close,
      };
    }) as CandlestickPoint[];
  }

  return uniqueData.map(item => {
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
        // Pour afficher le prix de HONEY en WBERA (combien de WBERA pour 1 HONEY)
        // On utilise token1Price qui représente le prix de token1 (HONEY) en token0 (WBERA)
        value = parseFloat(item.token1Price);
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
  chartType: ChartType,
  interval: ChartInterval
): LineChartPoint[] | CandlestickPoint[] => {
  if (!data || data.length === 0) return [];

  // Grouper les données selon l'intervalle
  const groupedData = groupTokenDataByInterval(data, interval);
  // Trier par ordre chronologique croissant (du plus ancien au plus récent)
  const sortedData = [...groupedData].sort((a, b) => {
    const timeA = 'periodStartUnix' in a ? a.periodStartUnix : a.date;
    const timeB = 'periodStartUnix' in b ? b.periodStartUnix : b.date;
    return timeA - timeB;
  });

  // Dédupliquer les données avec le même timestamp (garder la plus récente)
  const uniqueData = sortedData.reduce((acc, current) => {
    const currentTime = 'periodStartUnix' in current ? current.periodStartUnix : current.date;
    const existingIndex = acc.findIndex(item => {
      const itemTime = 'periodStartUnix' in item ? item.periodStartUnix : item.date;
      return itemTime === currentTime;
    });

    if (existingIndex === -1) {
      acc.push(current);
    } else {
      // Remplacer par la version la plus récente (en gardant la même logique de tri)
      acc[existingIndex] = current;
    }

    return acc;
  }, [] as typeof sortedData);

  if (chartType === 'candlestick') {
    return uniqueData.map(item => ({
      time: 'periodStartUnix' in item ? item.periodStartUnix : item.date,
      open: parseFloat(item.open),
      high: parseFloat(item.high),
      low: parseFloat(item.low),
      close: parseFloat(item.close),
    })) as CandlestickPoint[];
  }

  return uniqueData.map(item => {
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

      const graphqlUrl = import.meta.env.VITE_GRAPHQL_URL || 'http://localhost:42069/';
      // S'assurer que l'URL se termine par /graphql
      const finalUrl = graphqlUrl.endsWith('/graphql') ? graphqlUrl : `${graphqlUrl.replace(/\/$/, '')}/graphql`;

      const graphqlQuery = isPoolData
        ? buildPoolQuery(address, metric, interval, config.limit)
        : buildTokenQuery(address, metric, interval, config.limit);


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


      const data = isPoolData
        ? result.data.poolDayDatas?.items || result.data.poolHourDatas?.items || []
        : result.data.tokenDayDatas?.items || result.data.tokenHourDatas?.items || [];

      return isPoolData
        ? processPoolData(data as PoolDayData[] | PoolHourData[], metric, chartType, interval)
        : processTokenData(data as TokenDayData[] | TokenHourData[], metric, chartType, interval);
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

      const graphqlUrl = import.meta.env.VITE_GRAPHQL_URL || 'http://localhost:42069/';
      const finalUrl = graphqlUrl.endsWith('/graphql') ? graphqlUrl : `${graphqlUrl.replace(/\/$/, '')}/graphql`;

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

      const response = await fetch(finalUrl, {
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
