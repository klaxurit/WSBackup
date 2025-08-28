import { ponder } from "ponder:registry";
import { factory, mint, pool, tick, token, transaction } from "ponder:schema";
import { getOrCreateTransaction, getTickId } from "./helpers";
import { CONTRACTS } from "@repo/contracts";
import { getBeraPriceInUSD, getTrackedAmountUSD } from "./utils/pricing";
import Decimal from "decimal.js";
import { formatUnits } from "viem";
import { safeMul, tokenToRatio } from "./utils/bigint-math";

ponder.on("WinniePool:Mint", async ({ event, context }) => {
  let poolEntity = await context.db.find(pool, { id: event.log.address });
  if (!poolEntity) return;

  let token0Entity = await context.db.find(token, { id: poolEntity.token0 });
  let token1Entity = await context.db.find(token, { id: poolEntity.token1 });
  if (!token0Entity || !token1Entity) return;

  const txEntity = await getOrCreateTransaction(context, event);
  const mintId = `${event.transaction.hash}#${event.log.logIndex}`;

  const amount0 = event.args.amount0
  const amount1 = event.args.amount1

  const beraPriceUSD = await getBeraPriceInUSD(context)
  const trackedAmountUSD = getTrackedAmountUSD(
    amount0, token0Entity,
    amount1, token1Entity,
    beraPriceUSD
  )
  const amountUSD = new Decimal(formatUnits(trackedAmountUSD, 18)).toString();

  // Update Factory
  await context.db.update(factory, { id: CONTRACTS.FACTORY })
    .set((row) => ({
      txCount: row.txCount + 1,
      totalValueLockedBERA: row.totalValueLockedBERA - poolEntity!.totalValueLockedBERA,
    }));

  // Update Token0
  token0Entity = await context.db.update(token, { id: poolEntity.token0 })
    .set((row) => ({
      txCount: row.txCount + 1,
      totalValueLocked: row.totalValueLocked + amount0,
      totalValueLockedUSD: new Decimal(formatUnits(
        safeMul(
          safeMul(tokenToRatio(row.totalValueLocked + amount0, row.decimals), row.derivedBERA),
          beraPriceUSD
        ), 18
      )).toString()
    }));

  // Update Token1
  token1Entity = await context.db.update(token, { id: poolEntity.token1 })
    .set((row) => ({
      txCount: row.txCount + 1,
      totalValueLocked: row.totalValueLocked + amount1,
      totalValueLockedUSD: new Decimal(formatUnits(
        safeMul(
          safeMul(tokenToRatio(row.totalValueLocked + amount1, row.decimals), row.derivedBERA),
          beraPriceUSD
        ), 18
      )).toString()
    }));

  // Update pool metrics
  poolEntity = await context.db.update(pool, { id: poolEntity.id })
    .set((row) => ({
      txCount: row.txCount + 1,
      ...(row.tick !== null &&
        Number(event.args.tickLower) <= row.tick &&
        Number(event.args.tickUpper) > row.tick &&
        { liquidity: row.liquidity + event.args.amount }
      ),
      totalValueLockedToken0: row.totalValueLockedToken0 + amount0,
      totalValueLockedToken1: row.totalValueLockedToken1 + amount1,
      totalValueLockedBERA: safeMul(tokenToRatio(row.totalValueLockedToken0 + amount0, token0Entity.decimals), token0Entity.derivedBERA) +
                             safeMul(tokenToRatio(row.totalValueLockedToken1 + amount1, token1Entity.decimals), token1Entity.derivedBERA),
      totalValueLockedUSD: new Decimal(formatUnits(
          safeMul(
            safeMul(tokenToRatio(row.totalValueLockedToken0 + amount0, token0Entity.decimals), token0Entity.derivedBERA) +
            safeMul(tokenToRatio(row.totalValueLockedToken1 + amount1, token1Entity.decimals), token1Entity.derivedBERA),
            beraPriceUSD
          ), 18
        )).toString()
    }));

  // Update Factory with new value
  await context.db.update(factory, { id: CONTRACTS.FACTORY })
    .set((row) => ({
      totalValueLockedBERA: row.totalValueLockedBERA + poolEntity.totalValueLockedBERA,
      totalValueLockedUSD: new Decimal(formatUnits(
        safeMul(row.totalValueLockedBERA + poolEntity.totalValueLockedBERA, beraPriceUSD),
        18
      )).toString()
    }));

  // Update transaction
  await context.db.update(transaction, { id: txEntity.id })
    .set((row) => ({
      mints: [...row.mints, mintId],
    }));

  // create Mint event
  await context.db.insert(mint).values({
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
    amount0,
    amount1,
    amountUSD,
    tickLower: Number(event.args.tickLower),
    tickUpper: Number(event.args.tickUpper),
    logIndex: event.log.logIndex,
  });

  // Create or update ticks
  const tickLowerId = getTickId(event.log.address, Number(event.args.tickLower));
  const tickUpperId = getTickId(event.log.address, Number(event.args.tickUpper));

  const tickLower = await context.db.find(tick, { id: tickLowerId });
  if (!tickLower) {
    await context.db.insert(tick).values({
      id: tickLowerId,
      poolAddress: event.log.address,
      tickIdx: Number(event.args.tickLower),
      pool: event.log.address,
      liquidityGross: event.args.amount,
      liquidityNet: event.args.amount,
      price0: "0",
      price1: "0",
      volumeToken0: 0n,
      volumeToken1: 0n,
      volumeUSD: "0",
      untrackedVolumeUSD: "0",
      feesUSD: "0",
      collectedFeesToken0: 0n,
      collectedFeesToken1: 0n,
      collectedFeesUSD: "0",
      createdAtTimestamp: BigInt(event.block.timestamp),
      createdAtBlockNumber: BigInt(event.block.number),
      liquidityProviderCount: 1,
      feeGrowthOutside0X128: 0n,
      feeGrowthOutside1X128: 0n,
    });
  } else {
    await context.db.update(tick, { id: tickLowerId })
      .set((row) => ({
        liquidityGross: row.liquidityGross + event.args.amount,
        liquidityNet: row.liquidityNet + event.args.amount,
        liquidityProviderCount: row.liquidityProviderCount + 1,
      }));
  }

  const tickUpper = await context.db.find(tick, { id: tickUpperId });
  if (!tickUpper) {
    await context.db.insert(tick).values({
      id: tickUpperId,
      poolAddress: event.log.address,
      tickIdx: Number(event.args.tickUpper),
      pool: event.log.address,
      liquidityGross: event.args.amount,
      liquidityNet: -event.args.amount, // Négatif pour le tick supérieur
      price0: "0",
      price1: "0",
      volumeToken0: 0n,
      volumeToken1: 0n,
      volumeUSD: "0",
      untrackedVolumeUSD: "0",
      feesUSD: "0",
      collectedFeesToken0: 0n,
      collectedFeesToken1: 0n,
      collectedFeesUSD: "0",
      createdAtTimestamp: BigInt(event.block.timestamp),
      createdAtBlockNumber: BigInt(event.block.number),
      liquidityProviderCount: 1,
      feeGrowthOutside0X128: 0n,
      feeGrowthOutside1X128: 0n,
    });
  } else {
    await context.db.update(tick, { id: tickUpperId })
      .set((row) => ({
        liquidityGross: row.liquidityGross + event.args.amount,
        liquidityNet: row.liquidityNet - event.args.amount,
        liquidityProviderCount: row.liquidityProviderCount + 1,
      }));
  }


  // TODO Start all daily data update
});
