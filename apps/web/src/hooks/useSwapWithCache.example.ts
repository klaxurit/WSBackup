/**
 * EXEMPLE D'UTILISATION du système de cache intelligent pour WinnieSwap
 *
 * Ce fichier montre comment utiliser le hook useSwap avec le cache activé
 * et comment tirer parti des nouvelles fonctionnalités de performance.
 */

import { useState, useCallback, useEffect } from 'react'
import { parseEther, type Address } from 'viem'
import { useSwap } from './useSwap'
import { useSwapCacheManager } from './useSwapCacheManager'

/**
 * Hook d'exemple montrant l'utilisation optimale du cache des routes
 */
export const useSwapWithCacheExample = () => {
  // État local pour la démo
  const [tokenIn, setTokenIn] = useState<Address>('0x0000000000000000000000000000000000000000') // BERA
  const [tokenOut, setTokenOut] = useState<Address>('0xFCBD14DC51f0A4d49d5E53C2E0950e0bC26d0Dce') // HONEY
  const [amountIn, setAmountIn] = useState<bigint>(parseEther('1'))

  // Gestionnaire de cache global avec optimisations
  const cacheManager = useSwapCacheManager({
    maxCacheSize: 100, // Cache plus large pour cet exemple
    autoCleanupInterval: 3 * 60 * 1000, // Nettoyage toutes les 3 minutes
    preloadPopularPairs: true,
    enableBlockBasedInvalidation: true
  })

  // Hook de swap avec cache activé et configuré
  const swap = useSwap({
    tokenIn,
    tokenOut,
    amountIn,
    enableDebounce: true, // Active le debounce pour éviter trop de requêtes
    enableRouteCache: true, // Active le cache intelligent
    cacheOptions: {
      staleTime: 45 * 1000, // 45 secondes pour cet exemple
      enablePersistentCache: true, // Cache localStorage
      backgroundRefetch: true // Refetch en arrière-plan
    }
  })

  // Exemple d'utilisation des métriques de cache
  const handleCacheMetrics = useCallback(() => {
    const metrics = cacheManager.exportPerformanceMetrics()
    console.log('📊 Cache Performance Metrics:', {
      hitRate: `${metrics.cacheHitRate.toFixed(1)}%`,
      totalRequests: metrics.cacheMetrics.totalRequests,
      averageResponseTime: `${metrics.averageResponseTime.toFixed(0)}ms`,
      activeCaches: metrics.activeCaches,
      timestamp: new Date(metrics.timestamp).toLocaleTimeString()
    })
  }, [cacheManager])

  // Exemple de gestion intelligente des montants
  const handleAmountChange = useCallback((newAmount: bigint) => {
    const previousAmount = amountIn

    // Enregistre l'accès au cache avant le changement
    if (swap.cache.isFromCache) {
      cacheManager.recordCacheAccess(true, 50) // 50ms car instantané depuis le cache
    }

    setAmountIn(newAmount)

    // Si le changement est significatif (>5%), invalide le cache de manière proactive
    if (previousAmount > 0n) {
      const diff = newAmount > previousAmount ? newAmount - previousAmount : previousAmount - newAmount
      const percentageChange = Number((diff * 100n) / previousAmount)

      if (percentageChange > 5) {
        console.log(`💨 Amount change >5% (${percentageChange.toFixed(1)}%), invalidating cache`)
        swap.cache.invalidateCacheForAmount(newAmount)
      }
    }
  }, [amountIn, swap.cache, cacheManager])

  // Exemple de préchargement proactif
  const preloadRelatedRoutes = useCallback(async () => {
    if (!swap.cache.isEnabled) return

    console.log('🔄 Preloading related routes...')

    // Précharge des montants similaires
    const currentAmount = amountIn
    const relatedAmounts = [
      currentAmount / 2n, // 50%
      currentAmount * 2n, // 200%
      currentAmount * 5n, // 500%
    ].filter(amount => amount > 0n)

    await Promise.all(
      relatedAmounts.map(_amount =>
        swap.cache.prefetchPopularRoutes()
      )
    )

    console.log('✅ Related routes preloaded')
  }, [amountIn, swap.cache])

  // Exemple de monitoring de la santé du cache
  const [cacheHealth, setCacheHealth] = useState<'excellent' | 'good' | 'poor'>('good')

  useEffect(() => {
    const checkCacheHealth = () => {
      const { performanceStats } = cacheManager

      if (performanceStats.cacheHitRate > 80 && performanceStats.averageResponseTime < 1000) {
        setCacheHealth('excellent')
      } else if (performanceStats.cacheHitRate > 60 && performanceStats.averageResponseTime < 3000) {
        setCacheHealth('good')
      } else {
        setCacheHealth('poor')
      }
    }

    const intervalId = setInterval(checkCacheHealth, 10000) // Vérifie toutes les 10s
    return () => clearInterval(intervalId)
  }, [cacheManager])

  // Exemple d'optimisation automatique basée sur la santé du cache
  useEffect(() => {
    if (cacheHealth === 'poor') {
      console.log('⚠️ Poor cache performance detected, optimizing...')
      cacheManager.optimizeCache()
    }
  }, [cacheHealth, cacheManager])

  // Exemple d'utilisation des différents états du cache
  const getCacheStatusMessage = () => {
    if (!swap.cache.isEnabled) {
      return '❌ Cache désactivé'
    }

    if (swap.cache.isFromCache && swap.cache.isDataFresh) {
      return '✅ Données depuis le cache (fraîches)'
    }

    if (swap.cache.isFromCache && swap.cache.isStale) {
      return '🔄 Données depuis le cache (en cours de mise à jour)'
    }

    if (swap.isLoading) {
      return '⏳ Calcul des routes en cours...'
    }

    return '📊 Données calculées en temps réel'
  }

  // Exemple de réaction aux erreurs de cache
  useEffect(() => {
    if (swap.error?.context === 'route_cache') {
      console.warn('🚨 Cache error detected, falling back to direct calculation')
      // Pourrait déclencher un fallback vers le calcul direct
    }
  }, [swap.error])

  return {
    // État du swap
    swap,

    // Gestionnaire de cache
    cacheManager,

    // État local
    tokenIn,
    tokenOut,
    amountIn,
    setTokenIn,
    setTokenOut,

    // Actions personnalisées
    handleAmountChange,
    preloadRelatedRoutes,
    handleCacheMetrics,

    // Métriques et monitoring
    cacheHealth,
    cacheStatusMessage: getCacheStatusMessage(),

    // Statistiques utiles pour l'UI
    stats: {
      isFromCache: swap.cache.isFromCache,
      cacheHitRate: cacheManager.performanceStats.cacheHitRate,
      averageResponseTime: cacheManager.performanceStats.averageResponseTime,
      totalCachedRoutes: cacheManager.performanceStats.totalCachedRoutes,
      lastUpdate: swap.cache.timestamp ? new Date(swap.cache.timestamp) : null
    },

    // Actions de debug/maintenance
    debug: {
      clearAllCaches: () => {
        cacheManager.clearPersistentCache()
        cacheManager.invalidateAllRoutes()
        console.log('🧹 All caches cleared')
      },
      exportMetrics: cacheManager.exportPerformanceMetrics,
      resetMetrics: cacheManager.resetMetrics,
      optimizeCache: cacheManager.optimizeCache
    }
  }
}

/**
 * Exemple de composant React utilisant le cache
 */
export const SwapWithCacheExample = () => {
  const {
    swap,
    handleAmountChange,
    preloadRelatedRoutes,
    cacheStatusMessage,
    stats,
    debug
  } = useSwapWithCacheExample()

  return {
    // Render logic serait ici dans un vrai composant
    swapData: {
      quote: swap.quote,
      isLoading: swap.isLoading,
      isReady: swap.isReady,
      error: swap.error
    },

    // Actions disponibles
    actions: {
      swap: swap.swap,
      approve: swap.approve,
      refresh: swap.refresh,
      handleAmountChange,
      preloadRelatedRoutes
    },

    // Informations sur le cache pour l'UI
    cacheInfo: {
      status: cacheStatusMessage,
      hitRate: `${stats.cacheHitRate.toFixed(1)}%`,
      avgResponseTime: `${stats.averageResponseTime.toFixed(0)}ms`,
      isFromCache: stats.isFromCache,
      lastUpdate: stats.lastUpdate?.toLocaleString()
    },

    // Actions de debug
    debugActions: debug
  }
}

/**
 * Exemple de configuration avancée pour différents cas d'usage
 */
export const createSwapConfigForUseCase = (useCase: 'trading' | 'arbitrage' | 'casual') => {
  switch (useCase) {
    case 'trading':
      // Configuration pour trading haute fréquence
      return {
        enableRouteCache: true,
        enableDebounce: false, // Pas de debounce pour le trading
        cacheOptions: {
          staleTime: 15 * 1000, // Cache court pour prix frais
          enablePersistentCache: false, // Pas de cache persistant
          backgroundRefetch: true
        }
      }

    case 'arbitrage':
      // Configuration pour arbitrage
      return {
        enableRouteCache: true,
        enableDebounce: false,
        cacheOptions: {
          staleTime: 5 * 1000, // Cache très court
          enablePersistentCache: false,
          backgroundRefetch: true
        }
      }

    case 'casual':
      // Configuration pour utilisation casual
      return {
        enableRouteCache: true,
        enableDebounce: true, // Debounce pour éviter trop de requêtes
        cacheOptions: {
          staleTime: 60 * 1000, // Cache long
          enablePersistentCache: true, // Cache persistant pour UX
          backgroundRefetch: true
        }
      }

    default:
      return {
        enableRouteCache: true,
        enableDebounce: true,
        cacheOptions: {
          staleTime: 30 * 1000,
          enablePersistentCache: true,
          backgroundRefetch: true
        }
      }
  }
}

export default useSwapWithCacheExample