import { index, onchainTable, relations } from "ponder";

// ============ ENTITIES ============

export const factory = onchainTable("factory", (t) => ({
  id: t.hex().primaryKey(), // address
  poolCount: t.integer().notNull().default(0),
  txCount: t.integer().notNull().default(0),
  totalVolumeBERA: t.numeric().notNull().default("0"),
  totalVolumeUSD: t.numeric().notNull().default("0"),
  totalFeesBERA: t.numeric().notNull().default("0"),
  totalFeesUSD: t.numeric().notNull().default("0"),
  untrackedVolumeUSD: t.numeric().notNull().default("0"),
  totalValueLockedBERA: t.numeric().notNull().default("0"),
  totalValueLockedUSD: t.numeric().notNull().default("0"),
  owner: t.hex().notNull(),

  totalValueLockedBERAUntracked: t.bigint().notNull().default(0n),
  totalValueLockedUSDUntracked: t.numeric().notNull().default("0"),
}))

export const token = onchainTable("token", (t) => ({
  id: t.hex().primaryKey(), // Adresse
  symbol: t.text().notNull(),
  name: t.text().notNull(),
  decimals: t.integer().notNull(),
  totalSupply: t.bigint().notNull().default(0n),
  txCount: t.integer().notNull().default(0),
  poolCount: t.integer().notNull().default(0),
  whitelistPools: t.json().$type<string[]>().notNull().default([]),
  volume: t.bigint().notNull().default(0n),
  volumeUSD: t.numeric().notNull().default("0"),
  untrackedVolumeUSD: t.numeric().notNull().default("0"),
  feesUSD: t.numeric().notNull().default("0"),
  totalValueLocked: t.numeric().notNull().default("0"),
  totalValueLockedUSD: t.numeric().notNull().default("0"),
  derivedBERA: t.numeric().notNull().default("0"),

  totalValueLockedUSDUntracked: t.numeric().notNull().default("0"),
}), (table) => ({
  symbolIndex: index().on(table.symbol),
  nameIndex: index().on(table.name),
}));

export const pool = onchainTable("pool", (t) => ({
  id: t.hex().primaryKey(), // Adresse
  createdAtTimestamp: t.bigint().notNull(),
  createdAtBlockNumber: t.bigint().notNull(),
  token0: t.hex().notNull(),
  token1: t.hex().notNull(),
  feeTier: t.integer().notNull(),
  liquidity: t.bigint().notNull().default(0n),
  sqrtPrice: t.bigint().notNull().default(0n),
  tick: t.integer(),
  observationIndex: t.integer().notNull().default(0),
  volumeToken0: t.bigint().notNull().default(0n),
  volumeToken1: t.bigint().notNull().default(0n),
  volumeUSD: t.numeric().notNull().default("0"),
  untrackedVolumeUSD: t.numeric().notNull().default("0"),
  feesUSD: t.numeric().notNull().default("0"),
  txCount: t.integer().notNull().default(0),
  collectedFeesToken0: t.bigint().notNull().default(0n),
  collectedFeesToken1: t.bigint().notNull().default(0n),
  collectedFeesUSD: t.numeric().notNull().default("0"),
  totalValueLockedToken0: t.bigint().notNull().default(0n),
  totalValueLockedToken1: t.bigint().notNull().default(0n),
  totalValueLockedUSD: t.numeric().notNull().default("0"),
  totalValueLockedBERA: t.numeric().notNull().default("0"),
  token0Price: t.numeric().notNull().default("0"),
  token1Price: t.numeric().notNull().default("0"),
  liquidityProviderCount: t.integer().notNull().default(0),

  totalValueLockedUSDUntracked: t.numeric().notNull().default("0"),
  feeGrowthGlobal1X128: t.bigint().notNull().default(0n),
  feeGrowthGlobal0X128: t.bigint().notNull().default(0n),
}), (table) => ({
  token0Index: index().on(table.token0),
  token1Index: index().on(table.token1),
  feeTierIndex: index().on(table.feeTier),
}));

export const transaction = onchainTable("transaction", (t) => ({
  id: t.hex().primaryKey(), // tx hash
  blockNumber: t.bigint().notNull(),
  timestamp: t.bigint().notNull(),
  gasUsed: t.bigint().notNull(),
  gasPrice: t.bigint().notNull(),
  from: t.hex().notNull(),
  mints: t.json().$type<string[]>().notNull().default([]),
  swaps: t.json().$type<string[]>().notNull().default([]),
  burns: t.json().$type<string[]>().notNull().default([]),
  collects: t.json().$type<string[]>().notNull().default([]),
  flashes: t.json().$type<string[]>().notNull().default([]),
}), (table) => ({
  timestampIndex: index().on(table.timestamp),
  fromIndex: index().on(table.from),
}));

export const tick = onchainTable("tick", (t) => ({
  id: t.text().primaryKey(), // pool address + "#" + tick index
  poolAddress: t.hex().notNull(),
  tickIdx: t.integer().notNull(), // Index du tick (-887272 à 887272)
  pool: t.hex().notNull(),
  liquidityGross: t.bigint().notNull().default(0n), // Liquidité totale qui utilise ce tick comme borne
  liquidityNet: t.bigint().notNull().default(0n), // Changement net de liquidité quand le prix traverse ce tick
  // Positif = tick est utilisé comme tickLower
  // Négatif = tick est utilisé comme tickUpper
  price0: t.numeric().notNull().default("0"), // Prix de token0 en termes de token1 à ce tick
  price1: t.numeric().notNull().default("0"), // Prix de token1 en termes de token0 à ce tick
  volumeToken0: t.bigint().notNull().default(0n), // Volume total de token0 échangé à ce tick
  volumeToken1: t.bigint().notNull().default(0n), // Volume total de token1 échangé à ce tick
  volumeUSD: t.numeric().notNull().default("0"),
  untrackedVolumeUSD: t.numeric().notNull().default("0"),
  feesUSD: t.numeric().notNull().default("0"),
  collectedFeesToken0: t.bigint().notNull().default(0n),
  collectedFeesToken1: t.bigint().notNull().default(0n),
  collectedFeesUSD: t.numeric().notNull().default("0"),
  createdAtTimestamp: t.bigint().notNull(), // Première fois que ce tick a été initialisé
  createdAtBlockNumber: t.bigint().notNull(),
  liquidityProviderCount: t.integer().notNull().default(0), // Nombre de positions utilisant ce tick
  feeGrowthOutside0X128: t.bigint().notNull().default(0n), // Fees token0 accumulés "à l'extérieur" de ce tick
  feeGrowthOutside1X128: t.bigint().notNull().default(0n), // Fees token1 accumulés "à l'extérieur" de ce tick
}), (table) => ({
  poolIndex: index().on(table.pool),
  tickIdxIndex: index().on(table.tickIdx),
}));

export const position = onchainTable("position", (t) => ({
  id: t.text().primaryKey(), // NFT tokenId
  owner: t.hex().notNull(),
  pool: t.hex().notNull(),
  token0: t.hex().notNull(),
  token1: t.hex().notNull(),
  tickLower: t.hex().notNull(),
  tickUpper: t.hex().notNull(),
  liquidity: t.bigint().notNull().default(0n),
  depositedToken0: t.bigint().notNull().default(0n),
  depositedToken1: t.bigint().notNull().default(0n),
  withdrawnToken0: t.bigint().notNull().default(0n),
  withdrawnToken1: t.bigint().notNull().default(0n),
  collectedFeesToken0: t.bigint().notNull().default(0n),
  collectedFeesToken1: t.bigint().notNull().default(0n),
  transaction: t.hex().notNull(),
  feeGrowthInside0LastX128: t.bigint().notNull().default(0n),
  feeGrowthInside1LastX128: t.bigint().notNull().default(0n),
  tokenId: t.bigint().notNull()
}), (table) => ({
  ownerIndex: index().on(table.owner),
  poolIndex: index().on(table.pool),
}));

export const positionSnapshot = onchainTable("position_snapshot", (t) => ({
  id: t.text().primaryKey(), // position id + "#" + block number
  owner: t.hex().notNull(),
  pool: t.hex().notNull(),
  position: t.text().notNull(),
  timestamp: t.bigint().notNull(),
  blockNumber: t.bigint().notNull(),
  liquidity: t.bigint().notNull().default(0n),
  depositedToken0: t.bigint().notNull().default(0n),
  depositedToken1: t.bigint().notNull().default(0n),
  withdrawnToken0: t.bigint().notNull().default(0n),
  withdrawnToken1: t.bigint().notNull().default(0n),
  collectedFeesToken0: t.bigint().notNull().default(0n),
  collectedFeesToken1: t.bigint().notNull().default(0n),
  transaction: t.hex().notNull(),
  feeGrowthInside0LastX128: t.bigint().notNull().default(0n),
  feeGrowthInside1LastX128: t.bigint().notNull().default(0n),
}), (table) => ({
  positionIndex: index().on(table.position),
  timestampIndex: index().on(table.timestamp),
}));

// ============ EVENTS ============

export const mint = onchainTable("mint", (t) => ({
  id: t.text().primaryKey(), // tx hash + "#" + index
  transaction: t.hex().notNull(),
  timestamp: t.bigint().notNull(),
  pool: t.hex().notNull(),
  token0: t.hex().notNull(),
  token1: t.hex().notNull(),
  owner: t.hex().notNull(),
  sender: t.hex().notNull(),
  origin: t.hex().notNull(),
  amount: t.bigint().notNull(),
  amount0: t.bigint().notNull(),
  amount1: t.bigint().notNull(),
  amountUSD: t.numeric(),
  tickLower: t.integer().notNull(),
  tickUpper: t.integer().notNull(),
  logIndex: t.integer(),
}), (table) => ({
  poolIndex: index().on(table.pool),
  timestampIndex: index().on(table.timestamp),
  ownerIndex: index().on(table.owner),
}));

export const burn = onchainTable("burn", (t) => ({
  id: t.text().primaryKey(), // tx hash + "#" + index
  transaction: t.hex().notNull(),
  timestamp: t.bigint().notNull(),
  pool: t.hex().notNull(),
  token0: t.hex().notNull(),
  token1: t.hex().notNull(),
  owner: t.hex().notNull(),
  origin: t.hex().notNull(),
  amount: t.bigint().notNull(),
  amount0: t.bigint().notNull(),
  amount1: t.bigint().notNull(),
  amountUSD: t.numeric(),
  tickLower: t.integer().notNull(),
  tickUpper: t.integer().notNull(),
  logIndex: t.integer(),
}), (table) => ({
  poolIndex: index().on(table.pool),
  timestampIndex: index().on(table.timestamp),
  ownerIndex: index().on(table.owner),
}));

export const swap = onchainTable("swap", (t) => ({
  id: t.text().primaryKey(), // tx hash + "#" + index
  transaction: t.hex().notNull(),
  timestamp: t.bigint().notNull(),
  pool: t.hex().notNull(),
  token0: t.hex().notNull(),
  token1: t.hex().notNull(),
  sender: t.hex().notNull(),
  recipient: t.hex().notNull(),
  origin: t.hex().notNull(),
  amount0: t.bigint().notNull(), // Can be negative
  amount1: t.bigint().notNull(), // Can be negative
  amountUSD: t.numeric(),
  sqrtPriceX96: t.bigint().notNull(),
  tick: t.integer().notNull(),
  logIndex: t.integer(),

  liquidity: t.bigint().notNull(),
}), (table) => ({
  poolIndex: index().on(table.pool),
  timestampIndex: index().on(table.timestamp),
  senderIndex: index().on(table.sender),
  recipientIndex: index().on(table.recipient),
}));

export const collect = onchainTable("collect", (t) => ({
  id: t.text().primaryKey(), // tx hash + "#" + index
  transaction: t.hex().notNull(),
  timestamp: t.bigint().notNull(),
  pool: t.hex().notNull(),
  owner: t.hex().notNull(),
  amount0: t.bigint().notNull(),
  amount1: t.bigint().notNull(),
  amountUSD: t.numeric(),
  tickLower: t.integer().notNull(),
  tickUpper: t.integer().notNull(),
  logIndex: t.integer(),
}), (table) => ({
  poolIndex: index().on(table.pool),
  timestampIndex: index().on(table.timestamp),
  ownerIndex: index().on(table.owner),
}));

export const flash = onchainTable("flash", (t) => ({
  id: t.text().primaryKey(), // tx hash + "#" + index
  transaction: t.hex().notNull(),
  timestamp: t.bigint().notNull(),
  pool: t.hex().notNull(),
  sender: t.hex().notNull(),
  recipient: t.hex().notNull(),
  amount0: t.bigint().notNull(),
  amount1: t.bigint().notNull(),
  amountUSD: t.numeric(),
  amount0Paid: t.bigint().notNull(),
  amount1Paid: t.bigint().notNull(),
  logIndex: t.integer(),
}), (table) => ({
  poolIndex: index().on(table.pool),
  timestampIndex: index().on(table.timestamp),
}));

// ============ DONNÉES HISTORIQUES ============

export const protocolDayData = onchainTable("uniswap_day_data", (t) => ({
  id: t.integer().primaryKey(), // timestamp / 86400
  date: t.integer().notNull(),
  volumeBERA: t.numeric().notNull().default("0"),
  volumeUSD: t.numeric().notNull().default("0"),
  volumeUSDUntracked: t.numeric().notNull().default("0"),
  feesBERA: t.numeric().notNull().default("0"),
  feesUSD: t.numeric().notNull().default("0"),
  txCount: t.integer().notNull().default(0),
  tvlUSD: t.numeric().notNull().default("0"),
}), (table) => ({
  dateIndex: index().on(table.date),
}));

export const poolDayData = onchainTable("pool_day_data", (t) => ({
  id: t.text().primaryKey(), // pool address + "-" + day id
  date: t.integer().notNull(),
  pool: t.hex().notNull(),
  liquidity: t.bigint().notNull().default(0n),
  sqrtPrice: t.bigint().notNull().default(0n),
  token0Price: t.numeric().notNull().default("0"),
  token1Price: t.numeric().notNull().default("0"),
  tick: t.integer(),
  feeGrowthGlobal0X128: t.bigint().notNull().default(0n),
  feeGrowthGlobal1X128: t.bigint().notNull().default(0n),
  tvlUSD: t.numeric().notNull().default("0"),
  volumeToken0: t.numeric().notNull().default("0"),
  volumeToken1: t.numeric().notNull().default("0"),
  volumeUSD: t.numeric().notNull().default("0"),
  feesUSD: t.numeric().notNull().default("0"),
  txCount: t.integer().notNull().default(0),
  open: t.numeric().notNull().default("0"),
  high: t.numeric().notNull().default("0"),
  low: t.numeric().notNull().default("0"),
  close: t.numeric().notNull().default("0"),
}), (table) => ({
  dateIndex: index().on(table.date),
  poolIndex: index().on(table.pool),
  compoundIndex: index().on(table.pool, table.date),
}));

export const poolHourData = onchainTable("pool_hour_data", (t) => ({
  id: t.text().primaryKey(), // pool address + "-" + hour id
  periodStartUnix: t.integer().notNull(),
  pool: t.hex().notNull(),
  liquidity: t.bigint().notNull().default(0n),
  sqrtPrice: t.bigint().notNull().default(0n),
  token0Price: t.numeric().notNull().default("0"),
  token1Price: t.numeric().notNull().default("0"),
  tick: t.integer(),
  feeGrowthGlobal0X128: t.bigint().notNull().default(0n),
  feeGrowthGlobal1X128: t.bigint().notNull().default(0n),
  tvlUSD: t.numeric().notNull().default("0"),
  volumeToken0: t.numeric().notNull().default("0"),
  volumeToken1: t.numeric().notNull().default("0"),
  volumeUSD: t.numeric().notNull().default("0"),
  feesUSD: t.numeric().notNull().default("0"),
  txCount: t.integer().notNull().default(0),
  open: t.numeric().notNull().default("0"),
  high: t.numeric().notNull().default("0"),
  low: t.numeric().notNull().default("0"),
  close: t.numeric().notNull().default("0"),
}), (table) => ({
  periodIndex: index().on(table.periodStartUnix),
  poolIndex: index().on(table.pool),
}));

export const tokenDayData = onchainTable("token_day_data", (t) => ({
  id: t.text().primaryKey(), // token address + "-" + day id
  date: t.integer().notNull(),
  token: t.hex().notNull(),
  volume: t.numeric().notNull().default("0"),
  volumeUSD: t.numeric().notNull().default("0"),
  untrackedVolumeUSD: t.numeric().notNull().default("0"),
  totalValueLocked: t.numeric().notNull().default("0"),
  totalValueLockedUSD: t.numeric().notNull().default("0"),
  priceUSD: t.numeric().notNull().default("0"),
  feesUSD: t.numeric().notNull().default("0"),
  open: t.numeric().notNull().default("0"),
  high: t.numeric().notNull().default("0"),
  low: t.numeric().notNull().default("0"),
  close: t.numeric().notNull().default("0"),
}), (table) => ({
  dateIndex: index().on(table.date),
  tokenIndex: index().on(table.token),
}));

export const tokenHourData = onchainTable("token_hour_data", (t) => ({
  id: t.text().primaryKey(), // token address + "-" + hour id
  periodStartUnix: t.integer().notNull(),
  token: t.hex().notNull(),
  volume: t.numeric().notNull().default("0"),
  volumeUSD: t.numeric().notNull().default("0"),
  untrackedVolumeUSD: t.numeric().notNull().default("0"),
  totalValueLocked: t.numeric().notNull().default("0"),
  totalValueLockedUSD: t.numeric().notNull().default("0"),
  priceUSD: t.numeric().notNull().default("0"),
  feesUSD: t.numeric().notNull().default("0"),
  open: t.numeric().notNull().default("0"),
  high: t.numeric().notNull().default("0"),
  low: t.numeric().notNull().default("0"),
  close: t.numeric().notNull().default("0"),
}), (table) => ({
  periodIndex: index().on(table.periodStartUnix),
  tokenIndex: index().on(table.token),
}));

export const tickDayData = onchainTable("tick_day_data", (t) => ({
  id: t.text().primaryKey(), // pool address + "-" + tick + "-" + day id
  date: t.integer().notNull(),
  pool: t.hex().notNull(),
  tick: t.hex().notNull(),
  liquidityGross: t.bigint().notNull().default(0n),
  liquidityNet: t.bigint().notNull().default(0n),
  volumeToken0: t.numeric().notNull().default("0"),
  volumeToken1: t.numeric().notNull().default("0"),
  volumeUSD: t.numeric().notNull().default("0"),
  feesUSD: t.numeric().notNull().default("0"),
  feeGrowthOutside0X128: t.bigint().notNull().default(0n),
  feeGrowthOutside1X128: t.bigint().notNull().default(0n),
}), (table) => ({
  dateIndex: index().on(table.date),
  poolIndex: index().on(table.pool),
  tickIndex: index().on(table.tick),
}));

export const tickHourData = onchainTable("tick_hour_data", (t) => ({
  id: t.text().primaryKey(), // pool address + "-" + tick + "-" + hour id
  periodStartUnix: t.integer().notNull(),
  pool: t.hex().notNull(),
  tick: t.hex().notNull(),
  liquidityGross: t.bigint().notNull().default(0n),
  liquidityNet: t.bigint().notNull().default(0n),
  volumeToken0: t.numeric().notNull().default("0"),
  volumeToken1: t.numeric().notNull().default("0"),
  volumeUSD: t.numeric().notNull().default("0"),
  feesUSD: t.numeric().notNull().default("0"),
  feeGrowthOutside0X128: t.bigint().notNull().default(0n),
  feeGrowthOutside1X128: t.bigint().notNull().default(0n),
}), (table) => ({
  periodIndex: index().on(table.periodStartUnix),
  poolIndex: index().on(table.pool),
  tickIndex: index().on(table.tick),
}));

// ============ RELATIONS ============

export const poolRelations = relations(pool, ({ one, many }) => ({
  token0Ref: one(token, {
    fields: [pool.token0],
    references: [token.id],
  }),
  token1Ref: one(token, {
    fields: [pool.token1],
    references: [token.id],
  }),
  mints: many(mint),
  burns: many(burn),
  swaps: many(swap),
  collects: many(collect),
  ticks: many(tick),
  positions: many(position),
  poolDayData: many(poolDayData),
  poolHourData: many(poolHourData),
}));
export const mintPoolRelations = relations(mint, ({ one }) => ({
  pool: one(pool, {
    fields: [mint.pool],
    references: [pool.id]
  })
}))
export const burnPoolRelations = relations(burn, ({ one }) => ({
  pool: one(pool, {
    fields: [burn.pool],
    references: [pool.id]
  })
}))
export const swapPoolRelations = relations(swap, ({ one }) => ({
  pool: one(pool, {
    fields: [swap.pool],
    references: [pool.id]
  })
}))
export const collectPoolRelations = relations(collect, ({ one }) => ({
  pool: one(pool, {
    fields: [collect.pool],
    references: [pool.id]
  })
}))
export const tickPoolRelations = relations(tick, ({ one }) => ({
  pool: one(pool, {
    fields: [tick.pool],
    references: [pool.id]
  })
}))
export const positionPoolRelations = relations(position, ({ one }) => ({
  pool: one(pool, {
    fields: [position.pool],
    references: [pool.id]
  })
}))
export const poolHourRelations = relations(poolHourData, ({ one }) => ({
  pool: one(pool, {
    fields: [poolHourData.pool],
    references: [pool.id]
  })
}))
export const poolDayRelations = relations(poolDayData, ({ one }) => ({
  pool: one(pool, {
    fields: [poolDayData.pool],
    references: [pool.id]
  })
}))

export const tokenRelations = relations(token, ({ many }) => ({
  poolsAsToken0: many(pool),
  poolsAsToken1: many(pool),
  tokenDayData: many(tokenDayData),
  tokenHourData: many(tokenHourData),
}));
export const tokenDayRelations = relations(tokenDayData, ({ one }) => ({
  token: one(token, {
    fields: [tokenDayData.token],
    references: [token.id]
  })
}))
export const tokenHourRelations = relations(tokenHourData, ({ one }) => ({
  token: one(token, {
    fields: [tokenHourData.token],
    references: [token.id]
  })
}))

export const positionRelations = relations(position, ({ one, many }) => ({
  poolRef: one(pool, {
    fields: [position.pool],
    references: [pool.id],
  }),
  snapshots: many(positionSnapshot),
}));
export const snapshotsPositionRelations = relations(positionSnapshot, ({ one }) => ({
  position: one(position, {
    fields: [positionSnapshot.position],
    references: [position.id]
  })
}))

export const transactionRelations = relations(transaction, ({ many }) => ({
  mints: many(mint),
  burns: many(burn),
  swaps: many(swap),
  collects: many(collect),
  flashes: many(flash),
}));
export const mintTxRelations = relations(mint, ({ one }) => ({
  transaction: one(transaction, {
    fields: [mint.transaction],
    references: [transaction.id]
  })
}))
export const burnTxRelations = relations(burn, ({ one }) => ({
  transaction: one(transaction, {
    fields: [burn.transaction],
    references: [transaction.id]
  })
}))
export const swapsTxRelations = relations(swap, ({ one }) => ({
  transaction: one(transaction, {
    fields: [swap.transaction],
    references: [transaction.id]
  })
}))
export const collectTxRelations = relations(collect, ({ one }) => ({
  transaction: one(transaction, {
    fields: [collect.transaction],
    references: [transaction.id]
  })
}))
export const flashTxRelations = relations(flash, ({ one }) => ({
  transaction: one(transaction, {
    fields: [flash.transaction],
    references: [transaction.id]
  })
}))







// Old

// export const pools = onchainTable("pools", (t) => ({
//   address: t.text().primaryKey(),
//   token0Address: t.text().notNull(),
//   token1Address: t.text().notNull(),
//   tickSpacing: t.integer(),
//   fee: t.integer(),
//   createdAt: t.bigint().notNull(),
//   createdAtBlock: t.bigint().notNull(),
// }));
//
// export const poolsRelations = relations(pools, ({ many }) => ({
//   swaps: many(swaps),
//   positions: many(positions),
//   liquidityEvent: many(liquidityEvent)
// }))
//
// export const swaps = onchainTable("swaps", (t) => ({
//   id: t.text().primaryKey(),
//   poolAddress: t.text(),
//   sender: t.text().notNull(),
//   recipient: t.text().notNull(),
//   amount0: t.bigint().notNull(),
//   amount1: t.bigint().notNull(),
//   sqrtPriceX96: t.bigint().notNull(),
//   liquidity: t.bigint().notNull(),
//   tick: t.integer().notNull(),
//   createdAt: t.bigint().notNull(),
//   blockNumber: t.bigint().notNull(),
//   transactionHash: t.text().notNull(),
// }));
//
// export const swapsRelations = relations(swaps, ({ one }) => ({
//   pool: one(pools, { fields: [swaps.poolAddress], references: [pools.address] })
// }))
//
// export const positions = onchainTable("positions", (t) => ({
//   poolAddress: t.text(),
//   owner: t.text().notNull(),
//   tickLower: t.integer().notNull(),
//   tickUpper: t.integer().notNull(),
//   liquidity: t.bigint().notNull(),
//   amount0: t.bigint().notNull(),
//   amount1: t.bigint().notNull(),
//   createdAt: t.bigint().notNull(),
//   updatedAt: t.bigint().notNull(),
//   sender: t.text(),
//   tokenId: t.text()
// }), (table) => ({ pk: primaryKey({ columns: [table.poolAddress, table.owner, table.tickLower, table.tickUpper] }) }))
//
// export const positionsRelations = relations(positions, ({ one }) => ({
//   pool: one(pools, { fields: [positions.poolAddress], references: [pools.address] })
// }))
//
// export const liquidityEventTypeEnum = onchainEnum("type", ["MINT", "BURN"])
// export const liquidityEvent = onchainTable("liquidity_events", (t) => ({
//   id: t.text().primaryKey(),
//   poolAddress: t.text(),
//   owner: t.text().notNull(),
//   type: liquidityEventTypeEnum("type"),
//   tickLower: t.integer().notNull(),
//   tickUpper: t.integer().notNull(),
//   amount: t.bigint().notNull(),
//   amount0: t.bigint().notNull(),
//   amount1: t.bigint().notNull(),
//   createdAt: t.bigint().notNull(),
//   blockNumber: t.bigint().notNull(),
//   transactionHash: t.text().notNull(),
//   tokenId: t.text()
// }))
//
// export const liquidityEventRelations = relations(liquidityEvent, ({ one }) => ({
//   pool: one(pools, { fields: [liquidityEvent.poolAddress], references: [pools.address] })
// }))
