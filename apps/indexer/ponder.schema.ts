import { onchainTable, relations } from "ponder";

export const pools = onchainTable("i_pools", (t) => ({
  address: t.text().primaryKey(),
  token0: t.text().notNull(),
  token1: t.text().notNull(),
  fee: t.integer(),
  tvlUSD: t.real().default(0),
  volume24h: t.real().default(0),
  createdAt: t.timestamp().notNull(),
  createdAtBlock: t.bigint().notNull(),
}));
export const poolsRelations = relations(pools, ({ many }) => ({
  swaps: many(swaps)
}))

export const swaps = onchainTable("i_swaps", (t) => ({
  id: t.text().primaryKey(),
  poolAddress: t.text(),
  sender: t.text().notNull(),
  recipient: t.text().notNull(),
  amount0: t.bigint().notNull(),
  amount1: t.bigint().notNull(),
  timestamp: t.timestamp().notNull(),
  blockNumber: t.bigint().notNull(),
  transactionHash: t.text().notNull(),
}));
export const swapsRelations = relations(swaps, ({ one }) => ({
  pool: one(pools, { fields: [swaps.poolAddress], references: [pools.address] })
}))
