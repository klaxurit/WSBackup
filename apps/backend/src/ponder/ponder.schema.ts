import { relations } from 'drizzle-orm';
import {
  bigint,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  text,
} from 'drizzle-orm/pg-core';

export const pools = pgTable('pools', {
  address: text().primaryKey(),
  token0Address: text().notNull(),
  token1Address: text().notNull(),
  tickSpacing: integer(),
  fee: integer(),
  createdAt: bigint({ mode: 'bigint' }).notNull(),
  createdAtBlock: bigint({ mode: 'bigint' }).notNull(),
});

export const poolsRelations = relations(pools, ({ many }) => ({
  swaps: many(swaps),
  positions: many(positions),
  liquidityEvent: many(liquidityEvent),
}));

export const swaps = pgTable('swaps', {
  id: text().primaryKey(),
  poolAddress: text(),
  sender: text().notNull(),
  recipient: text().notNull(),
  amount0: bigint({ mode: 'bigint' }).notNull(),
  amount1: bigint({ mode: 'bigint' }).notNull(),
  sqrtPriceX96: bigint({ mode: 'bigint' }).notNull(),
  liquidity: bigint({ mode: 'bigint' }).notNull(),
  tick: integer().notNull(),
  createdAt: bigint({ mode: 'bigint' }).notNull(),
  blockNumber: bigint({ mode: 'bigint' }).notNull(),
  transactionHash: text().notNull(),
});

export const swapsRelations = relations(swaps, ({ one }) => ({
  pool: one(pools, {
    fields: [swaps.poolAddress],
    references: [pools.address],
  }),
}));

export const positions = pgTable(
  'positions',
  {
    poolAddress: text(),
    owner: text().notNull(),
    tickLower: integer().notNull(),
    tickUpper: integer().notNull(),
    liquidity: bigint({ mode: 'bigint' }).notNull(),
    amount0: bigint({ mode: 'bigint' }).notNull(),
    amount1: bigint({ mode: 'bigint' }).notNull(),
    createdAt: bigint({ mode: 'bigint' }).notNull(),
    updatedAt: bigint({ mode: 'bigint' }).notNull(),
  },
  (table) => [
    primaryKey({
      columns: [
        table.poolAddress,
        table.owner,
        table.tickLower,
        table.tickUpper,
      ],
    }),
  ],
);

export const positionsRelations = relations(positions, ({ one }) => ({
  pool: one(pools, {
    fields: [positions.poolAddress],
    references: [pools.address],
  }),
}));

export const liquidityEventTypeEnum = pgEnum('type', ['MINT', 'BURN']);
export const liquidityEvent = pgTable('liquidity_events', {
  id: text().primaryKey(),
  poolAddress: text(),
  owner: text().notNull(),
  type: liquidityEventTypeEnum('type'),
  tickLower: integer().notNull(),
  tickUpper: integer().notNull(),
  amount: bigint({ mode: 'bigint' }).notNull(),
  amount0: bigint({ mode: 'bigint' }).notNull(),
  amount1: bigint({ mode: 'bigint' }).notNull(),
  createdAt: bigint({ mode: 'bigint' }).notNull(),
  blockNumber: bigint({ mode: 'bigint' }).notNull(),
  transactionHash: text().notNull(),
});

export const liquidityEventRelations = relations(liquidityEvent, ({ one }) => ({
  pool: one(pools, {
    fields: [liquidityEvent.poolAddress],
    references: [pools.address],
  }),
}));
