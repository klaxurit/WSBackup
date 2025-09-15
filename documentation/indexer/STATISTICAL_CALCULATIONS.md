# WinnieSwap Indexer - Calculs Statistiques

## Calculs de Prix

### Prix ETH/BERA (Bundle.ethPriceUSD)
**Fichier** : `apps/indexer/src/utils/pricing.ts` - `getEthPriceInUSD()`

**Calcul** :
1. Recherche des pools BERA/stablecoin (USDC, USDT, DAI) avec `minimumEthLocked = 2`
2. Pour chaque pool éligible :
   - Récupération du prix BERA basé sur les réserves et le prix du stablecoin
   - Pondération par la liquidité BERA dans la pool
3. Prix final = moyenne pondérée par la liquidité

**Sources de données** :
- Pools avec BERA comme token0 ou token1
- Stablecoins avec prix fixe = 1 USD
- Liquidité minimale requise pour éviter la manipulation

### Prix des Tokens (Token.priceUSD)
**Fichier** : `apps/indexer/src/utils/pricing.ts` - `findEthPerToken()` puis conversion via Bundle.ethPriceUSD

**Calcul par ordre de priorité** :
1. **Stablecoins** : prix fixe = 1 USD
2. **BERA** : Bundle.ethPriceUSD directement
3. **Autres tokens** : recherche du meilleur chemin de pricing via BERA
   - Pools directes token/BERA si liquidité suffisante
   - Chemins indirects via stablecoins : token → stablecoin → BERA
   - Pondération par liquidité pour éviter la manipulation

**Sources de données** :
- Prix BERA du Bundle
- Réserves des pools impliquant le token
- Liquidité dans chaque pool pour la pondération

## Calculs de Volume

### Volume des Pools
**Mise à jour** : À chaque swap dans `apps/indexer/src/pool/swap.ts`

**Calcul** :
```
volumeToken0 += |amount0|
volumeToken1 += |amount1|
volumeUSD += (|amount0| * token0.priceUSD) + (|amount1| * token1.priceUSD)
```

### Volume des Tokens
**Mise à jour** : À chaque swap impliquant le token

**Calcul** :
```
Token.volumeUSD += montant_swappé * Token.priceUSD
```

### Volume 24h
**Calcul** : Somme des volumes dans les TokenDayData/PoolDayData des dernières 24h

## Calculs de TVL (Total Value Locked)

### TVL des Pools
**Mise à jour** : À chaque mint/burn + recalcul lors de changement de prix

**Calcul** :
```
totalValueLockedToken0 = somme(position.liquidity * facteur_tick)
totalValueLockedToken1 = somme(position.liquidity * facteur_tick)
totalValueLockedUSD = (totalValueLockedToken0 * token0.priceUSD) + (totalValueLockedToken1 * token1.priceUSD)
```

### TVL des Tokens
**Calcul** : Somme de la TVL du token dans toutes les pools

```
Token.totalValueLocked = somme(pool.totalValueLockedToken0/1 where token = token0/1)
Token.totalValueLockedUSD = Token.totalValueLocked * Token.priceUSD
```

### TVL des Vaults
**CORRIGÉ** : Calcul en temps réel via le contrat depuis `apps/indexer/src/vaults/` handlers

**Nouveau calcul unifié** :
```javascript
// 1. Récupération des balances réelles du contrat
const [amount0Current, amount1Current] = await context.client.readContract({
  address: vault.id,
  abi: context.contracts.svVaults.abi,
  functionName: "getUnderlyingBalances",
});

// 2. Conversion avec les décimales appropriées
const amount0Decimal = new Decimal(formatUnits(amount0Current, token0.decimals));
const amount1Decimal = new Decimal(formatUnits(amount1Current, token1.decimals));

// 3. Mise à jour directe avec les valeurs réelles
vault.totalValueLockedToken0 = amount0Decimal.toString()
vault.totalValueLockedToken1 = amount1Decimal.toString()

// 4. Calcul TVL USD avec prix actuels
const tvlBera = amount0Decimal.mul(token0.derivedBERA).plus(amount1Decimal.mul(token1.derivedBERA))
vault.totalValueLockedUSD = tvlBera.mul(beraPriceUSD).toString()
```

**Avantages** :
- ✅ TVL toujours synchronisée avec le contrat
- ✅ Pas de dérive due aux erreurs d'accumulation
- ✅ Prise en compte des rebalances automatiques
- ✅ Fallback vers l'ancien calcul si erreur contrat

### TVL Protocole
**Calcul** : Somme des TVL de toutes les pools + vaults

## Calculs de Fees

### Fees des Pools
**Mise à jour** : À chaque swap

**Calcul** :
```
feeAmount = swapAmount * pool.feeTier / 1000000
feesUSD += feeAmount * token.priceUSD
```

**Pool.feeTier** :
- 500 = 0.05%
- 3000 = 0.3%
- 10000 = 1%

### Volume des Vaults
**CORRIGÉ** : Séparation du volume de trading et des dépôts/retraits

**Nouveau calcul** :
```javascript
// Volume de dépôts/retraits (séparé du trading volume)
vault.depositWithdrawVolumeUSD = new Decimal(vault.depositWithdrawVolumeUSD || "0")
  .plus(totalDepositedUSD) // Lors des dépôts
  .plus(totalWithdrawnUSD) // Lors des retraits
  .toString()

// Volume de trading reste séparé dans volumeUSD (pour swaps internes)
```

### Fees des Vaults
**CORRIGÉ** : Prise en compte des frais de management

**Calcul des fees brutes** :
```javascript
Vault.feesEarned0/1 += montant des fees collectées
Vault.totalFeesEarnedUSD = (feesEarned0 * token0.priceUSD) + (feesEarned1 * token1.priceUSD)
```

**Nouveau : Calcul des frais de management** :
```javascript
// Frais prélevés par le gestionnaire (en basis points)
const managementFeeRate = new Decimal(vault.managementFee).div(10000); // 500 BPS = 5%
const managementFeesUSD = totalFeesEarnedUSD.mul(managementFeeRate);
const netFeesUSD = totalFeesEarnedUSD.minus(managementFeesUSD);
```

## Calculs d'APR

### APR des Pools
**Fichier** : `apps/indexer/src/utils/apr.ts` (si existe) ou calculé dans les resolvers

**Calcul** :
```
feesLast24h = PoolDayData des dernières 24h
APR = (feesLast24h / pool.totalValueLockedUSD) * 365 * 100
```

### APR des Vaults  
**CORRIGÉ** : Calcul de l'APR brut ET net depuis `apps/indexer/src/stats/vault.ts`

**Formule corrigée** :
```javascript
// 1. Calcul des fees sur la période
const periodFees = currentFeesUSD.minus(lastFeesUSD);

// 2. Calcul des frais de management sur la période 
const managementFeeRate = new Decimal(vault.managementFee).div(10000); // BPS → ratio
const managementFeesOnPeriod = periodFees.mul(managementFeeRate);

// 3. Fees nettes distribuées aux utilisateurs
const netPeriodFees = periodFees.minus(managementFeesOnPeriod);

// 4. Calcul de l'APR net (ce qui compte pour les utilisateurs)
const annualMultiplier = new Decimal(365 * 24 * 3600).div(timeDiff);
const netAPR = netPeriodFees.gt(0) 
  ? netPeriodFees.mul(annualMultiplier).div(tvlUSD).mul(100)
  : new Decimal(0);

// 5. APR brut pour information
const grossAPR = periodFees.gt(0)
  ? periodFees.mul(annualMultiplier).div(tvlUSD).mul(100) 
  : new Decimal(0);

vault.netAPR = netAPR.toString();
vault.apy = grossAPR.toString(); // Gardé pour compatibilité
```

**Nouveaux champs** :
- ✅ `netAPR` : APR réel pour les utilisateurs (après frais de management)  
- ✅ `apy` : APR brut (renommé depuis l'ancien APR)
- ✅ `managementFee` : frais en basis points récupérés du contrat

**Protection** :
- ✅ Plafonnement des frais anormaux à 500 BPS (5%)
- ✅ Validation lors de la création du vault

## Métriques de Performance

### Price Impact
**Calcul** : Lors des gros swaps
```
priceImpact = |newPrice - oldPrice| / oldPrice * 100
```

### Utilisation de Capital (Capital Efficiency)
**Pour les positions/vaults** :
```
efficiency = fees_earned / capital_deployed * temps
```

### Impermanent Loss
**NOUVEAU** : Calcul et suivi de la perte impermanente pour les vaults

**Calcul lors des rebalances** dans `apps/indexer/src/vaults/Rebalance.ts` :
```javascript
// 1. Valeur du vault après rebalance (prix actuels)
const valueAfterUSD = amount0AfterDecimal.mul(t0.derivedBERA).mul(beraPriceUSD)
  .plus(amount1AfterDecimal.mul(t1.derivedBERA).mul(beraPriceUSD))

// 2. Valeur avant rebalance (stockée)
const valueBefore = new Decimal(vault.totalValueLockedUSD || "0")

// 3. Changement relatif de valeur
if (valueBefore.gt(0)) {
  const ilChange = valueAfterUSD.minus(valueBefore).div(valueBefore).mul(100)
  // 4. Accumulation de l'IL sur toute la vie du vault
  vault.impermanentLoss = new Decimal(vault.impermanentLoss || "0").plus(ilChange).toString()
}
```

**Interprétation** :
- ✅ Perte impermanente cumulée sur la vie du vault
- ✅ Négative = perte, positive = gain par rapport au HODL
- ✅ Mise à jour à chaque rebalance du vault

### Performance des Positions Utilisateurs
**NOUVEAU** : Système complet de tracking de performance

**Calculs dans `apps/indexer/src/utils/positionCalculations.ts`** :

```javascript
// 1. PnL non-réalisé
const currentValueUSD = shareRatio.mul(vaultBalanceUSD);
const unrealizedPnLUSD = currentValueUSD.minus(initialValueUSD);

// 2. Retour total (réalisé + non-réalisé)  
const totalPnLUSD = realizedPnLUSD.plus(unrealizedPnLUSD);
const totalReturn = totalPnLUSD.div(initialValueUSD).mul(100); // en %

// 3. Retour annualisé
const holdingPeriodYears = holdingPeriodSeconds / (365 * 24 * 3600);
const annualizedReturn = totalReturn.div(holdingPeriodYears);
```

**Métriques trackées** :
- ✅ `currentValueUSD` : Valeur actuelle de la position  
- ✅ `realizedPnLUSD` : PnL réalisé lors des retraits
- ✅ `unrealizedPnLUSD` : PnL non-réalisé actuel
- ✅ `totalReturn` : Retour total en pourcentage
- ✅ `annualizedReturn` : Retour annualisé

## Données Temporelles OHLC

### Prix OHLC pour Tokens
**Dans TokenHourData/TokenDayData** :

**Calcul** :
- **Open** : premier prix de la période
- **High** : prix maximum de la période
- **Low** : prix minimum de la période  
- **Close** : dernier prix de la période

**Mise à jour** : À chaque swap modifiant le prix du token

### Volume OHLC pour Pools
**Dans PoolHourData/PoolDayData** :

- Basé sur le prix du token dominant (higher market cap)
- Mise à jour à chaque swap

## Précision des Calculs

### Utilisation de Decimal.js
**Pourquoi** : Éviter les erreurs de précision avec les nombres flottants JavaScript

**Usage** :
- Tous les calculs financiers (prix, volumes, TVL)
- Opérations avec des montants en wei
- Calculs de pourcentages et ratios

### Gestion des Overflows
**BigInt** utilisé pour :
- Montants de tokens en wei
- Calculs de liquidité
- Opérations sur sqrtPrice

## Agrégations Temporelles

### Données Horaires
**Création** : À la première mise à jour de l'heure UTC
**Mise à jour** : Accumulation pendant l'heure

### Données Journalières  
**Création** : À la première mise à jour du jour UTC (00:00)
**Mise à jour** : Accumulation pendant la journée

### Périodes de Calcul
- **24h** : Dernières 24 heures glissantes
- **7d** : 7 derniers jours complets
- **30d** : 30 derniers jours complets

## Triggers de Recalcul

### Prix → TVL
Quand un prix de token change :
1. Recalcul de la TVL de toutes les pools contenant ce token
2. Recalcul de la TVL de tous les vaults utilisant ces pools
3. Mise à jour des données temporelles

### Liquidité → Prix
Quand la liquidité d'une pool change :
1. Recalcul du poids de cette pool dans le pricing
2. Potentiel impact sur les prix dérivés des autres tokens

### Fees → APR
À chaque collection de fees :
1. Mise à jour des fees cumulées
2. Recalcul de l'APR basé sur les fees des dernières 24h