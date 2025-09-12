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

export async function updateVaultStats(
  timestamp: bigint,
  vault: typeof stickyVault.$inferSelect,
  beraPriceUSD: Decimal,
  context: Context,
) {
  if (!vault) return;

  const dayId = Math.floor(Number(timestamp) / 86400);
  const hourId = Math.floor(Number(timestamp) / 3600);
  const dayStart = dayId * 86400;
  const hourStart = hourId * 3600;
  const dayVaultId = `${vault.id}-${dayId}`;
  const hourVaultId = `${vault.id}-${hourId}`;

  const tvlUSD = await calculateTVL(vault, beraPriceUSD, context);
  const aprResults = await calculateAPR(timestamp, vault, tvlUSD, context);
  const volumeUSD1D = await calculateVolumeForPeriod(vault, `${vault.id}-${hourId - 24}`, context)
  const volumeUSD30D = await calculateVolumeForPeriod(vault, `${vault.id}-${hourId - (24 * 30)}`, context)

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
}

async function calculateTVL(
  vault: typeof stickyVault.$inferSelect,
  beraPriceUSD: Decimal,
  context: Context,
): Promise<string> {
  try {

    const [amount0Current, amount1Current] = await context.client.readContract({
      address: vault.id,
      abi: context.contracts.svVaults.abi,
      functionName: "getUnderlyingBalances",
    });

    const pool = await context.db.find(sPool, { id: vault.pool });
    if (!pool) return "0";

    const token0 = await context.db.find(sToken, { id: pool.token0 });
    const token1 = await context.db.find(sToken, { id: pool.token1 });
    if (!token0 || !token1) return "0";

    const amount0Decimal = new Decimal(formatUnits(amount0Current, token0.decimals));
    const amount1Decimal = new Decimal(formatUnits(amount1Current, token1.decimals));

    const tvl0USD = amount0Decimal.mul(new Decimal(token0.derivedBERA).mul(beraPriceUSD))
    const tvl1USD = amount1Decimal.mul(new Decimal(token1.derivedBERA).mul(beraPriceUSD))

    return tvl0USD.plus(tvl1USD).toString();
  } catch (error) {
    console.error(`Error calculating TVL for vault ${vault.id}:`, error);
    return "0";
  }
}

async function calculateAPR(
  timestamp: bigint,
  vault: typeof stickyVault.$inferSelect,
  tvlUSD: string,
  context: Context,
): Promise<{grossAPR: string, netAPR: string}> {
  const dayId = Math.floor(Number(timestamp) / 86400);
  const hourId = Math.floor(Number(timestamp) / 3600)

  let fromVaultData: typeof vaultDayData.$inferSelect | typeof vaultHourData.$inferSelect | null = null;
  let actualDaysBack = 0;
  let actualHoursBack = 0;

  if (!tvlUSD || new Decimal(tvlUSD).lte("0")) {
    return {grossAPR: "0", netAPR: "0"};
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
    return {grossAPR: "0", netAPR: "0"};
  }

  // Calculate gross fees for the period (fees collected by vault)
  const periodFees = new Decimal(vault.collectedFeesUSD).minus(
    fromVaultData.collectedFeesUSD,
  );
  if (periodFees.lte(0)) return {grossAPR: "0.00", netAPR: "0.00"};

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

async function calculateVolumeForPeriod(vault: typeof stickyVault.$inferSelect, targetHourVaultId: string, context: Context) {
  const currentTotalVolume = new Decimal(vault.tradingVolumeUSD || "0").plus(vault.depositWithdrawVolumeUSD || "0")
  if (currentTotalVolume.lte("0")) return "0"

  // Extract hour ID from target
  const targetHourMatch = targetHourVaultId.match(/-([0-9]+)$/)
  if (!targetHourMatch || !targetHourMatch[1]) return "0"

  const targetHour = parseInt(targetHourMatch[1])
  const VaultId = targetHourVaultId.substring(0, targetHourVaultId.lastIndexOf('-'))

  // Search backwards for the most recent available data near the target hour
  let fromVault: typeof vaultHourData.$inferSelect | null = null

  // Try exact hour first, then search backwards up to 7 days (168 hours)
  for (let i = 0; i <= 168 && !fromVault; i++) {
    const searchHour = targetHour - i
    fromVault = await context.db.find(vaultHourData, { id: `${VaultId}-${searchHour}` })
  }

  if (!fromVault) {
    // Search further backwards for any hour data (up to 30 days)
    for (let i = 168; i <= 720 && !fromVault; i += 24) {
      fromVault = await context.db.find(vaultHourData, { id: `${VaultId}-${targetHour - i}` })
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


