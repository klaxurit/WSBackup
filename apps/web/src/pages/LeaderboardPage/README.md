# Page Leaderboard - Documentation

## Vue d'ensemble

La page Leaderboard est une fonctionnalité complète qui combine :
- **Portfolio utilisateur** : Affiche toutes les positions (pools et vaults) de l'utilisateur connecté
- **Section Trending** : Met en avant les top 3 pools et vaults par APR
- **Classement global** : Affiche un leaderboard des meilleurs traders (données mockées actuellement)

## Architecture

### Composants

```
LeaderboardPage/
├── page.tsx                 # Page principale
└── README.md               # Cette documentation

components/Leaderboard/
├── PortfolioSection.tsx    # Portfolio de l'utilisateur
├── TrendingSection.tsx     # Top 3 trending pools/vaults
└── LeaderboardTable.tsx    # Table du classement global
```

### Données

- **Portfolio & Trending** : Données réelles via GraphQL (Ponder)
- **Leaderboard** : Données mockées dans `utils/mockLeaderboardData.ts`

## Fonctionnalités actuelles

### ✅ Portfolio Section
- ✅ Récupération des positions pools via GraphQL
- ✅ Récupération des positions vaults via GraphQL
- ✅ Calcul automatique de la valeur totale du portfolio
- ✅ Affichage du nombre de positions actives
- ✅ Calcul des fees collectés
- ✅ Liens directs vers chaque position

### ✅ Trending Section
- ✅ Query GraphQL pour les pools
- ✅ Query GraphQL pour les vaults
- ✅ Tri automatique par APR (décroissant)
- ✅ Affichage des top 3 de chaque catégorie
- ✅ Cards cliquables vers les pools/vaults
- ✅ Badges visuels pour les rangs 1, 2, 3

### ✅ Leaderboard Table
- ✅ Données mockées avec 30 utilisateurs
- ✅ Tri par colonne (rank, value, positions, fees, change)
- ✅ Highlight automatique de l'utilisateur connecté
- ✅ Filtres temporels (7D, 30D, All Time) - UI prête
- ✅ Badges pour whale 🐋, farmer 🌾, diamond-hands 💎
- ✅ Affichage de beranames si disponible

## Queries GraphQL utilisées

### Portfolio - Pool Positions
```graphql
query GetUserPositions($owner: String!) {
  positions(where: { owner: $owner }) {
    items {
      id
      pool
      liquidity
      depositedToken0
      depositedToken1
      collectedFeesToken0
      collectedFeesToken1
      poolRef {
        # ... token data
      }
    }
  }
}
```

### Portfolio - Vault Positions
```graphql
query GetUserVaultPositions($user: String!) {
  stickyVaults {
    items {
      id
      name
      # ... vault data
      positions(where: {user: $user}) {
        items {
          shares
          currentValueUSD
          feesEarnedUSD
        }
      }
    }
  }
}
```

### Trending - Pools & Vaults
Les queries récupèrent les 10 premiers par TVL, puis on filtre les top 3 par APR côté client.

## Intégration Backend Future

### Endpoint requis

```typescript
GET /api/leaderboard?period=7d|30d|all

Response:
{
  "data": LeaderboardUser[],
  "metadata": {
    "lastUpdate": "2024-...",
    "totalUsers": 1234
  }
}
```

### Interface TypeScript

```typescript
interface LeaderboardUser {
  rank: number;
  address: string;
  beraname?: string;
  totalValueUSD: number;
  positions: number;
  feesEarned: number;
  weeklyChange: number; // %
  badge?: 'whale' | 'farmer' | 'diamond-hands';
}
```

### Hook de transition

Le fichier `LeaderboardTable.tsx` utilise actuellement :
```typescript
import { MOCK_LEADERBOARD_DATA } from '../../utils/mockLeaderboardData';
```

Pour passer en mode API, créer un hook :

```typescript
// hooks/useLeaderboardData.ts
export const useLeaderboardData = (period: '7d' | '30d' | 'all') => {
  // Si la variable d'env VITE_LEADERBOARD_API n'est pas définie, utiliser le mock
  const USE_MOCK = !import.meta.env.VITE_LEADERBOARD_API;
  
  if (USE_MOCK) {
    return {
      data: MOCK_LEADERBOARD_DATA,
      isLoading: false,
      error: null
    };
  }
  
  return useQuery({
    queryKey: ['leaderboard', period],
    queryFn: async () => {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/leaderboard?period=${period}`
      );
      return res.json();
    }
  });
};
```

Puis dans `LeaderboardTable.tsx` :
```typescript
// Remplacer
const leaderboardData = MOCK_LEADERBOARD_DATA;

// Par
const { data: leaderboardData, isLoading } = useLeaderboardData(timeFilter);
```

## Critères de badges (suggestions)

- **🐋 Whale** : `totalValueUSD > 500,000`
- **🌾 Farmer** : `positions > 20`
- **💎 Diamond Hands** : `weeklyChange < 5%` (faible volatilité, position stable)

Ces critères peuvent être définis côté backend.

## Calculs à implémenter côté backend

### Total Value USD
```
Pour chaque utilisateur:
  - Sommer la valeur de toutes ses positions de pools
  - Sommer la valeur de toutes ses positions de vaults
  - Total = pools + vaults
```

### Fees Earned
```
Pour chaque utilisateur:
  - Sommer collectedFeesToken0 * priceToken0 + collectedFeesToken1 * priceToken1 (pools)
  - Sommer feesEarnedUSD (vaults)
```

### Weekly Change
```
weeklyChange = ((currentValue - valueFrom7DaysAgo) / valueFrom7DaysAgo) * 100
```

Nécessite de stocker des snapshots historiques des valeurs de portfolio.

## Variables d'environnement

```env
# Dans .env
VITE_GRAPHQL_URL=http://localhost:42069  # Ponder GraphQL
VITE_API_URL=http://localhost:3001      # NestJS Backend
# VITE_LEADERBOARD_API=true             # Décommenter quand le backend est prêt
```

## Style et Design

Les styles sont dans `/styles/pages/_leaderboardPage.scss` et suivent la même architecture que les autres pages :
- Variables SCSS réutilisées (`$primary-color`, `$text-primary`, etc.)
- Responsive mobile-first
- Animations et transitions cohérentes
- Dark mode compatible

## Testing

Pour tester la page en développement :
```bash
cd apps/web
pnpm dev

# Naviguer vers http://localhost:5173/leaderboard
```

### Scénarios de test

1. **Sans wallet connecté** : Doit afficher un message pour se connecter
2. **Avec wallet connecté (sans positions)** : Doit afficher un état vide
3. **Avec wallet connecté (avec positions)** : Doit afficher le portfolio complet
4. **Tri du leaderboard** : Tester chaque colonne
5. **Filtres temporels** : Vérifier que les boutons sont fonctionnels
6. **Navigation** : Cliquer sur les cards trending et les positions

## Performance

- Les queries GraphQL utilisent des limites (limit) pour ne pas surcharger
- Le tri du leaderboard est optimisé avec `useMemo`
- Les composants utilisent `React.memo` si nécessaire (à ajouter si besoin)

## Améliorations futures

- [ ] Intégration backend pour le leaderboard réel
- [ ] Pagination du leaderboard (si > 100 utilisateurs)
- [ ] Filtres avancés (par token, par vault type, etc.)
- [ ] Graphiques de progression du portfolio
- [ ] Comparaison avec les autres utilisateurs
- [ ] Export des données du portfolio (CSV, PDF)
- [ ] Notifications pour changements de rang
- [ ] Section "Achievements" (badges déblocables)

## Support

Pour toute question ou bug :
- Vérifier les erreurs dans la console navigateur
- Vérifier que le Ponder indexer est en cours d'exécution
- Vérifier les queries GraphQL dans le playground Ponder (http://localhost:42069)

