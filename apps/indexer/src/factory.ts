import { ponder } from "ponder:registry";
import { getOrCreateFactory, getOrCreateToken } from "./helpers";
import { factory, pool, token } from "ponder:schema";
import { logFactory, logDebug } from "./utils/logger";

ponder.on("WinnieFactory:PoolCreated", async ({ event, context }) => {
  const logContext = {
    event: 'factory',
    pool: event.args.pool,
    token0: event.args.token0,
    token1: event.args.token1,
    txHash: event.transaction.hash,
    blockNumber: event.block.number
  }

  logDebug(logContext, "Processing PoolCreated event", {
    fee: event.args.fee,
    tickSpacing: event.args.tickSpacing
  })

  // Load factory
  const factoryEntity = await getOrCreateFactory(context, event.log.address);

  // Load tokens
  const token0Entity = await getOrCreateToken(context, event.args.token0);
  const token1Entity = await getOrCreateToken(context, event.args.token1);

  // Create pool
  await context.db.insert(pool).values({
    id: event.args.pool,
    createdAtTimestamp: BigInt(event.block.timestamp),
    createdAtBlockNumber: BigInt(event.block.number),
    token0: event.args.token0,
    token1: event.args.token1,
    feeTier: Number(event.args.fee),

    liquidity: 0n,
    sqrtPrice: 0n,
    feeGrowthGlobal0X128: 0n,
    feeGrowthGlobal1X128: 0n,
    tick: null,
    observationIndex: 0,

    volumeToken0: 0n,
    volumeToken1: 0n,
    collectedFeesToken0: 0n,
    collectedFeesToken1: 0n,
    totalValueLockedToken0: 0n,
    totalValueLockedToken1: 0n,
    totalValueLockedBERA: "0",

    token0Price: "0",
    token1Price: "0",
    volumeUSD: "0",
    untrackedVolumeUSD: "0",
    feesUSD: "0",
    collectedFeesUSD: "0",
    totalValueLockedUSD: "0",
    totalValueLockedUSDUntracked: "0",

    txCount: 0,
    liquidityProviderCount: 0,
  });

  // Update pool count of factory
  await context.db.update(factory, { id: factoryEntity.id }).set((r) => ({
    poolCount: r.poolCount + 1
  }))

  // Update pool count for each token
  await Promise.all([
    context.db.update(token, { id: token0Entity.id })
      .set((row) => ({
        poolCount: row.poolCount + 1,
        whitelistPools: [...row.whitelistPools, event.args.pool],
      })),
    context.db.update(token, { id: token1Entity.id })
      .set((row) => ({
        poolCount: row.poolCount + 1,
        whitelistPools: [...row.whitelistPools, event.args.pool],
      })),
  ]);

  logFactory(logContext, {
    poolAddress: event.args.pool,
    token0Symbol: token0Entity.symbol,
    token1Symbol: token1Entity.symbol,
    fee: event.args.fee,
    tickSpacing: event.args.tickSpacing,
    factoryPoolCount: factoryEntity.poolCount + 1,
    token0PoolCount: token0Entity.poolCount + 1,
    token1PoolCount: token1Entity.poolCount + 1
  })
})
