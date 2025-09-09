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

  const apr = await calculateAPR(pool, timestamp, context)
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
      t0open: pool.token0Price,
      t0high: pool.token0Price,
      t0low: pool.token0Price,
      t0close: pool.token0Price,
      t1open: pool.token1Price,
      t1high: pool.token1Price,
      t1low: pool.token1Price,
      t1close: pool.token1Price,
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
      ...(r.t0open === "0" && { t0open: pool.token0Price }),
      ...(parseFloat(r.t0high) < parseFloat(pool.token0Price) && { t0high: pool.token0Price }),
      ...(parseFloat(r.t0low) > parseFloat(pool.token0Price) && { t0low: pool.token0Price }),
      t0close: pool.token0Price,
      ...(r.t1open === "0" && { t1open: pool.token1Price }),
      ...(parseFloat(r.t1high) < parseFloat(pool.token1Price) && { t1high: pool.token1Price }),
      ...(parseFloat(r.t1low) > parseFloat(pool.token1Price) && { t1low: pool.token1Price }),
      t1close: pool.token1Price,
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
      t0open: pool.token0Price,
      t0high: pool.token0Price,
      t0low: pool.token0Price,
      t0close: pool.token0Price,
      t1open: pool.token1Price,
      t1high: pool.token1Price,
      t1low: pool.token1Price,
      t1close: pool.token1Price,
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
      ...(r.t0open === "0" && { t0open: pool.token0Price }),
      ...(parseFloat(r.t0high) < parseFloat(pool.token0Price) && { t0high: pool.token0Price }),
      ...(parseFloat(r.t0low) > parseFloat(pool.token0Price) && { t0low: pool.token0Price }),
      t0close: pool.token0Price,
      ...(r.t1open === "0" && { t1open: pool.token1Price }),
      ...(parseFloat(r.t1high) < parseFloat(pool.token1Price) && { t1high: pool.token1Price }),
      ...(parseFloat(r.t1low) > parseFloat(pool.token1Price) && { t1low: pool.token1Price }),
      t1close: pool.token1Price,
    }))
  }
}

async function calculateAPR(pool: typeof sPool.$inferSelect, timestamp: bigint, context: Context) {
  const dayId = Math.floor(Number(timestamp) / 86400)
  const hourId = Math.floor(Number(timestamp) / 3600)
  let fromPool: typeof poolDayData.$inferSelect | typeof poolHourData.$inferSelect | null = null
  let actualDaysBack = 0
  let actualHoursBack = 0

  if (!pool.totalValueLockedUSD || pool.totalValueLockedUSD === "0") {
    return "0.00"
  }

  // Try to find the most recent week data (search backwards up to 14 days)
  for (let i = 7; i <= 14 && !fromPool; i++) {
    fromPool = await context.db.find(poolDayData, { id: `${pool.id}-${dayId - i}` })
    if (fromPool) {
      actualDaysBack = i
      break
    }
  }

  // If no week data found, try hour data (search backwards up to 7 days worth of hours)
  if (!fromPool) {
    for (let i = 24; i <= 24 * 7 && !fromPool; i += 24) {
      fromPool = await context.db.find(poolHourData, { id: `${pool.id}-${hourId - i}` })
      if (fromPool) {
        actualHoursBack = i
        break
      }
    }
  }

  // Still no data found, try searching for any available day data for this pool
  if (!fromPool) {
    // Search backwards further for any day data (up to 30 days)
    for (let i = 15; i <= 30 && !fromPool; i++) {
      fromPool = await context.db.find(poolDayData, { id: `${pool.id}-${dayId - i}` })
      if (fromPool) {
        actualDaysBack = i
        break
      }
    }
  }

  if (!fromPool) {
    console.warn(`No historical data to calculate APR for pool: ${pool.id}`)
    return "0.00"
  }

  const periodFees = new Decimal(pool.feesUSD).minus(fromPool.feesUSD)
  if (periodFees.lte(0)) return "0.00"

  // Calculate APR based on actual time period found
  let annualMultiplier: number
  if (actualDaysBack > 0) {
    // Day-based calculation
    annualMultiplier = 365 / actualDaysBack
  } else if (actualHoursBack > 0) {
    // Hour-based calculation  
    annualMultiplier = (365 * 24) / actualHoursBack
  } else {
    // Fallback to weekly calculation
    annualMultiplier = 52
  }

  const apr = periodFees.mul(annualMultiplier).div(pool.totalValueLockedUSD).mul(100)
  return apr.toFixed(2)
}

async function calculateVolumeForPeriod(pool: typeof sPool.$inferSelect, targetHourPoolId: string, context: Context) {
  if (!pool.volumeUSD || pool.volumeUSD === "0") return "0"

  // Extract hour ID from target
  const targetHourMatch = targetHourPoolId.match(/-([0-9]+)$/)
  if (!targetHourMatch || !targetHourMatch[1]) return "0"

  const targetHour = parseInt(targetHourMatch[1])
  const poolId = targetHourPoolId.substring(0, targetHourPoolId.lastIndexOf('-'))

  // Search backwards for the most recent available data near the target hour
  let fromPool: typeof poolHourData.$inferSelect | null = null

  // Try exact hour first, then search backwards up to 7 days (168 hours)
  for (let i = 0; i <= 168 && !fromPool; i++) {
    const searchHour = targetHour - i
    fromPool = await context.db.find(poolHourData, { id: `${poolId}-${searchHour}` })
  }

  if (!fromPool) {
    // Search further backwards for any hour data (up to 30 days)
    for (let i = 168; i <= 720 && !fromPool; i += 24) {
      fromPool = await context.db.find(poolHourData, { id: `${poolId}-${targetHour - i}` })
    }
  }

  if (!fromPool) return "0"

  const volumeDiff = new Decimal(pool.volumeUSD).minus(fromPool.volumeUSD)
  return volumeDiff.gt(0) ? volumeDiff.toString() : "0"
}
