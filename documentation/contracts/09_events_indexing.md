# Events & Indexing - Guide pour Subgraph

## Vue d'ensemble

L'indexation des événements est cruciale pour construire une interface utilisateur performante et un backend de données efficace. Ce guide détaille tous les événements émis par les contrats du DEX Winnie et leur structure d'indexation optimale.

## Events par contrat

### UniswapV3Factory

#### PoolCreated
```solidity
event PoolCreated(
    address indexed token0,
    address indexed token1,
    uint24 indexed fee,
    int24 tickSpacing,
    address pool
);
```

**Usage** : Découverte de nouveaux pools
**Index GraphQL** :
```graphql
type Pool @entity {
  id: ID!
  token0: Token!
  token1: Token1!
  fee: BigInt!
  tickSpacing: Int!
  createdAtBlockNumber: BigInt!
  createdAtTimestamp: BigInt!
}
```

#### FeeAmountEnabled
```solidity
event FeeAmountEnabled(uint24 indexed fee, int24 indexed tickSpacing);
```

**Usage** : Nouveaux fee tiers disponibles

#### OwnerChanged  
```solidity
event OwnerChanged(address indexed oldOwner, address indexed newOwner);
```

### UniswapV3Pool (Core)

#### Swap
```solidity
event Swap(
    address indexed sender,
    address indexed recipient,
    int256 amount0,
    int256 amount1,
    uint160 sqrtPriceX96,
    uint128 liquidity,
    int24 tick
);
```

**Usage** : Tracking tous les swaps
**Schema** :
```graphql
type Swap @entity {
  id: ID!
  transaction: Transaction!
  pool: Pool!
  sender: Bytes!
  recipient: Bytes!
  amount0: BigInt!
  amount1: BigInt!
  sqrtPriceX96: BigInt!
  liquidity: BigInt!
  tick: Int!
  timestamp: BigInt!
  gasUsed: BigInt!
  gasPrice: BigInt!
  logIndex: Int!
}
```

#### Mint
```solidity
event Mint(
    address sender,
    address indexed owner,
    int24 indexed tickLower,
    int24 indexed tickUpper,
    uint128 amount,
    uint256 amount0,
    uint256 amount1
);
```

**Usage** : Ajouts de liquidité
**Relation** : Lié à `IncreaseLiquidity` du Position Manager

#### Burn
```solidity
event Burn(
    address indexed owner,
    int24 indexed tickLower,
    int24 indexed tickUpper,
    uint128 amount,
    uint256 amount0,
    uint256 amount1
);
```

**Usage** : Retraits de liquidité

#### Collect
```solidity
event Collect(
    address indexed owner,
    address recipient,
    int24 indexed tickLower,
    int24 indexed tickUpper,
    uint128 amount0,
    uint128 amount1
);
```

### NonfungiblePositionManager

#### IncreaseLiquidity
```solidity
event IncreaseLiquidity(
    uint256 indexed tokenId,
    uint128 liquidity,
    uint256 amount0,
    uint256 amount1
);
```

**Schema position** :
```graphql
type Position @entity {
  id: ID!
  tokenId: BigInt!
  owner: Bytes!
  pool: Pool!
  token0: Token!
  token1: Token1!
  tickLower: Int!
  tickUpper: Int!
  liquidity: BigInt!
  depositedToken0: BigInt!
  depositedToken1: BigInt!
  withdrawnToken0: BigInt!
  withdrawnToken1: BigInt!
  collectedFeesToken0: BigInt!
  collectedFeesToken1: BigInt!
  createdAtTimestamp: BigInt!
  createdAtBlockNumber: BigInt!
  transaction: Transaction!
}
```

#### DecreaseLiquidity
```solidity
event DecreaseLiquidity(
    uint256 indexed tokenId,
    uint128 liquidity,
    uint256 amount0,
    uint256 amount1
);
```

#### Collect  
```solidity
event Collect(
    uint256 indexed tokenId,
    address recipient,
    uint256 amount0,
    uint256 amount1
);
```

#### Transfer (ERC721)
```solidity
event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
```

**Usage** : Transferts de positions NFT

### StickyVaultFactory

#### StickyVaultCreated
```solidity
event StickyVaultCreated(
    address indexed uniPool,
    address indexed manager,
    address stickyVault,
    address implementation
);
```

**Schema vault** :
```graphql
type StickyVault @entity {
  id: ID!
  pool: Pool!
  manager: Bytes
  implementation: Bytes!
  name: String!
  symbol: String!
  totalSupply: BigInt!
  totalValueLocked0: BigInt!
  totalValueLocked1: BigInt!
  managerFee: Int!
  createdAtTimestamp: BigInt!
  rebalances: [Rebalance!]! @derivedFrom(field: "vault")
}
```

#### UpdateStickyVaultImplementation
```solidity
event UpdateStickyVaultImplementation(address implementation);
```

#### TreasurySet / StickyVaultFeeSet
```solidity
event TreasurySet(address treasury);
event StickyVaultFeeSet(uint16 fee);
```

### StickyVault

#### Minted
```solidity
event Minted(
    address receiver,
    uint256 mintAmount,
    uint256 amount0In,
    uint256 amount1In,
    uint128 liquidityMinted
);
```

#### Burned
```solidity
event Burned(
    address receiver,
    uint256 burnAmount,
    uint256 amount0Out,
    uint256 amount1Out,
    uint128 liquidityBurned
);
```

#### Rebalance
```solidity
event Rebalance(
    address indexed compounder,
    int24 lowerTick_,
    int24 upperTick_,
    uint128 liquidityBefore,
    uint128 liquidityAfter
);
```

**Schema rebalance** :
```graphql
type Rebalance @entity {
  id: ID!
  vault: StickyVault!
  compounder: Bytes!
  tickLowerBefore: Int!
  tickUpperBefore: Int!
  tickLowerAfter: Int!
  tickUpperAfter: Int!
  liquidityBefore: BigInt!
  liquidityAfter: BigInt!
  timestamp: BigInt!
  transaction: Transaction!
}
```

#### FeesEarned
```solidity
event FeesEarned(uint256 feesEarned0, uint256 feesEarned1);
```

### UniswapV3Staker

#### IncentiveCreated
```solidity
event IncentiveCreated(
    IERC20Minimal indexed rewardToken,
    IUniswapV3Pool indexed pool,
    uint256 startTime,
    uint256 endTime,
    address refundee,
    uint256 reward
);
```

#### TokenStaked / TokenUnstaked
```solidity
event TokenStaked(uint256 indexed tokenId, bytes32 indexed incentiveId);
event TokenUnstaked(uint256 indexed tokenId, bytes32 indexed incentiveId);
```

#### RewardClaimed
```solidity
event RewardClaimed(address indexed to, uint256 reward);
```

## Patterns d'indexation

### Architecture subgraph

#### 1. Entités principales
```graphql
type Token @entity {
  id: ID!
  symbol: String!
  name: String!
  decimals: Int!
  derivedBERA: BigDecimal
  volume: BigDecimal!
  volumeUSD: BigDecimal!
  totalValueLocked: BigDecimal!
  totalValueLockedUSD: BigDecimal!
  txCount: BigInt!
}

type Pool @entity {
  id: ID!
  token0: Token!
  token1: Token1!
  fee: BigInt!
  sqrtPrice: BigInt!
  liquidity: BigInt!
  tick: Int!
  observationIndex: Int!
  volumeToken0: BigDecimal!
  volumeToken1: BigDecimal!
  volumeUSD: BigDecimal!
  feesUSD: BigDecimal!
  totalValueLockedToken0: BigDecimal!
  totalValueLockedToken1: BigDecimal!
  totalValueLockedUSD: BigDecimal!
  txCount: BigInt!
}
```

#### 2. Agrégations temporelles
```graphql
type PoolDayData @entity {
  id: ID! # pool address + day id
  pool: Pool!
  date: Int!
  volumeUSD: BigDecimal!
  tvlUSD: BigDecimal!
  feesUSD: BigDecimal!
  open: BigDecimal!
  high: BigDecimal!
  low: BigDecimal!
  close: BigDecimal!
}

type PoolHourData @entity {
  id: ID!
  pool: Pool!
  periodStartUnix: Int!
  # ... mêmes champs que DayData
}
```

### Handlers d'événements

#### Factory Events
```typescript
export function handlePoolCreated(event: PoolCreated): void {
  // Créer entités Token si nécessaires
  let token0 = Token.load(event.params.token0.toHex())
  if (token0 === null) {
    token0 = createToken(event.params.token0)
  }
  
  let token1 = Token.load(event.params.token1.toHex())
  if (token1 === null) {
    token1 = createToken(event.params.token1)
  }
  
  // Créer entité Pool
  let pool = new Pool(event.params.pool.toHex())
  pool.token0 = token0.id
  pool.token1 = token1.id
  pool.fee = BigInt.fromI32(event.params.fee)
  pool.tickSpacing = event.params.tickSpacing
  pool.createdAtTimestamp = event.block.timestamp
  pool.createdAtBlockNumber = event.block.number
  pool.sqrtPrice = ZERO_BI
  pool.liquidity = ZERO_BI
  pool.tick = ZERO_I32
  
  pool.save()
  
  // Update factory stats
  updateFactoryDayData(event)
}
```

#### Pool Swap Events
```typescript
export function handleSwap(event: Swap): void {
  let pool = Pool.load(event.address.toHex())!
  let token0 = Token.load(pool.token0)!
  let token1 = Token.load(pool.token1)!
  
  // Update pool state
  pool.sqrtPrice = event.params.sqrtPriceX96
  pool.liquidity = event.params.liquidity
  pool.tick = event.params.tick
  
  // Calculate amounts USD
  let amount0USD = convertTokenToDecimal(event.params.amount0, token0.decimals)
    .times(token0.derivedBERA)
    .times(getBERAPrice())
  let amount1USD = convertTokenToDecimal(event.params.amount1, token1.decimals)
    .times(token1.derivedBERA)
    .times(getBERAPrice())
  
  let amountTotalUSD = amount0USD.abs().plus(amount1USD.abs())
  
  // Update pool aggregates
  pool.volumeUSD = pool.volumeUSD.plus(amountTotalUSD)
  pool.txCount = pool.txCount.plus(ONE_BI)
  pool.save()
  
  // Create swap entity
  let swap = new Swap(createSwapId(event))
  swap.pool = pool.id
  swap.sender = event.params.sender
  swap.recipient = event.params.recipient
  swap.amount0 = event.params.amount0
  swap.amount1 = event.params.amount1
  swap.amountUSD = amountTotalUSD
  swap.sqrtPriceX96 = event.params.sqrtPriceX96
  swap.liquidity = event.params.liquidity
  swap.tick = event.params.tick
  swap.timestamp = event.block.timestamp
  swap.transaction = createTransaction(event)
  swap.save()
  
  // Update day/hour data
  updatePoolDayData(event, pool, amountTotalUSD)
  updatePoolHourData(event, pool, amountTotalUSD)
}
```

#### Position Events
```typescript
export function handleIncreaseLiquidity(event: IncreaseLiquidity): void {
  let position = Position.load(event.params.tokenId.toString())
  if (position === null) {
    // Create new position
    position = createPosition(event)
  }
  
  // Update position liquidity
  position.liquidity = position.liquidity.plus(event.params.liquidity)
  position.depositedToken0 = position.depositedToken0.plus(event.params.amount0)
  position.depositedToken1 = position.depositedToken1.plus(event.params.amount1)
  
  position.save()
  
  // Update pool TVL
  updatePoolTVL(position.pool, event.params.amount0, event.params.amount1, true)
}
```

### Fonctions utilitaires

#### Prix et conversions
```typescript
export function getBERAPrice(): BigDecimal {
  // Logic pour obtenir prix BERA/USD
  // Peut utiliser pool BERA/USDC comme référence
}

export function findBERAPerToken(token: Token): BigDecimal {
  if (token.id == WBERA_ADDRESS) {
    return ONE_BD
  }
  
  // Chercher meilleure route via pools liquides
  let beraPool = getBeraPool(token)
  if (beraPool !== null) {
    return calculatePriceFromPool(beraPool, token)
  }
  
  return ZERO_BD
}

export function convertTokenToDecimal(amount: BigInt, decimals: i32): BigDecimal {
  return amount.toBigDecimal().div(exponentToBigDecimal(decimals))
}
```

#### Agrégation données
```typescript
export function updatePoolDayData(event: ethereum.Event, pool: Pool, volumeUSD: BigDecimal): void {
  let dayID = event.block.timestamp.toI32() / 86400
  let poolDayDataID = pool.id.concat('-').concat(dayID.toString())
  
  let poolDayData = PoolDayData.load(poolDayDataID)
  if (poolDayData === null) {
    poolDayData = new PoolDayData(poolDayDataID)
    poolDayData.pool = pool.id
    poolDayData.date = dayID
    poolDayData.volumeUSD = ZERO_BD
    poolDayData.feesUSD = ZERO_BD
    poolDayData.txCount = ZERO_BI
  }
  
  poolDayData.volumeUSD = poolDayData.volumeUSD.plus(volumeUSD)
  poolDayData.feesUSD = poolDayData.feesUSD.plus(volumeUSD.times(pool.fee.toBigDecimal().div(BigDecimal.fromString('1000000'))))
  poolDayData.txCount = poolDayData.txCount.plus(ONE_BI)
  poolDayData.tvlUSD = calculatePoolTVL(pool)
  
  poolDayData.save()
}
```

## Queries GraphQL optimisées

### Dashboard principal
```graphql
query DashboardData($timestamp24h: Int!) {
  # Pools les plus actifs
  pools(first: 10, orderBy: volumeUSD, orderDirection: desc) {
    id
    token0 { symbol }
    token1 { symbol }
    volumeUSD
    tvlUSD
    feesUSD
  }
  
  # Stats 24h
  berachainDayData(
    where: { date_gte: $timestamp24h }
    orderBy: date
    orderDirection: desc
    first: 1
  ) {
    volumeUSD
    tvlUSD
    feesUSD
  }
}
```

### Position tracking
```graphql
query UserPositions($user: Bytes!) {
  positions(where: { owner: $user }) {
    id
    tokenId
    pool {
      token0 { symbol }
      token1 { symbol }
      fee
      sqrtPrice
      tick
    }
    tickLower
    tickUpper
    liquidity
    depositedToken0
    depositedToken1
    collectedFeesToken0
    collectedFeesToken1
  }
}
```

### Analytics pool
```graphql
query PoolAnalytics($pool: String!, $timestamp: Int!) {
  pool(id: $pool) {
    token0 { symbol, decimals }
    token1 { symbol, decimals }
    sqrtPrice
    tick
    liquidity
  }
  
  swaps(
    where: { pool: $pool, timestamp_gte: $timestamp }
    orderBy: timestamp
    orderDirection: desc
    first: 100
  ) {
    timestamp
    amount0
    amount1
    amountUSD
    tick
    sender
    recipient
  }
  
  poolHourData(
    where: { pool: $pool, periodStartUnix_gte: $timestamp }
    orderBy: periodStartUnix
    orderDirection: asc
  ) {
    periodStartUnix
    volumeUSD
    tvlUSD
    high
    low
    open
    close
  }
}
```

Ce guide d'indexation fournit la base complète pour construire un subgraph performant qui supportera efficacement les besoins d'une interface DEX moderne.