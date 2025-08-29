import { ponder } from "ponder:registry";
import { factory as sFactory, burn as sBurn, pool as sPool, tick as sTick, token as sToken, transaction as sTransaction } from "ponder:schema";
import { getOrCreateTransaction, getTickId } from "./helpers";
import { CONTRACTS } from "@repo/contracts";
import { getBeraPriceInUSD } from "./utils/pricing";
import Decimal from "decimal.js";

ponder.on("WinniePool:Burn", async ({ event, context }) => {
  const factoryEntity = await context.db.find(sFactory, { id: CONTRACTS.FACTORY });
  if (!factoryEntity) return;
  const factory = {...factoryEntity}

  let poolEntity = await context.db.find(sPool, { id: event.log.address });
  if (!poolEntity) return;
  const pool = { ...poolEntity }

  let token0Entity = await context.db.find(sToken, { id: poolEntity.token0 })
  let token1Entity = await context.db.find(sToken, { id: poolEntity.token1 })
  if (!token0Entity || !token1Entity) return
  const token0 = {...token0Entity}
  const token1 = {...token1Entity}

  const burnId = `${event.transaction.hash}#${event.log.logIndex}`;
  const beraPriceUSD = await getBeraPriceInUSD(context)

  const amount0 = event.args.amount0
  const amount1 = event.args.amount1
  
  const amountUSD = Decimal(amount0).mul(token0.derivedBERA).plus(Decimal(amount1).mul(token1.derivedBERA))

  factory.txCount += 1
  pool.txCount += 1
  token0.txCount += 1
  token1.txCount += 1
  
  if (pool.tick !== null && event.args.tickLower <= pool.tick && event.args.tickUpper > pool.tick) {
    pool.liquidity -= event.args.amount
  }

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
    amount0,
    amount1,
    amountUSD: amountUSD.toString(), // À calculer avec un oracle de prix
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

  await context.db.update(sFactory, { id: CONTRACTS.FACTORY }).set({...Object.fromEntries(Object.entries(factory).filter(([key]) => key !== 'id'))})
  await context.db.update(sPool, {id: pool.id}).set({...Object.fromEntries(Object.entries(pool).filter(([key]) => key !== 'id'))})
  await context.db.update(sToken, {id: token0.id}).set({...Object.fromEntries(Object.entries(token0).filter(([key]) => key !== 'id'))})
  await context.db.update(sToken, {id: token1.id}).set({...Object.fromEntries(Object.entries(token1).filter(([key]) => key !== 'id'))})
});
