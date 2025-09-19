import { useCallback, useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { type Address } from 'viem'
import { useAccount, useBlockNumber } from 'wagmi'
import { useRouteCacheManager } from './useRouteCache'

/**
 * Interface pour les statistiques de performance du cache
 */
interface CachePerformanceStats {
  totalCachedRoutes: number
  staleCaches: number
  activeCaches: number
  cacheHitRate: number
  averageResponseTime: number
  lastOptimization: number
}

/**
 * Interface pour les paramètres d'optimisation
 */
interface CacheOptimizationOptions {
  maxCacheSize?: number // Nombre maximum de caches conservés
  autoCleanupInterval?: number // Intervalle de nettoyage automatique (ms)
  preloadPopularPairs?: boolean // Précharger les paires populaires
  enableBlockBasedInvalidation?: boolean // Invalider basé sur les blocs
}

/**
 * Hook pour la gestion globale et l'optimisation du cache des routes
 */
export const useSwapCacheManager = (options: CacheOptimizationOptions = {}) => {
  const {
    maxCacheSize = 50,
    autoCleanupInterval = 5 * 60 * 1000, // 5 minutes
    preloadPopularPairs = true,
    enableBlockBasedInvalidation = true
  } = options

  const queryClient = useQueryClient()
  const { address } = useAccount()
  const { data: blockNumber } = useBlockNumber({ watch: true })
  const { invalidateAllRoutes, clearPersistentCache, getCacheStats } = useRouteCacheManager()

  const [performanceStats, setPerformanceStats] = useState<CachePerformanceStats>({
    totalCachedRoutes: 0,
    staleCaches: 0,
    activeCaches: 0,
    cacheHitRate: 0,
    averageResponseTime: 0,
    lastOptimization: Date.now()
  })

  const [cacheMetrics, setCacheMetrics] = useState({
    hits: 0,
    misses: 0,
    totalRequests: 0,
    responseTimes: [] as number[]
  })

  // Paires populaires à précharger (peut être enrichi par analytics)
  const popularPairs = [
    {
      tokenIn: '0x0000000000000000000000000000000000000000' as Address, // BERA
      tokenOut: '0xFCBD14DC51f0A4d49d5E53C2E0950e0bC26d0Dce' as Address, // HONEY
      amounts: ['1000000000000000000', '10000000000000000000', '100000000000000000000'] // 1, 10, 100 BERA
    },
    {
      tokenIn: '0xFCBD14DC51f0A4d49d5E53C2E0950e0bC26d0Dce' as Address, // HONEY
      tokenOut: '0x6969696969696969696969696969696969696969' as Address, // wBERA
      amounts: ['1000000000000000000', '100000000000000000000', '1000000000000000000000'] // 1, 100, 1000 HONEY
    }
  ]

  // Fonction de nettoyage automatique du cache
  const cleanupCache = useCallback(async () => {
    try {
      const stats = getCacheStats()

      // Si on dépasse la limite, nettoie les caches les plus anciens
      if (stats.totalCachedRoutes > maxCacheSize) {
        const allQueries = queryClient.getQueryCache().findAll({
          predicate: (query) => query.queryKey[0] === 'swap-routes'
        })

        // Trie par dernière utilisation et supprime les plus anciens
        allQueries
          .sort((a, b) => (a.state.dataUpdatedAt || 0) - (b.state.dataUpdatedAt || 0))
          .slice(0, allQueries.length - maxCacheSize)
          .forEach(query => {
            queryClient.removeQueries({ queryKey: query.queryKey })
          })

        console.log(`Cache cleanup: removed ${allQueries.length - maxCacheSize} old entries`)
      }

      // Nettoie aussi le cache persistant
      if (stats.staleCaches > 10) {
        clearPersistentCache()
      }

    } catch (error) {
      console.warn('Cache cleanup failed:', error)
    }
  }, [queryClient, getCacheStats, maxCacheSize, clearPersistentCache])

  // Fonction pour précharger les paires populaires
  const preloadPopularRoutes = useCallback(async () => {
    if (!preloadPopularPairs || !address) return

    try {
      for (const pair of popularPairs) {
        for (const amount of pair.amounts) {
          const amountBigInt = BigInt(amount)

          // Utilise prefetchQuery pour éviter de surcharger l'état
          await queryClient.prefetchQuery({
            queryKey: ['swap-routes', pair.tokenIn, pair.tokenOut, amountBigInt.toString()],
            staleTime: 30 * 1000,
            gcTime: 5 * 60 * 1000
          })
        }
      }

      console.log('Popular routes preloaded successfully')
    } catch (error) {
      console.warn('Failed to preload popular routes:', error)
    }
  }, [queryClient, preloadPopularPairs, address])

  // Fonction pour optimiser la performance du cache
  const optimizeCache = useCallback(async () => {
    const startTime = Date.now()

    try {
      // 1. Nettoie les caches obsolètes
      await cleanupCache()

      // 2. Précharge les routes populaires
      if (preloadPopularPairs) {
        await preloadPopularRoutes()
      }

      // 3. Met à jour les statistiques
      const newStats = getCacheStats()
      const optimizationTime = Date.now() - startTime

      setPerformanceStats(_prevStats => ({
        ...newStats,
        cacheHitRate: cacheMetrics.totalRequests > 0
          ? (cacheMetrics.hits / cacheMetrics.totalRequests) * 100
          : 0,
        averageResponseTime: cacheMetrics.responseTimes.length > 0
          ? cacheMetrics.responseTimes.reduce((a, b) => a + b, 0) / cacheMetrics.responseTimes.length
          : 0,
        lastOptimization: Date.now()
      }))

      console.log(`Cache optimization completed in ${optimizationTime}ms`)
    } catch (error) {
      console.error('Cache optimization failed:', error)
    }
  }, [cleanupCache, preloadPopularRoutes, getCacheStats, cacheMetrics])

  // Fonction pour enregistrer une hit/miss du cache
  const recordCacheAccess = useCallback((isHit: boolean, responseTime: number = 0) => {
    setCacheMetrics(prevMetrics => ({
      hits: prevMetrics.hits + (isHit ? 1 : 0),
      misses: prevMetrics.misses + (isHit ? 0 : 1),
      totalRequests: prevMetrics.totalRequests + 1,
      responseTimes: [...prevMetrics.responseTimes.slice(-99), responseTime] // Garde les 100 derniers temps
    }))
  }, [])

  // Fonction pour invalider le cache basé sur les changements de blocs
  const invalidateOnBlockChange = useCallback(() => {
    if (!enableBlockBasedInvalidation) return

    // Invalide les caches stale toutes les 5 blocks
    if (blockNumber && blockNumber % 5n === 0n) {
      const queries = queryClient.getQueryCache().findAll({
        predicate: (query) => query.queryKey[0] === 'swap-routes'
      })
      const staleQueries = queries.filter(q => q.isStale())

      if (staleQueries.length > 0) {
        staleQueries.forEach(query => {
          queryClient.invalidateQueries({
            predicate: (q) => q.queryKey.join('.') === query.queryKey.join('.')
          })
        })
        console.log(`Invalidated ${staleQueries.length} stale route caches on block ${blockNumber}`)
      }
    }
  }, [blockNumber, enableBlockBasedInvalidation, queryClient])

  // Fonction pour exporter les métriques de performance
  const exportPerformanceMetrics = useCallback(() => {
    return {
      ...performanceStats,
      cacheMetrics,
      timestamp: Date.now(),
      blockNumber: blockNumber?.toString() || '0'
    }
  }, [performanceStats, cacheMetrics, blockNumber])

  // Fonction pour réinitialiser les métriques
  const resetMetrics = useCallback(() => {
    setCacheMetrics({
      hits: 0,
      misses: 0,
      totalRequests: 0,
      responseTimes: []
    })
    setPerformanceStats(prev => ({
      ...prev,
      cacheHitRate: 0,
      averageResponseTime: 0,
      lastOptimization: Date.now()
    }))
  }, [])

  // Optimisation automatique périodique
  useEffect(() => {
    if (autoCleanupInterval > 0) {
      const intervalId = setInterval(optimizeCache, autoCleanupInterval)
      return () => clearInterval(intervalId)
    }
  }, [optimizeCache, autoCleanupInterval])

  // Invalidation basée sur les blocs
  useEffect(() => {
    invalidateOnBlockChange()
  }, [invalidateOnBlockChange])

  // Préchargement initial au montage
  useEffect(() => {
    if (preloadPopularPairs && address) {
      const timeoutId = setTimeout(preloadPopularRoutes, 1000) // Délai pour éviter la surcharge
      return () => clearTimeout(timeoutId)
    }
  }, [preloadPopularRoutes, address, preloadPopularPairs])

  // Met à jour les stats périodiquement
  useEffect(() => {
    const intervalId = setInterval(() => {
      const newStats = getCacheStats()
      setPerformanceStats(prev => ({
        ...prev,
        ...newStats,
        cacheHitRate: cacheMetrics.totalRequests > 0
          ? (cacheMetrics.hits / cacheMetrics.totalRequests) * 100
          : prev.cacheHitRate
      }))
    }, 10000) // Toutes les 10 secondes

    return () => clearInterval(intervalId)
  }, [getCacheStats, cacheMetrics])

  return {
    // Statistiques et métriques
    performanceStats,
    cacheMetrics,

    // Actions de gestion
    optimizeCache,
    cleanupCache,
    preloadPopularRoutes,
    invalidateAllRoutes,
    clearPersistentCache,

    // Métriques et monitoring
    recordCacheAccess,
    exportPerformanceMetrics,
    resetMetrics,

    // État du gestionnaire
    isOptimizing: false, // TODO: ajouter un état de chargement si nécessaire
    lastOptimization: performanceStats.lastOptimization,

    // Configuration actuelle
    config: {
      maxCacheSize,
      autoCleanupInterval,
      preloadPopularPairs,
      enableBlockBasedInvalidation
    }
  }
}

export type { CachePerformanceStats, CacheOptimizationOptions }