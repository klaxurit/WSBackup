import Decimal from "decimal.js";

export function validateTVL(tvl: string, context: string): string {
  const tvlDecimal = new Decimal(tvl);
  
  if (tvlDecimal.lt(0)) {
    console.error(`🚨 NEGATIVE TVL DETECTED: ${tvl} in ${context}`);
    // Log the issue but continue with 0 to prevent cascade failures
    return "0";
  }
  
  if (tvlDecimal.gt("1e15")) { // Sanity check for extremely large values
    console.warn(`⚠️ SUSPICIOUS HIGH TVL: ${tvl} in ${context}`);
  }
  
  return tvl;
}

export function validatePoolLiquidity(liquidity: bigint, context: string): bigint {
  if (liquidity < 0n) {
    console.error(`🚨 NEGATIVE POOL LIQUIDITY DETECTED: ${liquidity} in ${context}`);
    return 0n;
  }
  
  return liquidity;
}

export function logTVLChange(
  before: string, 
  after: string, 
  operation: string,
  context: string
) {
  const beforeVal = new Decimal(before);
  const afterVal = new Decimal(after);
  const diff = afterVal.minus(beforeVal);
  
  console.log(`📊 TVL Change - ${context} ${operation}: ${before} → ${after} (${diff.gt(0) ? '+' : ''}${diff})`);
  
  if (beforeVal.gt(0) && afterVal.eq(0)) {
    console.warn(`⚠️ TVL went to ZERO in ${context} during ${operation}`);
  }
}