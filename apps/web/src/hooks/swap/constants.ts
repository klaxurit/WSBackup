import type { Address } from "viem"
import { parseEther } from "viem"

/**
 * WBERA contract address on Berachain
 */
export const WBERA_ADDRESS: Address = "0x6969696969696969696969696969696969696969"

/**
 * Common base tokens for multi-hop routing
 */
export const COMMON_BASES: Address[] = [
  '0xFCBD14DC51f0A4d49d5E53C2E0950e0bC26d0Dce', // HONEY
  '0x0000000000000000000000000000000000000000', // BERA
  '0x6969696969696969696969696969696969696969', // wBera
]

/**
 * Available fee tiers for Uniswap V3 pools (in basis points)
 */
export const FEE_TIERS = [100, 500, 3000, 10000] as const

/**
 * Threshold amount for considering order splitting optimization
 * Orders above this amount will be evaluated for split routing
 */
export const ORDER_SPLIT_THRESHOLD = parseEther('100')

/**
 * Default gas price estimation for route optimization (in wei)
 */
export const DEFAULT_GAS_PRICE = 1000000000n // 1 gwei

/**
 * Default slippage tolerance (5%)
 */
export const DEFAULT_SLIPPAGE_TOLERANCE = 0.05

/**
 * Default transaction deadline (in minutes)
 */
export const DEFAULT_DEADLINE_MINUTES = 20

/**
 * Maximum number of hops for route discovery
 */
export const MAX_HOPS = 3

/**
 * Cache configuration defaults
 */
export const CACHE_DEFAULTS = {
  /** Default cache TTL in milliseconds (30 seconds) */
  STALE_TIME: 30 * 1000,
  /** Default debounce delay in milliseconds */
  DEBOUNCE_DELAY: 500,
  /** Persistent cache enabled by default */
  ENABLE_PERSISTENT_CACHE: true,
  /** Background refetch enabled by default */
  BACKGROUND_REFETCH: true,
  /** Default retry attempts for failed requests */
  RETRY_ATTEMPTS: 2,
} as const