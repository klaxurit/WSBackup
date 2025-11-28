# Architecture Core - Winnie DEX

## Vue d'ensemble du système

Le DEX Winnie est construit sur deux couches principales :

1. **Couche Uniswap V3** : Infrastructure de base pour les pools et le trading
2. **Couche StickyVault (Arrakis V1)** : Système de gestion automatisée de liquidité

## Contrats principaux

### Core Uniswap V3
- **UniswapV3Factory** (`0x76fD9D07d5e4D889CAbED96884F15f7ebdcd6B63`)
- **SwapRouter02** (`0x86e02f3D4Cb55974B7EE7E7c98c199e65F9023a4`)
- **NonfungiblePositionManager** (`0xEf089afF769bC068520a1A90f0773037eF31fbBC`)

### StickyVault System
- **StickyVaultFactory** (`0x18B9ABf2E821E2fE7A08Dc255d5a7e77fFc0b844`)
- **StickyVaultWithRouter** (`0x32a56Da6f958BBFB24797DD47C7d1146D55C4052`)
- **StickyVaultRouter** (`0xbb962d8805e2B4AF087C4702F088Cf9BE9862F30`)

## Relations entre contrats

### Hiérarchie des dépendances

```
UniswapV3Factory
    │
    ├── Crée des pools UniswapV3
    │
StickyVaultFactory
    │
    ├── Utilise UniswapV3Factory pour vérifier les pools
    ├── Clone StickyVaultWithRouter pour créer des vaults
    │
StickyVaultWithRouter (Implementation)
    │
    ├── Hérite de StickyVault
    ├── Implémente IUniswapV3MintCallback, IUniswapV3SwapCallback
    ├── Interagit directement avec les pools Uniswap V3
    │
StickyVaultRouter
    │
    ├── Interface utilisateur pour les vaults
    ├── Gère les swaps via winnieRouter
    ├── Wrap/unwrap BERA ↔ WBERA
```

## Concepts architecturaux clés

### 1. Pattern Factory avec Clonage
- **StickyVaultFactory** utilise LibClone pour déployer efficacement des instances
- Une seule implémentation `StickyVaultWithRouter` est clonée
- Économie de gas significative par rapport au déploiement complet

### 2. Système de Callbacks Uniswap
Les vaults implémentent les callbacks Uniswap V3 :
- `uniswapV3MintCallback` : pour les dépôts de liquidité
- `uniswapV3SwapCallback` : pour les swaps internes

### 3. Architecture Modulaire
- **Core** : logique de base (UniswapV3)
- **Vaults** : stratégies automatisées de gestion de liquidité  
- **Router** : interface utilisateur avec protection contre slippage
- **Peripherals** : outils additionnels (quoter, NFT, migration)

### 4. Gestion des Fees
- Fees Uniswap collectées automatiquement
- Fees de management configurables par vault (0-30% max)
- Treasury centralisée pour les fees de factory (5% par défaut)

## Workflows principaux

### A. Création d'un Pool
1. `UniswapV3Factory.createPool()` → Nouveau pool UniswapV3
2. Le pool est maintenant disponible pour création de vault

### B. Création d'un Vault 
1. `StickyVaultFactory.deployVault()` → Clone une nouvelle instance
2. Vérification que le pool Uniswap existe
3. Initialisation avec paramètres (manager, fees, range)

### C. Interaction utilisateur
1. Utilisateur → `StickyVaultRouter` (interface)
2. Router → `StickyVaultWithRouter` (vault instance)
3. Vault → Pool Uniswap V3 (exécution)

## Sécurité et contrôles

### Contrôles d'accès
- **Factory Owner** : peut modifier l'implémentation et fees
- **Vault Manager** : peut rebalancer et définir stratégies
- **Users** : peuvent déposer/retirer (selon restrictions)

### Protections
- Slippage protection dans tous les routers
- Validation des tick spacing
- Vérification des pools existants
- Pausable pattern pour urgences

## Innovations spécifiques à Winnie

### 1. StickyVaultWithRouter
Extension de StickyVault avec capacités de swapping via routers externes :
- Whitelist de routers autorisés
- Slippage protection basée sur TWAP
- Rebalancing automatisé avec swaps

### 2. Support BERA natif
- Wrapper/unwrapper automatique BERA ↔ WBERA
- Functions `*Native` dans le router
- Gestion des refunds de BERA non utilisé

### 3. Integration Berachain
- Contrats spécialement adaptés à l'écosystème Berachain
- Support pour winnieRouter externe
- Optimisations gas pour la chaîne

## Diagramme architectural

```
┌─────────────────────────────────────────────────┐
│                   FRONTEND                      │
├─────────────────────────────────────────────────┤
│                                                 │
│  StickyVaultRouter  ◄──────► SwapRouter02       │
│         │                        │              │
│         ▼                        ▼              │
│  StickyVaultWithRouter ◄───► UniswapV3Pool      │
│         │                        │              │
│         ▼                        ▼              │
│  StickyVaultFactory ────────► UniswapV3Factory  │
│                                                 │
├─────────────────────────────────────────────────┤
│               PERIPHERALS                       │
│  QuoterV2 │ TickLens │ NFTDescriptor │ ...      │
└─────────────────────────────────────────────────┘
```

Ce système offre une infrastructure complète et modulaire pour un DEX automatisé avec gestion intelligente de la liquidité sur Berachain.