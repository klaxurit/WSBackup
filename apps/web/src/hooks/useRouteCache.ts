import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useMemo } from 'react'
import { type Address } from 'viem'
import { type SingleRoute, type OptimizedRoute } from './useSwap'

/**
 * Cache key structure for route caching
 */
interface RouteCacheKey {
  tokenIn: Address
  tokenOut: Address
  amountInRange: string // buckets de 5% pour grouper les montants similaires
}

/**
 * Cached route data structure
 */
interface CachedRouteData {
  routes: SingleRoute[]
  optimizedRoute: OptimizedRoute
  timestamp: number
  amountIn: bigint // montant exact utilisé pour le calcul
  blockNumber?: bigint // bloc où les routes ont été calculées
}

/**
 * Route cache options
 */
interface RouteCacheOptions {
  enabled?: boolean
  staleTime?: number // TTL en millisecondes (défaut: 30s)
  gcTime?: number // Temps avant garbage collection (défaut: 5min)
  enablePersistentCache?: boolean // Cache localStorage pour routes populaires
  retryAttempts?: number // Nombre de tentatives en cas d'erreur
  backgroundRefetch?: boolean // Refetch en arrière-plan
}

/**
 * Route calculation function type
 */
type RouteCalculatorFn = (
  tokenIn: Address,
  tokenOut: Address,
  amountIn: bigint
) => Promise<{
  routes: SingleRoute[]
  optimizedRoute: OptimizedRoute
}>

/**
 * Calcule un bucket de montant pour grouper les requêtes similaires
 * Utilise des buckets de 5% pour réduire les appels redondants
 */
const calculateAmountBucket = (amount: bigint, bucketSize: number = 5): string => {
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
const areAmountsInSameBucket = (amount1: bigint, amount2: bigint, threshold: number = 5): boolean => {
  if (amount1 === 0n || amount2 === 0n) return amount1 === amount2

  const diff = amount1 > amount2 ? amount1 - amount2 : amount2 - amount1
  const percentage = Number((diff * 100n) / (amount1 > amount2 ? amount1 : amount2))

  return percentage < threshold
}

/**
 * Génère une clé de cache pour les routes
 */
const generateCacheKey = (tokenIn: Address, tokenOut: Address, amountIn: bigint): string[] => {
  const amountRange = calculateAmountBucket(amountIn)
  return ['swap-routes', tokenIn, tokenOut, amountRange]
}

/**
 * Gère le cache persistant dans localStorage pour les routes populaires
 */
const persistentCache = {
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

      return {
        ...parsed,
        amountIn: BigInt(parsed.amountIn),
        routes: parsed.routes.map((route: any) => ({
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
          ...parsed.optimizedRoute,
          totalQuote: BigInt(parsed.optimizedRoute.totalQuote),
          totalGasEstimate: BigInt(parsed.optimizedRoute.totalGasEstimate),
          routes: parsed.optimizedRoute.routes.map((r: any) => ({
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
    } catch {
      return null
    }
  },

  set: (key: string, data: CachedRouteData): void => {
    try {
      // Convertit les BigInt en string pour la sérialisation
      const serializable = {
        ...data,
        amountIn: data.amountIn.toString(),
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
  }
}

/**
 * Hook pour la gestion intelligente du cache des routes
 */
export const useRouteCache = (
  tokenIn: Address | undefined,
  tokenOut: Address | undefined,
  amountIn: bigint,
  routeCalculator: RouteCalculatorFn,
  options: RouteCacheOptions = {}
) => {
  const queryClient = useQueryClient()

  const {
    enabled = true,
    staleTime = 30 * 1000, // 30 secondes
    gcTime = 5 * 60 * 1000, // 5 minutes
    enablePersistentCache = true,
    retryAttempts = 2,
    backgroundRefetch = true
  } = options

  // Génère la clé de cache
  const cacheKey = useMemo(() => {
    if (!tokenIn || !tokenOut || amountIn === 0n) return null
    return generateCacheKey(tokenIn, tokenOut, amountIn)
  }, [tokenIn, tokenOut, amountIn])

  // Clé pour le cache persistant
  const persistentCacheKey = useMemo(() => {
    if (!cacheKey) return null
    return cacheKey.join('_')
  }, [cacheKey])

  // Fonction de récupération des routes avec cache persistant
  const fetchRoutes = useCallback(async (): Promise<CachedRouteData> => {
    if (!tokenIn || !tokenOut || amountIn === 0n) {
      throw new Error('Invalid parameters for route calculation')
    }

    // Vérifie d'abord le cache persistant
    if (enablePersistentCache && persistentCacheKey) {
      const cached = persistentCache.get(persistentCacheKey)
      if (cached && areAmountsInSameBucket(cached.amountIn, amountIn)) {
        return cached
      }
    }

    // Calcule les nouvelles routes
    const result = await routeCalculator(tokenIn, tokenOut, amountIn)

    const cacheData: CachedRouteData = {
      routes: result.routes,
      optimizedRoute: result.optimizedRoute,
      timestamp: Date.now(),
      amountIn,
      blockNumber: undefined // TODO: ajouter le numéro de bloc actuel
    }

    // Sauvegarde dans le cache persistant pour les routes populaires
    if (enablePersistentCache && persistentCacheKey) {
      persistentCache.set(persistentCacheKey, cacheData)
    }

    return cacheData
  }, [tokenIn, tokenOut, amountIn, routeCalculator, enablePersistentCache, persistentCacheKey])

  // Query React Query avec configuration optimisée
  const query = useQuery({
    queryKey: cacheKey || ['empty'],
    queryFn: fetchRoutes,
    enabled: enabled && !!cacheKey,
    staleTime,
    gcTime,
    retry: retryAttempts,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    refetchOnMount: false,
    refetchInterval: backgroundRefetch ? 60 * 1000 : false, // Refetch toutes les minutes en arrière-plan
    select: (data: CachedRouteData) => ({
      routes: data.routes,
      optimizedRoute: data.optimizedRoute,
      timestamp: data.timestamp,
      isFromCache: true
    })
  })

  // Fonction pour invalider le cache de façon intelligente
  const invalidateCache = useCallback((options?: {
    forceRefresh?: boolean
    invalidateAll?: boolean
    newAmountIn?: bigint
  }) => {
    const { forceRefresh = false, invalidateAll = false, newAmountIn } = options || {}

    if (invalidateAll) {
      // Invalide tous les caches de routes
      queryClient.invalidateQueries({
        predicate: (query) => query.queryKey[0] === 'swap-routes'
      })
      return
    }

    if (cacheKey) {
      if (forceRefresh) {
        // Force un refetch immédiat
        queryClient.invalidateQueries({
          predicate: (query) => query.queryKey.join('.') === cacheKey.join('.')
        })
      } else if (newAmountIn && !areAmountsInSameBucket(amountIn, newAmountIn)) {
        // Invalide seulement si le changement de montant est significatif (>5%)
        queryClient.invalidateQueries({
          predicate: (query) => query.queryKey.join('.') === cacheKey.join('.')
        })

        // Nettoie aussi le cache persistant
        if (persistentCacheKey) {
          persistentCache.remove(persistentCacheKey)
        }
      }
    }
  }, [queryClient, cacheKey, amountIn, persistentCacheKey])

  // Fonction pour précharger les routes populaires
  const prefetchRoute = useCallback(async (
    prefetchTokenIn: Address,
    prefetchTokenOut: Address,
    prefetchAmountIn: bigint
  ) => {
    const prefetchKey = generateCacheKey(prefetchTokenIn, prefetchTokenOut, prefetchAmountIn)

    await queryClient.prefetchQuery({
      queryKey: prefetchKey,
      queryFn: async () => {
        const result = await routeCalculator(prefetchTokenIn, prefetchTokenOut, prefetchAmountIn)
        return {
          routes: result.routes,
          optimizedRoute: result.optimizedRoute,
          timestamp: Date.now(),
          amountIn: prefetchAmountIn
        }
      },
      staleTime
    })
  }, [queryClient, routeCalculator, staleTime])

  // Fonction pour vérifier si le cache est valide pour un montant donné
  const isCacheValidForAmount = useCallback((checkAmountIn: bigint): boolean => {
    if (!query.data) return false
    return areAmountsInSameBucket(amountIn, checkAmountIn)
  }, [query.data, amountIn])

  return {
    // Données
    routes: query.data?.routes || [],
    optimizedRoute: query.data?.optimizedRoute || null,

    // État de la requête
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    isSuccess: query.isSuccess,
    isStale: query.isStale,

    // Métadonnées du cache
    cacheKey,
    timestamp: query.data?.timestamp,
    isFromCache: !!query.data,
    isCacheValidForAmount,

    // Actions
    refetch: query.refetch,
    invalidateCache,
    prefetchRoute,

    // Statut de fraîcheur
    isDataFresh: !query.isStale && query.isSuccess,
    shouldRefetch: query.isStale || !query.data,

    // Diagnostic
    dataUpdatedAt: query.dataUpdatedAt,
    errorUpdatedAt: query.errorUpdatedAt,
    failureCount: query.failureCount,
    failureReason: query.failureReason
  }
}

/**
 * Hook utilitaire pour la gestion globale du cache des routes
 */
export const useRouteCacheManager = () => {
  const queryClient = useQueryClient()

  // Invalide tous les caches de routes
  const invalidateAllRoutes = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: ['swap-routes'],
      exact: false
    })
  }, [queryClient])

  // Nettoie le cache persistant
  const clearPersistentCache = useCallback(() => {
    try {
      const keys = Object.keys(localStorage).filter(key => key.startsWith('route_cache_'))
      keys.forEach(key => localStorage.removeItem(key))
    } catch {
      // Silently ignore localStorage errors
    }
  }, [])

  // Statistiques du cache
  const getCacheStats = useCallback(() => {
    const queries = queryClient.getQueryCache().findAll({
      predicate: (query) => query.queryKey[0] === 'swap-routes'
    })
    return {
      totalCachedRoutes: queries.length,
      staleCaches: queries.filter(q => q.isStale()).length,
      activeCaches: queries.filter(q => q.getObserversCount() > 0).length
    }
  }, [queryClient])

  return {
    invalidateAllRoutes,
    clearPersistentCache,
    getCacheStats
  }
}

export type { RouteCacheKey, CachedRouteData, RouteCacheOptions, RouteCalculatorFn }