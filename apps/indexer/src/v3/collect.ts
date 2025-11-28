import { ponder } from "ponder:registry";
import { factory as sFactory, pool as sPool, token as sToken, collect as sCollect, bundle } from "ponder:schema";
import { CONTRACTS } from "../utils/abi";
import Decimal from "decimal.js";
import { getOrCreateTransaction } from "./helpers";
import { updateProtocolDayData } from "../stats/porotocolDay";
import { updatePoolStats } from "../stats/pool";
import { updateTokenStats } from "../stats/token";
import { formatUnits } from "viem";

/**
 * Handler pour l'événement Collect du Pool (v3Pool:Collect)
 * ⚠️ IMPORTANT: Ce handler NE met plus à jour les positions individuelles
 * Il sert uniquement pour les statistiques globales du pool
 * Les positions sont mises à jour par v3PositionManager:Collect dans positionCollect.ts
 */
ponder.on("v3Pool:Collect", async ({ event, context }) => {
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
  token0.txCount += 1
  token1.txCount += 1
  pool.txCount += 1

  const amount0Bera = amount0.mul(token0.derivedBERA)
  const amount1Bera = amount1.mul(token1.derivedBERA)
  const totalCollectedBera = amount0Bera.plus(amount1Bera)
  const totalCollectedUSD = totalCollectedBera.mul(beraPriceUSD)

  // ✅ STATS GLOBALES DU POOL UNIQUEMENT (pas de positions)
  pool.collectedFeesToken0 = new Decimal(pool.collectedFeesToken0).plus(amount0).toString()
  pool.collectedFeesToken1 = new Decimal(pool.collectedFeesToken1).plus(amount1).toString()
  pool.collectedFeesUSD = Decimal(pool.collectedFeesUSD).plus(totalCollectedUSD).toString()

  const poolCollectedFeesT0Bera = new Decimal(pool.collectedFeesToken0).mul(token0.derivedBERA)
  const poolCollectedFeesT1Bera = new Decimal(pool.collectedFeesToken1).mul(token1.derivedBERA)
  const poolCollectedFeesTotalBera = poolCollectedFeesT0Bera.plus(poolCollectedFeesT1Bera)
  const poolCollectedFeesTotalUSD = poolCollectedFeesTotalBera.mul(beraPriceUSD)

  // Enregistrer l'événement collect pour l'historique
  const collectId = `${event.transaction.hash}#${event.log.logIndex}`;
  const txEntity = await getOrCreateTransaction(context, event);

  await context.db.insert(sCollect).values({
    id: collectId,
    transaction: txEntity.id,
    timestamp: txEntity.timestamp,
    pool: poolEntity.id,
    owner: event.args.owner,
    amount0: event.args.amount0,
    amount1: event.args.amount1,
    amountUSD: totalCollectedUSD.toString(), // Corrigé: utiliser le montant de cette transaction, pas le total
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

