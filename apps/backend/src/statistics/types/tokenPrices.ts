import { Prisma } from '@repo/db';
import { CoinGeckoService } from '../services/coingecko.service';

export interface TokenPriceData {
  currentPrice: number;
  price1h: number;
  price24h: number;
  volume24h: number;
  fdv: number;
  priceChange1h: number;
  priceChange24h: number;
  lastUpdated: Date;
  source: 'coingecko' | 'pool_calculation';
}

export interface CoinGeckoResponse {
  [key: string]: {
    usd: number;
    usd_24h_change: number;
  };
}
export interface CoinGeckoTokenData {
  usd: number;
  usd_24h_change;
}

export interface PoolPriceCalculation {
  poolAddress: string;
  token0Address: string;
  token1Address: string;
  token0Price?: number;
  token1Price?: number;
  sqrtPriceX96: string;
  liquidity: string;
  calculatedPrice: number;
  referenceToken: string; // Address du token de référence utilisé
}

export interface TokenPriceCache {
  tokenAddress: string;
  currentPrice: number;
  expiresAt: Date;
}

export interface PriceHistoryPoint {
  timestamp: Date;
  price: number;
  volume24h: number;
}

export interface GetTokenPriceOptions {
  includeHistory?: boolean;
  forceRefresh?: boolean;
  maxCacheAge?: number; // en minutes
}

export type PoolWithTokens = Prisma.PoolGetPayload<{
  include: {
    token0: true;
    token1: true;
  };
}>;
export type PoolWithSwap = Prisma.PoolGetPayload<{
  include: {
    swaps: true
  }
}>
export type SwapWithPool = Prisma.SwapGetPayload<{
  include: {
    pool: true;
  };
}>;
