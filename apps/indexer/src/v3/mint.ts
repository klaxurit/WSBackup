import { ponder } from "ponder:registry";
import { bundle, factory as sFactory, mint as sMint, pool as sPool, tick as sTick, token as sToken, transaction as sTransaction } from "ponder:schema";
import { getOrCreateTransaction, getTickId } from "./helpers";
import { CONTRACTS } from "@repo/contracts";
import Decimal from "decimal.js";
import { updateProtocolDayData } from "../stats/porotocolDay";
import { updatePoolStats } from "../stats/pool";
import { updateTokenStats } from "../stats/token";
import { formatUnits } from "viem";

ponder.on("v3Pool:Mint", async ({ event, context }) => {
  const factoryEntity = await context.db.find(sFactory, { id: CONTRACTS.FACTORY });
  if (!factoryEntity) return;
  const factory = { ...factoryEntity }

  let poolEntity = await context.db.find(sPool, { id: event.log.address });
  if (!poolEntity) return;
  const pool = { ...poolEntity }
  // const debug = pool.id === "0xc224af3a407ddf03867eec22162a9d39345ec88b"
  const debug = false

  let token0Entity = await context.db.find(sToken, { id: poolEntity.token0 })
  let token1Entity = await context.db.find(sToken, { id: poolEntity.token1 })
  if (!token0Entity || !token1Entity) return
  const token0 = { ...token0Entity }
  const token1 = { ...token1Entity }

  // const logContext = {
  //   event: 'mint',
  //   pool: pool.id,
  //   token0: token0.symbol,
  //   token1: token1.symbol,
  //   txHash: event.transaction.hash,
  //   blockNumber: event.block.number
  // }

  // logDebug(logContext, "Processing Mint event", {
  //   token0Symbol: token0.symbol,
  //   token1Symbol: token1.symbol,
  //   poolId: pool.id,
  //   tickLower: event.args.tickLower.toString(),
  //   tickUpper: event.args.tickUpper.toString()
  // })

  const mintId = `${event.transaction.hash}#${event.log.logIndex}`;

  const b = await context.db.find(bundle, { id: "1" })
  const beraPriceUSD = new Decimal(b?.beraPriceUSD || "0")

  const amount0 = new Decimal(formatUnits(event.args.amount0, token0.decimals)) // format 0.465 Token
  const amount1 = new Decimal(formatUnits(event.args.amount1, token1.decimals)) // format 1.223231 Token

  const amount0Bera = amount0.mul(token0.derivedBERA)
  const amount1Bera = amount1.mul(token1.derivedBERA)
  const totalAmountBera = amount0Bera.plus(amount1Bera)
  const amountUSD = totalAmountBera.mul(beraPriceUSD)

  factory.txCount += 1
  factory.totalValueLockedBERA = Decimal(factory.totalValueLockedBERA).minus(pool.totalValueLockedBERA).toString()

  token0.txCount += 1
  token0.totalValueLocked = Decimal(token0.totalValueLocked).plus(amount0).toString()
  token0.totalValueLockedUSD = Decimal(token0.totalValueLocked).mul(Decimal(token0.derivedBERA).mul(beraPriceUSD)).toString()

  token1.txCount += 1
  token1.totalValueLocked = Decimal(token1.totalValueLocked).plus(amount1).toString()
  token1.totalValueLockedUSD = Decimal(token1.totalValueLocked).mul(Decimal(token1.derivedBERA).mul(beraPriceUSD)).toString()
  if (debug) {
    console.log(`TVL USD (${token0.symbol}) lors d'un mint : t0.tvl * (t0.derivedbera * beraprice) => ${token0.totalValueLocked} * (${token0.derivedBERA} * ${beraPriceUSD}) = ${token0.totalValueLockedUSD}`)
    console.log(`TVL USD (${token1.symbol}) lors d'un mint : t1.tvl * (t1.derivedbera * beraprice) => ${token1.totalValueLocked} * (${token1.derivedBERA} * ${beraPriceUSD}) = ${token1.totalValueLockedUSD}`)
  }

  pool.txCount += 1
  pool.liquidity += event.args.amount
  pool.totalValueLockedToken0 = new Decimal(pool.totalValueLockedToken0).plus(amount0).toString()
  pool.totalValueLockedToken1 = new Decimal(pool.totalValueLockedToken1).plus(amount1).toString()
  pool.totalValueLockedBERA = Decimal(pool.totalValueLockedBERA).plus(totalAmountBera).toString()
  pool.totalValueLockedUSD = Decimal(pool.totalValueLockedBERA).mul(beraPriceUSD).toString()
  pool.liquidityProviderCount += 1

  // logDebug(logContext, "TVL calculations completed", {
  //   token0TVL: {
  //     amount: pool.totalValueLockedToken0.toString(),
  //     bera: Decimal(formatUnits(pool.totalValueLockedToken0, token0.decimals)).mul(token0.derivedBERA).toString()
  //   },
  //   token1TVL: {
  //     amount: pool.totalValueLockedToken1.toString(),
  //     bera: Decimal(formatUnits(pool.totalValueLockedToken1, token1.decimals)).mul(token1.derivedBERA).toString()
  //   },
  //   totalBERA: pool.totalValueLockedBERA,
  //   totalUSD: totalValueLockedUSD,
  //   beraPriceUSD: beraPriceUSD.toString()
  // })

  // reset aggregates with new amounts
  factory.totalValueLockedBERA = Decimal(factory.totalValueLockedBERA).plus(pool.totalValueLockedBERA).toString()
  factory.totalValueLockedUSD = Decimal(factory.totalValueLockedBERA).mul(beraPriceUSD).toString()

  // Create transaction
  const txEntity = await getOrCreateTransaction(context, event);

  // Update transaction
  await context.db.update(sTransaction, { id: txEntity.id })
    .set((row) => ({
      mints: [...row.mints, mintId],
    }));

  // create Mint event
  await context.db.insert(sMint).values({
    id: mintId,
    transaction: event.transaction.hash,
    timestamp: BigInt(event.block.timestamp),
    pool: event.log.address,
    token0: poolEntity.token0,
    token1: poolEntity.token1,
    owner: event.args.owner,
    sender: event.args.sender,
    origin: event.transaction.from,
    amount: event.args.amount,
    amount0: event.args.amount0,
    amount1: event.args.amount1,
    amountUSD: amountUSD.toString(),
    tickLower: Number(event.args.tickLower),
    tickUpper: Number(event.args.tickUpper),
    logIndex: event.log.logIndex,
  });

  // Create or update ticks
  const tickLowerId = getTickId(event.log.address, Number(event.args.tickLower));
  const tickUpperId = getTickId(event.log.address, Number(event.args.tickUpper));

  const tickLower = await context.db.find(sTick, { id: tickLowerId });
  if (!tickLower) {
    await context.db.insert(sTick).values({
      id: tickLowerId,
      poolAddress: event.log.address,
      tickIdx: Number(event.args.tickLower),
      pool: event.log.address,
      liquidityGross: event.args.amount,
      liquidityNet: event.args.amount,
      price0: "0",
      price1: "0",
      volumeToken0: amount0.toString(),
      volumeToken1: amount1.toString(),
      volumeUSD: amountUSD.toString(),
      untrackedVolumeUSD: "0",
      feesUSD: "0",
      collectedFeesToken0: "0",
      collectedFeesToken1: "0",
      collectedFeesUSD: "0",
      createdAtTimestamp: BigInt(event.block.timestamp),
      createdAtBlockNumber: BigInt(event.block.number),
      liquidityProviderCount: 1,
      feeGrowthOutside0X128: 0n,
      feeGrowthOutside1X128: 0n,
    });
  } else {
    await context.db.update(sTick, { id: tickLowerId })
      .set((row) => ({
        liquidityGross: row.liquidityGross + event.args.amount,
        liquidityNet: row.liquidityNet + event.args.amount,
        liquidityProviderCount: row.liquidityProviderCount + 1,
        volumeToken0: new Decimal(row.volumeToken0).plus(amount0).toString(),
        volumeToken1: new Decimal(row.volumeToken1).plus(amount1).toString(),
        volumeUSD: new Decimal(row.volumeUSD).plus(amountUSD).toString(),
      }));
  }

  const tickUpper = await context.db.find(sTick, { id: tickUpperId });
  if (!tickUpper) {
    await context.db.insert(sTick).values({
      id: tickUpperId,
      poolAddress: event.log.address,
      tickIdx: Number(event.args.tickUpper),
      pool: event.log.address,
      liquidityGross: event.args.amount,
      liquidityNet: -event.args.amount, // Négatif pour le tick supérieur
      price0: "0",
      price1: "0",
      volumeToken0: amount0.toString(),
      volumeToken1: amount1.toString(),
      volumeUSD: amountUSD.toString(),
      untrackedVolumeUSD: "0",
      feesUSD: "0",
      collectedFeesToken0: "0",
      collectedFeesToken1: "0",
      collectedFeesUSD: "0",
      createdAtTimestamp: BigInt(event.block.timestamp),
      createdAtBlockNumber: BigInt(event.block.number),
      liquidityProviderCount: 1,
      feeGrowthOutside0X128: 0n,
      feeGrowthOutside1X128: 0n,
    });
  } else {
    await context.db.update(sTick, { id: tickUpperId })
      .set((row) => ({
        liquidityGross: row.liquidityGross + event.args.amount,
        liquidityNet: row.liquidityNet - event.args.amount,
        liquidityProviderCount: row.liquidityProviderCount + 1,
        volumeToken0: new Decimal(row.volumeToken0).plus(amount0).toString(),
        volumeToken1: new Decimal(row.volumeToken1).plus(amount1).toString(),
        volumeUSD: new Decimal(row.volumeUSD).plus(amountUSD).toString(),
      }));
  }

  await context.db.update(sFactory, { id: CONTRACTS.FACTORY }).set({ ...Object.fromEntries(Object.entries(factory).filter(([key]) => key !== 'id')) })
  await context.db.update(sPool, { id: pool.id }).set({ ...Object.fromEntries(Object.entries(pool).filter(([key]) => key !== 'id')) })
  await context.db.update(sToken, { id: token0.id }).set({ ...Object.fromEntries(Object.entries(token0).filter(([key]) => key !== 'id')) })
  await context.db.update(sToken, { id: token1.id }).set({ ...Object.fromEntries(Object.entries(token1).filter(([key]) => key !== 'id')) })

  await updateProtocolDayData(event.block.timestamp, context)
  await updatePoolStats(event.block.timestamp, pool, context)
  await updateTokenStats(event.block.timestamp, token0, context)
  await updateTokenStats(event.block.timestamp, token1, context)

  // logMint(logContext, {
  //   mintId,
  //   amounts: {
  //     amount0: amount0.toString(),
  //     amount1: amount1.toString(),
  //     liquidity: event.args.amount.toString(),
  //     amountUSD: amountUSD.toString()
  //   },
  //   ticks: {
  //     tickLower: event.args.tickLower.toString(),
  //     tickUpper: event.args.tickUpper.toString()
  //   },
  //   tvl: {
  //     token0: pool.totalValueLockedToken0.toString(),
  //     token1: pool.totalValueLockedToken1.toString(),
  //     totalBERA: pool.totalValueLockedBERA,
  //     totalUSD: pool.totalValueLockedUSD
  //   },
  //   prices: {
  //     beraPriceUSD: beraPriceUSD.toString(),
  //     token0DerivedBERA: token0.derivedBERA,
  //     token1DerivedBERA: token1.derivedBERA
  //   },
  //   participants: {
  //     owner: event.args.owner,
  //     sender: event.args.sender,
  //     origin: event.transaction.from
  //   },
  //   poolStats: {
  //     totalLiquidity: pool.liquidity.toString(),
  //     txCount: pool.txCount,
  //     liquidityProviderCount: pool.liquidityProviderCount
  //   }
  // })
});
