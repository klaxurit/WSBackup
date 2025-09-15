/**
 * Global cache for pool → vault mapping
 * This cache is rebuilt on every Ponder restart and provides O(1) lookup
 * for finding which vault manages a specific pool
 */

import { Context } from "ponder:registry";
import { formatUnits } from "viem";

// Global Map to store poolId → vaultId relationships
const poolToVaultMap = new Map<string, string>();

// Cache for vault underlying balances to avoid repeated RPC calls within the same block
interface BalanceCache {
  amount0: bigint;
  amount1: bigint;
  blockNumber: bigint;
  timestamp: number;
}

const vaultBalancesCache = new Map<string, BalanceCache>();

/**
 * Register a vault for a specific pool
 * Called when a new StickyVault is created
 * @param poolId - The pool address (hex string)
 * @param vaultId - The vault address (hex string)
 */
export function setVaultForPool(poolId: string, vaultId: string): void {
  const normalizedPoolId = poolId.toLowerCase();
  const normalizedVaultId = vaultId.toLowerCase();
  
  // Check if pool already has a vault (should not happen)
  if (poolToVaultMap.has(normalizedPoolId)) {
    const existingVault = poolToVaultMap.get(normalizedPoolId);
    console.warn(`⚠️  Pool ${poolId} already has vault ${existingVault}, replacing with ${vaultId}`);
  }
  
  poolToVaultMap.set(normalizedPoolId, normalizedVaultId);
}

/**
 * Get the vault ID that manages a specific pool
 * @param poolId - The pool address (hex string)
 * @returns The vault address or undefined if no vault manages this pool
 */
export function getVaultForPool(poolId: string): string | undefined {
  return poolToVaultMap.get(poolId.toLowerCase());
}

/**
 * Check if a pool has an associated vault
 * @param poolId - The pool address (hex string)
 * @returns true if the pool has a vault, false otherwise
 */
export function hasVaultForPool(poolId: string): boolean {
  return poolToVaultMap.has(poolId.toLowerCase());
}

/**
 * Get all pool → vault mappings (for debugging)
 * @returns Array of [poolId, vaultId] tuples
 */
export function getAllVaultMappings(): [string, string][] {
  return Array.from(poolToVaultMap.entries());
}

/**
 * Clear all mappings (for testing purposes)
 */
export function clearVaultCache(): void {
  poolToVaultMap.clear();
}

/**
 * Get cache size (for debugging)
 * @returns Number of pool → vault mappings
 */
export function getCacheSize(): number {
  return poolToVaultMap.size;
}

/**
 * Get cached underlying balances for a vault or fetch from contract if not cached
 * This reduces RPC calls by caching balances per block
 * @param vaultId - The vault address (hex string)
 * @param blockNumber - Current block number for cache key
 * @param context - Ponder context containing client
 * @returns Promise<[amount0: bigint, amount1: bigint] | null>
 */
export async function getCachedUnderlyingBalances(
  vaultId: string,
  blockNumber: bigint,
  context: Context
): Promise<[bigint, bigint] | null> {
  const normalizedVaultId = vaultId.toLowerCase();
  const currentBlock = blockNumber;
  const currentTime = Date.now();

  // Check if we have cached data for this vault in the current block
  const cached = vaultBalancesCache.get(normalizedVaultId);

  if (cached && cached.blockNumber === currentBlock) {
    // Cache hit - return cached balances
    console.log(`🎯 Cache HIT for vault ${vaultId} at block ${currentBlock}`);
    return [cached.amount0, cached.amount1];
  }

  // Cache miss - need to fetch from contract
  try {
    console.log(`📡 Cache MISS - Fetching balances for vault ${vaultId} at block ${currentBlock}`);

    const balances = await context.client.readContract({
      address: vaultId as `0x${string}`,
      abi: context.contracts.svVaults.abi,
      functionName: "getUnderlyingBalances",
    });

    if (!balances || !Array.isArray(balances) || balances.length !== 2) {
      console.warn(`⚠️  Invalid balances response for vault ${vaultId}`);
      return null;
    }

    const [amount0, amount1] = balances;

    // Cache the result
    vaultBalancesCache.set(normalizedVaultId, {
      amount0,
      amount1,
      blockNumber: currentBlock,
      timestamp: currentTime
    });

    // Clean old cache entries to prevent memory growth
    cleanOldCacheEntries(currentBlock, currentTime);

    return [amount0, amount1];

  } catch (error) {
    console.error(`💥 Failed to fetch balances for vault ${vaultId}:`, (error as Error).message);
    return null;
  }
}

/**
 * Clean cache entries that are older than the current block or older than 5 minutes
 * This prevents memory accumulation over time
 * @param currentBlock - Current block number
 * @param currentTime - Current timestamp in milliseconds
 */
function cleanOldCacheEntries(currentBlock: bigint, currentTime: number): void {
  const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
  let cleanedCount = 0;

  for (const [vaultId, cache] of vaultBalancesCache.entries()) {
    // Remove entries from previous blocks or older than TTL
    if (cache.blockNumber < currentBlock || (currentTime - cache.timestamp) > CACHE_TTL_MS) {
      vaultBalancesCache.delete(vaultId);
      cleanedCount++;
    }
  }

  if (cleanedCount > 0) {
    console.log(`🧹 Cleaned ${cleanedCount} old cache entries. Cache size: ${vaultBalancesCache.size}`);
  }
}

/**
 * Clear all balance cache entries (for testing purposes)
 */
export function clearBalancesCache(): void {
  vaultBalancesCache.clear();
}

/**
 * Get balance cache size (for debugging)
 * @returns Number of cached vault balances
 */
export function getBalancesCacheSize(): number {
  return vaultBalancesCache.size;
}

/**
 * Get all cached balances (for debugging)
 * @returns Array of [vaultId, cache] tuples
 */
export function getAllCachedBalances(): [string, BalanceCache][] {
  return Array.from(vaultBalancesCache.entries());
}