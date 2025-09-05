# Intégration des Charts avec GraphQL Ponder

## Vue d'ensemble

Ce document décrit l'intégration des nouvelles données GraphQL Ponder pour alimenter les charts de WinnieSwap. Le système permet d'afficher des données de pools et de tokens avec différentes métriques (prix, TVL, volume, fees).

## Architecture

### Composants principaux

1. **`usePonderChartData`** - Hook principal pour récupérer les données de chart via GraphQL
2. **`ChartWidget`** - Composant de chart avec support des métriques
3. **`ChartMetricsSelector`** - Sélecteur de métriques (prix, TVL, volume, fees)
4. **`usePoolSelection`** - Hook pour gérer la sélection de pools avec fallback

### Types de données

- **PoolDayData** / **PoolHourData** - Données agrégées par pool
- **TokenDayData** / **TokenHourData** - Données agrégées par token
- **ChartMetric** - Types de métriques disponibles (price, tvl, volume, fees)

## Utilisation

### Configuration par défaut

Le système affiche par défaut la pool WBERA/HONEY :
- WBERA: `0x6969696969696969696969696969696969696969`
- HONEY: `0xFCBD14DC51f0A4d49d5E53C2E0950e0bC26d0Dce`

### Sélection de tokens

Quand l'utilisateur sélectionne des tokens dans le SwapForm :
1. Le système recherche une pool correspondante
2. Si trouvée, affiche les données de la pool
3. Si non trouvée, affiche les données du token individuel
4. En fallback, affiche la pool WBERA/HONEY

### Métriques disponibles

- **Prix** - Prix du token ou de la pool
- **TVL** - Total Value Locked en USD
- **Volume** - Volume d'échange en USD
- **Fees** - Frais générés en USD

## Configuration GraphQL

### Endpoints

- **URL GraphQL** : `VITE_GRAPHQL_URL` (variable d'environnement)
- **Requêtes** : Utilise le schéma Ponder généré automatiquement

### Requêtes principales

```graphql
# Données de pool par jour
query GetPoolDayData {
  poolDayData(
    where: { pool: "0x..." }
    orderBy: "date"
    orderDirection: "desc"
    limit: 365
  ) {
    items {
      id
      date
      pool { id token0 token1 feeTier }
      tvlUSD
      volumeUSD
      feesUSD
      open high low close
    }
  }
}

# Données de token par jour
query GetTokenDayData {
  tokenDayData(
    where: { token: "0x..." }
    orderBy: "date"
    orderDirection: "desc"
    limit: 365
  ) {
    items {
      id
      date
      token { id symbol name }
      priceUSD
      volumeUSD
      totalValueLockedUSD
      feesUSD
      open high low close
    }
  }
}
```

## Intégration dans les composants

### SwapPageLayout

```tsx
import { usePoolSelectionWithFallback } from '../../hooks/usePoolSelection';

const poolSelection = usePoolSelectionWithFallback(fromToken, toToken);

<ChartWidget
  poolAddress={poolSelection.poolAddress || poolSelection.fallbackPoolAddress}
  metric={metric}
  showMetricsSelector={true}
  // ... autres props
/>
```

### ChartWidget

```tsx
import { usePonderChartData } from '../../hooks/usePonderChartData';

const { data, isLoading, error, stats } = usePonderChartData(
  poolAddress,
  tokenAddress,
  metric,
  chartType,
  interval
);
```

## Gestion des erreurs

### États d'erreur

1. **Pool non trouvée** - Affiche un message d'erreur spécifique
2. **Erreur GraphQL** - Affiche un message d'erreur générique
3. **Données manquantes** - Utilise les données de fallback

### Fallback

- Si aucune pool n'est trouvée pour les tokens sélectionnés
- Le système affiche automatiquement la pool WBERA/HONEY
- Les données de fallback sont toujours disponibles

## Performance

### Cache et refetch

- **Cache** : 1-60 minutes selon l'intervalle
- **Refetch** : Automatique selon l'intervalle
- **Retry** : 3 tentatives avec backoff exponentiel

### Optimisations

- Requêtes GraphQL optimisées avec pagination
- Cache React Query pour éviter les requêtes redondantes
- Lazy loading des données de chart

## Variables d'environnement

```env
VITE_GRAPHQL_URL=http://localhost:42069/graphql
```

## Développement

### Ajout de nouvelles métriques

1. Ajouter le type dans `ChartMetric`
2. Mettre à jour `ChartMetricsSelector`
3. Ajouter la logique de traitement dans `usePonderChartData`

### Ajout de nouveaux intervalles

1. Ajouter le type dans `ChartInterval`
2. Mettre à jour `INTERVAL_CONFIG`
3. Ajouter la logique de requête correspondante

## Tests

### Tests unitaires

- Hooks de données
- Composants de chart
- Logique de sélection de pool

### Tests d'intégration

- Flux complet de sélection de tokens
- Affichage des données de chart
- Gestion des erreurs et fallback
