import type { Address } from "viem"
import type { SingleRoute, OptimizedRoute } from "../../hooks/swap/types"

/**
 * Cache key structure for route caching
 */
export interface RouteCacheKey {
  tokenIn: Address
  tokenOut: Address
  amountInRange: string // buckets de 5% pour grouper les montants similaires
}

/**
 * Cached route data structure
 */
export interface CachedRouteData {
  routes: SingleRoute[]
  optimizedRoute: OptimizedRoute
  timestamp: number
  amountIn: bigint // montant exact utilisé pour le calcul
  blockNumber?: bigint // bloc où les routes ont été calculées
}

/**
 * Route cache options
 */
export interface RouteCacheOptions {
  enabled?: boolean
  staleTime?: number // TTL en millisecondes (défaut: 30s)
  gcTime?: number // Temps avant garbage collection (défaut: 5min)
  enablePersistentCache?: boolean // Cache localStorage pour routes populaires
  retryAttempts?: number // Nombre de tentatives en cas d'erreur
  backgroundRefetch?: boolean // Refetch en arrière-plan
}

/**
 * Cache statistics
 */
export interface CacheStats {
  totalCachedRoutes: number
  staleCaches: number
  activeCaches: number
}

/**
 * Calcule un bucket de montant pour grouper les requêtes similaires
 * Utilise des buckets de 5% pour réduire les appels redondants
 */
export const calculateAmountBucket = (amount: bigint, bucketSize: number = 5): string => {
  if (amount === 0n) return '0'

  // Convertit en nombre pour les calculs de pourcentage
  const amountStr = amount.toString()
  const amountNum = Number(amountStr)

  if (amountNum === 0) return '0'

  // Calcule l'ordre de grandeur
  const magnitude = Math.floor(Math.log10(amountNum))
  const normalizedAmount = amountNum / Math.pow(10, magnitude)

  // Crée des buckets de 5%
  const bucketIndex = Math.floor(normalizedAmount / (bucketSize / 100))
  const bucketValue = bucketIndex * (bucketSize / 100)

  return `${magnitude}_${bucketValue.toFixed(2)}`
}

/**
 * Vérifie si deux montants sont dans le même bucket (différence <5%)
 */
export const areAmountsInSameBucket = (amount1: bigint, amount2: bigint, threshold: number = 5): boolean => {
  if (amount1 === 0n || amount2 === 0n) return amount1 === amount2

  const diff = amount1 > amount2 ? amount1 - amount2 : amount2 - amount1
  const percentage = Number((diff * 100n) / (amount1 > amount2 ? amount1 : amount2))

  return percentage < threshold
}

/**
 * Génère une clé de cache pour les routes
 */
export const generateCacheKey = (tokenIn: Address, tokenOut: Address, amountIn: bigint): string[] => {
  const amountRange = calculateAmountBucket(amountIn)
  return ['swap-routes', tokenIn, tokenOut, amountRange]
}

/**
 * Convertit les données pour la sérialisation (BigInt -> string)
 */
const serializeRouteData = (data: CachedRouteData) => {
  return {
    ...data,
    amountIn: data.amountIn.toString(),
    blockNumber: data.blockNumber?.toString(),
    routes: data.routes.map(route => ({
      ...route,
      quote: route.quote.toString(),
      gasEstimate: route.gasEstimate.toString(),
      pools: route.pools.map(pool => ({
        ...pool,
        liquidity: pool.liquidity.toString(),
        sqrtPriceX96: pool.sqrtPriceX96.toString()
      }))
    })),
    optimizedRoute: {
      ...data.optimizedRoute,
      totalQuote: data.optimizedRoute.totalQuote.toString(),
      totalGasEstimate: data.optimizedRoute.totalGasEstimate.toString(),
      routes: data.optimizedRoute.routes.map(r => ({
        ...r,
        amount: r.amount.toString(),
        quote: r.quote.toString(),
        route: {
          ...r.route,
          quote: r.route.quote.toString(),
          gasEstimate: r.route.gasEstimate.toString(),
          pools: r.route.pools.map(pool => ({
            ...pool,
            liquidity: pool.liquidity.toString(),
            sqrtPriceX96: pool.sqrtPriceX96.toString()
          }))
        }
      }))
    }
  }
}

/**
 * Désérialise les données du cache (string -> BigInt)
 */
const deserializeRouteData = (data: any): CachedRouteData => {
  return {
    ...data,
    amountIn: BigInt(data.amountIn),
    blockNumber: data.blockNumber ? BigInt(data.blockNumber) : undefined,
    routes: data.routes.map((route: any) => ({
      ...route,
      quote: BigInt(route.quote),
      gasEstimate: BigInt(route.gasEstimate),
      pools: route.pools.map((pool: any) => ({
        ...pool,
        liquidity: BigInt(pool.liquidity),
        sqrtPriceX96: BigInt(pool.sqrtPriceX96)
      }))
    })),
    optimizedRoute: {
      ...data.optimizedRoute,
      totalQuote: BigInt(data.optimizedRoute.totalQuote),
      totalGasEstimate: BigInt(data.optimizedRoute.totalGasEstimate),
      routes: data.optimizedRoute.routes.map((r: any) => ({
        ...r,
        amount: BigInt(r.amount),
        quote: BigInt(r.quote),
        route: {
          ...r.route,
          quote: BigInt(r.route.quote),
          gasEstimate: BigInt(r.route.gasEstimate),
          pools: r.route.pools.map((pool: any) => ({
            ...pool,
            liquidity: BigInt(pool.liquidity),
            sqrtPriceX96: BigInt(pool.sqrtPriceX96)
          }))
        }
      }))
    }
  }
}

/**
 * Gère le cache persistant dans localStorage pour les routes populaires
 */
export const persistentCache = {
  get: (key: string): CachedRouteData | null => {
    try {
      const item = localStorage.getItem(`route_cache_${key}`)
      if (!item) return null

      const parsed = JSON.parse(item)

      // Vérifie si le cache n'est pas trop ancien (1 heure max)
      const maxAge = 60 * 60 * 1000 // 1 heure
      if (Date.now() - parsed.timestamp > maxAge) {
        localStorage.removeItem(`route_cache_${key}`)
        return null
      }

      return deserializeRouteData(parsed)
    } catch {
      return null
    }
  },

  set: (key: string, data: CachedRouteData): void => {
    try {
      const serializable = serializeRouteData(data)
      localStorage.setItem(`route_cache_${key}`, JSON.stringify(serializable))
    } catch (error) {
      console.warn('Failed to save route to persistent cache:', error)
    }
  },

  remove: (key: string): void => {
    try {
      localStorage.removeItem(`route_cache_${key}`)
    } catch {
      // Silently ignore localStorage errors
    }
  },

  clear: (): void => {
    try {
      const keys = Object.keys(localStorage).filter(key => key.startsWith('route_cache_'))
      keys.forEach(key => localStorage.removeItem(key))
    } catch {
      // Silently ignore localStorage errors
    }
  },

  getStats: (): { count: number; keys: string[] } => {
    try {
      const keys = Object.keys(localStorage).filter(key => key.startsWith('route_cache_'))
      return { count: keys.length, keys }
    } catch {
      return { count: 0, keys: [] }
    }
  }
}

/**
 * Cache en mémoire pour les requêtes fréquentes
 */
export class MemoryCache {
  private cache = new Map<string, CachedRouteData>()
  private readonly maxSize: number
  private readonly ttl: number

  constructor(maxSize = 50, ttl = 30000) { // 30s TTL par défaut
    this.maxSize = maxSize
    this.ttl = ttl
  }

  get(key: string): CachedRouteData | null {
    const item = this.cache.get(key)
    if (!item) return null

    // Vérifie TTL
    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key)
      return null
    }

    return item
  }

  set(key: string, data: CachedRouteData): void {
    // Supprime les éléments expirés
    this.cleanup()

    // Si le cache est plein, supprime l'élément le plus ancien
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value
      if (firstKey) this.cache.delete(firstKey)
    }

    this.cache.set(key, data)
  }

  has(key: string): boolean {
    return this.cache.has(key) && !this.isExpired(key)
  }

  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  private isExpired(key: string): boolean {
    const item = this.cache.get(key)
    if (!item) return true
    return Date.now() - item.timestamp > this.ttl
  }

  private cleanup(): void {
    const now = Date.now()
    for (const [key, data] of this.cache.entries()) {
      if (now - data.timestamp > this.ttl) {
        this.cache.delete(key)
      }
    }
  }

  getStats(): { size: number; maxSize: number; ttl: number } {
    this.cleanup() // Nettoie avant de retourner les stats
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      ttl: this.ttl
    }
  }
}

/**
 * Factory pour créer une instance de cache configuré
 */
export const createRouteCache = () => {
  const memoryCache = new MemoryCache()

  return {
    memoryCache,
    persistentCache,
    generateCacheKey,
    calculateAmountBucket,
    areAmountsInSameBucket,
    serializeRouteData,
    deserializeRouteData
  }
}