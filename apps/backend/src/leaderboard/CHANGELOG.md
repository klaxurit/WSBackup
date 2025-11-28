# Leaderboard Module - Changelog

## Version 1.1.0 - Calcul USD en temps réel

### Nouvelles fonctionnalités

#### 🎯 Calcul des valeurs USD depuis Ponder

**Prix des tokens**
- Ajout de `getBeraPriceUSD()` : Récupère le prix de BERA en USD depuis `bundle.beraPriceUSD`
- Ajout de `getTokenPrices()` : Récupère tous les prix des tokens via `derivedBERA × beraPriceUSD`
- Les prix sont mis à jour à chaque calcul du leaderboard (toutes les heures)

**Positions V3**
- Nouvelle méthode `getV3PoolPositionsWithPrices(tokenPrices)`
- Calcul USD basé sur : `(currentToken0 × token0Price) + (currentToken1 × token1Price)`
- `currentToken = depositedToken - withdrawnToken`
- Gestion automatique des prix manquants (valeur = 0)

**Positions AutoWin**
- Ajout de `getStickyVaultInfo()` : Récupère TVL et totalSupply des Sticky Vaults
- Ajout de `getAutoWinToStickyMapping()` : Mapping AutoWin → Sticky Vault
- Nouvelle méthode `getAutoWinPositionsWithPrices(stickyVaultInfo, autoWinToSticky)`
- Calcul USD basé sur : `shares × (vaultTVL / totalSupply)`

### Modifications des services

**PonderGraphqlService** (`ponder-graphql.service.ts`)
- ✅ Ajout de 5 nouvelles interfaces TypeScript pour les résultats GraphQL
- ✅ Ajout de 5 nouvelles méthodes de récupération de données
- ✅ Amélioration des logs pour le debugging

**LeaderboardCalculatorService** (`leaderboard-calculator.service.ts`)
- ✅ Modification du flux de calcul pour utiliser les prix en temps réel
- ✅ Ajout d'une phase de récupération des prix avant les positions
- ✅ Utilisation des nouvelles méthodes `*WithPrices()`
- ✅ Mise à jour des logs pour refléter les calculs USD

### Requêtes GraphQL ajoutées

```graphql
# Prix BERA en USD
query {
  bundles(limit: 1) {
    items {
      beraPriceUSD
    }
  }
}

# Prix de tous les tokens
query {
  tokens {
    items {
      id
      symbol
      derivedBERA
    }
  }
}

# Positions V3 avec montants
query {
  positions(where: { liquidity_gt: "0" }) {
    items {
      owner
      token0
      token1
      depositedToken0
      depositedToken1
      withdrawnToken0
      withdrawnToken1
    }
  }
}

# Info des Sticky Vaults
query {
  stickyVaults {
    items {
      id
      totalValueLockedUSD
      totalSupply
    }
  }
}

# Mapping AutoWin → Sticky
query {
  autoWinVaults {
    items {
      id
      stakingToken
    }
  }
}

# Positions AutoWin
query {
  autoWinUserPositions(where: { shares_gt: "0" }) {
    items {
      user
      shares
      autoWinVault
    }
  }
}
```

### Impact sur les performances

**Avant (v1.0.0)**
- V3 positions : Comptage uniquement, pas de valeur USD
- AutoWin positions : Comptage uniquement, pas de valeur USD
- Temps total : ~5-7 secondes pour 1000 wallets

**Après (v1.1.0)**
- V3 positions : Valeur USD calculée avec prix en temps réel
- AutoWin positions : Valeur USD calculée via Sticky Vault TVL
- Temps total : ~7-10 secondes pour 1000 wallets (incluant récupération des prix)

**Requêtes supplémentaires**
- +3 requêtes GraphQL au début du calcul (prix, vaults, mapping)
- +2 requêtes GraphQL modifiées (positions avec plus de champs)

### Breaking Changes

Aucun breaking change ! Les anciennes méthodes `getV3PoolPositions()` et `getAutoWinPositions()` sont conservées pour compatibilité mais ne sont plus utilisées dans le calculateur.

### Migration

Aucune migration requise. Le système utilisera automatiquement les calculs USD au prochain run du cron job.

### Tests

Vérifications à effectuer :
- [ ] Prix BERA récupéré correctement depuis bundle
- [ ] Prix des tokens calculés avec derivedBERA
- [ ] Valeurs USD des positions V3 non nulles
- [ ] Valeurs USD des positions AutoWin non nulles
- [ ] Gestion des prix manquants (pas d'erreur)
- [ ] Temps de calcul acceptable (<15 secondes)

### Documentation

- ✅ README.md mis à jour avec formules de calcul USD
- ✅ Section "Calcul des valeurs USD" ajoutée
- ✅ Exemples de code pour chaque type de position
- ✅ Notes sur la gestion des erreurs

---

## Version 1.0.0 - Release initiale

### Fonctionnalités de base

- ✅ Récupération volumes de swap par wallet
- ✅ Récupération volumes de liquidité par wallet
- ✅ Comptage des positions (V3, Sticky Vault, AutoWin)
- ✅ Calcul des points (volume ×1.2 + liquidité ×1.0)
- ✅ Classement automatique
- ✅ Historique avec snapshots
- ✅ Cron job toutes les heures
- ✅ 2 endpoints API (leaderboard + wallet detail)
- ✅ Prisma schema et migrations
- ✅ Documentation complète
