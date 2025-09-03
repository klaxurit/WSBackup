import Decimal from "decimal.js";
import { Context } from "ponder:registry";
import { poolHourData } from "ponder:schema";
import { poolDayData, pool as sPool } from "ponder:schema";

export async function updatePoolStats(timestamp: bigint, pool: typeof sPool.$inferSelect, context: Context) {
  if (!pool) return

  const dayId = Math.floor(Number(timestamp) / 86400)
  const dayStartTimestamp = dayId * 86400
  const dayPoolId = `${pool.id}-${dayId}`

  const hourId = Math.floor(Number(timestamp) / 3600)
  const hourStartUnix = hourId * 3600
  const hourPoolID = `${pool.id}-${hourId}`

  const apr = await calculateAPR(pool, `${pool.id}-${dayId - 1}`, context)
  const volumeUSD1D = await calculateVolumeForPeriod(pool, `${pool.id}-${hourId - 24}`, context)
  const volumeUSD30D = await calculateVolumeForPeriod(pool, `${pool.id}-${hourId - (24 * 30)}`, context)

  await updateDayPoolData(pool, dayPoolId, dayStartTimestamp, apr, volumeUSD1D, volumeUSD30D, context)
  await updateHourPoolData(pool, hourPoolID, hourStartUnix, context)
}

export async function updateDayPoolData(
  pool: typeof sPool.$inferSelect,
  dayPoolId: string,
  startTS: number,
  apr: string,
  volumeUSD1D: string,
  volumeUSD30D: string,
  context: Context
) {
  const poolData = await context.db.find(poolDayData, { id: dayPoolId })
  if (!poolData) {
    await context.db.insert(poolDayData).values({
      id: dayPoolId, // pool address + "-" + day id
      date: startTS,
      pool: pool.id,
      liquidity: pool.liquidity,
      sqrtPrice: pool.sqrtPrice,
      token0Price: pool.token0Price,
      token1Price: pool.token1Price,
      tick: pool.tick,
      feeGrowthGlobal0X128: pool.feeGrowthGlobal0X128,
      feeGrowthGlobal1X128: pool.feeGrowthGlobal1X128,
      tvlUSD: pool.totalValueLockedUSD,
      volumeToken0: pool.volumeToken0,
      volumeToken1: pool.volumeToken1,
      volumeUSD: pool.volumeUSD,
      feesUSD: pool.feesUSD,
      txCount: pool.txCount,
      open: pool.token0Price,
      high: pool.token0Price,
      low: pool.token0Price,
      close: pool.token1Price,
      apr,
      volumeUSD1D,
      volumeUSD30D
    })
  } else {
    await context.db.update(poolDayData, { id: dayPoolId }).set((r) => ({
      liquidity: pool.liquidity,
      sqrtPrice: pool.sqrtPrice,
      token0Price: pool.token0Price,
      token1Price: pool.token1Price,
      tick: pool.tick,
      feeGrowthGlobal0X128: pool.feeGrowthGlobal0X128,
      feeGrowthGlobal1X128: pool.feeGrowthGlobal1X128,
      tvlUSD: pool.totalValueLockedUSD,
      volumeToken0: pool.volumeToken0,
      volumeToken1: pool.volumeToken1,
      volumeUSD: pool.volumeUSD,
      feesUSD: pool.feesUSD,
      txCount: pool.txCount,
      open: pool.token0Price,
      high: r.high < pool.token0Price ? pool.token0Price : r.high,
      low: r.low > pool.token0Price ? pool.token0Price : r.low,
      close: pool.token1Price,
      apr,
      volumeUSD1D,
      volumeUSD30D
    }))
  }
}

async function updateHourPoolData(
  pool: typeof sPool.$inferSelect,
  hourPoolID: string,
  startTS: number,
  context: Context
) {
  const poolData = await context.db.find(poolHourData, { id: hourPoolID })

  if (!poolData) {
    await context.db.insert(poolHourData).values({
      id: hourPoolID, // pool address + "-" + day id
      periodStartUnix: startTS,
      pool: pool.id,
      liquidity: pool.liquidity,
      sqrtPrice: pool.sqrtPrice,
      token0Price: pool.token0Price,
      token1Price: pool.token1Price,
      tick: pool.tick,
      feeGrowthGlobal0X128: pool.feeGrowthGlobal0X128,
      feeGrowthGlobal1X128: pool.feeGrowthGlobal1X128,
      tvlUSD: pool.totalValueLockedUSD,
      volumeToken0: pool.volumeToken0,
      volumeToken1: pool.volumeToken1,
      volumeUSD: pool.volumeUSD,
      feesUSD: pool.feesUSD,
      txCount: pool.txCount,
      open: pool.token0Price,
      high: pool.token0Price,
      low: pool.token0Price,
      close: pool.token1Price,
    })
  } else {
    await context.db.update(poolHourData, { id: hourPoolID }).set((r) => ({
      liquidity: pool.liquidity,
      sqrtPrice: pool.sqrtPrice,
      token0Price: pool.token0Price,
      token1Price: pool.token1Price,
      tick: pool.tick,
      feeGrowthGlobal0X128: pool.feeGrowthGlobal0X128,
      feeGrowthGlobal1X128: pool.feeGrowthGlobal1X128,
      tvlUSD: pool.totalValueLockedUSD,
      volumeToken0: pool.volumeToken0,
      volumeToken1: pool.volumeToken1,
      volumeUSD: pool.volumeUSD,
      feesUSD: pool.feesUSD,
      txCount: pool.txCount,
      open: pool.token0Price,
      high: r.high < pool.token0Price ? pool.token0Price : r.high,
      low: r.low > pool.token0Price ? pool.token0Price : r.low,
      close: pool.token1Price,
    }))
  }
}

async function calculateAPR(pool: typeof sPool.$inferSelect, dayPoolId: string, context: Context) {
  if (!pool.totalValueLockedUSD || pool.totalValueLockedUSD === "0") return "0.00"

  const fromPool = await context.db.find(poolDayData, { id: dayPoolId })
  if (!fromPool) return "0.00"

  const periodFees = new Decimal(pool.feesUSD).minus(fromPool.feesUSD)
  const apr = periodFees.mul(365).div(pool.totalValueLockedUSD).mul(100)

  return apr.toFixed(2)
}

async function calculateVolumeForPeriod(pool: typeof sPool.$inferSelect, dayPoolId: string, context: Context) {
  if (!pool.volumeUSD || pool.volumeUSD === "0") return "0"

  const fromPool = await context.db.find(poolHourData, { id: dayPoolId })
  if (!fromPool) return "0"

  return new Decimal(pool.volumeUSD).minus(fromPool.volumeUSD).toString()
}
