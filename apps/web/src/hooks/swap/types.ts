import type { Address, Hex } from "viem"

/**
 * Configuration parameters for swap operations
 */
export interface SwapParams {
  tokenIn: Address
  tokenOut: Address
  amountIn: bigint
  slippageTolerance?: number // Percent (0.05 = 5%)
  deadline?: number // Minutes
  recipient?: Address
  enableDebounce?: boolean // Enable debounce on amountIn (default: true)
  enableRouteCache?: boolean // Enable intelligent route caching (default: true)
  cacheOptions?: {
    staleTime?: number // TTL en millisecondes (défaut: 30s)
    enablePersistentCache?: boolean // Cache localStorage (défaut: true)
    backgroundRefetch?: boolean // Refetch en arrière-plan (défaut: true)
  }
}

/**
 * Basic token information
 */
export interface TokenInfo {
  address: Address
  symbol: string
  decimals: number
  name?: string
}

/**
 * Pool information from Uniswap V3
 */
export interface PoolInfo {
  token0: Address
  token1: Address
  fee: number
  liquidity: bigint
  sqrtPriceX96: bigint
}

/**
 * Single route information with associated pools and quote
 */
export interface SingleRoute {
  path: TokenInfo[]
  fees: number[]
  pools: PoolInfo[]
  quote: bigint
  gasEstimate: bigint
}

/**
 * Transaction data structure for contract calls
 */
export interface TransactionData {
  to: Address
  functionName: string
  abi: any
  args: any[]
  value: bigint
}

/**
 * Optimized route that can be either single or split
 */
export interface OptimizedRoute {
  type: 'single' | 'split'
  totalQuote: bigint
  totalGasEstimate: bigint
  quoteFormatted: string
  priceImpact: number
  routes: Array<{
    route: SingleRoute
    percentage: number
    amount: bigint
    quote: bigint
  }>
  transactionData: TransactionData | null
}

/**
 * Swap operation state
 */
export interface SwapState {
  status: 'idle' | 'loading-routes' | 'quoting' | 'optimizing' | 'ready' | 'approving' | 'swapping' | 'wrapping' | 'unwrapping' | 'success' | 'error'
  error?: {
    message: string
    originalError?: unknown
    code?: string
    context?: string
  }
  routes: SingleRoute[]
  optimizedRoute: OptimizedRoute | null
  txHash?: Hex
}

/**
 * Quote information returned by the swap hook
 */
export interface QuoteInfo {
  amountOut: bigint
  amountOutFormatted: string
  amountOutMinimum: bigint
  priceImpact: number
  gasEstimate: bigint
  routeType: 'single' | 'split'
  routeDetails: string
  potentialSavings: bigint
}

/**
 * Cache metrics and information
 */
export interface CacheMetrics {
  dataUpdatedAt: number
  errorUpdatedAt: number
  failureCount: number
  isFetching: boolean
}

/**
 * Cache information and controls
 */
export interface CacheInfo {
  isEnabled: boolean
  isFromCache: boolean
  isDataFresh: boolean
  isStale: boolean
  timestamp?: number
  cacheKey: string | null
  invalidateCache: (options?: { forceRefresh?: boolean; invalidateAll?: boolean; newAmountIn?: bigint }) => void
  invalidateCacheForAmount: (newAmountIn: bigint) => void
  prefetchPopularRoutes: () => Promise<void>
  metrics: CacheMetrics
}

/**
 * Route discovery result
 */
export interface RouteDiscoveryResult {
  routes: SingleRoute[]
  optimizedRoute: OptimizedRoute
}

/**
 * Raw route path before token info resolution
 */
export interface RawRoute {
  tokens: Address[]
  fees: number[]
}

/**
 * Token wrapping detection result
 */
export interface TokenWrapInfo {
  isWrap: boolean
  isUnwrap: boolean
  normalizedTokenIn: Address
  normalizedTokenOut: Address
}

/**
 * Route calculation function type for cache system
 */
export type RouteCalculatorFn = (
  tokenIn: Address,
  tokenOut: Address,
  amountIn: bigint
) => Promise<RouteDiscoveryResult>