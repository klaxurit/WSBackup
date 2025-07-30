import type {
  ChartType,
  ChartInterval,
  LineChartPoint,
  CandlestickPoint,
  ApiDataPoint,
  ProcessedChartData
} from '../types/chart';
import {
  cleanLineData,
  filterOutliers,
  shouldNormalize,
  normalizeLineData,
  filterLWCBounds
} from './lineChart';
import { aggregateLineData } from './aggregateLineData';
import { convertLineDataToCandlesticks, convertToCandlestickData } from './candleStickData';

/**
 * Processeur unifié pour tous les types de données de chart
 * Centralise la logique de traitement selon le type de chart et l'intervalle
 */
export class ChartDataProcessor {
  /**
   * Point d'entrée principal - traite les données selon le type de chart
   */
  static processForChart<T extends keyof ProcessedChartData>(
    rawData: ApiDataPoint[],
    chartType: T,
    interval: ChartInterval,
    tokenDecimals?: number
  ): ProcessedChartData[T] {
    if (!rawData || rawData.length === 0) {
      return [] as ProcessedChartData[T];
    }

    switch (chartType) {
      case 'area':
      case 'line':
        return this.processForLineChart(rawData, interval, tokenDecimals) as ProcessedChartData[T];

      case 'candlestick':
        return this.processForCandlestickChart(rawData, interval, tokenDecimals) as ProcessedChartData[T];

      default:
        throw new Error(`Unsupported chart type: ${chartType}`);
    }
  }

  /**
   * Traite les données pour les line/area charts
   * Utilise la logique existante (backwards compatible)
   */
  private static processForLineChart(
    rawData: ApiDataPoint[],
    interval: ChartInterval,
    tokenDecimals?: number
  ): LineChartPoint[] {
    // Convertir les données API en format compatible pour les utilitaires existants
    const compatibleData = rawData.map(d => ({
      time: Math.floor(d.timestamp / 1000),
      value: d.price,
    }));

    // Appliquer la pipeline de traitement existante
    const filtered = filterOutliers(compatibleData);
    const normalized = shouldNormalize(filtered) && tokenDecimals
      ? normalizeLineData(filtered, tokenDecimals)
      : filtered;
    const cleaned = filterLWCBounds(cleanLineData(normalized));

    return aggregateLineData(cleaned, interval);
  }

  /**
   * Traite les données pour les candlestick charts
   */
  private static processForCandlestickChart(
    rawData: ApiDataPoint[],
    interval: ChartInterval,
    tokenDecimals?: number
  ): CandlestickPoint[] {
    // Pour les candlesticks, on applique les mêmes filtres mais différemment
    const filtered = this.filterOutliersForCandlesticks(rawData);
    const normalized = tokenDecimals && this.shouldNormalizeApiData(filtered)
      ? this.normalizeApiData(filtered, tokenDecimals)
      : filtered;

    // Convertir en candlesticks
    const candlesticks = convertToCandlestickData(normalized, interval);

    // Filtrer les bornes LWC pour les candlesticks
    return this.filterCandlestickBounds(candlesticks);
  }

  /**
   * Convertit des données existantes (line) vers un autre type de chart
   */
  static convertChartType(
    data: LineChartPoint[],
    fromType: ChartType,
    toType: ChartType,
    interval: ChartInterval
  ): LineChartPoint[] | CandlestickPoint[] {
    if (fromType === toType) return data;

    if (fromType === 'area' || fromType === 'line') {
      if (toType === 'candlestick') {
        return convertLineDataToCandlesticks(data, interval);
      }
      // area <-> line conversion is just data pass-through
      return data;
    }

    if (fromType === 'candlestick' && (toType === 'area' || toType === 'line')) {
      // Convertir candlesticks vers line en utilisant les prix de clôture
      return (data as unknown as CandlestickPoint[]).map(candle => ({
        time: candle.time,
        value: candle.close,
      }));
    }

    throw new Error(`Conversion from ${fromType} to ${toType} not supported`);
  }

  /**
   * Détecte automatiquement le meilleur type de chart selon les données disponibles
   */
  static suggestChartType(rawData: ApiDataPoint[]): ChartType {
    if (!rawData || rawData.length === 0) return 'area';

    // Si on a des données OHLC dans l'API, suggérer candlestick
    const hasOHLCData = rawData.some(d =>
      typeof d.open === 'number' &&
      typeof d.high === 'number' &&
      typeof d.low === 'number' &&
      typeof d.close === 'number'
    );

    if (hasOHLCData) return 'candlestick';

    // Si on a beaucoup de points de données, candlestick est plus lisible
    if (rawData.length > 1000) return 'candlestick';

    // Par défaut, area chart (existant)
    return 'area';
  }

  /**
   * Calcule des statistiques sur les données traitées
   */
  static getDataStats(data: LineChartPoint[] | CandlestickPoint[]): {
    count: number;
    firstTime: number;
    lastTime: number;
    durationHours: number;
    minPrice: number;
    maxPrice: number;
    avgPrice: number;
  } {
    if (!data || data.length === 0) {
      return {
        count: 0,
        firstTime: 0,
        lastTime: 0,
        durationHours: 0,
        minPrice: 0,
        maxPrice: 0,
        avgPrice: 0,
      };
    }

    const sortedData = [...data].sort((a, b) => (a.time as number) - (b.time as number));
    const firstTime = sortedData[0].time as number;
    const lastTime = sortedData[sortedData.length - 1].time as number;

    let prices: number[];
    if ('value' in sortedData[0]) {
      // LineChartPoint
      prices = (sortedData as LineChartPoint[]).map(d => d.value);
    } else {
      // CandlestickPoint - utiliser les prix de clôture
      prices = (sortedData as CandlestickPoint[]).map(d => d.close);
    }

    return {
      count: data.length,
      firstTime,
      lastTime,
      durationHours: (lastTime - firstTime) / 3600,
      minPrice: Math.min(...prices),
      maxPrice: Math.max(...prices),
      avgPrice: prices.reduce((sum, price) => sum + price, 0) / prices.length,
    };
  }

  // Méthodes utilitaires privées pour les candlesticks

  private static filterOutliersForCandlesticks(data: ApiDataPoint[]): ApiDataPoint[] {
    if (data.length < 3) return data;

    const prices = data.map(d => d.price).sort((a, b) => a - b);
    const median = prices[Math.floor(prices.length / 2)];

    return data.filter(d => d.price < median * 1e6 && d.price > median / 1e6);
  }

  private static shouldNormalizeApiData(data: ApiDataPoint[]): boolean {
    if (!data.length) return false;
    const sample = data.slice(0, 10);
    const bigValues = sample.filter(d => Math.abs(d.price) > 1e6).length;
    return bigValues > sample.length / 2;
  }

  private static normalizeApiData(data: ApiDataPoint[], decimals: number): ApiDataPoint[] {
    const divisor = Math.pow(10, decimals);
    return data.map(d => ({
      ...d,
      price: d.price / divisor,
      open: d.open ? d.open / divisor : undefined,
      high: d.high ? d.high / divisor : undefined,
      low: d.low ? d.low / divisor : undefined,
      close: d.close ? d.close / divisor : undefined,
    }));
  }

  private static filterCandlestickBounds(data: CandlestickPoint[]): CandlestickPoint[] {
    const LWC_MIN = -90071992547409.91;
    const LWC_MAX = 90071992547409.91;

    return data.filter(candle =>
      candle.open >= LWC_MIN && candle.open <= LWC_MAX &&
      candle.high >= LWC_MIN && candle.high <= LWC_MAX &&
      candle.low >= LWC_MIN && candle.low <= LWC_MAX &&
      candle.close >= LWC_MIN && candle.close <= LWC_MAX
    );
  }
}

/**
 * Factory function pour créer des données de test
 */
export function createTestChartData(
  chartType: ChartType,
  interval: ChartInterval,
  count: number = 100
): LineChartPoint[] | CandlestickPoint[] {
  const now = Math.floor(Date.now() / 1000);
  const intervalSeconds = getIntervalSeconds(interval);

  const testApiData: ApiDataPoint[] = Array.from({ length: count }, (_, i) => ({
    timestamp: (now - (count - i) * intervalSeconds) * 1000,
    price: 100 + Math.sin(i / 10) * 20 + (Math.random() - 0.5) * 10,
  }));

  return ChartDataProcessor.processForChart(testApiData, chartType, interval);
}

function getIntervalSeconds(interval: ChartInterval): number {
  switch (interval) {
    case '1H': return 3600;
    case '1D': return 86400;
    case '1W': return 604800;
    case '1M': return 2629746;
    case '1Y': return 31556952;
    case 'MAX': return 86400; // Fallback à 1 jour
    default: return 3600;
  }
}