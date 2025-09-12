# WinnieSwap Indexer - Suivi des Positions Utilisateurs

## Vue d'ensemble

Le système de suivi des positions utilisateurs dans les vaults permet de calculer en temps réel la valeur, les performances et l'historique des investissements de chaque utilisateur.

## Architecture

### Entités Principales

#### vaultUserPosition
**Table principale** pour le suivi des positions actives
```typescript
{
  id: string; // "{user}-{vault}"
  user: string;
  vault: string;
  
  // Valeurs déposées
  depositedToken0: string;
  depositedToken1: string;
  shares: string;
  
  // Prix d'entrée moyens pondérés
  avgEntryPriceToken0: string;
  avgEntryPriceToken1: string;
  
  // Valeurs actuelles (CHAMP PRINCIPAL DEMANDÉ)
  currentValueToken0: string;
  currentValueToken1: string;
  currentValueBERA: string;
  currentValueUSD: string;
  totalValue: string; // Alias pour currentValueUSD
  
  // Suivi de l'investissement initial
  initialValueBERA: string;
  initialValueUSD: string;
  
  // PnL et performance
  realizedPnLBERA: string;
  realizedPnLUSD: string;
  unrealizedPnLBERA: string;
  unrealizedPnLUSD: string;
  totalPnLUSD: string;
  totalReturn: string; // %
  annualizedReturn: string; // %
  
  // Timestamps
  firstDepositAt: bigint;
  lastUpdateAt: bigint;
}
```

#### vaultPositionSnapshot
**Table historique** pour le tracking dans le temps
```typescript
{
  id: string; // "{vaultUserPosition.id}-{timestamp}"
  vaultUserPosition: string;
  timestamp: bigint;
  blockNumber: bigint;
  
  // État de la position à ce moment
  shares: string;
  currentValueToken0: string;
  currentValueToken1: string;
  currentValueUSD: string;
  currentValueBERA: string;
  
  // Métriques de performance
  unrealizedPnLUSD: string;
  totalReturn: string;
  annualizedReturn: string;
  
  // Contexte du vault
  vaultAPR: string;
  vaultTVL: string;
  
  // Métadonnées
  cause: string; // "deposit", "withdraw", "rebalance"
  triggerTxHash?: string;
}
```

## Calculs de Position

### 1. Valeur Actuelle de Position

**Fichier** : `apps/indexer/src/utils/positionCalculations.ts`

```javascript
async function calculatePositionValue(userPosition, vault, beraPriceUSD, context) {
  // 1. Récupération des balances réelles du vault
  const [amount0Raw, amount1Raw] = await context.client.readContract({
    address: vault.id,
    abi: context.contracts.svVaults.abi,
    functionName: "getUnderlyingBalances",
  });
  
  // 2. Calcul de la part de l'utilisateur
  const userShares = new Decimal(userPosition.shares);
  const totalShares = new Decimal(vault.totalSupply);
  const shareRatio = userShares.div(totalShares);
  
  // 3. Montants de tokens de l'utilisateur
  const currentValueToken0 = shareRatio.mul(vaultToken0Balance);
  const currentValueToken1 = shareRatio.mul(vaultToken1Balance);
  
  // 4. Conversion en BERA et USD
  const currentValueBERA = currentValueToken0.mul(token0.derivedBERA)
    .plus(currentValueToken1.mul(token1.derivedBERA));
  const currentValueUSD = currentValueBERA.mul(beraPriceUSD);
  
  return {
    currentValueToken0: currentValueToken0.toString(),
    currentValueToken1: currentValueToken1.toString(),
    currentValueBERA: currentValueBERA.toString(),
    currentValueUSD: currentValueUSD.toString(),
    totalValue: currentValueUSD.toString(), // CHAMP PRINCIPAL
    // ... autres métriques
  };
}
```

### 2. Calcul des Prix d'Entrée Moyens Pondérés

**Lors des nouveaux dépôts** :
```javascript
function calculateWeightedAverageEntryPrice(oldDeposits, oldAvgPrice, newDeposit, newPrice) {
  if (oldDeposits.eq(0)) {
    return newPrice; // Premier dépôt
  }
  
  // Valeur totale = ancienne valeur + nouvelle valeur
  const totalValue = oldDeposits.mul(oldAvgPrice).plus(newDeposit.mul(newPrice));
  const totalAmount = oldDeposits.plus(newDeposit);
  
  return totalValue.div(totalAmount); // Prix moyen pondéré
}
```

### 3. Calcul du PnL Réalisé

**Lors des retraits** :
```javascript
// 1. Proportion retirée
const shareRatio = sharesBurned.div(new Decimal(userPos.shares));

// 2. Valeur réalisée
const realizedValueUSD = totalBurnedUSD;

// 3. Coût initial correspondant
const initialCostUSD = new Decimal(userPos.initialValueUSD).mul(shareRatio);

// 4. PnL réalisé
const realizedPnLUSD = realizedValueUSD.minus(initialCostUSD);

// 5. Mise à jour du PnL réalisé cumulé
userPos.realizedPnLUSD = new Decimal(userPos.realizedPnLUSD).plus(realizedPnLUSD).toString();
```

## Mise à Jour des Positions

### Événement Minted (Dépôt)

**Fichier** : `apps/indexer/src/vaults/Minted.ts`

1. **Création ou récupération** de la position utilisateur
2. **Calcul des prix d'entrée** moyens pondérés
3. **Mise à jour des montants** déposés et shares
4. **Calcul des métriques** de performance actuelles
5. **Création d'un snapshot** automatique

### Événement Burned (Retrait)

**Fichier** : `apps/indexer/src/vaults/Burned.ts`

1. **Calcul du PnL réalisé** avec coût de base approprié
2. **Réduction proportionnelle** de l'investissement initial
3. **Gestion de la fermeture** complète (reset si shares = 0)
4. **Recalcul des métriques** pour la position restante
5. **Création d'un snapshot** de retrait

### Événement Rebalance

**Fichier** : `apps/indexer/src/vaults/Rebalance.ts`

1. **Récupération de toutes** les positions du vault
2. **Recalcul des valeurs** après changement de range
3. **Mise à jour en masse** de toutes les positions
4. **Création de snapshots** pour tous les utilisateurs

## Snapshots Historiques

### Création Automatique

Les snapshots sont créés automatiquement lors des événements :

```javascript
await createPositionSnapshot(
  userPosition,
  vault,
  "deposit", // cause: "deposit", "withdraw", "rebalance"
  event.transaction.hash,
  event.block.timestamp,
  event.block.number,
  context
);
```

### Utilisation

Les snapshots permettent :
- 📈 **Graphiques de performance** dans le temps
- 📊 **Analyse historique** des positions
- 🎯 **Comparaison** entre périodes
- 📋 **Audit trail** complet des positions

## Requêtes GraphQL

### Position Actuelle d'un Utilisateur

```graphql
query GetUserPosition($userId: String!, $vaultId: String!) {
  vaultUserPosition(id: "${userId}-${vaultId}") {
    # VALEUR PRINCIPALE DEMANDÉE
    totalValue      # Valeur totale actuelle en USD
    currentValueUSD # Alias pour totalValue
    
    # Détail par token
    currentValueToken0
    currentValueToken1
    currentValueBERA
    
    # Performance
    totalPnLUSD
    totalReturn
    annualizedReturn
    realizedPnLUSD
    unrealizedPnLUSD
    
    # Informations de base
    shares
    depositedToken0
    depositedToken1
    firstDepositAt
    lastUpdateAt
  }
}
```

### Historique d'une Position

```graphql
query GetPositionHistory($positionId: String!) {
  vaultPositionSnapshots(
    where: { vaultUserPosition: $positionId }
    orderBy: timestamp
    orderDirection: desc
  ) {
    timestamp
    currentValueUSD
    totalReturn
    annualizedReturn
    cause
    vaultAPR
    triggerTxHash
  }
}
```

### Toutes les Positions d'un Utilisateur

```graphql
query GetUserPositions($userId: String!) {
  vaultUserPositions(where: { user: $userId }) {
    id
    vault {
      name
      pool {
        token0 { symbol }
        token1 { symbol }
      }
    }
    totalValue
    totalPnLUSD
    totalReturn
    shares
    lastUpdateAt
  }
}
```

## Précision et Fiabilité

### Utilisation de Decimal.js

Tous les calculs financiers utilisent `Decimal.js` pour :
- ✅ **Éviter les erreurs** de précision JavaScript
- ✅ **Calculs précis** avec les wei et grandes valeurs
- ✅ **Cohérence** dans tous les calculs

### Synchronisation avec les Contrats

- ✅ **TVL en temps réel** via `getUnderlyingBalances()`
- ✅ **Pas de dérive** accumulative
- ✅ **Fallback** en cas d'erreur de contrat
- ✅ **Validation** des données critiques

### Gestion d'Erreurs

```javascript
try {
  const positionMetrics = await calculatePositionValue(...);
  // Mise à jour avec les métriques calculées
} catch (error) {
  console.warn(`Could not calculate position metrics:`, error.message);
  // Fallback vers calculs de base
  userPos.currentValueToken0 = fallbackCalculation();
}
```

## Cas d'Usage

### Frontend - Dashboard Utilisateur

Le champ `totalValue` fournit directement la valeur demandée :

```javascript
// Récupération de la valeur totale de position
const { data } = useQuery(GET_USER_POSITION, {
  variables: { userId: userAddress, vaultId: vaultAddress }
});

console.log("Valeur actuelle:", data.vaultUserPosition.totalValue, "USD");
console.log("PnL total:", data.vaultUserPosition.totalPnLUSD, "USD");
console.log("Retour:", data.vaultUserPosition.totalReturn, "%");
```

### Analytics - Performance Tracking

```javascript
// Historique de performance
const snapshots = await getPositionSnapshots(positionId);
const performanceChart = snapshots.map(s => ({
  date: s.timestamp,
  value: s.currentValueUSD,
  return: s.totalReturn
}));
```

## Avantages du Système

- ✅ **Valeur totale précise** : `totalValue` répond exactement à la demande
- ✅ **Performance complète** : PnL réalisé + non-réalisé + returns
- ✅ **Historique détaillé** : snapshots automatiques sur tous les événements
- ✅ **Temps réel** : synchronisation avec les contrats
- ✅ **Évolutif** : système modulaire et extensible