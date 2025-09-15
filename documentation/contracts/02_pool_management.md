# Pool Management - UniswapV3Factory

## Vue d'ensemble

Le système de gestion des pools repose sur **UniswapV3Factory** (`0x76fD9D07d5e4D889CAbED96884F15f7ebdcd6B63`), qui est responsable de :
- Création des pools de liquidité Uniswap V3
- Gestion des tiers de frais (fee tiers)
- Configuration du tick spacing
- Contrôle des accès et ownership

## Configuration des fees

### Fees pré-configurés par défaut

Le factory déploie avec 3 tiers de fees standards :

```solidity
// Dans le constructor
feeAmountTickSpacing[500] = 10;      // 0.05% - tickSpacing: 10
feeAmountTickSpacing[3000] = 60;     // 0.3%  - tickSpacing: 60  
feeAmountTickSpacing[10000] = 200;   // 1%    - tickSpacing: 200
```

### Structure des fees
- **Fee** : exprimé en "hundredths of a bip" (1e-6)
- **500** = 0.05% de frais de swap
- **3000** = 0.3% de frais de swap  
- **10000** = 1% de frais de swap

## Workflow de création de pool

### 1. Vérifications préalables
```solidity
function createPool(address tokenA, address tokenB, uint24 fee) external returns (address pool) {
    require(tokenA != tokenB);                          // Tokens différents
    require(token0 != address(0));                      // Pas d'adresse zéro
    require(feeAmountTickSpacing[fee] != 0);           // Fee tier valide
    require(getPool[token0][token1][fee] == address(0)); // Pool inexistant
}
```

### 2. Ordre canonique des tokens
```solidity
(address token0, address token1) = tokenA < tokenB ? (tokenA, tokenB) : (tokenB, tokenA);
```
- Les tokens sont toujours ordonnés par adresse (token0 < token1)
- Garantit une adresse de pool déterministe

### 3. Déploiement du pool
```solidity
pool = deploy(address(this), token0, token1, fee, tickSpacing);
```

### 4. Enregistrement bidirectionnel
```solidity
getPool[token0][token1][fee] = pool;
getPool[token1][token0][fee] = pool; // Mapping inverse pour faciliter les requêtes
```

## Gestion des fee tiers

### Ajout de nouveaux fee tiers
```solidity
function enableFeeAmount(uint24 fee, int24 tickSpacing) public override {
    require(msg.sender == owner);           // Seul le owner peut ajouter
    require(fee < 1000000);                 // Max 100% (théorique)
    require(tickSpacing > 0 && tickSpacing < 16384); // Limites du tick spacing
    require(feeAmountTickSpacing[fee] == 0); // Pas de redéfinition
    
    feeAmountTickSpacing[fee] = tickSpacing;
}
```

### Contraintes du tick spacing
- **Minimum** : > 0
- **Maximum** : < 16384 (évite overflow dans TickBitmap)
- **Relation fee/spacing** : Plus la fee est élevée, plus le spacing peut être large

## Events émis

### PoolCreated
```solidity
event PoolCreated(
    address indexed token0,
    address indexed token1, 
    uint24 indexed fee,
    int24 tickSpacing,
    address pool
);
```

### FeeAmountEnabled
```solidity  
event FeeAmountEnabled(uint24 indexed fee, int24 indexed tickSpacing);
```

### OwnerChanged
```solidity
event OwnerChanged(address indexed oldOwner, address indexed newOwner);
```

## Intégration avec StickyVault

### Vérification de pools dans StickyVaultFactory
```solidity
// Dans StickyVaultFactory._preDeploy()
uniPool = IUniswapV3Factory(factory).getPool(token0, token1, uniFee);
require(uniPool != address(0), "uniswap pool does not exist");
```

Le StickyVaultFactory vérifie toujours qu'un pool Uniswap existe avant de créer un vault.

## Patterns d'utilisation

### 1. Vérifier si un pool existe
```solidity
address pool = factory.getPool(tokenA, tokenB, fee);
bool poolExists = pool != address(0);
```

### 2. Créer un pool avec gestion d'erreurs
```solidity
try factory.createPool(tokenA, tokenB, fee) returns (address pool) {
    // Pool créé avec succès
} catch {
    // Pool existe déjà ou paramètres invalides
}
```

### 3. Query fee tiers disponibles
```solidity
int24 tickSpacing500 = factory.feeAmountTickSpacing(500);   // 10
int24 tickSpacing3000 = factory.feeAmountTickSpacing(3000); // 60
int24 tickSpacing10000 = factory.feeAmountTickSpacing(10000); // 200
```

## Considérations pour développeurs

### Gas optimization
- Les pools sont créés via `CREATE2` pour des adresses déterministes
- Mapping bidirectionnel évite les comparaisons d'adresses coûteuses

### Sécurité
- Une fois un pool créé, il ne peut pas être supprimé
- Les fee tiers ne peuvent pas être désactivés
- Seul le owner peut ajouter de nouveaux fee tiers

### Frontend integration
- Toujours vérifier l'existence d'un pool avant tentative de création
- Utiliser les fee tiers standards pour la meilleure liquidité
- Observer les events `PoolCreated` pour indexer les nouveaux pools

## Exemple complet : Création d'un pool

```typescript
// 1. Vérifier si le pool existe
const poolAddress = await factory.getPool(tokenA, tokenB, 3000);

if (poolAddress === ethers.constants.AddressZero) {
  // 2. Pool n'existe pas, le créer
  const tx = await factory.createPool(tokenA, tokenB, 3000);
  const receipt = await tx.wait();
  
  // 3. Extraire l'adresse du pool depuis les events
  const poolCreatedEvent = receipt.events.find(e => e.event === 'PoolCreated');
  const newPoolAddress = poolCreatedEvent.args.pool;
  
  console.log(`Pool créé: ${newPoolAddress}`);
} else {
  console.log(`Pool existe déjà: ${poolAddress}`);
}
```