import Decimal from "decimal.js";

// Global tracking for event ordering validation
const poolLastBlockProcessed = new Map<string, number>();

export function validateEventOrder(poolId: string, blockNumber: number, eventType: string): boolean {
  const lastBlock = poolLastBlockProcessed.get(poolId) || 0;
  
  if (blockNumber < lastBlock) {
    console.error(`🚨 OUT-OF-ORDER EVENT: Pool ${poolId} ${eventType} at block ${blockNumber} < last processed ${lastBlock}`);
    return false;
  }
  
  poolLastBlockProcessed.set(poolId, Math.max(lastBlock, blockNumber));
  return true;
}

export function validateTVLOperation(
  currentTVL: string, 
  operation: "plus" | "minus", 
  amount: string,
  context: string
): string {
  const tvl = new Decimal(currentTVL || "0");
  const amt = new Decimal(amount || "0");
  
  const result = operation === "plus" ? tvl.plus(amt) : tvl.minus(amt);
  
  // Prevent negative TVL
  if (result.lt(0)) {
    console.error(`🚨 NEGATIVE TVL PREVENTED: ${context}`, {
      currentTVL,
      operation,
      amount,
      wouldBe: result.toString()
    });
    
    // Return 0 instead of negative
    return "0";
  }
  
  return result.toString();
}

export function logTVLChange(
  poolId: string,
  eventType: string, 
  before: string,
  after: string,
  blockNumber: number
) {
  const beforeVal = new Decimal(before || "0");
  const afterVal = new Decimal(after || "0");
  const change = afterVal.minus(beforeVal);
  
  console.log(`📊 Pool ${poolId} Block ${blockNumber} ${eventType}: TVL ${before} → ${after} (${change.gt(0) ? '+' : ''}${change})`);
  
  if (afterVal.lt(0)) {
    console.error(`🚨 NEGATIVE TVL RESULT: Pool ${poolId} ${eventType} = ${after}`);
  }
}