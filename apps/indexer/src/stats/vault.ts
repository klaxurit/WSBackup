import Decimal from "decimal.js";
import { Context } from "ponder:registry";
import {
  stickyVault,
  vaultDayData,
  vaultHourData,
  pool as sPool,
  token as sToken,
} from "ponder:schema";
import { formatUnits } from "viem";
import { getCachedUnderlyingBalances } from "../utils/vaultCache.js";

export async function updateVaultStats(
  timestamp: bigint,
  vault: typeof stickyVault.$inferSelect,
  beraPriceUSD: Decimal,
  context: Context,
  blockNumber?: bigint,
) {
  if (!vault) return;

  const dayId = Math.floor(Number(timestamp) / 86400);
  const hourId = Math.floor(Number(timestamp) / 3600);
  const dayStart = dayId * 86400;
  const hourStart = hourId * 3600;
  const dayVaultId = `${vault.id}-${dayId}`;
  const hourVaultId = `${vault.id}-${hourId}`;

  try {
    const tvlUSD = await calculateTVL(vault, beraPriceUSD, context, blockNumber);
    const aprResults = await calculateAPR(timestamp, vault, tvlUSD, context);
    const volumeUSD1D = await calculateVolumeForPeriod(vault, `${vault.id}-${dayId - 1}`, context, "day")
    const volumeUSD30D = await calculateVolumeForPeriod(vault, `${vault.id}-${dayId - 30}`, context, "day")

    console.log("Update vault Data")
    console.log("tvlUSD :", tvlUSD)
    console.log("aprResults :", aprResults)
    console.log("volumeUSD1D :", volumeUSD1D)
    console.log("volumeUSD30D :", volumeUSD30D)
    await updateDayVaultData(vault, dayVaultId, dayStart, tvlUSD, aprResults.grossAPR, aprResults.netAPR, volumeUSD1D, volumeUSD30D, context);
    await updateHourVaultData(
      vault,
      hourVaultId,
      hourStart,
      tvlUSD,
      aprResults.grossAPR,
      aprResults.netAPR,
      context,
    );
  } catch (error: any) {
    console.warn("Error when update vault stats", error?.message)
  }

}

async function calculateTVL(
  vault: typeof stickyVault.$inferSelect,
  beraPriceUSD: Decimal,
  context: Context,
  blockNumber?: bigint,
): Promise<string> {
  // Get pool and token info first (these are local DB calls)
  const pool = await context.db.find(sPool, { id: vault.pool });
  if (!pool) {
    console.warn(`🚨 Pool ${vault.pool} not found for vault ${vault.id}`);
    return "0";
  }

  const token0 = await context.db.find(sToken, { id: pool.token0 });
  const token1 = await context.db.find(sToken, { id: pool.token1 });
  if (!token0 || !token1) {
    console.warn(`🚨 Tokens not found for pool ${pool.id} (vault ${vault.id})`);
    return "0";
  }

  // Try to get fresh balances from contract using cache to avoid repeated calls
  let balances: [bigint, bigint] | null = null;

  if (blockNumber) {
    balances = await getCachedUnderlyingBalances(vault.id, blockNumber, context);
  }

  if (!balances) {
    // Fallback to cached values if RPC fails
    console.warn(`💾 Using cached TVL for vault ${vault.id} due to RPC failure`);
    const cachedTvl0 = new Decimal(vault.totalValueLockedToken0).mul(new Decimal(token0.derivedBERA).mul(beraPriceUSD));
    const cachedTvl1 = new Decimal(vault.totalValueLockedToken1).mul(new Decimal(token1.derivedBERA).mul(beraPriceUSD));
    return cachedTvl0.plus(cachedTvl1).toString();
  }

  const [amount0Current, amount1Current] = balances;

  try {
    const amount0Decimal = new Decimal(formatUnits(amount0Current, token0.decimals));
    const amount1Decimal = new Decimal(formatUnits(amount1Current, token1.decimals));

    const tvl0USD = amount0Decimal.mul(new Decimal(token0.derivedBERA).mul(beraPriceUSD));
    const tvl1USD = amount1Decimal.mul(new Decimal(token1.derivedBERA).mul(beraPriceUSD));

    return tvl0USD.plus(tvl1USD).toString();
  } catch (error: any) {
    console.error(`💥 Error processing TVL calculation for vault ${vault.id}:`, error?.message);
    // Fallback to cached values
    const cachedTvl0 = new Decimal(vault.totalValueLockedToken0).mul(new Decimal(token0.derivedBERA).mul(beraPriceUSD));
    const cachedTvl1 = new Decimal(vault.totalValueLockedToken1).mul(new Decimal(token1.derivedBERA).mul(beraPriceUSD));
    return cachedTvl0.plus(cachedTvl1).toString();
  }
}

async function calculateAPR(
  timestamp: bigint,
  vault: typeof stickyVault.$inferSelect,
  tvlUSD: string,
  context: Context,
): Promise<{ grossAPR: string, netAPR: string }> {
  const dayId = Math.floor(Number(timestamp) / 86400);
  const hourId = Math.floor(Number(timestamp) / 3600)

  let fromVaultData: typeof vaultDayData.$inferSelect | typeof vaultHourData.$inferSelect | null = null;
  let actualDaysBack = 0;
  let actualHoursBack = 0;

  if (!tvlUSD || new Decimal(tvlUSD).lte("0")) {
    return { grossAPR: "0", netAPR: "0" };
  }

  for (let i = 7; i <= 14 && !fromVaultData; i++) {
    fromVaultData = await context.db.find(vaultDayData, {
      id: `${vault.id}-${dayId - i}`,
    });
    if (fromVaultData) {
      actualDaysBack = i;
      break;
    }
  }

  if (!fromVaultData) {
    for (let i = 24; i <= 24 && !fromVaultData; i += 24) {
      fromVaultData = await context.db.find(vaultHourData, {
        id: `${vault.id}-${hourId - i}`,
      });
      if (fromVaultData) {
        actualHoursBack = i;
        break;
      }
    }
  }

  if (!fromVaultData) {
    for (let i = 15; i <= 30 && !fromVaultData; i++) {
      fromVaultData = await context.db.find(vaultDayData, {
        id: `${vault.id}-${dayId - i}`,
      });
      if (fromVaultData) {
        actualDaysBack = i;
        break;
      }
    }
  }

  if (!fromVaultData) {
    return { grossAPR: "0", netAPR: "0" };
  }

  // Calculate gross fees for the period (fees collected by vault)
  const periodFees = new Decimal(vault.collectedFeesUSD).minus(
    fromVaultData.collectedFeesUSD,
  );
  if (periodFees.lte(0)) return { grossAPR: "0.00", netAPR: "0.00" };

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

  // Calculate gross APR (before management fees)
  const grossAPR = periodFees
    .mul(annualMultiplier)
    .div(tvlUSD)
    .mul(100);

  // Calculate management fees on the period fees
  // Management fee is in basis points (e.g., 100 = 1%)
  const managementFeeRate = new Decimal(vault.managementFee).div(10000); // Convert basis points to decimal
  const managementFeesOnPeriod = periodFees.mul(managementFeeRate);

  // Net fees = gross fees - management fees
  const netPeriodFees = periodFees.minus(managementFeesOnPeriod);

  // Calculate net APR (after management fees)
  const netAPR = netPeriodFees.gt(0)
    ? netPeriodFees.mul(annualMultiplier).div(tvlUSD).mul(100)
    : new Decimal(0);

  return {
    grossAPR: grossAPR.toFixed(2),
    netAPR: netAPR.toFixed(2)
  };
}

async function calculateVolumeForPeriod(
  vault: typeof stickyVault.$inferSelect,
  targetVaultId: string,
  context: Context,
  periodType: "day" | "hour" = "hour"
) {
  const currentTotalVolume = new Decimal(vault.tradingVolumeUSD || "0").plus(vault.depositWithdrawVolumeUSD || "0")
  if (currentTotalVolume.lte("0")) return "0"

  // Extract period ID from target
  const targetMatch = targetVaultId.match(/-([0-9]+)$/)
  if (!targetMatch || !targetMatch[1]) return "0"

  const targetPeriod = parseInt(targetMatch[1])
  const vaultId = targetVaultId.substring(0, targetVaultId.lastIndexOf('-'))

  // Search backwards for the most recent available data near the target period
  let fromVault: typeof vaultDayData.$inferSelect | typeof vaultHourData.$inferSelect | null = null

  if (periodType === "day") {
    // For day calculations, search day data first (exact match, then backwards up to 7 days)
    for (let i = 0; i <= 7 && !fromVault; i++) {
      const searchDay = targetPeriod - i
      fromVault = await context.db.find(vaultDayData, { id: `${vaultId}-${searchDay}` })
    }

    // If still no data, search further backwards up to 30 days
    if (!fromVault) {
      for (let i = 8; i <= 30 && !fromVault; i++) {
        const searchDay = targetPeriod - i
        fromVault = await context.db.find(vaultDayData, { id: `${vaultId}-${searchDay}` })
      }
    }
  } else {
    // For hour calculations, search hour data first, then fall back to day data
    for (let i = 0; i <= 168 && !fromVault; i++) {
      const searchHour = targetPeriod - i
      fromVault = await context.db.find(vaultHourData, { id: `${vaultId}-${searchHour}` })
    }

    if (!fromVault) {
      // Search further backwards for any hour data (up to 30 days)
      for (let i = 168; i <= 720 && !fromVault; i += 24) {
        fromVault = await context.db.find(vaultHourData, { id: `${vaultId}-${targetPeriod - i}` })
      }
    }
  }

  if (!fromVault) return "0"

  const pastTotalVolume = new Decimal(fromVault.tradingVolumeUSD || "0").plus(fromVault.depositWithdrawVolumeUSD || "0")
  const volumeDiff = currentTotalVolume.minus(pastTotalVolume)
  return volumeDiff.gt(0) ? volumeDiff.toString() : "0"
}

async function updateDayVaultData(
  vault: typeof stickyVault.$inferSelect,
  dayVaultId: string,
  startTS: number,
  tvlUSD: string,
  grossAPR: string,
  netAPR: string,
  volumeUSD1D: string,
  volumeUSD30D: string,
  context: Context,
) {
  const vaultData = await context.db.find(vaultDayData, { id: dayVaultId });

  if (!vaultData) {
    await context.db.insert(vaultDayData).values({
      id: dayVaultId,
      date: startTS,
      vault: vault.id,
      tradingVolumeUSD: vault.tradingVolumeUSD || "0",
      depositWithdrawVolumeUSD: vault.depositWithdrawVolumeUSD || "0",
      volumeUSD1D,
      volumeUSD30D,
      totalSupply: vault.totalSupply,
      totalValueLockedToken0: vault.totalValueLockedToken0,
      totalValueLockedToken1: vault.totalValueLockedToken1,
      totalValueLockedUSD: tvlUSD,
      collectedFeesToken0: vault.collectedFeesToken0,
      collectedFeesToken1: vault.collectedFeesToken1,
      collectedFeesUSD: vault.collectedFeesUSD,
      managementFeesToken0: vault.managementFeesToken0 || "0",
      managementFeesToken1: vault.managementFeesToken1 || "0",
      managementFeesUSD: vault.managementFeesUSD || "0",
      apr: grossAPR,
      netAPR: netAPR,
      impermanentLoss: vault.impermanentLoss || "0",
      rebalanceCount: vault.rebalanceCount,
      txCount: vault.txCount,
    });
  } else {
    await context.db.update(vaultDayData, { id: dayVaultId }).set({
      tradingVolumeUSD: vault.tradingVolumeUSD || "0",
      depositWithdrawVolumeUSD: vault.depositWithdrawVolumeUSD || "0",
      volumeUSD1D,
      volumeUSD30D,
      totalSupply: vault.totalSupply,
      totalValueLockedToken0: vault.totalValueLockedToken0,
      totalValueLockedToken1: vault.totalValueLockedToken1,
      totalValueLockedUSD: tvlUSD,
      collectedFeesToken0: vault.collectedFeesToken0,
      collectedFeesToken1: vault.collectedFeesToken1,
      collectedFeesUSD: vault.collectedFeesUSD,
      managementFeesToken0: vault.managementFeesToken0 || "0",
      managementFeesToken1: vault.managementFeesToken1 || "0",
      managementFeesUSD: vault.managementFeesUSD || "0",
      apr: grossAPR,
      netAPR: netAPR,
      impermanentLoss: vault.impermanentLoss || "0",
      rebalanceCount: vault.rebalanceCount,
      txCount: vault.txCount,
    });
  }
}

async function updateHourVaultData(
  vault: typeof stickyVault.$inferSelect,
  hourVaultId: string,
  startTS: number,
  tvlUSD: string,
  grossAPR: string,
  netAPR: string,
  context: Context,
) {
  const vaultData = await context.db.find(vaultHourData, { id: hourVaultId });

  if (!vaultData) {
    await context.db.insert(vaultHourData).values({
      id: hourVaultId,
      periodStartUnix: startTS,
      vault: vault.id,
      tradingVolumeUSD: vault.tradingVolumeUSD || "0",
      depositWithdrawVolumeUSD: vault.depositWithdrawVolumeUSD || "0",
      totalSupply: vault.totalSupply,
      totalValueLockedToken0: vault.totalValueLockedToken0,
      totalValueLockedToken1: vault.totalValueLockedToken1,
      totalValueLockedUSD: tvlUSD,
      collectedFeesToken0: vault.collectedFeesToken0,
      collectedFeesToken1: vault.collectedFeesToken1,
      collectedFeesUSD: vault.collectedFeesUSD,
      managementFeesToken0: vault.managementFeesToken0 || "0",
      managementFeesToken1: vault.managementFeesToken1 || "0",
      managementFeesUSD: vault.managementFeesUSD || "0",
      apr: grossAPR,
      netAPR: netAPR,
      impermanentLoss: vault.impermanentLoss || "0",
      rebalanceCount: vault.rebalanceCount,
      txCount: vault.txCount,
    });
  } else {
    await context.db.update(vaultHourData, { id: hourVaultId }).set({
      tradingVolumeUSD: vault.tradingVolumeUSD || "0",
      depositWithdrawVolumeUSD: vault.depositWithdrawVolumeUSD || "0",
      totalSupply: vault.totalSupply,
      totalValueLockedToken0: vault.totalValueLockedToken0,
      totalValueLockedToken1: vault.totalValueLockedToken1,
      totalValueLockedUSD: tvlUSD,
      collectedFeesToken0: vault.collectedFeesToken0,
      collectedFeesToken1: vault.collectedFeesToken1,
      collectedFeesUSD: vault.collectedFeesUSD,
      managementFeesToken0: vault.managementFeesToken0 || "0",
      managementFeesToken1: vault.managementFeesToken1 || "0",
      managementFeesUSD: vault.managementFeesUSD || "0",
      apr: grossAPR,
      netAPR: netAPR,
      impermanentLoss: vault.impermanentLoss || "0",
      rebalanceCount: vault.rebalanceCount,
      txCount: vault.txCount,
    });
  }
}


