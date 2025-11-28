import { ponder } from "ponder:registry";
import { factory as sFactory, burn as sBurn, pool as sPool, tick as sTick, token as sToken, transaction as sTransaction, bundle } from "ponder:schema";
import { getOrCreateTransaction, getTickId } from "./helpers";
import Decimal from "decimal.js";
import { updateProtocolDayData } from "../stats/porotocolDay";
import { updatePoolStats } from "../stats/pool";
import { updateTokenStats } from "../stats/token";
import { formatUnits } from "viem";
import { CONTRACTS } from "../utils/abi";

ponder.on("v3Pool:Burn", async ({ event, context }) => {
  const factoryEntity = await context.db.find(sFactory, { id: CONTRACTS.FACTORY });
  if (!factoryEntity) return;
  const factory = { ...factoryEntity }

  let poolEntity = await context.db.find(sPool, { id: event.log.address });
  if (!poolEntity) return;
  const pool = { ...poolEntity }

  let token0Entity = await context.db.find(sToken, { id: poolEntity.token0 })
  let token1Entity = await context.db.find(sToken, { id: poolEntity.token1 })
  if (!token0Entity || !token1Entity) return
  const token0 = { ...token0Entity }
  const token1 = { ...token1Entity }

  const burnId = `${event.transaction.hash}#${event.log.logIndex}`;

  const b = await context.db.find(bundle, { id: "1" })
  const beraPriceUSD = new Decimal(b?.beraPriceUSD || "0")

  const amount0 = new Decimal(formatUnits(event.args.amount0, token0.decimals))
  const amount1 = new Decimal(formatUnits(event.args.amount1, token1.decimals))

  const amount0Abs = amount0.abs()
  const amount1Abs = amount1.abs()

  const amount0Bera = amount0Abs.mul(token0.derivedBERA)
  const amount1Bera = amount1Abs.mul(token1.derivedBERA)
  const totalAmountBera = amount0Bera.plus(amount1Bera)

  const amount0USD = amount0Bera.mul(beraPriceUSD)
  const amount1USD = amount1Bera.mul(beraPriceUSD)
  // Fix: Take average of both sides to avoid double counting (align with vault and swap logic)
  const totalAmountUSD = amount0USD.plus(amount1USD).div(2)

  factory.txCount += 1
  factory.totalValueLockedBERA = Decimal(factory.totalValueLockedBERA).minus(pool.totalValueLockedBERA).toString()

  token0.txCount += 1
  token0.totalValueLocked = Decimal(token0.totalValueLocked).minus(amount0).toString()
  token0.totalValueLockedUSD = Decimal(token0.totalValueLocked).mul(Decimal(token0.derivedBERA).mul(beraPriceUSD)).toString()

  token1.txCount += 1
  token1.totalValueLocked = Decimal(token1.totalValueLocked).minus(amount1).toString()
  token1.totalValueLockedUSD = Decimal(token1.totalValueLocked).mul(Decimal(token1.derivedBERA).mul(beraPriceUSD)).toString()

  pool.txCount += 1
  pool.totalValueLockedToken0 = new Decimal(pool.totalValueLockedToken0).minus(amount0).toString()
  pool.totalValueLockedToken1 = new Decimal(pool.totalValueLockedToken1).minus(amount1).toString()
  pool.totalValueLockedBERA = Decimal(pool.totalValueLockedBERA).minus(totalAmountBera).toString()
  pool.totalValueLockedUSD = Decimal(pool.totalValueLockedBERA).mul(beraPriceUSD).toString()
  pool.liquidityProviderCount -= 1

  // Only subtract from ACTIVE liquidity if position is in current tick range
  if (pool.tick !== null && event.args.tickLower <= pool.tick && event.args.tickUpper > pool.tick) {
    pool.liquidity -= event.args.amount
  }

  // reset aggregates with new amounts
  factory.totalValueLockedBERA = Decimal(factory.totalValueLockedBERA).plus(pool.totalValueLockedBERA).toString()
  factory.totalValueLockedUSD = Decimal(factory.totalValueLockedBERA).mul(beraPriceUSD).toString()

  // Crate Burn event
  await context.db.insert(sBurn).values({
    id: burnId,
    transaction: event.transaction.hash,
    timestamp: BigInt(event.block.timestamp),
    pool: event.log.address,
    token0: poolEntity.token0,
    token1: poolEntity.token1,
    owner: event.args.owner,
    origin: event.transaction.from,
    amount: event.args.amount,
    amount0: event.args.amount0,
    amount1: event.args.amount1,
    amountUSD: totalAmountUSD.toString(), // À calculer avec un oracle de prix
    tickLower: Number(event.args.tickLower),
    tickUpper: Number(event.args.tickUpper),
    logIndex: event.log.logIndex,
  });

  // Create tx
  const txEntity = await getOrCreateTransaction(context, event);
  // Update transaction
  await context.db.update(sTransaction, { id: txEntity.id })
    .set((row) => ({
      burns: [...row.burns, burnId],
    }));

  const tickLowerId = getTickId(event.log.address, Number(event.args.tickLower));
  const tickUpperId = getTickId(event.log.address, Number(event.args.tickUpper));

  const tickLower = await context.db.find(sTick, { id: tickLowerId });
  if (tickLower) {
    await context.db.update(sTick, { id: tickLowerId })
      .set((row) => ({
        liquidityGross: row.liquidityGross - event.args.amount,
        liquidityNet: row.liquidityNet - event.args.amount,
        liquidityProviderCount: row.liquidityProviderCount - 1,
      }));
  }

  const tickUpper = await context.db.find(sTick, { id: tickUpperId });
  if (tickUpper) {
    await context.db.update(sTick, { id: tickUpperId })
      .set((row) => ({
        liquidityGross: row.liquidityGross - event.args.amount,
        liquidityNet: row.liquidityNet + event.args.amount,
        liquidityProviderCount: row.liquidityProviderCount - 1,
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
});
