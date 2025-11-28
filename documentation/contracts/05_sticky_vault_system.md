# StickyVault System - Arrakis V1 Based

## Vue d'ensemble

Le système StickyVault est une adaptation d'Arrakis V1 qui fournit une **gestion automatisée de liquidité** sur Uniswap V3. Les utilisateurs déposent des tokens et reçoivent des shares d'un vault qui gère une position concentrée avec rebalancing automatique.

### Contrats principaux
- **StickyVaultFactory** (`0x18B9ABf2E821E2fE7A08Dc255d5a7e77fFc0b844`) : Factory pour créer des vaults
- **StickyVaultWithRouter** (`0x32a56Da6f958BBFB24797DD47C7d1146D55C4052`) : Implementation des vaults avec router intégré
- **StickyVaultRouter** (`0xbb962d8805e2B4AF087C4702F088Cf9BE9862F30`) : Interface utilisateur pour interactions vault

## Architecture des vaults

### Hiérarchie d'héritage
```
StickyVaultStorage (abstract)
    ↓
StickyVault (abstract) 
    ↓
StickyVaultWithRouter (concrete)
```

### StickyVaultStorage - État de base
```solidity
// Variables core
IUniswapV3Pool public pool;
IERC20 public token0;
IERC20 public token1;
int24 public lowerTick;
int24 public upperTick;

// Configuration management
uint16 public managerFeeBPS;          // 0-10000 (0-100%)
address public managerTreasury;       // Destinataire fees manager
uint16 public compounderSlippageBPS;  // Protection slippage (default 500 = 5%)
uint32 public compounderSlippageInterval; // Intervalle TWAP (default 5 minutes)

// Balances fees
uint256 public managerBalance0;
uint256 public managerBalance1;

// Contrôles d'accès
bool public restrictedMint;           // Mint limité au manager
mapping(address => bool) public pauser; // Addresses autorisées à pause
```

### Système de gestion
- **Manager** : Peut rebalancer, configurer fees, pause/unpause
- **Pausers** : Peuvent mettre en pause (pas unpause)  
- **Factory** : Source des paramètres par défaut pour vaults sans manager

## Cycle de vie d'un vault

### 1. Création via Factory
```solidity
function deployVault(
    address tokenA,
    address tokenB,
    uint24 uniFee,
    address manager,
    address managerTreasury,
    uint16 managerFee,
    int24 lowerTick,
    int24 upperTick
) external returns (address stickyVault)
```

#### Processus de déploiement :
1. **Validation des paramètres** : Manager fees ≤ 30%, ticks valides
2. **Vérification pool** : Pool Uniswap doit exister
3. **Clonage** : `LibClone.clone(stickyVaultImplementation)`  
4. **Initialisation** : `initialize()` avec paramètres
5. **Enregistrement** : Ajout aux mappings factory

### 2. Initialisation du vault
```solidity
function initialize(
    string memory _name,        // "Sticky Vault TOKEN0-TOKEN1-0.3%"
    string memory _symbol,      // "STICKYTOKEN0TOKEN1"
    address _pool,
    uint16 _managerFeeBPS,
    int24 _lowerTick,
    int24 _upperTick,
    address _manager_,
    address _managerTreasury
) external
```

## Interactions utilisateur

### Mint - Dépôt de liquidité
```solidity
function mint(uint256 mintAmount, address receiver) 
    external 
    returns (uint256 amount0, uint256 amount1, uint128 liquidityMinted)
```

#### Algorithme de mint :
1. **Calcul proportionnel** : Si vault non vide, calcul pro-rata
2. **Mint initial** : Si vault vide, `mintAmount = liquidity` à déposer
3. **Transfer tokens** : From user to vault
4. **Ajout liquidité** : `pool.mint()` avec callback
5. **Mint shares** : ERC20 tokens représentant la part

### Burn - Retrait de liquidité
```solidity
function burn(uint256 burnAmount, address receiver)
    external
    returns (uint256 amount0, uint256 amount1, uint128 liquidityBurned)
```

#### Processus de burn :
1. **Burn shares** : Détruit les tokens utilisateur
2. **Calcul proportion** : Détermine part de liquidity à retirer  
3. **Withdraw pool** : `pool.burn()` + `pool.collect()`
4. **Distribution fees** : Applique manager fees
5. **Transfer tokens** : Envoie tokens + proportional idle balance

## Rebalancing automatique

### Types de rebalance

#### 1. Rebalance simple (anyone)
```solidity
function rebalance() external whenNotPaused
```
- **Objectif** : Réinvestir les fees accumulées
- **Contraintes** : Garde la même range (lowerTick/upperTick)
- **Processus** : Withdraw 0 liquidity pour trigger fee collection → mint nouvelle liquidity

#### 2. Executive Rebalance (manager only)
```solidity
function executiveRebalance(
    int24 newLowerTick,
    int24 newUpperTick, 
    uint160 swapThresholdPrice,
    uint256 swapAmountBPS,
    bool zeroForOne
) external whenNotPaused onlyManager
```

- **Objectif** : Changer la range et optimiser allocation
- **Étapes** :
  1. Withdraw toute la liquidity + fees
  2. Update lowerTick/upperTick
  3. Dépose max possible dans nouvelle range
  4. Swap excédent selon paramètres (optionnel)
  5. Dépose reste après swap

#### 3. Executive Rebalance With Router (manager only)
```solidity
function executiveRebalanceWithRouter(
    int24 newLowerTick,
    int24 newUpperTick,
    SwapData calldata swapData
) external whenNotPaused onlyManager
```

- **Amélioration** : Utilise routers externes whitelistés
- **Protection** : Vérification slippage via TWAP
- **Flexibilité** : Route data personnalisée pour swaps complexes

## Système de fees

### Manager fees
- **Range** : 0-30% des fees earned (managerFeeBPS)
- **Application** : Sur chaque fee collection
- **Distribution** : Accumulé dans managerBalance0/1
- **Collection** : `withdrawManagerBalance()` par manager

### Factory fees  
- **Default rate** : 5% (stickyVaultFee)
- **Application** : Pour vaults sans manager
- **Destinataire** : Factory treasury

### Calcul des fees
```solidity
function _applyFees(uint256 _fee0, uint256 _fee1) internal {
    if (managerFeeBPS > 0) {
        managerBalance0 += _fee0 * managerFeeBPS / 10000;
        managerBalance1 += _fee1 * managerFeeBPS / 10000;
    }
}
```

## Protection contre MEV/slippage

### TWAP Oracle intégré
```solidity
function getAvgPrice(uint32 interval) public view returns (uint160 avgSqrtPriceX96) {
    uint32[] memory secondsAgo = new uint32[](2);
    secondsAgo[0] = interval;  // Ex: 300 secondes
    secondsAgo[1] = 0;         // Maintenant
    
    (int56[] memory tickCumulatives,) = pool.observe(secondsAgo);
    int24 avgTick = int24((tickCumulatives[1] - tickCumulatives[0]) / int56(uint56(interval)));
    avgSqrtPriceX96 = avgTick.getSqrtRatioAtTick();
}
```

### Worst case output
```solidity
function worstAmountOut(
    uint256 amountIn, 
    uint16 slippageBPS,
    uint160 avgSqrtPriceX96, 
    bool zeroForOne
) public pure returns (uint256)
```

Calcule le minimum acceptable basé sur :
- **TWAP price** : Prix moyen récent
- **Slippage tolerance** : Buffer de sécurité (5% default)

## Router Integration

### StickyVaultRouter functions
```solidity
// Dépôts
function addLiquidity(...)           // Standard deposit
function addLiquidityNative(...)     // BERA native support  
function addLiquiditySingle(...)     // Single token deposit avec swap
function addLiquiditySingleNative(...) // Single BERA deposit

// Retraits  
function removeLiquidity(...)        // Standard withdrawal
function removeLiquidityNative(...)  // BERA unwrap
```

### BERA natif support
- **Wrapping automatique** : BERA → WBERA lors dépôts
- **Unwrapping automatique** : WBERA → BERA lors retraits
- **Refund surplus** : BERA non utilisé retourné à user

## Exemples d'implémentation

### Créer un vault USDC/WETH
```typescript
// 1. Vérifier que le pool existe
const pool = await factory.getPool(USDC, WETH, 3000);
if (pool === ethers.constants.AddressZero) {
  await factory.createPool(USDC, WETH, 3000);
}

// 2. Calculer les ticks pour range ±10%
const currentTick = await pool.slot0().then(s => s.tick);
const tickSpacing = await pool.tickSpacing();
const lowerTick = Math.floor((currentTick - 2000) / tickSpacing) * tickSpacing;
const upperTick = Math.ceil((currentTick + 2000) / tickSpacing) * tickSpacing;

// 3. Déployer vault
const tx = await stickyVaultFactory.deployVault(
  USDC,           // tokenA  
  WETH,           // tokenB
  3000,           // fee (0.3%)
  managerAddress, // manager
  treasuryAddress, // managerTreasury  
  1000,           // managerFee (10%)
  lowerTick,      // lowerTick
  upperTick       // upperTick
);

const receipt = await tx.wait();
const vaultAddress = receipt.events
  .find(e => e.event === 'StickyVaultCreated').args.stickyVault;
```

### Déposer via router avec BERA
```typescript
const stickyVault = new ethers.Contract(vaultAddress, STICKY_VAULT_ABI);
const router = new ethers.Contract(ROUTER_ADDRESS, ROUTER_ABI);

// Dépôt single-sided avec BERA
const swapData = {
  router: winnieRouter,
  amountIn: parseEther("1"),      // 1 BERA à swapper
  minAmountOut: parseUnits("950", 6), // Min 950 USDC expected
  zeroForOne: true,               // WBERA → USDC
  routeData: encodeSwapCall(...),
};

await router.addLiquiditySingleNative(
  vaultAddress,
  parseEther("100"),    // Min shares
  500,                  // Max 5% staking slippage  
  swapData,
  userAddress,
  { value: parseEther("2") } // 2 BERA total
);
```

### Monitoring d'une position
```typescript
const vaultContract = new ethers.Contract(vaultAddress, STICKY_VAULT_ABI);

// Info général
const [amount0, amount1] = await vaultContract.getUnderlyingBalances();
const totalSupply = await vaultContract.totalSupply();
const userShares = await vaultContract.balanceOf(userAddress);

// Position info
const lowerTick = await vaultContract.lowerTick();
const upperTick = await vaultContract.upperTick();
const pool = await vaultContract.pool();
const currentTick = await pool.slot0().then(s => s.tick);

// Status
const inRange = currentTick >= lowerTick && currentTick <= upperTick;
const userValue0 = amount0.mul(userShares).div(totalSupply);
const userValue1 = amount1.mul(userShares).div(totalSupply);

console.log({
  inRange,
  userShares: userShares.toString(),
  userValue0: formatUnits(userValue0, 6),  // USDC
  userValue1: formatEther(userValue1),     // WETH
});
```

## Considérations sécurité

### Access Control
- **Manager** : Contrôle complet (rebalance, fees, pause)
- **Pausers** : Peuvent arrêter dépôts/retraits en urgence
- **Factory Owner** : Peut changer implementation et fees

### Protection MEV
- **TWAP oracles** : Prix basé sur moyenne historique
- **Slippage protection** : Revert si prix dévie trop
- **Router whitelist** : Seuls routers approuvés pour swaps

### Risques principaux  
- **Impermanent loss** : Exposition aux variations de prix
- **Range management** : Positions out-of-range ne gagnent pas de fees
- **Manager risk** : Manager malveillant peut extraire value via rebalancing