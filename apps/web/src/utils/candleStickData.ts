import type { UTCTimestamp } from 'lightweight-charts';
import type { CandlestickPoint, ApiDataPoint, ChartInterval, LineChartPoint } from '../types/chart';
import { calculateOHLCFromGroup } from './aggregateLineData';

/**
 * Convertit les données de l'API (timestamp, price) en données OHLCV pour candlesticks
 * Groupe les données par intervalle et calcule Open, High, Low, Close
 */
export function convertToCandlestickData(
  apiData: ApiDataPoint[],
  interval: ChartInterval,
  tokenDecimals?: number
): CandlestickPoint[] {
  if (!apiData || apiData.length === 0) return [];
  if (interval === 'MAX') {
    // Pour MAX, on groupe par jour par défaut
    return groupIntoCandlesticks(apiData, '1D', tokenDecimals);
  }

  return groupIntoCandlesticks(apiData, interval, tokenDecimals);
}

/**
 * Convertit des LineChartPoint en CandlestickPoint
 * Utile pour transformer les données existantes
 */
export function convertLineDataToCandlesticks(
  lineData: LineChartPoint[],
  interval: ChartInterval
): CandlestickPoint[] {
  if (!lineData || lineData.length === 0) return [];

  const apiFormat: ApiDataPoint[] = lineData.map(point => ({
    timestamp: (point.time as number) * 1000, // Convertir en milliseconds
    price: point.value,
  }));

  return convertToCandlestickData(apiFormat, interval);
}

/**
 * Groupe les données par intervalle et calcule OHLCV
 */
function groupIntoCandlesticks(
  data: ApiDataPoint[],
  interval: ChartInterval,
  tokenDecimals?: number
): CandlestickPoint[] {
  // Normaliser les prix si nécessaire
  const normalizedData = tokenDecimals
    ? data.map(d => ({ ...d, price: d.price / Math.pow(10, tokenDecimals) }))
    : data;

  // Convertir en LineChartPoint pour utiliser la logique existante
  const linePoints: LineChartPoint[] = normalizedData.map(d => ({
    time: Math.floor(d.timestamp / 1000) as UTCTimestamp,
    value: d.price,
  }));

  // Grouper par intervalle
  const grouped = groupByInterval(linePoints, interval);

  // Convertir chaque groupe en candlestick
  const candlesticks: CandlestickPoint[] = [];

  for (const [, points] of Object.entries(grouped)) {
    const ohlc = calculateOHLCFromGroup(points);
    if (ohlc) {
      candlesticks.push({
        time: ohlc.time as UTCTimestamp,
        open: ohlc.open,
        high: ohlc.high,
        low: ohlc.low,
        close: ohlc.close,
        volume: ohlc.volume, // Pour l'instant 0, sera implémenté plus tard
      });
    }
  }

  return candlesticks.sort((a, b) => (a.time as number) - (b.time as number));
}

/**
 * Groupe les points par intervalle de temps
 */
function groupByInterval(
  points: LineChartPoint[],
  interval: ChartInterval
): { [key: string]: LineChartPoint[] } {
  const grouped: { [key: string]: LineChartPoint[] } = {};

  const getGroupKey = (timestamp: number): string => {
    const date = new Date(timestamp * 1000);

    switch (interval) {
      case '1H':
        return `${date.getUTCFullYear()}-${date.getUTCMonth()}-${date.getUTCDate()}-${date.getUTCHours()}`;

      case '1D':
        return `${date.getUTCFullYear()}-${date.getUTCMonth()}-${date.getUTCDate()}`;

      case '1W': {
        const firstDayOfYear = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
        const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
        const week = Math.ceil((pastDaysOfYear + firstDayOfYear.getUTCDay() + 1) / 7);
        return `${date.getUTCFullYear()}-W${week}`;
      }

      case '1M':
        return `${date.getUTCFullYear()}-${date.getUTCMonth()}`;

      case '1Y':
        return `${date.getUTCFullYear()}`;

      default:
        return `${date.getUTCFullYear()}-${date.getUTCMonth()}-${date.getUTCDate()}`;
    }
  };

  points.forEach(point => {
    const key = getGroupKey(point.time as number);
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(point);
  });

  return grouped;
}

/**
 * Simule des données OHLCV à partir d'un seul prix (pour les tests)
 * Génère une variation aléatoire autour du prix de base
 */
export function generateOHLCFromSinglePrice(
  timestamp: UTCTimestamp,
  basePrice: number,
  volatility: number = 0.02 // 2% de volatilité par défaut
): CandlestickPoint {
  const variation = basePrice * volatility;

  // Générer 4 prix dans l'ordre chronologique
  const open = basePrice + (Math.random() - 0.5) * variation;
  const pricePoint2 = open + (Math.random() - 0.5) * variation;
  const pricePoint3 = pricePoint2 + (Math.random() - 0.5) * variation;
  const close = pricePoint3 + (Math.random() - 0.5) * variation;

  const allPrices = [open, pricePoint2, pricePoint3, close];

  return {
    time: timestamp,
    open,
    high: Math.max(...allPrices),
    low: Math.min(...allPrices),
    close,
    volume: Math.floor(Math.random() * 1000000), // Volume simulé
  };
}

/**
 * Valide que les données candlestick sont correctes
 */
export function validateCandlestickData(data: CandlestickPoint[]): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  data.forEach((candle, index) => {
    // Vérifier que high >= max(open, close) et low <= min(open, close)
    if (candle.high < Math.max(candle.open, candle.close)) {
      errors.push(`Candle ${index}: high (${candle.high}) should be >= max(open, close)`);
    }

    if (candle.low > Math.min(candle.open, candle.close)) {
      errors.push(`Candle ${index}: low (${candle.low}) should be <= min(open, close)`);
    }

    // Vérifier que les valeurs sont des nombres valides
    if (isNaN(candle.open) || isNaN(candle.high) || isNaN(candle.low) || isNaN(candle.close)) {
      errors.push(`Candle ${index}: contains invalid numbers`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
}