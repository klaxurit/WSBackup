import type { QueryClientConfig } from '@tanstack/react-query'

/**
 * Configuration optimisée pour React Query spécialement pour le cache des routes
 */
export const routeCacheQueryClientConfig: QueryClientConfig = {
  defaultOptions: {
    queries: {
      // Configuration générale
      staleTime: 30 * 1000, // 30 secondes - routes restent fraîches pendant 30s
      gcTime: 5 * 60 * 1000, // 5 minutes - garde en mémoire pendant 5min
      retry: 2, // 2 tentatives en cas d'erreur
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Backoff exponentiel

      // Optimisations réseau
      refetchOnWindowFocus: false, // Pas de refetch au focus pour éviter les requêtes inutiles
      refetchOnReconnect: true, // Refetch lors de la reconnexion
      refetchOnMount: false, // Utilise le cache au montage

      // Configuration spécifique aux routes
      networkMode: 'online', // Seulement en ligne pour les routes

      // Optimisation mémoire
      structuralSharing: true, // Partage structurel pour optimiser la mémoire
    },
    mutations: {
      retry: 1, // Une seule tentative pour les mutations
      networkMode: 'online'
    }
  },

  // Configuration de la gestion des erreurs sera ajoutée lors de la création du QueryClient
}

/**
 * Configuration spécifique pour les requêtes de routes selon leur type
 */
export const routeQueryConfigs = {
  // Routes directes (plus fréquentes, cache plus long)
  directRoute: {
    staleTime: 45 * 1000, // 45 secondes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 3
  },

  // Routes multi-hop (plus complexes, cache plus court)
  multiHopRoute: {
    staleTime: 20 * 1000, // 20 secondes
    gcTime: 3 * 60 * 1000, // 3 minutes
    retry: 2
  },

  // Routes de split (très complexes, cache court mais important)
  splitRoute: {
    staleTime: 15 * 1000, // 15 secondes
    gcTime: 2 * 60 * 1000, // 2 minutes
    retry: 1,
    refetchInterval: 60 * 1000 // Refetch automatique toutes les minutes
  },

  // Préchargement des routes populaires
  prefetchRoute: {
    staleTime: 60 * 1000, // 1 minute
    gcTime: 30 * 60 * 1000, // 30 minutes (garde plus longtemps)
    retry: 1
  }
}

/**
 * Fonction pour créer une clé de cache optimisée
 */
export const createOptimizedCacheKey = (
  type: 'direct' | 'multiHop' | 'split' | 'prefetch',
  tokenIn: string,
  tokenOut: string,
  amountRange: string,
  extraParams?: Record<string, any>
): string[] => {
  const baseKey = ['swap-routes', type, tokenIn, tokenOut, amountRange]

  if (extraParams) {
    // Ajoute les paramètres supplémentaires de manière déterministe
    const sortedParams = Object.keys(extraParams)
      .sort()
      .map(key => `${key}:${extraParams[key]}`)
      .join('|')

    if (sortedParams) {
      baseKey.push(sortedParams)
    }
  }

  return baseKey
}

/**
 * Configuration de persistance pour localStorage
 */
export const persistentCacheConfig = {
  // Clés à persister (routes les plus importantes)
  persistKeys: [
    'swap-routes.direct', // Routes directes
    'swap-routes.prefetch' // Routes préchargées
  ],

  // TTL pour le cache persistant
  maxAge: 60 * 60 * 1000, // 1 heure

  // Taille maximum du cache persistant
  maxSize: 100, // 100 entrées maximum

  // Compression des données (si implémentée)
  compress: true
}

/**
 * Métriques de performance par défaut
 */
export const defaultPerformanceThresholds = {
  // Temps de réponse acceptable (ms)
  maxResponseTime: 5000, // 5 secondes

  // Taux de succès minimum
  minSuccessRate: 95, // 95%

  // Taille maximum du cache en mémoire
  maxCacheSize: 50, // 50 routes

  // Temps maximum avant nettoyage automatique
  maxStaleTime: 2 * 60 * 1000, // 2 minutes

  // Intervalle de monitoring
  monitoringInterval: 30 * 1000 // 30 secondes
}

/**
 * Configuration des retry selon le type d'erreur
 */
export const retryConfig = {
  // Erreurs temporaires - retry agressif
  networkErrors: {
    retry: 3,
    retryDelay: (attemptIndex: number) => Math.min(500 * 2 ** attemptIndex, 5000)
  },

  // Erreurs de validation - pas de retry
  validationErrors: {
    retry: 0
  },

  // Erreurs de contrat - retry limité
  contractErrors: {
    retry: 1,
    retryDelay: 2000
  },

  // Timeout - retry avec délai plus long
  timeoutErrors: {
    retry: 2,
    retryDelay: (attemptIndex: number) => Math.min(2000 * 2 ** attemptIndex, 10000)
  }
}

/**
 * Helper pour déterminer le type d'erreur et la stratégie de retry
 */
export const getRetryStrategy = (error: Error) => {
  const message = error.message.toLowerCase()

  if (message.includes('network') || message.includes('fetch')) {
    return retryConfig.networkErrors
  }

  if (message.includes('timeout')) {
    return retryConfig.timeoutErrors
  }

  if (message.includes('validation') || message.includes('invalid')) {
    return retryConfig.validationErrors
  }

  if (message.includes('contract') || message.includes('revert')) {
    return retryConfig.contractErrors
  }

  // Stratégie par défaut
  return {
    retry: 1,
    retryDelay: 1000
  }
}

/**
 * Configuration d'optimisation basée sur l'utilisation
 */
export const adaptiveConfig = {
  // Ajuste le staleTime basé sur la fréquence d'utilisation
  calculateAdaptiveStaleTime: (usageFrequency: number) => {
    // Plus c'est utilisé, plus le cache reste frais
    const baseStaleTime = 30 * 1000 // 30s
    const maxStaleTime = 120 * 1000 // 2min
    const minStaleTime = 10 * 1000 // 10s

    // Formule: plus la fréquence est élevée, plus le staleTime est long
    const adaptiveTime = baseStaleTime + (usageFrequency * 1000)

    return Math.min(Math.max(adaptiveTime, minStaleTime), maxStaleTime)
  },

  // Ajuste la priorité de préchargement
  calculatePrefetchPriority: (tokenPairPopularity: number) => {
    if (tokenPairPopularity > 0.8) return 'high'
    if (tokenPairPopularity > 0.5) return 'medium'
    return 'low'
  }
}

export default routeCacheQueryClientConfig