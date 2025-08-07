import { onchainEnum, onchainTable, primaryKey, relations } from "ponder";

export const pools = onchainTable("pools", (t) => ({
  address: t.text().primaryKey(),
  token0Address: t.text().notNull(),
  token1Address: t.text().notNull(),
  tickSpacing: t.integer(),
  fee: t.integer(),
  createdAt: t.bigint().notNull(),
  createdAtBlock: t.bigint().notNull(),
}));

export const poolsRelations = relations(pools, ({ many }) => ({
  swaps: many(swaps),
  positions: many(positions),
  liquidityEvent: many(liquidityEvent)
}))

export const swaps = onchainTable("swaps", (t) => ({
  id: t.text().primaryKey(),
  poolAddress: t.text(),
  sender: t.text().notNull(),
  recipient: t.text().notNull(),
  amount0: t.bigint().notNull(),
  amount1: t.bigint().notNull(),
  sqrtPriceX96: t.bigint().notNull(),
  liquidity: t.bigint().notNull(),
  tick: t.integer().notNull(),
  createdAt: t.bigint().notNull(),
  blockNumber: t.bigint().notNull(),
  transactionHash: t.text().notNull(),
}));

export const swapsRelations = relations(swaps, ({ one }) => ({
  pool: one(pools, { fields: [swaps.poolAddress], references: [pools.address] })
}))

export const positions = onchainTable("positions", (t) => ({
  poolAddress: t.text(),
  owner: t.text().notNull(),
  tickLower: t.integer().notNull(),
  tickUpper: t.integer().notNull(),
  liquidity: t.bigint().notNull(),
  amount0: t.bigint().notNull(),
  amount1: t.bigint().notNull(),
  createdAt: t.bigint().notNull(),
  updatedAt: t.bigint().notNull()
}), (table) => ({ pk: primaryKey({ columns: [table.poolAddress, table.owner, table.tickLower, table.tickUpper] }) }))

export const positionsRelations = relations(positions, ({ one }) => ({
  pool: one(pools, { fields: [positions.poolAddress], references: [pools.address] })
}))

export const liquidityEventTypeEnum = onchainEnum("type", ["MINT", "BURN"])
export const liquidityEvent = onchainTable("liquidity_events", (t) => ({
  id: t.text().primaryKey(),
  poolAddress: t.text(),
  owner: t.text().notNull(),
  type: liquidityEventTypeEnum("type"),
  tickLower: t.integer().notNull(),
  tickUpper: t.integer().notNull(),
  amount: t.bigint().notNull(),
  amount0: t.bigint().notNull(),
  amount1: t.bigint().notNull(),
  createdAt: t.bigint().notNull(),
  blockNumber: t.bigint().notNull(),
  transactionHash: t.text().notNull(),
}))

export const liquidityEventRelations = relations(liquidityEvent, ({ one }) => ({
  pool: one(pools, { fields: [liquidityEvent.poolAddress], references: [pools.address] })
}))
