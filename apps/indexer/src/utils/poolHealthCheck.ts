import { Context } from "ponder:registry";
import { pool as sPool } from "ponder:schema";
import Decimal from "decimal.js";

export async function checkPoolHealth(context: Context) {
  console.log("🔍 Running Pool Health Check...");
  
  const pools = await context.db.sql
    .select()
    .from(sPool);
    
  let negativeCount = 0;
  let zeroLiquidityCount = 0;
  
  for (const pool of pools) {
    // Check for negative TVL
    if (new Decimal(pool.totalValueLockedUSD).lt(0) || 
        new Decimal(pool.totalValueLockedBERA).lt(0) ||
        new Decimal(pool.totalValueLockedToken0).lt(0) ||
        new Decimal(pool.totalValueLockedToken1).lt(0)) {
      
      console.error(`🚨 Pool ${pool.id} has NEGATIVE TVL:`, {
        tvlUSD: pool.totalValueLockedUSD,
        tvlBERA: pool.totalValueLockedBERA,
        tvlToken0: pool.totalValueLockedToken0,
        tvlToken1: pool.totalValueLockedToken1,
        liquidity: pool.liquidity.toString()
      });
      negativeCount++;
    }
    
    // Check for negative liquidity
    if (pool.liquidity < 0n) {
      console.error(`🚨 Pool ${pool.id} has NEGATIVE LIQUIDITY: ${pool.liquidity}`);
    }
    
    // Check for zero liquidity with non-zero TVL
    if (pool.liquidity === 0n && new Decimal(pool.totalValueLockedUSD).gt(0)) {
      console.warn(`⚠️ Pool ${pool.id} has ZERO liquidity but TVL > 0: ${pool.totalValueLockedUSD}`);
      zeroLiquidityCount++;
    }
  }
  
  console.log(`✅ Health Check Complete: ${negativeCount} negative TVL, ${zeroLiquidityCount} zero liquidity issues`);
  
  return { negativeCount, zeroLiquidityCount, totalPools: pools.length };
}