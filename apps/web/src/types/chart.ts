import type { Time, UTCTimestamp } from 'lightweight-charts';

// Types existants
export interface LineChartPoint {
  time: Time;
  value: number;
}

// Nouveaux types pour le Sprint 1
export type ChartType = 'area' | 'line' | 'candlestick';
export type ChartInterval = '1H' | '1D' | '1W' | '1M' | '1Y' | 'MAX';

// Interface pour les données OHLCV (candlesticks)
export interface CandlestickPoint {
  time: UTCTimestamp;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

// Interface pour les données brutes de l'API
export interface ApiDataPoint {
  timestamp: number;
  price: number;
  volume?: number;
  open?: number;
  high?: number;
  low?: number;
  close?: number;
}

// Union type pour toutes les données de chart
export type ChartDataPoint = LineChartPoint | CandlestickPoint;

// Interface pour les données processées par type de chart
export interface ProcessedChartData {
  area: LineChartPoint[];
  line: LineChartPoint[];
  candlestick: CandlestickPoint[];
}

// Configuration des intervalles
export const CHART_INTERVALS: { [K in ChartInterval]: { label: string; seconds: number } } = {
  '1H': { label: '1H', seconds: 3600 },
  '1D': { label: '1D', seconds: 86400 },
  '1W': { label: '1W', seconds: 604800 },
  '1M': { label: '1M', seconds: 2629746 }, // 30.44 jours en moyenne
  '1Y': { label: '1Y', seconds: 31556952 }, // 365.25 jours
  'MAX': { label: 'MAX', seconds: 0 }
};

// Configuration des types de charts
export const CHART_TYPES: { [K in ChartType]: { label: string; icon?: string } } = {
  area: { label: 'Area' },
  line: { label: 'Line' },
  candlestick: { label: 'Candles' }
};