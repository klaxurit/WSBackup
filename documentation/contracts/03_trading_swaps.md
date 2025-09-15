# Trading & Swaps - SwapRouter02

## Vue d'ensemble

**SwapRouter02** (`0x86e02f3D4Cb55974B7EE7E7c98c199e65F9023a4`) est le router unifié qui combine :
- **V2SwapRouter** : trading sur pools Uniswap V2
- **V3SwapRouter** : trading sur pools Uniswap V3  
- **ApproveAndCall** : approval et exécution en une transaction
- **MulticallExtended** : batch de multiples opérations
- **SelfPermit** : meta-transactions avec permits

## Architecture du router

### Héritage multiple
```solidity
contract SwapRouter02 is 
    ISwapRouter02, 
    V2SwapRouter, 
    V3SwapRouter, 
    ApproveAndCall, 
    MulticallExtended, 
    SelfPermit
```

### États immutables
- `factory` : address de UniswapV3Factory
- `factoryV2` : address de UniswapV2Factory (compatibility)
- `positionManager` : address du NonfungiblePositionManager
- `WETH9` : address du token WETH

## Types de swaps supportés

### 1. Exact Input (montant d'entrée fixe)
- **Single hop** : `exactInputSingle()`
- **Multi-hop** : `exactInput()`
- L'utilisateur spécifie combien il veut échanger
- Le contrat retourne le maximum possible en sortie

### 2. Exact Output (montant de sortie fixe)  
- **Single hop** : `exactOutputSingle()`
- **Multi-hop** : `exactOutput()`
- L'utilisateur spécifie combien il veut recevoir
- Le contrat calcule le minimum requis en entrée

## Workflow V3 Swaps

### Exact Input Single
```solidity
struct ExactInputSingleParams {
    address tokenIn;
    address tokenOut; 
    uint24 fee;
    address recipient;
    uint256 amountIn;
    uint256 amountOutMinimum;
    uint160 sqrtPriceLimitX96; // 0 pour pas de limite
}
```

#### Étapes d'exécution :
1. **Vérification du balance** : Si `amountIn == Constants.CONTRACT_BALANCE`, utilise tout le balance du contrat
2. **Construction du path** : Encode `tokenIn + fee + tokenOut`
3. **Appel swap** : `pool.swap()` avec callback data
4. **Callback** : `uniswapV3SwapCallback()` effectue le paiement
5. **Validation** : Vérifie `amountOut >= amountOutMinimum`

### Multi-hop exactInput
```solidity
struct ExactInputParams {
    bytes path; // tokenA + fee + tokenB + fee + tokenC...
    address recipient;
    uint256 amountIn;
    uint256 amountOutMinimum;
}
```

#### Workflow multi-hop :
1. **Parsing du path** : Décode chaque pool séquentiellement
2. **Swaps en chaîne** : Output du swap 1 = Input du swap 2
3. **Custody intermédiaire** : Router détient tokens entre swaps
4. **Paiement final** : Dernier token envoyé au recipient

## Callback pattern

### uniswapV3SwapCallback
```solidity
function uniswapV3SwapCallback(
    int256 amount0Delta,
    int256 amount1Delta, 
    bytes calldata _data
) external override
```

#### Fonctionnement :
1. **Validation** : Vérifie que l'appelant est un pool valide
2. **Décodage** : Extract path et payer depuis callback data
3. **Exact Input** : Paye directement le token requis
4. **Exact Output** : Continue la chaîne ou cache le montant

### Sécurité callback
```solidity
CallbackValidation.verifyCallback(factory, tokenIn, tokenOut, fee);
```
- Vérifie que `msg.sender` est le bon pool
- Prévient les attaques de callback malicieux

## Protection contre slippage

### Prix limits
- `sqrtPriceLimitX96` : limite de prix pour le swap
- `0` = pas de limite de prix
- Arrête le swap si le prix dépasse la limite

### Montants minimum/maximum
- **exactInput** : `amountOutMinimum` protection vendeur
- **exactOutput** : `amountInMaximum` protection acheteur

## Gestion des fees

### V3 Fee Tiers
- **500** (0.05%) : stablecoins, très faible volatilité
- **3000** (0.3%) : pairs standards, volatilité moyenne  
- **10000** (1%) : pairs exotiques, haute volatilité

### Calcul automatique des routes
Le router trouve automatiquement le pool basé sur :
- `tokenIn` + `tokenOut` + `fee`
- Adresse déterministe via CREATE2

## Patterns d'utilisation avancés

### 1. Contract Balance Flag
```solidity
// Swap tout le balance du contrat
params.amountIn = Constants.CONTRACT_BALANCE;
```

### 2. Address Constants
```solidity
// Envoie au msg.sender
params.recipient = Constants.MSG_SENDER;
// Garde dans le contrat
params.recipient = Constants.ADDRESS_THIS;
```

### 3. Multi-path encoding
```solidity
// Path: USDC -> (0.05%) -> WETH -> (0.3%) -> DAI
bytes memory path = abi.encodePacked(
    USDC,
    uint24(500),
    WETH, 
    uint24(3000),
    DAI
);
```

## Intégration avec les Vaults

### StickyVault Swaps
Les StickyVaults utilisent des routers externes pour rebalancer :
```solidity
// Dans StickyVaultWithRouter
function _swapWithRouter(
    uint256 amount0,
    uint256 amount1, 
    SwapData calldata swapData
) internal returns (uint256, uint256)
```

### Router whitelisting
```solidity
mapping(address => bool) public swapRouter;

function setRouter(address _router, bool _status) external onlyManager {
    swapRouter[_router] = _status;
}
```

## Exemple d'implémentation frontend

### Swap USDC -> WETH
```typescript
// 1. Preparation des paramètres
const params = {
  tokenIn: USDC_ADDRESS,
  tokenOut: WETH_ADDRESS,
  fee: 3000,
  recipient: userAddress,
  amountIn: parseUnits("100", 6), // 100 USDC
  amountOutMinimum: 0,
  sqrtPriceLimitX96: 0
}

// 2. Approbation si nécessaire
const allowance = await usdc.allowance(userAddress, swapRouter.address);
if (allowance.lt(params.amountIn)) {
  await usdc.approve(swapRouter.address, params.amountIn);
}

// 3. Exécution du swap
const tx = await swapRouter.exactInputSingle(params);
const receipt = await tx.wait();

// 4. Extraction du résultat
const swapEvent = receipt.logs.find(log => 
  log.topics[0] === SwapEventTopic
);
```

### Multi-hop USDC -> WETH -> DAI
```typescript
// Construction du path
const path = encodePath(
  [USDC_ADDRESS, WETH_ADDRESS, DAI_ADDRESS],
  [3000, 3000]
);

const params = {
  path: path,
  recipient: userAddress,
  amountIn: parseUnits("100", 6),
  amountOutMinimum: 0
};

await swapRouter.exactInput(params);
```

## Optimisations gas

### 1. Batch operations
```solidity
// Combine approve + swap en une transaction
bytes[] memory calls = new bytes[](2);
calls[0] = abi.encodeCall(selfPermit, (token, amount, deadline, v, r, s));
calls[1] = abi.encodeCall(exactInputSingle, (params));
router.multicall(calls);
```

### 2. Contract balance swaps
Évite les transferts inutiles en utilisant le balance existant

### 3. Path optimization
- Shorter paths = moins de gas
- Pools avec plus de liquidité = meilleur prix + moins de gas

## Considérations sécurité

### 1. Callback validation
- Toujours vérifier l'origine des callbacks
- Utiliser `CallbackValidation.verifyCallback()`

### 2. Slippage protection
- Jamais de swap sans `amountOutMinimum` / `amountInMaximum`
- Calculer le slippage basé sur prix actuels

### 3. Deadlines
- Utiliser `block.timestamp + 300` (5 minutes)
- Éviter les transactions qui traînent en mempool

### 4. MEV protection
- Utiliser des prix limits appropriés
- Considérer des solutions comme flashbots