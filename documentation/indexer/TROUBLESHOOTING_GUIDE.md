# WinnieSwap Indexer - Guide de Dépannage des Statistiques

## Problèmes de Prix

### Prix Token Incohérent ou Zéro

#### Symptômes
- `Token.priceUSD = 0` ou prix aberrant
- TVL pools incorrecte
- Volume USD incorrect

#### Causes Possibles et Solutions

**1. Pas de chemin de pricing**
- **Vérification** : `Token.derivedETH = 0`
- **Localisation** : `apps/indexer/src/utils/pricing.ts` - `findEthPerToken()`
- **Solution** : 
  - Vérifier que des pools existent avec ce token
  - Vérifier la liquidité minimale (`MINIMUM_ETH_LOCKED`)
  - Créer une pool token/BERA ou token/stablecoin avec liquidité suffisante

**2. Prix BERA (Bundle) incorrect**
- **Vérification** : `Bundle.ethPriceUSD` aberrant
- **Localisation** : `apps/indexer/src/utils/pricing.ts` - `getEthPriceInUSD()`
- **Causes** :
  - Pools BERA/stablecoin avec liquidité insuffisante
  - Prix stablecoin modifié (devrait être 1.0)
  - Manipulation de prix dans les petites pools
- **Solution** :
  - Augmenter `MINIMUM_ETH_LOCKED` 
  - Vérifier les adresses des stablecoins dans `constants.ts`
  - Ignorer les pools avec liquidité anormalement faible

**3. Pool pricing non mise à jour**
- **Vérification** : Pool existe mais prix token pas mis à jour
- **Cause** : Événement swap pas traité ou échec du handler
- **Solution** : Vérifier les logs Ponder pour erreurs de traitement

### Prix Token Volatil/Instable

#### Symptômes
- Prix qui change drastiquement entre les blocs
- TVL qui fluctue anormalement

#### Causes et Solutions

**1. Liquidité insuffisante**
- **Seuil** : Pool avec moins de `MINIMUM_ETH_LOCKED` BERA
- **Impact** : Swaps de petite taille causent gros changements de prix
- **Solution** : Augmenter seuils de liquidité minimale

**2. Pool de manipulation**
- **Détection** : Prix très différent des autres pools du même token
- **Solution** : Implémenter pondération par liquidité plus stricte

## Problèmes de Volume

### Volume 24h Incorrect

#### Symptômes
- Volume affiché différent de la somme des swaps
- Volume négatif ou zéro

#### Diagnostic et Solutions

**1. Données temporelles manquantes**
- **Vérification** : `PoolDayData` des dernières 24h
- **Localisation** : Création dans chaque handler de swap
- **Solution** : Vérifier que les entités DayData sont bien créées

**2. Calcul de volume incorrect**  
- **Vérification** : `Pool.volumeUSD` vs somme des swaps
- **Localisation** : `apps/indexer/src/pool/swap.ts`
- **Formule attendue** : 
  ```
  volumeUSD += (|amount0| * token0.priceUSD) + (|amount1| * token1.priceUSD)
  ```

**3. Prix utilisé pour calcul invalide**
- **Cause** : Prix token = 0 au moment du swap
- **Solution** : Vérifier ordre de mise à jour (prix avant volume)

### Volume Token vs Pool Incohérent

#### Diagnostic
- Vérifier que `Token.volumeUSD` = somme des volumes pools contenant ce token
- Localisation : Mise à jour dans chaque swap impliquant le token

## Problèmes de TVL

### TVL Pool Incorrecte

#### Symptômes
- `Pool.totalValueLockedUSD` ne correspond pas aux réserves
- TVL négative

#### Diagnostic et Solutions

**1. Problème de calcul de liquidité**
- **Vérification** : `Pool.liquidity` cohérente avec positions actives
- **Localisation** : Mise à jour dans `mint.ts` et `burn.ts`
- **Solution** : Vérifier que toutes les positions sont correctement trackées

**2. Prix utilisé pour TVL incorrect**
- **Cause** : Prix token obsolète ou zéro
- **Solution** : Forcer recalcul prix avant TVL

**3. Positions fantômes**
- **Symptômes** : Positions avec liquidité mais pas de mint associé
- **Solution** : Audit des entités Position vs événements Mint

### TVL Token Incohérente

#### Diagnostic
```
Token.totalValueLockedUSD ≠ somme(Pool.totalValueLockedToken0/1 * prix)
```

#### Solutions
- Vérifier que tous les pools sont inclus dans le calcul
- Recalcul forcé lors de changement de prix

## Problèmes d'APR

### APR Pool Incorrect ou Manquant

#### Symptômes
- APR = 0 alors que fees collectées
- APR aberrant (trop élevé/faible)

#### Diagnostic et Solutions

**1. Fees 24h incorrectes**
- **Vérification** : Somme des `PoolDayData.feesUSD` dernières 24h
- **Cause** : Données journalières manquantes
- **Solution** : Vérifier création des entités DayData

**2. TVL utilisée pour calcul incorrect**
- **Formule APR** : `(fees24h / tvlUSD) * 365 * 100`
- **Cause** : TVL = 0 ou obsolète
- **Solution** : Recalcul TVL avant APR

**3. Fees pas comptabilisées**
- **Vérification** : `Pool.feesUSD` augmente lors des swaps
- **Localisation** : Calcul dans `swap.ts`
- **Formule** : `fees = swapAmount * pool.feeTier / 1000000`

### APR Vault Incorrect

#### Symptômes
- APR vault très différent de la pool sous-jacente
- APR négatif

#### Diagnostic Spécifique Vaults

**1. Fees de gestion pas déduites**
- **Formule** : `netAPR = grossAPR - managementFeeAPR`
- **Vérification** : `Vault.managementFee` correctement appliquée

**2. Fees vault pas collectées**
- **Événement manqué** : `FeesEarned` pas traité
- **Solution** : Vérifier handler d'événement vault

## Problèmes de Données Temporelles

### Données Hourly/Daily Manquantes

#### Symptômes
- Gaps dans les données temporelles
- Métriques 24h/7d incorrectes

#### Solutions

**1. Création d'entités temporelles**
- **Vérification** : Entité créée au premier événement de la période
- **Code** : Pattern `getOrCreateXXXData()` dans chaque handler
- **Fix** : Implémenter création lazy des entités manquantes

**2. Timezone problems**
- **Standard** : Tout doit être en UTC
- **Vérification** : `timestamp % 3600 === 0` pour les heures
- **Fix** : Conversion explicite vers UTC

### Données OHLC Incorrectes

#### Diagnostic
- `high < low` ou valeurs aberrantes
- Prix open/close incohérents

#### Solutions
- Vérifier ordre chronologique des mises à jour
- S'assurer que chaque swap met à jour OHLC approprié

## Outils de Debug

### Logs Ponder Utiles
```bash
# Événements traités
pnpm dev | grep "Processing event"

# Erreurs de base de données  
pnpm dev | grep "Database error"

# Problèmes de sync
pnpm dev | grep "Sync"
```

### Requêtes SQL Debug
```sql
-- Vérifier cohérence TVL
SELECT 
  p.id,
  p.totalValueLockedUSD,
  (p.totalValueLockedToken0 * t0.priceUSD + p.totalValueLockedToken1 * t1.priceUSD) as calculatedTVL
FROM Pool p
JOIN Token t0 ON p.token0 = t0.id  
JOIN Token t1 ON p.token1 = t1.id
WHERE ABS(p.totalValueLockedUSD - (p.totalValueLockedToken0 * t0.priceUSD + p.totalValueLockedToken1 * t1.priceUSD)) > 100;

-- Vérifier positions orphelines
SELECT * FROM Position p 
LEFT JOIN Pool po ON p.pool = po.id 
WHERE po.id IS NULL;

-- Vérifier prix cohérents
SELECT id, symbol, priceUSD, derivedETH FROM Token 
WHERE priceUSD > 0 AND derivedETH = 0;
```

### GraphQL Queries Debug
```graphql
# Vérifier données temporelles récentes
query CheckRecentData {
  poolDayDatas(
    orderBy: "date"
    orderDirection: "desc"
    limit: 5
  ) {
    pool { id }
    date
    volumeUSD
    tvlUSD
    feesUSD
  }
}

# Vérifier pricing
query CheckPricing {
  bundle(id: "1") {
    ethPriceUSD
  }
  tokens(where: { priceUSD: "0" }) {
    id
    symbol
    priceUSD
    derivedETH
  }
}
```

## Checklist de Vérification Rapide

### Après Déploiement
- [ ] Bundle.ethPriceUSD cohérent avec marché
- [ ] Prix des stablecoins = 1.0
- [ ] Toutes les pools ont TVL > 0 si liquidité
- [ ] Volume 24h croissant avec activité
- [ ] APR des pools principales > 0
- [ ] Données temporelles créées automatiquement

### Debug Quotidien
- [ ] Aucune entité avec valeurs négatives
- [ ] TVL totale cohérente avec somme des composants
- [ ] Volumes 24h réalistes vs activité blockchain
- [ ] Prix tokens stables (pas de variations 10x+)
- [ ] Logs Ponder sans erreurs critiques