import { ponder } from "ponder:registry";
import { factory as sFactory, pool as sPool, token as sToken, collect as sCollect, bundle } from "ponder:schema";
import { CONTRACTS } from "@repo/contracts";
import Decimal from "decimal.js";
import { getOrCreateTransaction } from "./helpers";
import { updateProtocolDayData } from "./stats/porotocolDay";
import { updatePoolStats } from "./stats/pool";
import { updateTokenStats } from "./stats/token";
import { formatUnits } from "viem";

ponder.on("WinniePool:Collect", async ({ event, context }) => {
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

  const b = await context.db.find(bundle, { id: "1" })
  const beraPriceUSD = new Decimal(b?.beraPriceUSD || "0")

  const amount0 = new Decimal(formatUnits(event.args.amount0, token0.decimals))
  const amount1 = new Decimal(formatUnits(event.args.amount1, token1.decimals))

  factory.txCount += 1
  factory.totalValueLockedBERA = Decimal(factory.totalValueLockedBERA).minus(pool.totalValueLockedBERA).toString()

  token0.txCount += 1
  token0.totalValueLocked = Decimal(token0.totalValueLocked).minus(amount0).toString()
  token0.totalValueLockedUSD = Decimal(token0.totalValueLocked).mul(beraPriceUSD).toString()

  token1.txCount += 1
  token1.totalValueLocked = Decimal(token1.totalValueLocked).minus(amount1).toString()
  token1.totalValueLockedUSD = Decimal(token1.totalValueLocked).mul(beraPriceUSD).toString()

  pool.txCount += 1
  pool.totalValueLockedToken0 = new Decimal(pool.totalValueLockedToken0).minus(amount0).toString()
  pool.totalValueLockedToken1 = new Decimal(pool.totalValueLockedToken1).minus(amount1).toString()

  const poolTVLt0Bera = new Decimal(pool.totalValueLockedToken0).mul(token0.derivedBERA)
  const poolTVLt1Bera = new Decimal(pool.totalValueLockedToken1).mul(token1.derivedBERA)
  pool.totalValueLockedBERA = poolTVLt0Bera.plus(poolTVLt1Bera).toString()
  pool.totalValueLockedUSD = new Decimal(pool.totalValueLockedBERA).mul(beraPriceUSD).toString()

  pool.collectedFeesToken0 = new Decimal(pool.collectedFeesToken0).plus(amount0).toString()
  pool.collectedFeesToken1 = new Decimal(pool.collectedFeesToken1).plus(amount1).toString()

  const poolCollectedFeesT0Bera = new Decimal(pool.collectedFeesToken0).mul(token0.derivedBERA)
  const poolCollectedFeesT1Bera = new Decimal(pool.collectedFeesToken1).mul(token1.derivedBERA)
  const poolCollectedFeesTotalBera = poolCollectedFeesT0Bera.plus(poolCollectedFeesT1Bera)
  const poolCollectedFeesTotalUSD = poolCollectedFeesTotalBera.mul(beraPriceUSD)
  pool.collectedFeesUSD = Decimal(pool.collectedFeesUSD).plus(poolCollectedFeesTotalUSD).toString()

  factory.totalValueLockedBERA = Decimal(factory.totalValueLockedBERA).plus(pool.totalValueLockedBERA).toString()
  factory.totalValueLockedUSD = Decimal(factory.totalValueLockedBERA).mul(beraPriceUSD).toString()

  const collectId = `${event.transaction.hash}#${event.log.logIndex}`;
  const txEntity = await getOrCreateTransaction(context, event);

  await context.db.insert(sCollect).values({
    id: collectId, // tx hash + "#" + index
    transaction: txEntity.id,
    timestamp: txEntity.timestamp,
    pool: poolEntity.id,
    owner: event.args.owner,
    amount0: event.args.amount0,
    amount1: event.args.amount1,
    amountUSD: poolCollectedFeesTotalUSD.toString(),
    tickLower: event.args.tickLower,
    tickUpper: event.args.tickUpper,
    logIndex: event.log.logIndex
  })

  await context.db.update(sFactory, { id: CONTRACTS.FACTORY }).set({ ...Object.fromEntries(Object.entries(factory).filter(([key]) => key !== 'id')) })
  await context.db.update(sPool, { id: pool.id }).set({ ...Object.fromEntries(Object.entries(pool).filter(([key]) => key !== 'id')) })
  await context.db.update(sToken, { id: token0.id }).set({ ...Object.fromEntries(Object.entries(token0).filter(([key]) => key !== 'id')) })
  await context.db.update(sToken, { id: token1.id }).set({ ...Object.fromEntries(Object.entries(token1).filter(([key]) => key !== 'id')) })

  await updateProtocolDayData(event.block.timestamp, context)
  await updatePoolStats(event.block.timestamp, pool, context)
  await updateTokenStats(event.block.timestamp, token0, context)
  await updateTokenStats(event.block.timestamp, token1, context)
})