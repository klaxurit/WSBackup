# 🚀 Système de Cache Intelligent pour les Routes WinnieSwap

## Vue d'ensemble

Ce système implémente un cache intelligent pour les routes de swap dans WinnieSwap, utilisant React Query pour optimiser les performances et réduire les appels redondants à la blockchain.

## 🎯 Objectifs

- **Performance** : Réduire les temps de réponse de 80% pour les requêtes répétées
- **Efficacité** : Éviter les recalculs inutiles avec des buckets de 5%
- **UX** : Améliorer la réactivité de l'interface utilisateur
- **Coût** : Réduire les appels RPC et les coûts associés

## 🏗️ Architecture

### Composants principaux

1. **`useRouteCache.ts`** - Hook principal de gestion du cache
2. **`useSwap.ts`** - Hook de swap enrichi avec le cache
3. **`useSwapCacheManager.ts`** - Gestionnaire global et optimisations
4. **`routeCacheConfig.ts`** - Configuration optimisée React Query

### Stratégie de cache

```typescript
// Clé de cache avec buckets intelligents
['swap-routes', tokenIn, tokenOut, amountInRange]

// Exemple :
['swap-routes', '0x...', '0x...', '18_1.00'] // 1 BERA ±5%
```

## 🚀 Utilisation

### Utilisation basique

```typescript
import { useSwap } from './hooks/useSwap'

const SwapComponent = () => {
  const swap = useSwap({
    tokenIn: '0x...',
    tokenOut: '0x...',
    amountIn: parseEther('1'),
    // Cache activé par défaut
    enableRouteCache: true
  })

  return (
    <div>
      {swap.cache.isFromCache && <span>⚡ Depuis le cache</span>}
      {swap.quote && (
        <div>
          Prix: {swap.quote.amountOutFormatted}
          Impact: {swap.quote.priceImpact}%
        </div>
      )}
    </div>
  )
}
```

### Configuration avancée

```typescript
const swap = useSwap({
  tokenIn,
  tokenOut,
  amountIn,
  enableRouteCache: true,
  cacheOptions: {
    staleTime: 45 * 1000, // 45 secondes
    enablePersistentCache: true, // Cache localStorage
    backgroundRefetch: true // Refetch en arrière-plan
  }
})
```

### Gestionnaire de cache global

```typescript
import { useSwapCacheManager } from './hooks/useSwapCacheManager'

const CacheManager = () => {
  const cacheManager = useSwapCacheManager({
    maxCacheSize: 100,
    autoCleanupInterval: 5 * 60 * 1000,
    preloadPopularPairs: true
  })

  return (
    <div>
      <p>Hit Rate: {cacheManager.performanceStats.cacheHitRate}%</p>
      <p>Routes en cache: {cacheManager.performanceStats.totalCachedRoutes}</p>
      <button onClick={cacheManager.optimizeCache}>Optimiser</button>
    </div>
  )
}
```

## 🎛️ Fonctionnalités

### 1. Buckets intelligents (5%)

Les montants similaires partagent le même cache :

```typescript
// Ces montants utilisent le même cache :
parseEther('1.00')    // 1.00 BERA
parseEther('1.02')    // 1.02 BERA (+2%)
parseEther('1.04')    // 1.04 BERA (+4%)

// Nouveau cache nécessaire :
parseEther('1.06')    // 1.06 BERA (+6% > seuil)
```

### 2. Cache persistant (localStorage)

Routes populaires sauvegardées entre les sessions :

```typescript
// Automatically saved for popular pairs
const popularRoutes = [
  'BERA → HONEY',
  'HONEY → wBERA',
  // ...
]
```

### 3. Invalidation intelligente

```typescript
// Invalide automatiquement si :
- Changement >5% du montant
- Données stale (>30s par défaut)
- Nouveau bloc (optionnel)
- Erreur de transaction
```

### 4. Prefetch automatique

```typescript
// Précharge automatiquement :
- Routes pour montants similaires (50%, 200%, 500%)
- Paires populaires au démarrage
- Routes basées sur l'historique utilisateur
```

### 5. Background refetch

```typescript
// Mise à jour en arrière-plan sans bloquer l'UI
- Données stale mais utilisables immédiatement
- Nouveau calcul en parallèle
- Transition fluide vers nouvelles données
```

## 📊 Métriques et monitoring

### Données disponibles

```typescript
interface CacheMetrics {
  hitRate: number              // Taux de succès du cache
  averageResponseTime: number  // Temps de réponse moyen
  totalCachedRoutes: number   // Nombre de routes en cache
  staleCaches: number         // Caches obsolètes
  activeCaches: number        // Caches actifs
}
```

### Monitoring en temps réel

```typescript
const { performanceStats, exportMetrics } = useSwapCacheManager()

// Export pour analytics
const metrics = exportMetrics()
console.log('Cache metrics:', metrics)
```

## ⚙️ Configuration

### Paramètres principaux

```typescript
interface CacheOptions {
  staleTime?: number              // TTL (défaut: 30s)
  enablePersistentCache?: boolean // Cache localStorage (défaut: true)
  backgroundRefetch?: boolean     // Refetch arrière-plan (défaut: true)
}
```

### Cas d'usage optimisés

```typescript
// Trading haute fréquence
const tradingConfig = {
  staleTime: 15 * 1000,      // Cache court
  enablePersistentCache: false,
  backgroundRefetch: true
}

// Utilisation casual
const casualConfig = {
  staleTime: 60 * 1000,      // Cache long
  enablePersistentCache: true,
  backgroundRefetch: true
}
```

## 🔧 API Complète

### Hook useSwap enrichi

```typescript
const {
  // État standard
  quote, routes, optimizedRoute,
  isLoading, isReady, error,

  // Actions standard
  swap, approve, refresh, reset,

  // Nouvelles fonctionnalités cache
  cache: {
    isEnabled: boolean
    isFromCache: boolean
    isDataFresh: boolean
    isStale: boolean
    timestamp: number
    cacheKey: string[]
    invalidateCache: (options?) => void
    invalidateCacheForAmount: (amount) => void
    prefetchPopularRoutes: () => Promise<void>
    metrics: {
      dataUpdatedAt: number
      failureCount: number
      isFetching: boolean
    }
  }
} = useSwap(params)
```

### Gestionnaire global

```typescript
const {
  // Statistiques
  performanceStats: CachePerformanceStats
  cacheMetrics: CacheMetrics

  // Actions
  optimizeCache: () => Promise<void>
  cleanupCache: () => Promise<void>
  preloadPopularRoutes: () => Promise<void>
  invalidateAllRoutes: () => void
  clearPersistentCache: () => void

  // Monitoring
  recordCacheAccess: (isHit, responseTime) => void
  exportPerformanceMetrics: () => object
  resetMetrics: () => void

} = useSwapCacheManager(options)
```

## 🚨 Gestion d'erreurs

### Types d'erreurs gérées

```typescript
// Erreurs réseau - retry automatique
'NETWORK_ERROR' -> 3 tentatives avec backoff

// Erreurs de validation - pas de retry
'VALIDATION_ERROR' -> échec immédiat

// Erreurs de contrat - retry limité
'CONTRACT_ERROR' -> 1 tentative

// Timeout - retry avec délai
'TIMEOUT_ERROR' -> 2 tentatives, délai plus long
```

### Fallback automatique

```typescript
// Si le cache échoue :
1. Essaie le calcul direct
2. Utilise les données stale si disponibles
3. Affiche erreur utilisateur en dernier recours
```

## 📈 Optimisations

### 1. Memory management

```typescript
// Nettoyage automatique
- Max 50 routes en cache par défaut
- Garbage collection des caches anciens
- Compression des données persistantes
```

### 2. Network optimization

```typescript
// Requêtes optimisées
- Groupement des requêtes similaires
- Debounce intelligent des montants
- Priorité aux requêtes utilisateur
```

### 3. Performance adaptive

```typescript
// Ajustement dynamique
- StaleTime adapté à la fréquence d'usage
- Prefetch basé sur la popularité
- Cleanup selon la mémoire disponible
```

## 🔍 Debug et maintenance

### Outils de debug

```typescript
// Actions de debug disponibles
swap.cache.invalidateCache({ forceRefresh: true })
cacheManager.clearPersistentCache()
cacheManager.exportPerformanceMetrics()
cacheManager.resetMetrics()
```

### Logs de développement

```typescript
// En mode développement
console.debug('Route cache hit for key:', queryKey)
console.warn('Poor cache performance detected')
console.log('Cache optimization completed in 150ms')
```

## 📋 Migration

### Depuis l'ancien système

```typescript
// Avant (sans cache)
const swap = useSwap({ tokenIn, tokenOut, amountIn })

// Après (avec cache)
const swap = useSwap({
  tokenIn,
  tokenOut,
  amountIn,
  enableRouteCache: true // Ajout de cette ligne
})

// L'API reste 100% compatible
```

### Configuration recommandée

```typescript
// Configuration recommandée pour la production
const prodConfig = {
  enableRouteCache: true,
  enableDebounce: true,
  cacheOptions: {
    staleTime: 30 * 1000,
    enablePersistentCache: true,
    backgroundRefetch: true
  }
}
```

## 🎉 Bénéfices attendus

### Performance
- **80% de réduction** du temps de réponse pour requêtes répétées
- **50% de réduction** des appels RPC
- **Amélioration subjective** de la fluidité de l'UI

### Coûts
- **Réduction significative** des coûts RPC
- **Optimisation** de la bande passante
- **Amélioration** de la scalabilité

### Expérience utilisateur
- **Réponse instantanée** pour montants similaires
- **Indicateurs visuels** de l'état du cache
- **Transition fluide** entre données cached/fresh

---

*Ce système de cache est conçu pour être progressivement adoptable, performant et facile à maintenir. Il s'intègre parfaitement dans l'architecture existante de WinnieSwap.*