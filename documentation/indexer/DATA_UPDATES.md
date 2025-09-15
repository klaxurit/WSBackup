# WinnieSwap Indexer - Mises à Jour des Données

## Entités Principales et Leurs Mises à Jour

### Pool
**Fichier Schema** : `apps/indexer/ponder.schema.ts`

#### Mises à jour lors d'un SWAP :
- `sqrtPrice` : nouveau prix de la pool
- `tick` : nouveau tick actuel
- `liquidity` : liquidité active mise à jour
- `volumeToken0/1` : volume cumulé des tokens
- `volumeUSD` : volume en USD ajouté
- `txCount` : incrémenté de 1
- `totalValueLockedToken0/1` : recalculé si changement de liquidité
- `totalValueLockedUSD` : recalculé avec nouveaux prix
- `feesUSD` : fees accumulées en USD
- `feeGrowthGlobal0X128/1X128` : croissance des fees

#### Mises à jour lors d'un MINT :
- `liquidity` : liquidité ajoutée
- `totalValueLockedToken0/1` : tokens ajoutés à la pool
- `totalValueLockedUSD` : TVL recalculée
- `txCount` : incrémenté

#### Mises à jour lors d'un BURN :
- `liquidity` : liquidité retirée
- `totalValueLockedToken0/1` : tokens retirés de la pool
- `totalValueLockedUSD` : TVL recalculée
- `txCount` : incrémenté

### Token
**Fichier Schema** : `apps/indexer/ponder.schema.ts`

#### Mises à jour lors d'événements :
- `priceUSD` : prix mis à jour via le système de pricing
- `volumeUSD` : volume cumulé en USD
- `txCount` : nombre de transactions incrémenté
- `totalValueLocked` : TVL totale du token dans le protocole
- `totalValueLockedUSD` : TVL en USD
- `derivedETH` : prix dérivé en ETH/BERA

### Position
**Fichier Schema** : `apps/indexer/ponder.schema.ts`

#### Création lors d'un MINT :
- `owner` : adresse du propriétaire
- `pool` : pool associée
- `token0/1` : tokens de la position
- `tickLower/Upper` : range de la position
- `liquidity` : liquidité de la position
- `depositedToken0/1` : montants déposés
- `withdrawnToken0/1` : montants retirés (initialement 0)
- `collectedFeesToken0/1` : fees collectées
- `feeGrowthInside0/1LastX128` : croissance des fees au dernier collect

#### Mises à jour lors d'un BURN :
- `liquidity` : liquidité retirée
- `withdrawnToken0/1` : montants retirés mis à jour

#### Mises à jour lors d'un COLLECT :
- `collectedFeesToken0/1` : fees collectées ajoutées
- `feeGrowthInside0/1LastX128` : mis à jour

### stickyVault
**Fichier Schema** : `apps/indexer/ponder.schema.ts`

#### **NOUVEAU** : Champs de fees et performance ajoutés :
- `managementFee` : frais de management en basis points (BPS)
- `performanceFee` : frais de performance (0 pour Arrakis V1)
- `netAPR` : APR net après déduction des frais de management
- `depositWithdrawVolumeUSD` : volume séparé pour dépôts/retraits
- `impermanentLoss` : perte impermanente accumulée

#### Mises à jour lors d'un MINTED :
- `totalSupply` : shares totales augmentées
- `liquidity` : liquidité mise à jour
- `txCount` : nombre de transactions incrémenté
- **NOUVEAU** : `depositWithdrawVolumeUSD` mis à jour (séparé du trading volume)
- **NOUVEAU** : TVL calculée en temps réel via `getUnderlyingBalances()` du contrat

#### Mises à jour lors d'un BURNED :
- `totalSupply` : shares totales diminuées  
- `liquidity` : liquidité mise à jour
- `txCount` : incrémenté
- **NOUVEAU** : `depositWithdrawVolumeUSD` mis à jour
- **NOUVEAU** : TVL en temps réel via contrat avec fallback

#### Mises à jour lors d'un REBALANCE :
- `tickLower/tickUpper` : nouveaux ticks de range
- `liquidity` : nouvelle liquidité après rebalance
- `rebalanceCount` : nombre de rebalances incrémenté
- **NOUVEAU** : `impermanentLoss` calculée et accumulée
- **NOUVEAU** : TVL mise à jour après rebalancing

### vaultUserPosition
**Fichier Schema** : `apps/indexer/ponder.schema.ts`

#### **NOUVEAU** : Système de position complet ajouté :
**Valeurs de base** :
- `depositedToken0/1` : montants déposés par l'utilisateur
- `shares` : shares détenues

**Prix d'entrée** :
- `avgEntryPriceToken0/1` : prix d'entrée moyen pondéré

**Valeurs actuelles** :
- `currentValueToken0/1` : valeur actuelle des tokens dans la position
- `currentValueBERA/USD` : valeur totale en BERA et USD
- `totalValue` : alias pour currentValueUSD (champ principal demandé)

**Tracking d'investissement** :
- `initialValueBERA/USD` : valeur initiale de l'investissement

**Performance et PnL** :
- `realizedPnLBERA/USD` : PnL réalisé lors des retraits
- `unrealizedPnLBERA/USD` : PnL non-réalisé basé sur la valeur actuelle
- `totalPnLUSD` : PnL total (réalisé + non-réalisé)
- `totalReturn` : retour total en pourcentage
- `annualizedReturn` : retour annualisé

**Timestamps** :
- `firstDepositAt` : timestamp du premier dépôt
- `lastUpdateAt` : dernière mise à jour

#### Mises à jour lors d'un MINTED :
- **NOUVEAU** : Création automatique si position n'existe pas
- Calcul des prix d'entrée moyens pondérés
- Mise à jour de tous les champs de performance
- **NOUVEAU** : Appel à `calculatePositionValue()` pour métriques complètes

#### Mises à jour lors d'un BURNED :
- **NOUVEAU** : Calcul du PnL réalisé avec base de coût appropriée
- Réduction proportionnelle des valeurs initiales
- Gestion de la fermeture complète (reset si shares = 0)
- Recalcul des métriques de performance restantes

#### Mises à jour lors d'un REBALANCE :
- **NOUVEAU** : Mise à jour automatique de toutes les positions du vault
- Recalcul des valeurs après changement de range du vault

### vaultPositionSnapshot  
**Fichier Schema** : `apps/indexer/ponder.schema.ts`

#### **NOUVEAU** : Table de suivi historique ajoutée :
- `vaultUserPosition` : référence vers la position
- `timestamp/blockNumber` : moment du snapshot
- `shares` : shares à ce moment
- `currentValueToken0/1/BERA/USD` : valeurs de position
- `unrealizedPnLUSD/totalReturn/annualizedReturn` : métriques de performance
- `vaultAPR/vaultTVL` : contexte du vault à ce moment
- `cause` : événement déclencheur (deposit, withdraw, rebalance)
- `triggerTxHash` : transaction associée

#### Création automatique lors de :
- **Dépôts** (cause: "deposit")
- **Retraits** (cause: "withdraw")  
- **Rebalances** (cause: "rebalance") - pour toutes les positions

### vaultDeposit / vaultWithdrawal
**Fichier Schema** : `apps/indexer/ponder.schema.ts`

#### **NOUVEAU** : Tables de transactions détaillées :
- `transaction` : référence vers la transaction blockchain
- `user/vault/vaultUserPosition` : entités associées
- `amount0/1/shares` : montants de la transaction
- `liquidityMinted/Burned` : liquidité impactée
- `timestamp` : moment de la transaction

### Données Temporelles (Hourly/Daily)

#### PoolHourData / PoolDayData
**Mises à jour à chaque événement de pool** :
- `volumeUSD` : volume de la période
- `tvlUSD` : TVL à la fin de la période
- `feesUSD` : fees collectées pendant la période
- `txCount` : nombre de transactions
- `high/low/open/close` : prix OHLC du token dominant

#### TokenHourData / TokenDayData
**Mises à jour lors d'événements impliquant le token** :
- `volumeUSD` : volume du token pendant la période
- `totalValueLocked` : TVL du token
- `priceUSD` : prix à la fin de la période
- `high/low/open/close` : prix OHLC

#### VaultHourData / VaultDayData
**Mises à jour lors d'événements de vault** :
- `tvlUSD` : TVL du vault
- `sharesOutstanding` : shares totales en circulation
- `feesEarned0/1` : fees gagnées pendant la période
- `feesEarnedUSD` : fees en USD
- `deposits/withdrawals` : montants des dépôts/retraits
- `rebalances` : nombre de rebalances

#### ProtocolHourData / ProtocolDayData
**Mises à jour lors de tout événement** :
- `tvlUSD` : TVL totale du protocole
- `volumeUSD` : volume total
- `txCount` : transactions totales

### Bundle (Pricing Global)
**Fichier** : `apps/indexer/src/utils/pricing.ts`

#### Mise à jour lors de swaps impliquant BERA :
- `ethPriceUSD` : prix de BERA en USD
- Déclenche la mise à jour des prix de tous les autres tokens

### Transaction
**Création lors de chaque événement** :
- `blockNumber/timestamp/hash` : informations du bloc
- `type` : SWAP, MINT, BURN, COLLECT
- Référence vers les entités associées (mints, burns, swaps, collects)

### VaultTransaction
**Création lors d'événements de vault** :
- `type` : DEPOSIT, WITHDRAW
- `vault` : vault associé
- `user` : utilisateur
- `amount0/1` : montants
- `shares` : shares impliquées
- `timestamp/blockNumber/hash` : informations du bloc

## Flux de Données

### 1. Événement Blockchain → Handler
- Ponder capture l'événement
- Appel du handler approprié
- Parsing des paramètres de l'événement

### 2. Handler → Mise à Jour des Entités
- Chargement des entités existantes
- Calculs des nouvelles valeurs
- Sauvegarde des modifications

### 3. Mise à Jour des Entités → Données Temporelles
- Création/mise à jour automatique des données horaires/journalières
- Agrégation des métriques

### 4. Propagation des Prix
- Événement SWAP → Mise à jour du prix de la pool
- Si pool BERA impliquée → Mise à jour Bundle.ethPriceUSD
- Propagation aux autres tokens via les pools connectées

### 5. Calculs Dérivés
- TVL recalculée à chaque changement de liquidité ou prix
- APR recalculé à chaque collection de fees
- Métriques de performance mises à jour

## Persistance

Toutes les modifications sont automatiquement persistées dans PostgreSQL par Ponder après chaque traitement d'événement.