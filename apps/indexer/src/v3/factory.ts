import { ponder } from "ponder:registry";
import { getOrCreateFactory, getOrCreateToken } from "./helpers";
import { bundle, factory, pool, token } from "ponder:schema";

const WHITELIST_TOKENS = [
  "0x6969696969696969696969696969696969696969", // wBera
  "0xfcbd14dc51f0a4d49d5e53c2e0950e0bc26d0dce", // Honey
  "0x118d2ceee9785eaf70c15cd74cd84c9f8c3eec9a", // sWBera
  "0x9b6761bf2397Bb5a6624a856cC84A3A14Dcd3fe5 ", // iBera
  "0xac03CABA51e17c86c921E1f6CBFBdC91F8BB2E6b", // iBGT
  "0x1ce0a25d13ce4d52071ae7e02cf1f6606f4c79d3", // NECT
  "0x549943e04f40284185054145c6E4e9568C1D3241", // USDC.e
  "0x2F6F07CDcf3588944Bf4C42aC74ff24bF56e7590", // WETH
  "0x1ce0a25d13ce4d52071ae7e02cf1f6606f4c79d3", // NECT

]

ponder.on("v3Factory:PoolCreated", async ({ event, context }) => {
  // Load factory
  const factoryEntity = await getOrCreateFactory(context, event.log.address);

  // Load tokens
  const token0Entity = await getOrCreateToken(context, event.args.token0);
  const token1Entity = await getOrCreateToken(context, event.args.token1);

  // Create bundle is not exist
  const b = await context.db.find(bundle, { id: '1' })
  if (!b) {
    await context.db.insert(bundle).values({
      id: "1",
      beraPriceUSD: "0"
    });
  }

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

    volumeToken0: "0",
    volumeToken1: "0",
    collectedFeesToken0: "0",
    collectedFeesToken1: "0",
    totalValueLockedToken0: "0",
    totalValueLockedToken1: "0",
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
        whitelistPools: [...row.whitelistPools, event.args.pool]
      })),
    context.db.update(token, { id: token1Entity.id })
      .set((row) => ({
        poolCount: row.poolCount + 1,
        whitelistPools: [...row.whitelistPools, event.args.pool]
      })),
  ]);
})
