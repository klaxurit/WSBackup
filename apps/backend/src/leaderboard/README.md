# Leaderboard Module

Système de classement des contributeurs du DEX WinnieSwap basé sur le volume et la liquidité.

## Architecture

### Flux de données

```
Ponder Indexer (port 42069)
  ↓ GraphQL API (/graphql)
  ↓
PonderGraphqlService
  ↓ Agrégation des données
  ↓
LeaderboardCalculatorService
  ↓ Calcul des points et rankings
  ↓
PostgreSQL (tables leaderboard_entries, leaderboard_snapshots)
  ↓
LeaderboardService
  ↓ API REST
  ↓
Frontend
```

### Services

1. **PonderGraphqlService** : Client GraphQL pour récupérer les données de Ponder
   - Volumes de swap par wallet
   - Volumes de dépôt de liquidité par wallet
   - Positions V3 actives
   - Positions Sticky Vault
   - Positions AutoWin

2. **LeaderboardCalculatorService** : Calcul des métriques et points
   - Agrégation des volumes
   - Calcul de la liquidité actuelle
   - Calcul des points : `volumePoints = totalVolumeUSD × 1.2`
   - Calcul des points : `liquidityPoints = currentLiquidityUSD × 1.0`
   - Classement par `totalPoints = volumePoints + liquidityPoints`

3. **LeaderboardService** : Service principal avec cron job
   - Cron job toutes les heures (`@Cron(CronExpression.EVERY_HOUR)`)
   - Récupération des données depuis la DB
   - Création de snapshots pour l'historique

## API Endpoints

### 1. GET /leaderboard

Récupère le classement complet avec pagination.

**Query Parameters:**
- `page` (optional, default: 1) - Numéro de page
- `limit` (optional, default: 100, max: 500) - Nombre d'entrées par page

**Response:**
```json
{
  "entries": [
    {
      "wallet": "0x1234...",
      "swapVolumeUSD": 1000000,
      "liquidityDepositVolumeUSD": 500000,
      "totalVolumeUSD": 1500000,
      "currentLiquidityUSD": 2000000,
      "positionsCount": 5,
      "v3PoolsLiquidityUSD": 800000,
      "stickyVaultsLiquidityUSD": 1000000,
      "autoWinVaultsLiquidityUSD": 200000,
      "volumePoints": 1800000,
      "liquidityPoints": 2000000,
      "totalPoints": 3800000,
      "rank": 1,
      "previousRank": 2,
      "rankChange": 1,
      "lastUpdatedAt": "2025-11-19T14:00:00.000Z"
    }
  ],
  "total": 1234,
  "page": 1,
  "limit": 100,
  "lastUpdatedAt": "2025-11-19T14:00:00.000Z"
}
```

**Exemples:**
```bash
# Top 100
curl http://localhost:3000/leaderboard

# Top 10
curl http://localhost:3000/leaderboard?limit=10

# Page 2 avec 50 entrées
curl http://localhost:3000/leaderboard?page=2&limit=50
```

### 2. GET /leaderboard/:wallet

Récupère les statistiques et l'historique d'un wallet spécifique.

**Response:**
```json
{
  "wallet": "0x1234...",
  "swapVolumeUSD": 1000000,
  "liquidityDepositVolumeUSD": 500000,
  "totalVolumeUSD": 1500000,
  "currentLiquidityUSD": 2000000,
  "positionsCount": 5,
  "v3PoolsLiquidityUSD": 800000,
  "stickyVaultsLiquidityUSD": 1000000,
  "autoWinVaultsLiquidityUSD": 200000,
  "volumePoints": 1800000,
  "liquidityPoints": 2000000,
  "totalPoints": 3800000,
  "rank": 1,
  "previousRank": 2,
  "rankChange": 1,
  "lastUpdatedAt": "2025-11-19T14:00:00.000Z",
  "history": [
    {
      "timestamp": "2025-11-19T14:00:00.000Z",
      "rank": 1,
      "totalPoints": 3800000,
      "totalVolumeUSD": 1500000,
      "currentLiquidityUSD": 2000000,
      "positionsCount": 5
    },
    {
      "timestamp": "2025-11-19T13:00:00.000Z",
      "rank": 2,
      "totalPoints": 3700000,
      "totalVolumeUSD": 1450000,
      "currentLiquidityUSD": 1950000,
      "positionsCount": 5
    }
  ]
}
```

**Exemples:**
```bash
curl http://localhost:3000/leaderboard/0x1234567890abcdef
```

### 3. GET /leaderboard/stats/overview (Bonus)

Récupère les statistiques globales du leaderboard.

**Response:**
```json
{
  "totalWallets": 1234,
  "totalVolume": 50000000,
  "totalLiquidity": 30000000
}
```

## Configuration

### Variables d'environnement

```bash
# Ponder API URL (défaut: http://localhost:42069/sql)
PONDER_SQL_URL=http://localhost:42069/sql

# Database URL (pour Prisma)
DATABASE_URL=postgresql://user:password@localhost:5432/winnieswap
```

### Formule de points

- **Volume Points** = `totalVolumeUSD × 1.2`
  - `totalVolumeUSD` = `swapVolumeUSD + liquidityDepositVolumeUSD`

- **Liquidity Points** = `currentLiquidityUSD × 1.0`
  - `currentLiquidityUSD` = `v3PoolsLiquidityUSD + stickyVaultsLiquidityUSD + autoWinVaultsLiquidityUSD`

- **Total Points** = `volumePoints + liquidityPoints`

### Cron Job

Le leaderboard est recalculé automatiquement **toutes les heures** via un cron job NestJS.

Pour modifier la fréquence, éditer `leaderboard.service.ts` :

```typescript
@Cron(CronExpression.EVERY_HOUR) // Toutes les heures
// @Cron('0 */6 * * *')          // Toutes les 6 heures
// @Cron('0 0 * * *')             // Tous les jours à minuit
async handleCron() { ... }
```

## Migration de la base de données

Appliquer la migration :

```bash
# Si DATABASE_URL est configuré
cd packages/db
npx prisma migrate deploy

# Ou via la commande turbo
pnpm db:migrate
```

## Développement

### Tester le calcul manuellement

Vous pouvez déclencher manuellement le calcul sans attendre le cron :

```typescript
// Dans le code
await leaderboardService.triggerCalculation();
```

Ou via un endpoint (à ajouter si besoin) :

```typescript
// Dans leaderboard.controller.ts
@Post('trigger')
async triggerCalculation() {
  return this.leaderboardService.triggerCalculation();
}
```

### Logs

Les logs sont générés par chaque service avec le contexte approprié :

```
[PonderGraphqlService] Fetched swap volumes for 1234 unique wallets
[LeaderboardCalculatorService] Processing 1234 unique wallets...
[LeaderboardCalculatorService] Leaderboard calculation completed in 5432ms. Processed 1234 wallets.
[LeaderboardService] Cron job: Leaderboard calculation completed
```

## Dépendances Ponder

Le module requiert que l'indexeur Ponder soit démarré et accessible :

```bash
# Démarrer Ponder
cd apps/indexer
pnpm dev
```

Ponder expose automatiquement :
- API GraphQL : `http://localhost:42069/graphql`
- API SQL : `http://localhost:42069/sql`

## Snapshots et historique

À chaque calcul, un snapshot est créé dans `leaderboard_snapshots` avec :
- Timestamp
- Rank
- Total points
- Volume total
- Liquidité actuelle
- Nombre de positions

Les snapshots permettent de tracer l'évolution du ranking d'un wallet dans le temps.

**Limite:** Les 100 derniers snapshots sont retournés par l'API `/leaderboard/:wallet`.

## Performances

### Optimisations

1. **Indexes DB** : Tous les champs de tri ont des indexes (rank, totalPoints, wallet, timestamp)
2. **Calcul en batch** : Le calcul se fait toutes les heures, pas en temps réel
3. **Pagination** : Limite max de 500 entrées par requête
4. **Snapshots limités** : Max 100 snapshots par wallet dans l'API

### Temps de calcul estimé

Pour 1000 wallets :
- Récupération données Ponder : ~2-3s
- Calcul et tri : ~500ms
- Insertion DB : ~2-3s
- **Total : ~5-7 secondes**

## Calcul des valeurs USD

### Prix des tokens

Les prix des tokens sont récupérés depuis Ponder à chaque calcul :

1. **Prix BERA en USD** : Récupéré depuis la table `bundle.beraPriceUSD`
2. **Prix des tokens** : Calculé via `token.derivedBERA × beraPriceUSD`

### Positions V3

La valeur USD des positions V3 est calculée en temps réel :

```typescript
// Pour chaque position
currentToken0 = depositedToken0 - withdrawnToken0
currentToken1 = depositedToken1 - withdrawnToken1

token0PriceUSD = token0.derivedBERA × beraPriceUSD
token1PriceUSD = token1.derivedBERA × beraPriceUSD

positionValueUSD = (currentToken0 × token0PriceUSD) + (currentToken1 × token1PriceUSD)
```

### Positions Sticky Vault

Les positions Sticky Vault utilisent directement `vaultUserPosition.currentValueUSD` qui est déjà calculé par l'indexeur.

### Positions AutoWin

La valeur USD des positions AutoWin est calculée en temps réel :

```typescript
// 1. Récupérer le Sticky Vault sous-jacent
stickyVault = autoWinVault.stakingToken

// 2. Calculer la valeur des shares
positionValueUSD = (shares × stickyVault.totalValueLockedUSD) / stickyVault.totalSupply
```

## Notes importantes

### Calculs en temps réel

1. **Prix à jour** : Les prix et valeurs sont récupérés à chaque calcul du leaderboard (toutes les heures), garantissant des valeurs à jour.

2. **Normalisation des wallets** : Tous les wallets sont normalisés en lowercase pour éviter les doublons.

3. **Gestion des erreurs** : Si un prix de token est manquant, sa valeur est considérée comme 0 (pas d'erreur bloquante).

4. **AutoWin → Sticky Vault** : Le mapping entre vaults AutoWin et Sticky Vaults est récupéré dynamiquement pour calculer les valeurs correctement.

### Prochaines améliorations

- [ ] Ajouter un cache Redis pour les requêtes fréquentes
- [ ] Ajouter des webhooks pour notifier les changements de rank
- [ ] Ajouter des filtres (top volume, top liquidity, etc.)
- [ ] Optimiser les requêtes GraphQL (batching)
- [ ] Ajouter des métriques de performance (temps de calcul par étape)
