import { InferSelectModel } from 'drizzle-orm';
import {
  bigint,
  integer,
  pgTable,
  text
} from 'drizzle-orm/pg-core';

export const pool = pgTable('pool', {
  id: text().primaryKey(), // Adresse
  createdAtTimestamp: bigint({ mode: 'bigint' }).notNull(),
  createdAtBlockNumber: bigint({ mode: 'bigint' }).notNull(),
  token0: text().notNull(),
  token1: text().notNull(),
  feeTier: integer().notNull(),
  liquidity: bigint({ mode: 'bigint' }).notNull().default(0n),
  sqrtPrice: bigint({ mode: 'bigint' }).notNull().default(0n),
  tick: integer(),
  observationIndex: integer().notNull().default(0),
  volumeToken0: text().notNull().default("0"),
  volumeToken1: text().notNull().default("0"),
  volumeUSD: text().notNull().default("0"),
  untrackedVolumeUSD: text().notNull().default("0"),
  feesUSD: text().notNull().default("0"),
  txCount: integer().notNull().default(0),
  collectedFeesToken0: text().notNull().default("0"),
  collectedFeesToken1: text().notNull().default("0"),
  collectedFeesUSD: text().notNull().default("0"),
  totalValueLockedToken0: text().notNull().default("0"),
  totalValueLockedToken1: text().notNull().default("0"),
  totalValueLockedUSD: text().notNull().default("0"),
  totalValueLockedBERA: text().notNull().default("0"),
  token0Price: text().notNull().default("0"),
  token1Price: text().notNull().default("0"),
  liquidityProviderCount: integer().notNull().default(0),

  totalValueLockedUSDUntracked: text().notNull().default("0"),
  feeGrowthGlobal1X128: bigint({ mode: 'bigint' }).notNull().default(0n),
  feeGrowthGlobal0X128: bigint({ mode: 'bigint' }).notNull().default(0n),
});

export type Pool = InferSelectModel<typeof pool>;