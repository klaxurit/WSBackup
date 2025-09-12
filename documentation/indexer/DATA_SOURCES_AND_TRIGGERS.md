# WinnieSwap Indexer - Sources de Données et Déclencheurs

## Sources de Données

### Contrats Blockchain Surveillés

#### Uniswap V3 Core
**Configuration** : `apps/indexer/ponder.config.ts`

```typescript
// Pool Factory
{
  name: "poolFactory",
  network: "berachainTestnet",
  address: "0x...", // Adresse du factory Uniswap V3
  abi: poolFactoryAbi,
  startBlock: DEPLOY_BLOCK,
}

// Pools (créées dynamiquement)
{
  name: "pool",
  network: "berachainTestnet", 
  factory: {
    address: "0x...",
    event: "PoolCreated",
    parameter: "pool",
  },
  abi: poolAbi,
  startBlock: DEPLOY_BLOCK,
}
```

**Événements écoutés** :
- `PoolCreated` (Factory)
- `Swap`, `Mint`, `Burn`, `Collect` (Pools)

#### Sticky Vaults (Arrakis V1)
**Configuration** : `apps/indexer/ponder.config.ts`

```typescript
// Vault Factory  
{
  name: "vaultFactory",
  network: "berachainTestnet",
  address: "0x...", // Adresse du vault factory
  abi: vaultFactoryAbi,
  startBlock: DEPLOY_BLOCK,
}

// Vaults (créés dynamiquement)
{
  name: "vault", 
  network: "berachainTestnet",
  factory: {
    address: "0x...",
    event: "VaultCreated", 
    parameter: "vault",
  },
  abi: vaultAbi,
  startBlock: DEPLOY_BLOCK,
}
```

**Événements écoutés** :
- `VaultCreated` (Factory)
- `Deposit`, `Withdraw`, `Rebalance`, `FeesEarned` (Vaults)

### Configuration des Adresses
**Fichier** : `apps/indexer/src/constants.ts`

```typescript
// Adresses des stablecoins pour le pricing
export const STABLE_COINS = {
  USDC: "0x...",
  USDT: "0x...", 
  DAI: "0x...",
  FRAX: "0x...",
}

// Adresse de BERA (native token)
export const WETH_ADDRESS = "0x..." // BERA wrapped

// Paramètres de pricing
export const MINIMUM_ETH_LOCKED = 2 // Liquidité min pour pricing
export const MINIMUM_USD_THRESHOLD_NEW_PAIRS = 3000 // TVL min nouvelles pairs
```

## Déclencheurs de Mise à Jour

### 1. Événements Blockchain (Temps Réel)

#### Pool Factory → Nouvelles Pools
**Déclencheur** : `PoolCreated`
**Action** :
- Création entité `Pool`
- Création entités `Token` si nécessaire
- Initialisation des statistiques à zéro
- Ajout de la pool au monitoring des événements

#### Pool Events → Statistiques
**Déclencheurs** : `Swap`, `Mint`, `Burn`, `Collect`
**Actions** :
- Mise à jour des entités pool/token/position
- Calcul des nouvelles métriques (volume, TVL, fees)
- Création/mise à jour des données temporelles
- Recalcul des prix si nécessaire

#### Vault Events → Statistiques Vaults
**Déclencheurs** : `Deposit`, `Withdraw`, `Rebalance`, `FeesEarned`
**Actions** :
- Mise à jour des entités vault
- Impact sur TVL des pools sous-jacentes
- Recalcul APR et performances
- Mise à jour des positions utilisateurs

### 2. Dépendances entre Données

#### Prix BERA → Tous les Prix
**Déclencheur** : Swap dans une pool BERA/stablecoin avec liquidité suffisante
**Cascade** :
1. Mise à jour `Bundle.ethPriceUSD`
2. Recalcul de tous les `Token.priceUSD` via chemins de pricing
3. Recalcul de toutes les TVL en USD
4. Mise à jour des données temporelles

#### Changement de Liquidité → Prix Dérivés
**Déclencheur** : `Mint`/`Burn` modifiant significativement la liquidité
**Impact** :
- Changement du poids de la pool dans le pricing
- Possible modification des chemins de pricing optimaux
- Recalcul des prix des tokens connectés

#### Nouveau Token → Pricing Path
**Déclencheur** : Première pool créée avec un nouveau token
**Action** :
- Analyse des chemins de pricing possibles
- Attribution d'un prix initial si chemin trouvé
- Monitoring pour futurs recalculs

### 3. Agrégations Temporelles

#### Déclencheur Temporel : Nouvelle Heure UTC
**Action automatique Ponder** :
- Vérification si entités HourData existent
- Création si première mise à jour de l'heure
- Accumulation des métriques horaires

#### Déclencheur Temporel : Nouveau Jour UTC  
**Action automatique Ponder** :
- Vérification si entités DayData existent
- Création si première mise à jour du jour
- Accumulation des métriques journalières

### 4. Calculs Dérivés

#### TVL Recalcul
**Déclencheurs multiples** :
- Changement de prix d'un token → recalcul TVL de toutes ses pools
- Mint/Burn → recalcul TVL de la pool spécifique
- Deposit/Withdraw vault → recalcul TVL vault et pool sous-jacente

#### APR Recalcul
**Déclencheurs** :
- Collection de fees (`Collect`, `FeesEarned`)
- Changement de TVL significatif (impact sur le dénominateur)
- Nouveau jour (recalcul APR 24h glissant)

## Pipeline de Traitement

### 1. Réception Événement
```
Blockchain → RPC Node → Ponder → Event Handler
```

### 2. Traitement Données
```
Event Handler → Entity Updates → Derived Calculations → Time Series Updates
```

### 3. Persistance
```
Ponder → PostgreSQL → GraphQL API → Frontend
```

## Monitoring et Logs

### Sources de Debug
**Ponder Logs** :
- `ponder:dev` - événements traités
- `ponder:sync` - synchronisation blockchain
- `ponder:database` - opérations base de données

### Points de Vérification
**Données critiques à surveiller** :
- `Bundle.ethPriceUSD` : cohérence avec prix marché
- TVL totale vs somme des composants
- Volume 24h vs événements swap
- Entités orphelines (positions sans pool, etc.)

## Fréquence des Mises à Jour

### Temps Réel (chaque bloc)
- Événements blockchain
- Métriques principales (prix, volume, TVL)
- Positions et balances utilisateurs

### Agrégé (périodique)
- **Horaire** : Données OHLC, volumes horaires
- **Journalier** : Statistiques 24h, APR, métriques long terme
- **Calculé** : APR 7d/30d, moyennes mobiles

## Dépendances Externes

### RPC Endpoints
**Configuration** : Variables d'environnement
```
PONDER_RPC_URL_1 = "https://rpc.ankr.com/berachain_testnet"
PONDER_RPC_URL_2 = "https://bartio.rpc.berachain.com/"
```

### Base de Données
**PostgreSQL** :
```
DATABASE_URL = "postgresql://user:pass@localhost/winnieswap"
```

### Fallbacks et Redondance
- **Multiple RPC** : basculement automatique si un RPC échoue
- **Checkpoint Database** : reprise après crash
- **Event Retry** : re-traitement des événements échoués

## Configuration des Seuils

### Pricing
```typescript
MINIMUM_ETH_LOCKED = 2 // BERA minimum pour pricing
MINIMUM_USD_THRESHOLD_NEW_PAIRS = 3000 // TVL min nouvelles pairs
```

### Performance
```typescript
MAX_SKIP_BLOCKS = 1000 // Blocs max à ignorer si retard
BATCH_SIZE = 100 // Événements traités par batch
```

Ces seuils sont configurables dans `apps/indexer/src/constants.ts` et impactent directement la qualité et la performance de l'indexation.