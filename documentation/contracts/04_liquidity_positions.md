# Liquidity Positions - NonfungiblePositionManager

## Vue d'ensemble

**NonfungiblePositionManager** (`0xEf089afF769bC068520a1A90f0773037eF31fbBC`) transforme les positions de liquidité Uniswap V3 en tokens ERC721 NFT. Chaque position est représentée par un NFT unique contenant toutes les métadonnées de position.

## Architecture NFT

### Structure Position
```solidity
struct Position {
    uint96 nonce;        // Pour les permits EIP-2612
    address operator;    // Adresse approuvée pour ce token
    uint80 poolId;      // ID interne du pool
    int24 tickLower;    // Tick inférieur de la range
    int24 tickUpper;    // Tick supérieur de la range
    uint128 liquidity;  // Liquidité déposée
    uint256 feeGrowthInside0LastX128; // Snapshot des fees token0
    uint256 feeGrowthInside1LastX128; // Snapshot des fees token1
    uint128 tokensOwed0; // Fees non collectées token0
    uint128 tokensOwed1; // Fees non collectées token1
}
```

### Optimisations de stockage
- **Pool IDs** : Mapping des adresses pools vers des IDs uint80 pour économiser le gas
- **Pool Keys** : Stockage séparé des infos pools pour réduire la redondance
- **Token ID compteur** : `_nextId` commence à 1 pour éviter confusion avec ID 0

## Cycle de vie d'une position

### 1. Mint - Création d'une position
```solidity
struct MintParams {
    address token0;
    address token1;
    uint24 fee;
    int24 tickLower;
    int24 tickUpper;
    uint256 amount0Desired;
    uint256 amount1Desired;
    uint256 amount0Min;      // Protection slippage
    uint256 amount1Min;      // Protection slippage
    address recipient;
    uint256 deadline;
}
```

#### Workflow de mint :
1. **Vérification deadline** : `checkDeadline(params.deadline)`
2. **Ajout liquidité** : Appel `addLiquidity()` du pool
3. **Mint NFT** : Création du token ERC721 avec ID incrémental
4. **Snapshot fees** : Capture de `feeGrowthInside` actuel
5. **Cache pool** : Assignation d'un poolId si nouveau pool
6. **Storage position** : Sauvegarde de toutes les données

### 2. IncreaseLiquidity - Ajout de liquidité
```solidity
struct IncreaseLiquidityParams {
    uint256 tokenId;
    uint256 amount0Desired;
    uint256 amount1Desired;
    uint256 amount0Min;
    uint256 amount1Min;
    uint256 deadline;
}
```

#### Processus d'augmentation :
1. **Calcul fees** : Calcule les fees accumulées depuis le dernier snapshot
2. **Mise à jour tokensOwed** : Ajoute les fees calculées
3. **Ajout liquidité** : Ajoute la nouvelle liquidité au pool
4. **Update snapshots** : Met à jour les `feeGrowthInside`
5. **Somme liquidité** : `position.liquidity += nouveauLiquidity`

### 3. DecreaseLiquidity - Retrait de liquidité
```solidity
struct DecreaseLiquidityParams {
    uint256 tokenId;
    uint128 liquidity;
    uint256 amount0Min;
    uint256 amount1Min;
    uint256 deadline;
}
```

#### Processus de diminution :
1. **Validation owner** : `isAuthorizedForToken(tokenId)`
2. **Burn du pool** : `pool.burn(tickLower, tickUpper, liquidity)`
3. **Calcul fees totales** : Fees + tokens retirés
4. **Update tokensOwed** : Ajoute tokens récupérés + fees
5. **Réduction liquidité** : `position.liquidity -= liquidity`

### 4. Collect - Collection des fees et tokens
```solidity
struct CollectParams {
    uint256 tokenId;
    address recipient;
    uint128 amount0Max;
    uint128 amount1Max;
}
```

#### Mécanisme de collection :
1. **Trigger update** : `pool.burn(tickLower, tickUpper, 0)` pour sync fees
2. **Calcul montants** : `min(tokensOwed, amountMax)`  
3. **Collection pool** : `pool.collect()` transfert effectif
4. **Réduction tokensOwed** : Soustrait montants collectés

### 5. Burn - Suppression du NFT
```solidity
function burn(uint256 tokenId) external payable isAuthorizedForToken(tokenId) {
    Position storage position = _positions[tokenId];
    require(position.liquidity == 0 && position.tokensOwed0 == 0 && position.tokensOwed1 == 0);
    delete _positions[tokenId];
    _burn(tokenId);
}
```

## Gestion des fees

### Tracking des fees
Le système utilise le concept de "fee growth inside" pour tracker les fees efficacement :
```solidity
// À chaque interaction
uint256 feesAccrued = (feeGrowthInside - feeGrowthInsideLast) * liquidity / Q128
tokensOwed += feesAccrued
```

### Collection automatique
- Les fees s'accumulent automatiquement dans `tokensOwed`
- Collection possible à tout moment, même sans liquidité restante
- `recipient = address(0)` garde les funds dans le contrat

## Patterns d'autorisation

### Modifier isAuthorizedForToken
```solidity
modifier isAuthorizedForToken(uint256 tokenId) {
    require(_isApprovedOrOwner(msg.sender, tokenId), 'Not approved');
    _;
}
```

### Approval optimisé
- L'approval est stocké dans `position.operator` avec la position
- Économise un SSTORE séparé par rapport à ERC721 standard

## Intégration avec les pools

### Callbacks Uniswap V3
Le Position Manager implémente les callbacks pour interagir avec les pools :
- `uniswapV3MintCallback` : Transfer tokens lors des mints
- Position Manager agit comme un "wrapper" autour des positions pool

### Calcul d'adresses pools
```solidity
IUniswapV3Pool pool = IUniswapV3Pool(
    PoolAddress.computeAddress(factory, poolKey)
);
```
Utilise CREATE2 pour calculer deterministiquement l'adresse des pools.

## Métadonnées NFT

### TokenURI dynamique
```solidity
function tokenURI(uint256 tokenId) public view returns (string memory) {
    return INonfungibleTokenPositionDescriptor(_tokenDescriptor).tokenURI(this, tokenId);
}
```

Le descriptor génère dynamiquement :
- Image SVG de la position
- Métadonnées JSON avec infos de range, liquidité, fees
- Status in-range/out-of-range

## Exemples d'utilisation frontend

### Créer une position
```typescript
const mintParams = {
  token0: USDC_ADDRESS,
  token1: WETH_ADDRESS, 
  fee: 3000,
  tickLower: -887220,  // Prix minimum
  tickUpper: 887220,   // Prix maximum  
  amount0Desired: parseUnits("1000", 6),  // 1000 USDC
  amount1Desired: parseUnits("0.5", 18),  // 0.5 WETH
  amount0Min: parseUnits("950", 6),       // 5% slippage
  amount1Min: parseUnits("0.475", 18),    // 5% slippage
  recipient: userAddress,
  deadline: Math.floor(Date.now() / 1000) + 300 // 5 minutes
};

const tx = await positionManager.mint(mintParams);
const receipt = await tx.wait();

// Extraire tokenId depuis les events
const mintEvent = receipt.events.find(e => e.event === 'Transfer');
const tokenId = mintEvent.args.tokenId;
```

### Collecter les fees
```typescript
// 1. Vérifier les fees disponibles
const position = await positionManager.positions(tokenId);
console.log(`Fees: ${position.tokensOwed0} / ${position.tokensOwed1}`);

// 2. Collecter
const collectParams = {
  tokenId: tokenId,
  recipient: userAddress,
  amount0Max: position.tokensOwed0,
  amount1Max: position.tokensOwed1
};

await positionManager.collect(collectParams);
```

### Monitoring des positions
```typescript
// Query toutes les positions d'un utilisateur
const userPositions = await positionManager.balanceOf(userAddress);
const positions = [];

for (let i = 0; i < userPositions; i++) {
  const tokenId = await positionManager.tokenOfOwnerByIndex(userAddress, i);
  const position = await positionManager.positions(tokenId);
  positions.push({
    tokenId: tokenId.toString(),
    liquidity: position.liquidity.toString(),
    tokensOwed0: position.tokensOwed0.toString(),
    tokensOwed1: position.tokensOwed1.toString(),
    tickLower: position.tickLower,
    tickUpper: position.tickUpper
  });
}
```

## Optimisations et meilleures pratiques

### Gas optimization
- **Batch operations** : Utiliser multicall pour grouper mint + approve
- **Collect régulier** : Éviter l'accumulation excessive de fees
- **Deadline courts** : 5-15 minutes max pour éviter MEV

### Gestion des ranges
- **Ranges étroites** : Plus de fees mais plus de risk d'être out-of-range
- **Ranges larges** : Moins de fees mais position plus stable
- **Monitoring** : Suivre le prix vs range pour rebalancer

### Sécurité
- **Slippage protection** : Toujours set amount0Min/amount1Min
- **Deadlines** : Protection contre transactions stales
- **Approvals** : Révoque les approvals après usage