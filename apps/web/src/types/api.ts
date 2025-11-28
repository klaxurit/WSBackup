import type { Address } from "viem";

// ============ BASE TYPES FROM GRAPHQL ============

export interface GraphQLToken {
  id: string;
  name: string;
  symbol: string;
  decimals: number;
  logoUri?: string | null;
  tokenDayData?: {
    items: Array<{
      priceUSD: string;
    }>;
  };
}

export interface GraphQLPool {
  id: string;
  feeTier: number;
  liquidity: string;
  sqrtPrice?: string;
  tick?: number;
  token0Price?: number;
  token1Price?: number;
  totalValueLockedUSD: number;
  totalValueLockedBERA?: number;
  volumeUSD?: number;
  feeGrowthGlobal0X128?: string;
  feeGrowthGlobal1X128?: string;
  token0Ref: GraphQLToken;
  token1Ref: GraphQLToken;
  poolDayData?: {
    items: Array<{
      tvlUSD: number;
      volumeUSD: number;
      apr: number;
      volumeUSD1D: number;
      volumeUSD30D: number;
    }>;
  };
}

export interface GraphQLPosition {
  id: string;
  tokenId: string;
  owner: string;
  liquidity: string;
  tickLower: number;
  tickUpper: number;
  depositedToken0: string;
  depositedToken1: string;
  withdrawnToken0: string;
  withdrawnToken1: string;
  collectedFeesToken0: string;
  collectedFeesToken1: string;
  feeGrowthInside0LastX128: string;
  feeGrowthInside1LastX128: string;
  poolRef: GraphQLPool;
}

export interface GraphQLStickyVault {
  id: string;
  collectedFeesToken0: string;
  collectedFeesToken1: string;
  collectedFeesUSD: string;
  createdAtBlockNumber: string;
  createdAtTimestamp: string;
  currentTick: number;
  liquidity: string;
  manager: string;
  rebalanceCount: number;
  tickLower: number;
  tickUpper: number;
  totalValueLockedBERA: string;
  totalValueLockedToken0: string;
  totalValueLockedToken1: string;
  totalValueLockedUSD: string;
  txCount: number;
  poolRef: GraphQLPool;
  positions?: {
    items: Array<{
      id: string;
      user: string;
      shares: string;
      depositedToken0: string;
      depositedToken1: string;
      currentValueToken0: string;
      currentValueToken1: string;
      unrealizedPnL: number;
    }>;
  };
}

// ============ FRONTEND TYPES ============

export interface Token {
  id: string;
  address: Address;
  symbol: string;
  name: string;
  decimals: number;
  logoUri?: string | null;
  totalSupply?: string;
}

export interface TokenWithPrice extends Token {
  priceUSD?: number;
}

export interface Pool {
  id: string;
  address: Address;
  fee: number;
  liquidity: string;
  sqrtPriceX96?: string;
  tickSpacing?: number;
  createdAt?: string;
  createdAtBlock?: string;
  isValid?: boolean;

  token0Address: Address;
  token1Address: Address;
  token0Symbol: string;
  token1Symbol: string;
  token0LogoUri?: string | null;
  token1LogoUri?: string | null;

  tvlUSD: number;
  dayVolumeUSD: number;
  monthVolumeUSD: number;
  apr: number;

  token0?: LegacyToken & { id: Address };
  token1?: LegacyToken & { id: Address };
  PoolStatistic?: Array<{
    id: string;
    tvlUSD: number;
    volOneDay: string;
    volOneMonth: string;
    apr: number;
    createdAt: string;
    impermanentLoss: number;
    healthScore: number;
  }>;
}

export interface Position {
  id: string;
  tokenId: string;
  owner: Address;
  pool: Address;
  token0: Address;
  token1: Address;
  tickLower: number;
  tickUpper: number;
  liquidity: string;
  depositedToken0: string;
  depositedToken1: string;
  withdrawnToken0: string;
  withdrawnToken1: string;
  collectedFeesToken0: string;
  collectedFeesToken1: string;
  feeGrowthInside0LastX128: string;
  feeGrowthInside1LastX128: string;
}

export interface StickyVault {
  id: Address;
  name?: string;
  strategy?: string;
  totalValueLockedUSD: number;
  feesApr?: number;
  rewardsApr?: number;
  dayVolumeUSD?: number;
  apr?: number;
  address: Address;
  collectedFeesToken0: string;
  collectedFeesToken1: string;
  collectedFeesUSD: string;
  createdAtBlockNumber: string;
  createdAtTimestamp: string;
  currentTick: number;
  liquidity: string;
  manager: Address;
  rebalanceCount: number;
  tickLower: number;
  tickUpper: number;
  totalValueLockedBERA: string;
  totalValueLockedToken0: string;
  totalValueLockedToken1: string;
  txCount: number;
  poolRef: GraphQLPool;
  positions?: {
    items: Array<{
      id: string;
      user: string;
      shares: string;
      depositedToken0: string;
      depositedToken1: string;
      currentValueToken0: string;
      currentValueToken1: string;
      unrealizedPnL: number;
      valueUSD?: string;
    }>;
  };
}

// ============ LEGACY TYPES (for backward compatibility) ============

export interface TokenPrice {
  confidence: number;
  createdAt: string;
  price: number;
  priceSource: string;
  tokenAddress: string;
  volumeUSD: number;
}

export interface LegacyToken {
  TokenPrice: TokenPrice[];
  address: Address;
  coingeckoId: string;
  createdAt: string;
  decimals: number;
  description: string;
  discoveredAt: string;
  isStableCoin: boolean;
  isVerifiedManually: boolean;
  lastActivityAt: string;
  lastEnrichmentAt: string;
  logoUri: string;
  metadata: any;
  name: string;
  status: string;
  symbol: string;
  totalSupply: string;
  twitter: string;
  updatedAt: string;
  website: string;
}

export interface PositionData {
  position: Position;
  pool: Pool;
}

// ============ TRANSFORMATION FUNCTIONS ============

export const transformGraphQLTokenToToken = (graphqlToken: GraphQLToken): Token => ({
  id: graphqlToken.id,
  address: graphqlToken.id as Address,
  symbol: graphqlToken.symbol,
  name: graphqlToken.name,
  decimals: graphqlToken.decimals,
  logoUri: graphqlToken.logoUri,
  totalSupply: "0"
});

export const transformGraphQLTokenToLegacyToken = (graphqlToken: GraphQLToken): LegacyToken & { id: Address } => ({
  id: graphqlToken.id as Address,
  TokenPrice: [],
  address: graphqlToken.id as Address,
  coingeckoId: "",
  createdAt: new Date().toISOString(),
  decimals: graphqlToken.decimals,
  description: "",
  discoveredAt: new Date().toISOString(),
  isStableCoin: false,
  isVerifiedManually: false,
  lastActivityAt: new Date().toISOString(),
  lastEnrichmentAt: new Date().toISOString(),
  logoUri: graphqlToken.logoUri || "",
  metadata: {},
  name: graphqlToken.name,
  status: "active",
  symbol: graphqlToken.symbol,
  totalSupply: "0",
  twitter: "",
  updatedAt: new Date().toISOString(),
  website: ""
});

export const transformGraphQLPoolToPool = (graphqlPool: GraphQLPool): Pool => {
  const latestDayData = graphqlPool.poolDayData?.items?.[0];
  const aprValue = latestDayData?.apr;

  return {
    id: graphqlPool.id,
    address: graphqlPool.id as Address,
    fee: graphqlPool.feeTier,
    liquidity: graphqlPool.liquidity,
    token0Address: graphqlPool.token0Ref.id as Address,
    token1Address: graphqlPool.token1Ref.id as Address,
    token0Symbol: graphqlPool.token0Ref.symbol,
    token1Symbol: graphqlPool.token1Ref.symbol,
    token0LogoUri: graphqlPool.token0Ref.logoUri,
    token1LogoUri: graphqlPool.token1Ref.logoUri,
    tvlUSD: graphqlPool.totalValueLockedUSD,
    dayVolumeUSD: latestDayData?.volumeUSD1D || 0,
    monthVolumeUSD: latestDayData?.volumeUSD30D || 0,
    apr: typeof aprValue === 'number' ? aprValue : (typeof aprValue === 'string' ? parseFloat(aprValue) : 0),
    token0: transformGraphQLTokenToLegacyToken(graphqlPool.token0Ref),
    token1: transformGraphQLTokenToLegacyToken(graphqlPool.token1Ref)
  };
};

// ============ UTILITY TYPES ============

export interface TokenAmount {
  tokenAddress: string;
  amount: string;
}

export interface SwapParams {
  tokenIn: Address;
  tokenOut: Address;
  amountIn: bigint;
  slippageTolerance?: number;
  deadline?: number;
  recipient?: Address;
}

export interface TokenInfo {
  address: Address;
  symbol: string;
  decimals: number;
  name?: string;
  logoUri?: string | null;
}