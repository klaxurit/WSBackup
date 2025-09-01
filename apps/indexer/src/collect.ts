import { ponder } from "ponder:registry";
import { getBeraPriceInUSD, getTrackedAmountUSD } from "./utils/pricing";
import { factory as sFactory, pool as sPool, token as sToken, collect as sCollect } from "ponder:schema";
import { CONTRACTS } from "@repo/contracts";
import Decimal from "decimal.js";
import { getOrCreateTransaction } from "./helpers";
import { updateProtocolDayData } from "./stats/porotocolDay";
import { updateDayPoolData, updateHourPoolData } from "./stats/pool";
import { updateDayTokenData, updateHourTokenData } from "./stats/token";

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

  let beraPriceUSD = await getBeraPriceInUSD(context)

  const amount0 = event.args.amount0
  const amount1 = event.args.amount1
  const trackedCollectedAmountUSD = getTrackedAmountUSD(
    amount0, token0Entity,
    amount1, token1Entity,
    beraPriceUSD
  )

  factory.totalValueLockedBERA = Decimal(factory.totalValueLockedBERA).minus(pool.totalValueLockedBERA).toString()
  factory.txCount += 1

  token0.txCount += 1
  token0.totalValueLocked = Decimal(token0.totalValueLocked).plus(amount0).toString()
  token0.totalValueLockedUSD = Decimal(token0.totalValueLocked).mul(beraPriceUSD).toString()

  token1.txCount += 1
  token1.totalValueLocked = Decimal(token1.totalValueLocked).plus(amount1).toString()
  token1.totalValueLockedUSD = Decimal(token1.totalValueLocked).mul(beraPriceUSD).toString()

  pool.txCount += 1
  pool.totalValueLockedToken0 -= amount0
  pool.totalValueLockedToken1 -= amount1
  pool.totalValueLockedBERA = Decimal(pool.totalValueLockedToken0)
    .mul(token0.derivedBERA)
    .plus(Decimal(pool.totalValueLockedToken1).mul(token1.derivedBERA))
    .toString()
  pool.totalValueLockedUSD = Decimal(pool.totalValueLockedBERA).mul(beraPriceUSD).toString()

  pool.collectedFeesToken0 += amount0
  pool.collectedFeesToken1 += amount1
  pool.collectedFeesUSD = Decimal(pool.collectedFeesUSD).plus(trackedCollectedAmountUSD).toString()

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
    amount0: amount0,
    amount1: amount1,
    amountUSD: trackedCollectedAmountUSD.toString(),
    tickLower: event.args.tickLower,
    tickUpper: event.args.tickUpper,
    logIndex: event.log.logIndex
  })

  await context.db.update(sFactory, { id: CONTRACTS.FACTORY }).set({ ...Object.fromEntries(Object.entries(factory).filter(([key]) => key !== 'id')) })
  await context.db.update(sPool, { id: pool.id }).set({ ...Object.fromEntries(Object.entries(pool).filter(([key]) => key !== 'id')) })
  await context.db.update(sToken, { id: token0.id }).set({ ...Object.fromEntries(Object.entries(token0).filter(([key]) => key !== 'id')) })
  await context.db.update(sToken, { id: token1.id }).set({ ...Object.fromEntries(Object.entries(token1).filter(([key]) => key !== 'id')) })

  await updateProtocolDayData(event.block.timestamp, context)
  await updateDayPoolData(event.block.timestamp, pool.id, context)
  await updateHourPoolData(event.block.timestamp, pool.id, context)
  await updateDayTokenData(event.block.timestamp, token0.id, context)
  await updateHourTokenData(event.block.timestamp, token0.id, context)
})