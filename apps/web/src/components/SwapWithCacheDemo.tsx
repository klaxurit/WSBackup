import React, { useState } from 'react'
import { parseEther, type Address } from 'viem'
import { useSwap } from '../hooks/useSwap'
import { useSwapCacheManager } from '../hooks/useSwapCacheManager'

/**
 * Composant de démonstration du système de cache intelligent pour les routes
 */
export const SwapWithCacheDemo: React.FC = () => {
  // État local pour les paramètres de swap
  const [tokenIn, setTokenIn] = useState<Address>('0x0000000000000000000000000000000000000000') // BERA
  const [tokenOut, setTokenOut] = useState<Address>('0xFCBD14DC51f0A4d49d5E53C2E0950e0bC26d0Dce') // HONEY
  const [amountIn, setAmountIn] = useState<bigint>(parseEther('1'))
  const [cacheEnabled, setCacheEnabled] = useState(true)

  // Gestionnaire de cache global
  const cacheManager = useSwapCacheManager({
    maxCacheSize: 50,
    autoCleanupInterval: 3 * 60 * 1000, // 3 minutes
    preloadPopularPairs: true,
    enableBlockBasedInvalidation: true
  })

  // Hook de swap avec cache
  const swap = useSwap({
    tokenIn,
    tokenOut,
    amountIn,
    enableRouteCache: cacheEnabled,
    enableDebounce: true,
    cacheOptions: {
      staleTime: 30 * 1000,
      enablePersistentCache: true,
      backgroundRefetch: true
    }
  })

  // Fonction pour changer le montant
  const handleAmountChange = (newAmount: string) => {
    try {
      const amount = parseEther(newAmount)
      setAmountIn(amount)

      // Invalide le cache si changement significatif
      if (swap.cache.isEnabled) {
        swap.cache.invalidateCacheForAmount(amount)
      }
    } catch (error) {
      console.warn('Invalid amount:', error)
    }
  }

  // Fonction pour échanger les tokens
  const handleTokenSwap = () => {
    const tempTokenIn = tokenIn
    setTokenIn(tokenOut)
    setTokenOut(tempTokenIn)
  }

  // Fonction pour afficher les métriques
  const handleShowMetrics = () => {
    const metrics = cacheManager.exportPerformanceMetrics()
    console.log('📊 Cache Metrics:', {
      hitRate: `${metrics.cacheHitRate.toFixed(1)}%`,
      totalRequests: metrics.cacheMetrics.totalRequests,
      averageResponseTime: `${metrics.averageResponseTime.toFixed(0)}ms`,
      activeCaches: metrics.activeCaches,
      totalCached: metrics.totalCachedRoutes
    })
  }

  // Détermine le statut du cache
  const getCacheStatus = () => {
    if (!swap.cache.isEnabled) return { text: 'Désactivé', color: '#gray' }
    if (swap.cache.isFromCache && swap.cache.isDataFresh) return { text: '✅ Cache (frais)', color: '#00C853' }
    if (swap.cache.isFromCache && swap.cache.isStale) return { text: '🔄 Cache (mise à jour)', color: '#FF9800' }
    if (swap.isLoading) return { text: '⏳ Calcul...', color: '#2196F3' }
    return { text: '📊 Temps réel', color: '#9C27B0' }
  }

  const cacheStatus = getCacheStatus()

  return (
    <div style={{
      padding: '20px',
      maxWidth: '600px',
      margin: '0 auto',
      fontFamily: 'Arial, sans-serif',
      background: '#f5f5f5',
      borderRadius: '12px'
    }}>
      <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>
        🚀 Demo Cache Routes WinnieSwap
      </h2>

      {/* Configuration du cache */}
      <div style={{
        background: 'white',
        padding: '15px',
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <h3>⚙️ Configuration du Cache</h3>
        <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <input
            type="checkbox"
            checked={cacheEnabled}
            onChange={(e) => setCacheEnabled(e.target.checked)}
          />
          Cache intelligent activé
        </label>

        <div style={{ marginTop: '10px', fontSize: '14px' }}>
          <strong>Statut:</strong>
          <span style={{ color: cacheStatus.color, marginLeft: '8px' }}>
            {cacheStatus.text}
          </span>
        </div>
      </div>

      {/* Interface de swap */}
      <div style={{
        background: 'white',
        padding: '15px',
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <h3>💱 Interface de Swap</h3>

        <div style={{ marginBottom: '15px' }}>
          <label>Token In:</label>
          <select
            value={tokenIn}
            onChange={(e) => setTokenIn(e.target.value as Address)}
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          >
            <option value="0x0000000000000000000000000000000000000000">BERA</option>
            <option value="0x6969696969696969696969696969696969696969">wBERA</option>
            <option value="0xFCBD14DC51f0A4d49d5E53C2E0950e0bC26d0Dce">HONEY</option>
          </select>
        </div>

        <div style={{ textAlign: 'center', margin: '10px 0' }}>
          <button
            onClick={handleTokenSwap}
            style={{
              background: '#2196F3',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            🔄 Inverser
          </button>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Token Out:</label>
          <select
            value={tokenOut}
            onChange={(e) => setTokenOut(e.target.value as Address)}
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          >
            <option value="0x0000000000000000000000000000000000000000">BERA</option>
            <option value="0x6969696969696969696969696969696969696969">wBERA</option>
            <option value="0xFCBD14DC51f0A4d49d5E53C2E0950e0bC26d0Dce">HONEY</option>
          </select>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Montant:</label>
          <input
            type="number"
            step="0.1"
            min="0"
            defaultValue="1"
            onChange={(e) => handleAmountChange(e.target.value)}
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>
      </div>

      {/* Résultats du swap */}
      <div style={{
        background: 'white',
        padding: '15px',
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <h3>📊 Résultats</h3>

        {swap.isLoading && (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            ⏳ Chargement des routes...
          </div>
        )}

        {swap.error && (
          <div style={{
            background: '#ffebee',
            color: '#c62828',
            padding: '10px',
            borderRadius: '4px'
          }}>
            ❌ Erreur: {swap.error.message}
          </div>
        )}

        {swap.quote && (
          <div>
            <div style={{ marginBottom: '10px' }}>
              <strong>Montant de sortie:</strong> {swap.quote.amountOutFormatted}
            </div>
            <div style={{ marginBottom: '10px' }}>
              <strong>Impact prix:</strong> {swap.quote.priceImpact.toFixed(2)}%
            </div>
            <div style={{ marginBottom: '10px' }}>
              <strong>Type de route:</strong> {swap.quote.routeType}
            </div>
            <div style={{ marginBottom: '10px', fontSize: '12px', color: '#666' }}>
              {swap.quote.routeDetails}
            </div>
          </div>
        )}
      </div>

      {/* Métriques de cache */}
      {cacheEnabled && (
        <div style={{
          background: 'white',
          padding: '15px',
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          <h3>📈 Métriques du Cache</h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '14px' }}>
            <div>
              <strong>Taux de succès:</strong> {cacheManager.performanceStats.cacheHitRate.toFixed(1)}%
            </div>
            <div>
              <strong>Routes en cache:</strong> {cacheManager.performanceStats.totalCachedRoutes}
            </div>
            <div>
              <strong>Temps de réponse:</strong> {cacheManager.performanceStats.averageResponseTime.toFixed(0)}ms
            </div>
            <div>
              <strong>Caches actifs:</strong> {cacheManager.performanceStats.activeCaches}
            </div>
          </div>

          <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
            <button
              onClick={handleShowMetrics}
              style={{
                background: '#4CAF50',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              📊 Voir métriques (console)
            </button>

            <button
              onClick={() => swap.cache.invalidateCache({ forceRefresh: true })}
              style={{
                background: '#FF9800',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              🔄 Invalider cache
            </button>

            <button
              onClick={cacheManager.optimizeCache}
              style={{
                background: '#9C27B0',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              ⚡ Optimiser
            </button>
          </div>
        </div>
      )}

      {/* Actions de swap */}
      <div style={{
        background: 'white',
        padding: '15px',
        borderRadius: '8px'
      }}>
        <h3>🔄 Actions</h3>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {swap.needsApproval && (
            <button
              onClick={swap.approve}
              disabled={!swap.isReady}
              style={{
                background: '#FF5722',
                color: 'white',
                border: 'none',
                padding: '12px 20px',
                borderRadius: '4px',
                cursor: swap.isReady ? 'pointer' : 'not-allowed',
                opacity: swap.isReady ? 1 : 0.6
              }}
            >
              ✅ Approuver Token
            </button>
          )}

          <button
            onClick={swap.swap}
            disabled={!swap.isReady || swap.needsApproval}
            style={{
              background: '#4CAF50',
              color: 'white',
              border: 'none',
              padding: '12px 20px',
              borderRadius: '4px',
              cursor: (swap.isReady && !swap.needsApproval) ? 'pointer' : 'not-allowed',
              opacity: (swap.isReady && !swap.needsApproval) ? 1 : 0.6
            }}
          >
            💱 Échanger
          </button>

          <button
            onClick={swap.refresh}
            style={{
              background: '#2196F3',
              color: 'white',
              border: 'none',
              padding: '12px 20px',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            🔄 Actualiser
          </button>
        </div>
      </div>

      {/* Info du développeur */}
      <div style={{
        marginTop: '20px',
        padding: '10px',
        background: '#e3f2fd',
        borderRadius: '4px',
        fontSize: '12px',
        color: '#1565c0'
      }}>
        💡 <strong>Info développeur:</strong> Ouvrez la console pour voir les logs détaillés du cache.
        Testez différents montants pour voir le système de buckets de 5% en action.
      </div>
    </div>
  )
}

export default SwapWithCacheDemo