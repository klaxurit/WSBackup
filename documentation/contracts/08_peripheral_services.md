# Services Périphériques - Migration, Staking, Multicall

## Vue d'ensemble

Les services périphériques enrichissent l'écosystème DEX avec des fonctionnalités avancées : migration de liquidité, staking incitatif, et optimisations de requêtes. Ces contrats démontrent des patterns DeFi sophistiqués.

### Contrats analysés
- **V3Migrator** (`0x89E9230257f4Ff1B98babb77b482aF4eaF69462f`) : Migration V2 → V3
- **UniswapV3Staker** (`0x34a56a3f226CD4565F6dbC84962a3e99CC08baf9`) : Mining de liquidité  
- **ElkDexInterfaceMulticall** (`0x2B35c459e86fABd62b9C37fb652091671C5aA3ad`) : Batch queries

## V3Migrator - Migration de liquidité

### Objectif
Facilite la migration des positions de liquidité d'ElkDex V2 vers V3, permettant aux utilisateurs de bénéficier de la liquidité concentrée.

### Processus de migration

#### 1. Burn de liquidité V2
```solidity
function migrate(MigrateParams calldata params) external {
    // Transfer LP tokens to pair
    IElkDexV2Pair(params.pair).transferFrom(msg.sender, params.pair, params.liquidityToMigrate);
    
    // Burn LP tokens and receive underlying tokens
    (uint256 amount0V2, uint256 amount1V2) = IElkDexV2Pair(params.pair).burn(address(this));
}
```

#### 2. Migration partielle supportée
```solidity
uint256 amount0V2ToMigrate = amount0V2.mul(params.percentageToMigrate) / 100;
uint256 amount1V2ToMigrate = amount1V2.mul(params.percentageToMigrate) / 100;
```
- **Flexibilité** : Migration de 1% à 100% de la position
- **Stratégie graduelle** : Permet tests avant migration complète

#### 3. Création position V3
```solidity
INonfungiblePositionManager(nonfungiblePositionManager).mint(MintParams({
    token0: params.token0,
    token1: params.token1, 
    fee: params.fee,
    tickLower: params.tickLower,
    tickUpper: params.tickUpper,
    amount0Desired: amount0V2ToMigrate,
    amount1Desired: amount1V2ToMigrate,
    amount0Min: params.amount0Min,
    amount1Min: params.amount1Min,
    recipient: params.recipient,
    deadline: params.deadline
}));
```

#### 4. Refund des surplus
```solidity
// Refund unused token0
if (IERC20(params.token0).balanceOf(address(this)) > 0) {
    if (params.refundAsETH && params.token0 == WETH9) {
        IWETH9(WETH9).withdraw(IERC20(params.token0).balanceOf(address(this)));
        TransferHelper.safeTransferETH(params.recipient, address(this).balance);
    } else {
        TransferHelper.safeTransfer(params.token0, params.recipient, IERC20(params.token0).balanceOf(address(this)));
    }
}
```

### Patterns d'intégration

#### Support multicall
```solidity
contract V3Migrator is IMulticall, SelfPermit, PoolInitializer, PeripheryPayments {
    // Batch multiple operations
    function multicall(bytes[] calldata data) external payable override returns (bytes[] memory results);
}
```

#### Initialisation pool automatique
```solidity
if (params.createPool) {
    poolInitializer.createAndInitializePoolIfNecessary(
        params.token0,
        params.token1,
        params.fee,
        params.sqrtPriceX96
    );
}
```

## UniswapV3Staker - Mining de liquidité

### Architecture incitative

#### Structure IncentiveKey
```solidity
struct IncentiveKey {
    IERC20Minimal rewardToken;  // Token distribué comme reward
    IUniswapV3Pool pool;        // Pool cible pour staking
    uint256 startTime;          // Début des rewards
    uint256 endTime;            // Fin des rewards  
    address refundee;           // Récupère rewards non-réclamées
}
```

#### Système de calcul de rewards
```solidity
function computeRewardAmount(
    uint256 totalRewardUnclaimed,
    uint160 totalSecondsClaimedX128,
    uint256 startTime,
    uint256 endTime,
    uint128 liquidity,
    uint160 secondsPerLiquidityInsideInitialX128,
    uint160 secondsPerLiquidityInsideX128,
    uint256 currentTime
) internal pure returns (uint256 reward, uint160 secondsInsideX128)
```

**Formule reward** : `reward = totalReward * (secondsInside / totalSecondsInside)`

### Cycle de vie staking

#### 1. Création incitative
```solidity
function createIncentive(IncentiveKey memory key, uint256 reward) external {
    require(key.startTime >= block.timestamp, 'IncentiveStartTime');
    require(key.endTime > key.startTime, 'IncentiveEndTime');
    
    incentives[IncentiveId.compute(key)] = Incentive({
        totalRewardUnclaimed: reward,
        totalSecondsClaimedX128: 0,
        numberOfStakes: 0
    });
    
    TransferHelper.safeTransferFrom(address(key.rewardToken), msg.sender, address(this), reward);
}
```

#### 2. Dépôt NFT
```solidity
function onERC721Received(
    address,
    address from,
    uint256 tokenId,
    bytes calldata data
) external override returns (bytes4) {
    require(msg.sender == address(nonfungiblePositionManager));
    
    deposits[tokenId] = Deposit({owner: from, numberOfStakes: 0, tickLower: tickLower, tickUpper: tickUpper});
    
    // Auto-stake if data provided
    if (data.length > 0) {
        IncentiveKey memory key = abi.decode(data, (IncentiveKey));
        _stakeToken(tokenId, key);
    }
    
    return this.onERC721Received.selector;
}
```

#### 3. Staking dans incitative
```solidity
function stakeToken(uint256 tokenId, IncentiveKey memory key) external {
    require(deposits[tokenId].owner == msg.sender, 'NotOwner');
    _stakeToken(tokenId, key);
}

function _stakeToken(uint256 tokenId, IncentiveKey memory key) private {
    bytes32 incentiveId = IncentiveId.compute(key);
    
    // Calcul secondsPerLiquidityInside actuel
    (uint160 secondsPerLiquidityInsideX128,) = pool.snapshotCumulativesInside(tickLower, tickUpper);
    
    _stakes[tokenId][incentiveId] = Stake({
        secondsPerLiquidityInsideInitialX128: secondsPerLiquidityInsideX128,
        liquidity: liquidity > type(uint96).max ? type(uint96).max : liquidity,
        liquidityIfOverflow: liquidity
    });
}
```

#### 4. Collection rewards
```solidity
function claimReward(IERC20Minimal rewardToken, address to, uint256 amountRequested)
    external
    returns (uint256 reward)
{
    reward = rewards[msg.sender][rewardToken];
    if (amountRequested != 0 && amountRequested < reward) {
        reward = amountRequested;
    }
    
    rewards[msg.sender][rewardToken] -= reward;
    TransferHelper.safeTransfer(address(rewardToken), to, reward);
}
```

### Fonctionnalités avancées

#### Multi-incentive staking
```solidity
// Un NFT peut être staké dans plusieurs incentives simultanément
mapping(uint256 => mapping(bytes32 => Stake)) private _stakes;
mapping(uint256 => Deposit) public deposits;
```

#### Gestion overflow liquidité
```solidity
struct Stake {
    uint160 secondsPerLiquidityInsideInitialX128;
    uint96 liquidityNoOverflow;  // Capped à type(uint96).max
    uint128 liquidityIfOverflow; // Liquidité complète si overflow
}
```

## ElkDexInterfaceMulticall - Batch queries

### Structure call enhanced
```solidity
struct Call {
    address target;      // Contrat à appeler
    uint256 gasLimit;    // Gas max pour cet appel
    bytes callData;      // Données d'appel de fonction
}

struct Result {
    bool success;        // Si appel a réussi
    uint256 gasUsed;     // Gas réellement consommé
    bytes returnData;    // Données retournées
}
```

### Implémentation core
```solidity
function multicall(Call[] memory calls) public returns (uint256 blockNumber, Result[] memory returnData) {
    blockNumber = block.number;
    returnData = new Result[](calls.length);
    
    for (uint256 i = 0; i < calls.length; i++) {
        uint256 gasLeftBefore = gasleft();
        
        (bool success, bytes memory ret) = calls[i].target.call{gas: calls[i].gasLimit}(calls[i].callData);
        
        uint256 gasUsed = gasLeftBefore - gasleft();
        returnData[i] = Result(success, gasUsed, ret);
    }
}
```

### Fonctionnalités spéciales

#### Gas limiting individuel
- Chaque call a sa limite gas individuelle
- Empêche qu'un appel consomme tout le gas
- Protection contre griefing attacks

#### Monitoring gas usage  
- Tracking précis consommation gas par call
- Utile pour optimisation et debugging
- Analyse coûts opérationnels

## Patterns d'utilisation

### Migration V2→V3 complète
```typescript
async function migrateV2ToV3(
  v2PairAddress: string,
  lpBalance: BigNumber,
  newTickLower: number,
  newTickUpper: number
): Promise<void> {
  const migrator = new ethers.Contract(MIGRATOR_ADDRESS, MIGRATOR_ABI);
  
  // 1. Approve LP tokens
  const lpToken = new ethers.Contract(v2PairAddress, ERC20_ABI);
  await lpToken.approve(migrator.address, lpBalance);
  
  // 2. Execute migration
  const tx = await migrator.migrate({
    pair: v2PairAddress,
    liquidityToMigrate: lpBalance,
    percentageToMigrate: 100, // Migration complète
    token0: await lpToken.token0(),
    token1: await lpToken.token1(),
    fee: 3000, // 0.3% fee tier
    tickLower: newTickLower,
    tickUpper: newTickUpper,
    amount0Min: 0, // À calculer avec slippage
    amount1Min: 0,
    recipient: userAddress,
    deadline: Math.floor(Date.now() / 1000) + 300,
    refundAsETH: true
  });
  
  const receipt = await tx.wait();
  const newTokenId = receipt.events
    .find(e => e.topics[0] === TRANSFER_EVENT_TOPIC).args.tokenId;
}
```

### Création programme staking
```typescript
async function createLiquidityMining(
  poolAddress: string,
  rewardToken: string,
  totalReward: BigNumber,
  duration: number // seconds
): Promise<string> {
  const staker = new ethers.Contract(STAKER_ADDRESS, STAKER_ABI);
  const rewardERC20 = new ethers.Contract(rewardToken, ERC20_ABI);
  
  const incentiveKey = {
    rewardToken,
    pool: poolAddress,
    startTime: Math.floor(Date.now() / 1000),
    endTime: Math.floor(Date.now() / 1000) + duration,
    refundee: adminAddress
  };
  
  // 1. Approve reward tokens
  await rewardERC20.approve(staker.address, totalReward);
  
  // 2. Create incentive
  await staker.createIncentive(incentiveKey, totalReward);
  
  return ethers.utils.keccak256(
    ethers.utils.defaultAbiCoder.encode(
      ['address', 'address', 'uint256', 'uint256', 'address'],
      [incentiveKey.rewardToken, incentiveKey.pool, incentiveKey.startTime, incentiveKey.endTime, incentiveKey.refundee]
    )
  );
}
```

### Batch queries efficaces
```typescript
async function batchPoolData(poolAddresses: string[]): Promise<PoolData[]> {
  const multicall = new ethers.Contract(MULTICALL_ADDRESS, MULTICALL_ABI);
  
  const calls = poolAddresses.flatMap(pool => [
    {
      target: pool,
      gasLimit: 100000,
      callData: IUniswapV3Pool.interface.encodeFunctionData('slot0')
    },
    {
      target: pool,
      gasLimit: 50000, 
      callData: IUniswapV3Pool.interface.encodeFunctionData('liquidity')
    },
    {
      target: pool,
      gasLimit: 30000,
      callData: IUniswapV3Pool.interface.encodeFunctionData('fee')
    }
  ]);
  
  const [blockNumber, results] = await multicall.multicall(calls);
  
  const poolData: PoolData[] = [];
  for (let i = 0; i < poolAddresses.length; i++) {
    const slot0Result = results[i * 3];
    const liquidityResult = results[i * 3 + 1];
    const feeResult = results[i * 3 + 2];
    
    if (slot0Result.success && liquidityResult.success && feeResult.success) {
      const slot0 = IUniswapV3Pool.interface.decodeFunctionResult('slot0', slot0Result.returnData);
      const liquidity = IUniswapV3Pool.interface.decodeFunctionResult('liquidity', liquidityResult.returnData);
      const fee = IUniswapV3Pool.interface.decodeFunctionResult('fee', feeResult.returnData);
      
      poolData.push({
        address: poolAddresses[i],
        sqrtPriceX96: slot0.sqrtPriceX96,
        tick: slot0.tick,
        liquidity: liquidity[0],
        fee: fee[0],
        blockNumber
      });
    }
  }
  
  return poolData;
}
```

## Optimisations et meilleures pratiques

### Techniques communes d'optimisation

#### 1. Structures packées
```solidity
struct Deposit {
    address owner;           // 20 bytes
    uint48 numberOfStakes;   // 6 bytes  
    int24 tickLower;         // 3 bytes
    int24 tickUpper;         // 3 bytes
}                           // Total: 32 bytes (1 slot)
```

#### 2. Math gas-efficient  
```solidity
import '@uniswap/v3-core/contracts/libraries/LowGasSafeMath.sol';
using LowGasSafeMath for uint256;
```

#### 3. Lazy computation
- Rewards calculés seulement au unstake
- Évite stockage/update constants
- Gas savings significatifs

### Considérations sécurité

#### Access controls
```solidity
modifier onlyOwner(uint256 tokenId) {
    require(deposits[tokenId].owner == msg.sender, 'NotOwner');
    _;
}
```

#### Overflow handling
```solidity
if (liquidity >= type(uint96).max) {
    _stakes[tokenId][incentiveId] = Stake({
        liquidityNoOverflow: type(uint96).max,
        liquidityIfOverflow: liquidity
    });
}
```

#### Reentrancy protection
Pattern checks-effects-interactions respecté dans tous les contrats.

Ces services périphériques démontrent l'étendue et la sophistication de l'écosystème DEX, offrant des outils avancés pour la gestion de liquidité, l'optimisation des performances et l'incitation économique.