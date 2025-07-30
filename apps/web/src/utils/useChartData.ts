import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import type {
  ChartType,
  ChartInterval,
  LineChartPoint,
  CandlestickPoint,
  ApiDataPoint,
  ProcessedChartData
} from '../types/chart';
import { ChartDataProcessor } from '../utils/chartDataProcessor';

/**
 * Configuration des timings de cache selon l'intervalle
 */
const getStaleTimeForInterval = (interval: ChartInterval): number => {
  switch (interval) {
    case '1H': return 5 * 60 * 1000;      // 5 minutes
    case '1D': return 10 * 60 * 1000;     // 10 minutes  
    case '1W': return 30 * 60 * 1000;     // 30 minutes
    case '1M': return 60 * 60 * 1000;     // 1 heure
    case '1Y': return 2 * 60 * 60 * 1000; // 2 heures
    case 'MAX': return 4 * 60 * 60 * 1000; // 4 heures
    default: return 10 * 60 * 1000;
  }
};

const getRefetchIntervalForInterval = (interval: ChartInterval): number | false => {
  switch (interval) {
    case '1H': return 2 * 60 * 1000;  // Refresh toutes les 2 minutes
    case '1D': return 5 * 60 * 1000;  // Refresh toutes les 5 minutes
    case '1W': return 15 * 60 * 1000; // Refresh toutes les 15 minutes
    case '1M':
    case '1Y':
    case 'MAX': return false; // Pas de refresh auto pour les longues périodes
    default: return false;
  }
};

/**
 * Hook unifié pour récupérer les données de chart
 * Remplace les hooks existants et supporte tous les types de charts
 */
export function useChartData<T extends ChartType>(
  tokenAddress: string | null,
  chartType: T,
  interval: ChartInterval,
  tokenDecimals?: number
) {
  const query = useQuery({
    queryKey: ['chart-data', tokenAddress, chartType, interval, tokenDecimals],
    enabled: !!tokenAddress,
    queryFn: async (): Promise<ProcessedChartData[T]> => {
      if (!tokenAddress) {
        throw new Error('Token address is required');
      }

      // Récupération des données depuis l'API
      const response = await fetch(`${import.meta.env.VITE_API_URL}/stats/token/${tokenAddress}`);
      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const rawData = await response.json();

      // Conversion au format ApiDataPoint
      const apiData: ApiDataPoint[] = rawData.map((d: any) => ({
        timestamp: d.timestamp,
        price: d.price,
        volume: d.volume || 0,
        // Si l'API retourne des données OHLC à l'avenir
        open: d.open,
        high: d.high,
        low: d.low,
        close: d.close,
      }));

      // Traitement des données selon le type de chart
      return ChartDataProcessor.processForChart(apiData, chartType, interval, tokenDecimals);
    },
    staleTime: getStaleTimeForInterval(interval),
    refetchInterval: getRefetchIntervalForInterval(interval),
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Calcul des statistiques si on a des données
  const stats = query.data ? ChartDataProcessor.getDataStats(query.data) : null;

  return {
    ...query,
    stats,
  };
}

/**
 * Hook spécialisé pour les line charts (backwards compatibility)
 */
export function useLineChartData(
  tokenAddress: string | null,
  interval: ChartInterval = '1D',
  tokenDecimals?: number
): UseQueryResult<LineChartPoint[], Error> {
  return useChartData(tokenAddress, 'area', interval, tokenDecimals) as UseQueryResult<LineChartPoint[], Error>;
}

/**
 * Hook spécialisé pour les candlestick charts
 */
export function useCandlestickChartData(
  tokenAddress: string | null,
  interval: ChartInterval = '1D',
  tokenDecimals?: number
) {
  return useChartData(tokenAddress, 'candlestick', interval, tokenDecimals);
}

/**
 * Hook pour convertir entre types de charts sans re-fetch
 */
export function useChartTypeConverter(
  data: LineChartPoint[] | CandlestickPoint[] | undefined,
  fromType: ChartType,
  toType: ChartType,
  interval: ChartInterval
) {
  return useQuery({
    queryKey: ['chart-convert', data, fromType, toType, interval],
    enabled: !!data && data.length > 0 && fromType !== toType,
    queryFn: () => {
      if (!data || data.length === 0) return [];

      if (fromType === 'area' || fromType === 'line') {
        return ChartDataProcessor.convertChartType(
          data as LineChartPoint[],
          fromType,
          toType,
          interval
        );
      }

      // Pour candlestick vers line/area
      return ChartDataProcessor.convertChartType(
        data as LineChartPoint[], // Le type sera géré dans la fonction
        fromType,
        toType,
        interval
      );
    },
    staleTime: Infinity, // Les conversions n'expirent jamais
  });
}

/**
 * Hook pour les données de fallback (token par défaut)
 */
export function useDefaultChartData(
  chartType: ChartType = 'area',
  interval: ChartInterval = '1D'
) {
  // Token BERA par défaut (vous pouvez ajuster selon votre configuration)
  const DEFAULT_TOKEN_ADDRESS = '0x0000000000000000000000000000000000000000';

  return useChartData(DEFAULT_TOKEN_ADDRESS, chartType, interval);
}

/**
 * Hook pour comparer deux tokens sur le même chart
 */
export function useCompareChartData(
  token1Address: string | null,
  token2Address: string | null,
  chartType: ChartType = 'line',
  interval: ChartInterval = '1D'
) {
  const token1Data = useChartData(token1Address, chartType, interval);
  const token2Data = useChartData(token2Address, chartType, interval);

  // Normaliser les données pour la comparaison (base 100)
  const normalizedData = useQuery({
    queryKey: ['chart-compare', token1Data.data, token2Data.data, interval],
    enabled: !!(token1Data.data && token2Data.data),
    queryFn: () => {
      if (!token1Data.data || !token2Data.data) return null;

      const normalize = (data: any[], baseValue: number) => {
        return data.map(point => ({
          ...point,
          value: chartType === 'candlestick'
            ? {
              ...point,
              open: (point.open / baseValue) * 100,
              high: (point.high / baseValue) * 100,
              low: (point.low / baseValue) * 100,
              close: (point.close / baseValue) * 100,
            }
            : {
              ...point,
              value: (point.value / baseValue) * 100
            }
        }));
      };

      const token1Base = chartType === 'candlestick'
        ? (token1Data.data as CandlestickPoint[])[0]?.close
        : (token1Data.data as LineChartPoint[])[0]?.value;

      const token2Base = chartType === 'candlestick'
        ? (token2Data.data as CandlestickPoint[])[0]?.close
        : (token2Data.data as LineChartPoint[])[0]?.value;

      if (!token1Base || !token2Base) return null;

      return {
        token1: normalize(token1Data.data, token1Base),
        token2: normalize(token2Data.data, token2Base),
      };
    },
    staleTime: Infinity,
  });

  return {
    token1: token1Data,
    token2: token2Data,
    comparison: normalizedData,
    isLoading: token1Data.isLoading || token2Data.isLoading,
    error: token1Data.error || token2Data.error,
  };
}

/**
 * Hook pour récupérer des données de chart avec pagination (pour de gros datasets)
 */
export function usePaginatedChartData(
  tokenAddress: string | null,
  chartType: ChartType,
  interval: ChartInterval,
  page: number = 1,
  limit: number = 1000
) {
  return useQuery({
    queryKey: ['chart-data-paginated', tokenAddress, chartType, interval, page, limit],
    enabled: !!tokenAddress,
    queryFn: async () => {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/stats/token/${tokenAddress}?page=${page}&limit=${limit}`
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const result = await response.json();
      const apiData: ApiDataPoint[] = result.data.map((d: any) => ({
        timestamp: d.timestamp,
        price: d.price,
        volume: d.volume || 0,
      }));

      return {
        data: ChartDataProcessor.processForChart(apiData, chartType, interval),
        pagination: result.pagination,
      };
    },
    staleTime: getStaleTimeForInterval(interval),
    placeholderData: (previousData) => previousData, // Garde les données précédentes pendant le chargement
  });
}