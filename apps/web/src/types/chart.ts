// Types pour les charts
export type ChartType = 'area' | 'line' | 'candlestick';
export type ChartInterval = '1H' | '4H' | '1D' | '1W' | '1M';
export type ChartMetric = 'price' | 'tvl' | 'volume' | 'fees';

// Types pour les données de chart
export interface LineChartPoint {
  time: number;
  value: number;
}

export interface CandlestickPoint {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

// Type pour les données API
export interface ApiDataPoint {
  time: number;
  value: number;
  timestamp?: number;
  price?: number;
  open?: number;
  high?: number;
  low?: number;
  close?: number;
  volume?: number;
}

// Types pour les données GraphQL Ponder
export interface PoolDayData {
  id: string;
  date: number;
  pool: {
    id: string;
    token0: string;
    token1: string;
    feeTier: number;
    token0Ref?: {
      symbol: string;
      name: string;
    };
    token1Ref?: {
      symbol: string;
      name: string;
    };
  };
  tvlUSD: string;
  volumeUSD: string;
  feesUSD: string;
  token0Price: string;
  token1Price: string;
  t0open: string;
  t0high: string;
  t0low: string;
  t0close: string;
  t1open: string;
  t1high: string;
  t1low: string;
  t1close: string;
}

export interface PoolHourData {
  id: string;
  periodStartUnix: number;
  pool: {
    id: string;
    token0: string;
    token1: string;
    feeTier: number;
    token0Ref?: {
      symbol: string;
      name: string;
    };
    token1Ref?: {
      symbol: string;
      name: string;
    };
  };
  tvlUSD: string;
  volumeUSD: string;
  feesUSD: string;
  token0Price: string;
  token1Price: string;
  t0open: string;
  t0high: string;
  t0low: string;
  t0close: string;
  t1open: string;
  t1high: string;
  t1low: string;
  t1close: string;
}

export interface TokenDayData {
  id: string;
  date: number;
  token: {
    id: string;
    symbol: string;
    name: string;
  };
  priceUSD: string;
  volumeUSD: string;
  totalValueLockedUSD: string;
  feesUSD: string;
  open: string;
  high: string;
  low: string;
  close: string;
}

export interface TokenHourData {
  id: string;
  periodStartUnix: number;
  token: {
    id: string;
    symbol: string;
    name: string;
  };
  priceUSD: string;
  volumeUSD: string;
  totalValueLockedUSD: string;
  feesUSD: string;
  open: string;
  high: string;
  low: string;
  close: string;
}

// Types pour les requêtes GraphQL
export interface ChartDataQuery {
  poolAddress?: string;
  tokenAddress?: string;
  metric: ChartMetric;
  interval: ChartInterval;
  limit?: number;
}

// Types pour les réponses GraphQL
export interface PoolDataResponse {
  poolDayData?: {
    items: PoolDayData[];
  };
  poolHourData?: {
    items: PoolHourData[];
  };
}

export interface TokenDataResponse {
  tokenDayData?: {
    items: TokenDayData[];
  };
  tokenHourData?: {
    items: TokenHourData[];
  };
}

// Types pour les données traitées
export type ProcessedChartData = LineChartPoint[] | CandlestickPoint[];

// Types pour les statistiques
export interface ChartStats {
  min: number;
  max: number;
  avg: number;
  change: number;
  changePercent: number;
}