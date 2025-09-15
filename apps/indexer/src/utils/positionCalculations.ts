import Decimal from "decimal.js";
import { Context } from "ponder:registry";
import { stickyVault, vaultUserPosition, vaultPositionSnapshot, token, pool as sPool, bundle } from "ponder:schema";
import { formatUnits } from "viem";
import { getCachedUnderlyingBalances } from "./vaultCache.js";

export interface PositionMetrics {
  currentValueToken0: string;
  currentValueToken1: string;
  currentValueBERA: string;
  currentValueUSD: string;
  totalValue: string;
  unrealizedPnLBERA: string;
  unrealizedPnLUSD: string;
  totalPnLUSD: string;
  totalReturn: string;
  annualizedReturn: string;
}

/**
 * Calculate current position value based on shares and vault state
 */
export async function calculatePositionValue(
  userPosition: typeof vaultUserPosition.$inferSelect,
  vault: typeof stickyVault.$inferSelect,
  beraPriceUSD: Decimal,
  context: Context,
  blockNumber?: bigint
): Promise<PositionMetrics> {
  // Get real-time vault balances
  let amount0Current = new Decimal(vault.totalValueLockedToken0);
  let amount1Current = new Decimal(vault.totalValueLockedToken1);

  // Get token info first (local DB calls)
  const pool = await context.db.find(sPool, { id: vault.pool });
  if (!pool) {
    throw new Error(`Pool not found for vault ${vault.id}`);
  }

  const token0 = await context.db.find(token, { id: pool.token0 });
  const token1 = await context.db.find(token, { id: pool.token1 });

  if (!token0 || !token1) {
    throw new Error(`Tokens not found for pool ${pool.id}`);
  }

  // Try to get fresh balances from contract using cache to avoid repeated calls
  if (blockNumber) {
    const balances = await getCachedUnderlyingBalances(vault.id, blockNumber, context);

    if (balances) {
      try {
        const [amount0Raw, amount1Raw] = balances;
        amount0Current = new Decimal(formatUnits(amount0Raw, token0.decimals));
        amount1Current = new Decimal(formatUnits(amount1Raw, token1.decimals));
      } catch (error) {
        console.warn(`🔄 Using cached balances for vault ${vault.id} due to processing error:`, (error as Error).message);
      }
    } else {
      console.warn(`💾 Using cached balances for vault ${vault.id} due to RPC failure`);
    }
  } else {
    console.warn(`⏭️  No blockNumber provided, using stored vault balances for ${vault.id}`);
  }

  // Calculate user's share of vault assets
  const userShares = new Decimal(userPosition.shares);
  const totalShares = new Decimal(vault.totalSupply);

  let shareRatio = new Decimal(0);
  if (totalShares.gt(0)) {
    shareRatio = userShares.div(totalShares);
  }

  // User's current token amounts
  const currentValueToken0 = shareRatio.mul(amount0Current);
  const currentValueToken1 = shareRatio.mul(amount1Current);

  const token0PriceBERA = new Decimal(token0.derivedBERA);
  const token1PriceBERA = new Decimal(token1.derivedBERA);

  // Calculate values in BERA and USD
  const currentValueToken0BERA = currentValueToken0.mul(token0PriceBERA);
  const currentValueToken1BERA = currentValueToken1.mul(token1PriceBERA);
  const currentValueBERA = currentValueToken0BERA.plus(currentValueToken1BERA);
  const currentValueUSD = currentValueBERA.mul(beraPriceUSD);

  // Calculate PnL
  const initialValueUSD = new Decimal(userPosition.initialValueUSD || "0");
  const unrealizedPnLUSD = currentValueUSD.minus(initialValueUSD);
  const unrealizedPnLBERA = unrealizedPnLUSD.div(beraPriceUSD.gt(0) ? beraPriceUSD : new Decimal(1));

  // Calculate total PnL (realized + unrealized)
  const realizedPnLUSD = new Decimal(userPosition.realizedPnLUSD);
  const totalPnLUSD = realizedPnLUSD.plus(unrealizedPnLUSD);

  // Calculate returns
  let totalReturn = new Decimal(0);
  let annualizedReturn = new Decimal(0);

  if (initialValueUSD.gt(0)) {
    totalReturn = totalPnLUSD.div(initialValueUSD).mul(100);

    // Calculate annualized return based on holding period
    const firstDepositAt = userPosition.firstDepositAt;
    if (firstDepositAt) {
      const holdingPeriodSeconds = Date.now() / 1000 - Number(firstDepositAt);
      const holdingPeriodYears = holdingPeriodSeconds / (365 * 24 * 3600);

      if (holdingPeriodYears > 0) {
        // Simple annualization: (total return / holding period in years)
        annualizedReturn = totalReturn.div(holdingPeriodYears);
      }
    }
  }

  return {
    currentValueToken0: currentValueToken0.toString(),
    currentValueToken1: currentValueToken1.toString(),
    currentValueBERA: currentValueBERA.toString(),
    currentValueUSD: currentValueUSD.toString(),
    totalValue: currentValueUSD.toString(), // Alias
    unrealizedPnLBERA: unrealizedPnLBERA.toString(),
    unrealizedPnLUSD: unrealizedPnLUSD.toString(),
    totalPnLUSD: totalPnLUSD.toString(),
    totalReturn: totalReturn.toString(),
    annualizedReturn: annualizedReturn.toString(),
  };
}

/**
 * Update position entry prices on new deposits
 */
export function calculateWeightedAverageEntryPrice(
  oldDeposits: Decimal,
  oldAvgPrice: Decimal,
  newDeposit: Decimal,
  newPrice: Decimal
): Decimal {
  if (oldDeposits.eq(0)) {
    return newPrice;
  }

  const totalValue = oldDeposits.mul(oldAvgPrice).plus(newDeposit.mul(newPrice));
  const totalAmount = oldDeposits.plus(newDeposit);

  return totalValue.div(totalAmount);
}

/**
 * Create a position snapshot for historical tracking
 */
export async function createPositionSnapshot(
  userPosition: typeof vaultUserPosition.$inferSelect,
  vault: typeof stickyVault.$inferSelect,
  cause: string,
  triggerTxHash: string | undefined,
  timestamp: bigint,
  blockNumber: bigint,
  context: Context
): Promise<void> {
  const snapshotId = `${userPosition.id}-${timestamp}`;

  // Get current vault APR (use netAPR if available, fallback to apy)
  const vaultAPR = vault.netAPR || vault.apy || "0";

  await context.db.insert(vaultPositionSnapshot).values({
    id: snapshotId,
    vaultUserPosition: userPosition.id,
    timestamp,
    blockNumber,

    // Position state
    shares: userPosition.shares,
    currentValueToken0: userPosition.currentValueToken0,
    currentValueToken1: userPosition.currentValueToken1,
    currentValueUSD: userPosition.currentValueUSD,
    currentValueBERA: userPosition.currentValueBERA,

    // Performance metrics
    unrealizedPnLUSD: userPosition.unrealizedPnLUSD,
    totalReturn: userPosition.totalReturn,
    annualizedReturn: userPosition.annualizedReturn,

    // Vault context
    vaultAPR: vaultAPR,
    vaultTVL: vault.totalValueLockedUSD,

    // Metadata
    cause,
    triggerTxHash: triggerTxHash as `0x${string}` | undefined,
  });
}

/**
 * Calculate user's share of fees earned by the vault
 */
export function calculateUserFeesEarned(
  userShares: Decimal,
  vaultTotalShares: Decimal,
  vaultFeesEarnedUSD: Decimal
): Decimal {
  if (vaultTotalShares.eq(0)) {
    return new Decimal(0);
  }

  const shareRatio = userShares.div(vaultTotalShares);
  return shareRatio.mul(vaultFeesEarnedUSD);
}