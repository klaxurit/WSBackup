# WinnieSwap Indexer Documentation

Cette documentation détaille le fonctionnement complet de l'indexer WinnieSwap, qui surveille et traite les événements blockchain pour fournir des statistiques DeFi via GraphQL.

## Vue d'ensemble

L'indexer WinnieSwap utilise [Ponder](https://ponder.sh/) pour :
- Surveiller les événements Uniswap V3 + Sticky Vaults sur Berachain
- Calculer les statistiques en temps réel (TVL, volume, APR, prix)
- Exposer les données via une API GraphQL

## Structure de la Documentation

### 📋 [Event Handlers](./EVENT_HANDLERS.md) ⭐ **MISE À JOUR**
Liste complète des événements blockchain écoutés et leurs handlers :
- **Uniswap V3** : PoolCreated, Swap, Mint, Burn, Collect
- **Sticky Vaults** : **StickyVaultCreated, Minted, Burned, Rebalance** (noms corrects)
- **NOUVEAU** : Système de position tracking avec snapshots automatiques
- Management fees et protection contre frais anormaux

### 🔄 [Data Updates](./DATA_UPDATES.md) ⭐ **MISE À JOUR**
Détail des mises à jour d'entités lors de chaque événement :
- Entités principales (Pool, Token, Position, **stickyVault**)
- **NOUVEAU** : `vaultUserPosition` avec système de performance complet
- **NOUVEAU** : `vaultPositionSnapshot` pour tracking historique
- **NOUVEAU** : Tables `vaultDeposit/vaultWithdrawal` détaillées
- TVL en temps réel via contrats + fallback

### 📊 [Statistical Calculations](./STATISTICAL_CALCULATIONS.md) ⭐ **MISE À JOUR**
Formules et calculs de toutes les métriques financières :
- **Prix** : Système de pricing basé BERA (inchangé)
- **TVL** : **CORRIGÉ** - Calcul en temps réel via `getUnderlyingBalances()`
- **Volume** : **CORRIGÉ** - Séparation trading vs deposit/withdraw volume
- **APR** : **CORRIGÉ** - APR net après frais de management + protection
- **NOUVEAU** : Performance utilisateurs (PnL, returns, annualized returns)
- **NOUVEAU** : Impermanent loss tracking pour vaults

### 🎯 [Position Tracking](./POSITION_TRACKING.md) ⭐ **NOUVEAU**
Système complet de suivi des positions utilisateurs dans les vaults :
- **Valeur totale** : Champ `totalValue` pour répondre à la demande utilisateur
- **Performance** : PnL réalisé/non-réalisé, returns totaux et annualisés
- **Historique** : Snapshots automatiques sur tous les événements
- **Prix d'entrée** : Moyennes pondérées pour calculs de coût précis
- **Temps réel** : Synchronisation avec les contrats vault

### 🔗 [Data Sources and Triggers](./DATA_SOURCES_AND_TRIGGERS.md)
Configuration et déclencheurs de mise à jour :
- Contrats surveillés et leur configuration
- Pipeline de traitement des événements
- Dépendances entre données et cascade de recalculs
- Fréquences de mise à jour et monitoring

### 🛠 [Troubleshooting Guide](./TROUBLESHOOTING_GUIDE.md)
Guide de diagnostic pour résoudre les problèmes statistiques :
- **Prix** : tokens à zéro, pricing instable, chemins manquants
- **Volume** : incohérences 24h, calculs incorrects
- **TVL** : valeurs négatives, positions fantômes
- **APR** : calculs incorrects, fees manquantes
- Outils de debug (logs, SQL, GraphQL queries)
- Checklists de vérification

## Utilisation Rapide

### Pour les Développeurs
1. **Bug de statistique** → Consulter [Troubleshooting Guide](./TROUBLESHOOTING_GUIDE.md)
2. **Comprendre un calcul** → Voir [Statistical Calculations](./STATISTICAL_CALCULATIONS.md)  
3. **Position utilisateur** → Utiliser [Position Tracking](./POSITION_TRACKING.md) ⭐ **NOUVEAU**
4. **Ajouter un nouvel événement** → Suivre [Event Handlers](./EVENT_HANDLERS.md)
5. **Tracer une mise à jour** → Référencer [Data Updates](./DATA_UPDATES.md)

### Pour l'IA/Training
Ces documents sont optimisés pour :
- Compréhension rapide du workflow complet
- Debugging automatique des anomalies statistiques
- Validation des calculs financiers
- Audit des dépendances entre données

## Architecture Technique

```
Blockchain Events → Ponder → Entity Updates → Statistical Calculations → GraphQL API
                     ↓              ↓                     ↓
                PostgreSQL    Time Series Data    Pricing & APR Calculations
```

## Entités Principales

- **Pool** : Pools Uniswap V3, stats de liquidité et volume
- **Token** : Tokens ERC20, pricing et métriques globales  
- **Position** : Positions de liquidité des utilisateurs
- **stickyVault** : Vaults Arrakis V1, gestion automatisée de liquidité ⭐ **AMÉLIORÉ**
- **vaultUserPosition** : Positions utilisateurs dans les vaults ⭐ **NOUVEAU**
- **vaultPositionSnapshot** : Historique des positions ⭐ **NOUVEAU**  
- **Bundle** : Pricing global (prix BERA/USD)
- **XxxDayData/HourData** : Agrégations temporelles toutes entités

## Points Critiques

### Système de Pricing
- Basé sur BERA comme token de référence
- Chemins de pricing weighted par liquidité
- Fallback via stablecoins (USDC, USDT, DAI)
- Seuils de liquidité minimale pour éviter manipulation

### Calculs Financiers
- Précision Decimal.js pour éviter erreurs float
- BigInt pour montants token en wei
- APR calculés sur fees 24h glissantes
- TVL recalculée à chaque changement prix/liquidité

### Performance et Fiabilité
- Traitement temps réel des événements blockchain
- Fallback RPC multiple pour résilience
- Checkpoint database pour récupération après crash
- Monitoring intégré des incohérences de données

---

*Cette documentation est maintenue à jour avec le code de l'indexer. Pour toute incohérence, vérifier d'abord les fichiers source dans `apps/indexer/src/`.*