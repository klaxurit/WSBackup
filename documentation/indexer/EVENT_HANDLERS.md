# WinnieSwap Indexer - Event Handlers Documentation

## Vue d'ensemble

L'indexer WinnieSwap écoute les événements blockchain de deux sources principales :
- **Uniswap V3 Core** : Pool Factory, Pools
- **Sticky Vaults (Arrakis V1)** : Vault Factory, Vaults

## Événements Uniswap V3

### Pool Factory Events

#### PoolCreated
**Fichier** : `apps/indexer/src/poolFactory.ts`
**Event** : `PoolCreated(token0, token1, fee, tickSpacing, pool)`

**Données créées/mises à jour** :
- Création d'une nouvelle entité `Pool`
- Création d'entités `Token` si elles n'existent pas
- Initialisation des statistiques de pool à zéro
- Calcul du prix initial basé sur l'ordre des tokens

### Pool Events

#### Swap
**Fichier** : `apps/indexer/src/pool/swap.ts`
**Event** : `Swap(sender, recipient, amount0, amount1, sqrtPriceX96, liquidity, tick)`

**Données mises à jour** :
- `Pool` : volume, sqrtPrice, tick, liquidity, txCount, feeGrowth
- `Token` : volume, txCount, priceUSD
- `Bundle` : ethPriceUSD (si pool BERA impliquée)
- `PoolHourData` : volume, tvlUSD, feesUSD, txCount, high, low, open, close
- `PoolDayData` : volume, tvlUSD, feesUSD, txCount, high, low, open, close
- `TokenHourData` : volume, priceUSD, high, low, open, close
- `TokenDayData` : volume, priceUSD, high, low, open, close
- `ProtocolHourData` : volume, tvlUSD, txCount
- `ProtocolDayData` : volume, tvlUSD, txCount
- `Transaction` : nouvelle transaction créée
- `Mint/Burn` : mise à jour de la transaction associée si elle existe

#### Mint
**Fichier** : `apps/indexer/src/pool/mint.ts`
**Event** : `Mint(sender, owner, tickLower, tickUpper, amount, amount0, amount1)`

**Données mises à jour** :
- `Pool` : liquidity, txCount, totalValueLockedToken0/1
- `Position` : création ou mise à jour avec liquidité ajoutée
- `PositionSnapshot` : snapshot à la création/modification
- `Tick` : liquidityNet, liquidityGross si dans les ticks actifs
- `Token` : txCount
- `PoolHourData/PoolDayData` : tvlUSD, txCount
- `TokenHourData/TokenDayData` : totalValueLocked
- `ProtocolHourData/ProtocolDayData` : tvlUSD, txCount
- `Transaction` : création avec type 'MINT'

#### Burn
**Fichier** : `apps/indexer/src/pool/burn.ts`
**Event** : `Burn(owner, tickLower, tickUpper, amount, amount0, amount1)`

**Données mises à jour** :
- `Pool` : liquidity, txCount, totalValueLockedToken0/1
- `Position` : liquidité retirée, suppression si liquidité = 0
- `Tick` : liquidityNet, liquidityGross mis à jour
- `Token` : txCount
- `PoolHourData/PoolDayData` : tvlUSD, txCount
- `TokenHourData/TokenDayData` : totalValueLocked
- `ProtocolHourData/ProtocolDayData` : tvlUSD, txCount
- `Transaction` : création avec type 'BURN'

#### Collect
**Fichier** : `apps/indexer/src/pool/collect.ts`
**Event** : `Collect(owner, recipient, tickLower, tickUpper, amount0, amount1)`

**Données mises à jour** :
- `Position` : collectedFeesToken0/1, feeGrowthInside0LastX128/1LastX128
- `Pool` : txCount
- `Token` : txCount
- `PoolHourData/PoolDayData` : txCount
- `ProtocolHourData/ProtocolDayData` : txCount
- `Transaction` : création avec type 'COLLECT'

## Événements Sticky Vaults

### Vault Factory Events

#### StickyVaultCreated
**Fichier** : `apps/indexer/src/vaults/StickyVaultCreated.ts`
**Event** : `StickyVaultCreated(stickyVault, uniPool, manager)`

**Données créées/mises à jour** :
- Création d'une nouvelle entité `stickyVault`
- Association avec la `Pool` Uniswap V3 correspondante
- Récupération du nom du vault depuis le contrat
- **NOUVEAU** : Récupération et validation des frais de management (`managerFeeBPS`)
- Protection contre les frais anormaux (plafonnés à 500 BPS = 5%)
- Configuration des paramètres initiaux avec `performanceFee` = 0 (Arrakis V1)

### Vault Events

#### Minted
**Fichier** : `apps/indexer/src/vaults/Minted.ts`
**Event** : `Minted(receiver, mintAmount, amount0In, amount1In, liquidityMinted)`

**Données mises à jour** :
- `stickyVault` : totalSupply, liquidity, txCount, **depositWithdrawVolumeUSD**
- **NOUVEAU** : TVL calculée en temps réel via `getUnderlyingBalances()` du contrat
- `vaultUserPosition` : création ou mise à jour avec **système de position complet**
  - Calcul des prix d'entrée moyens pondérés (`avgEntryPriceToken0/1`)
  - Suivi de la valeur initiale de l'investissement (`initialValueBERA/USD`)
  - Calcul des métriques de performance (PnL, returns)
- `vaultDeposit` : enregistrement de la transaction de dépôt
- **NOUVEAU** : `vaultPositionSnapshot` créé automatiquement
- Appel à `updateVaultStats` pour l'APR et les statistiques globales

#### Burned
**Fichier** : `apps/indexer/src/vaults/Burned.ts`
**Event** : `Burned(receiver, burnAmount, amount0Out, amount1Out, liquidityBurned)`

**Données mises à jour** :
- `stickyVault` : totalSupply, liquidity, txCount, **depositWithdrawVolumeUSD**
- **NOUVEAU** : TVL en temps réel via `getUnderlyingBalances()`
- `vaultUserPosition` : **calculs avancés de PnL réalisé**
  - Calcul du PnL réalisé basé sur la base de coût (`realizedPnLBERA/USD`)
  - Réduction proportionnelle de l'investissement initial
  - Gestion de la fermeture complète de position (reset des valeurs)
  - Mise à jour du PnL total (réalisé + non-réalisé)
- `vaultWithdrawal` : enregistrement de la transaction de retrait
- **NOUVEAU** : `vaultPositionSnapshot` créé pour le suivi historique
- Appel à `updateVaultStats`

#### Rebalance
**Fichier** : `apps/indexer/src/vaults/Rebalance.ts`
**Event** : `Rebalance(lowerTick_, upperTick_, liquidityAfter)`

**Données mises à jour** :
- `stickyVault` : tickLower, tickUpper, liquidity, rebalanceCount
- **NOUVEAU** : Calcul de la perte impermanente (`impermanentLoss`)
- TVL mise à jour après rebalancing via contrat
- **NOUVEAU** : Mise à jour de TOUTES les positions utilisateur impactées
  - Recalcul des valeurs de position après rebalancing
  - Création de snapshots pour tous les utilisateurs
- Appel à `updateVaultStats`

## Événements de Pricing

### Bundle Updates
**Fichier** : `apps/indexer/src/utils/pricing.ts`

Le pricing est mis à jour lors de chaque swap impliquant BERA :
- Calcul du prix ETH basé sur les pools BERA avec le plus de liquidité
- Propagation des prix USD à tous les tokens via les pools connectées
- Utilisation de chemins de pricing weighted par liquidité

## Déclencheurs de Mise à Jour

### Temps Réel
- Tous les événements blockchain déclenchent des mises à jour immédiates
- Les données sont persistées dans PostgreSQL via Ponder

### Agrégations Temporelles
- **Données horaires** : agrégées par heure UTC
- **Données journalières** : agrégées par jour UTC
- Création automatique des entités temporelles si elles n'existent pas

### Calculs Dérivés
- **TVL** : recalculée à chaque changement de liquidité ou prix
- **Volume 24h** : somme des volumes dans les dernières 24h
- **APR** : basée sur les fees collectées et la TVL
- **Prix** : propagation via le réseau de liquidité