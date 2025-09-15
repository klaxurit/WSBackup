import Decimal from "decimal.js";

interface TVLSnapshot {
  poolId: string;
  blockNumber: number;
  event: string;
  before: {
    token0: string;
    token1: string;
    bera: string;
    usd: string;
  };
  after: {
    token0: string;
    token1: string;
    bera: string;
    usd: string;
  };
  amounts: {
    amount0: string;
    amount1: string;
  };
}

const tvlHistory = new Map<string, TVLSnapshot[]>();

export function trackTVLChange(
  poolId: string,
  eventType: string,
  blockNumber: number,
  beforeTVL: {
    token0: string;
    token1: string; 
    bera: string;
    usd: string;
  },
  afterTVL: {
    token0: string;
    token1: string;
    bera: string; 
    usd: string;
  },
  amounts: {
    amount0: string;
    amount1: string;
  }
) {
  const snapshot: TVLSnapshot = {
    poolId,
    blockNumber,
    event: eventType,
    before: beforeTVL,
    after: afterTVL,
    amounts
  };

  if (!tvlHistory.has(poolId)) {
    tvlHistory.set(poolId, []);
  }
  
  tvlHistory.get(poolId)!.push(snapshot);
  
  // Check for negative TVL
  const afterT0 = new Decimal(afterTVL.token0);
  const afterT1 = new Decimal(afterTVL.token1);
  const afterBERA = new Decimal(afterTVL.bera);
  const afterUSD = new Decimal(afterTVL.usd);
  
  if (afterT0.lt(0) || afterT1.lt(0) || afterBERA.lt(0) || afterUSD.lt(0)) {
    console.error(`🚨 NEGATIVE TVL DETECTED!`, {
      poolId,
      event: eventType,
      blockNumber,
      before: beforeTVL,
      after: afterTVL,
      amounts,
      history: tvlHistory.get(poolId)?.slice(-5) // Last 5 events
    });
    
    // Trace the problem
    traceNegativeTVL(poolId);
  }
}

function traceNegativeTVL(poolId: string) {
  const history = tvlHistory.get(poolId) || [];
  console.log(`🔍 TVL TRACE for Pool ${poolId}:`);
  
  history.slice(-10).forEach((snapshot, i) => {
    const t0Change = new Decimal(snapshot.after.token0).minus(snapshot.before.token0);
    const t1Change = new Decimal(snapshot.after.token1).minus(snapshot.before.token1);
    
    console.log(`${i + 1}. Block ${snapshot.blockNumber} ${snapshot.event}:`);
    console.log(`   Token0: ${snapshot.before.token0} → ${snapshot.after.token0} (${t0Change.gt(0) ? '+' : ''}${t0Change})`);
    console.log(`   Token1: ${snapshot.before.token1} → ${snapshot.after.token1} (${t1Change.gt(0) ? '+' : ''}${t1Change})`);
    console.log(`   Amounts: [${snapshot.amounts.amount0}, ${snapshot.amounts.amount1}]`);
  });
}

export function getTVLHistory(poolId: string): TVLSnapshot[] {
  return tvlHistory.get(poolId) || [];
}

export function validateAndFixTVL(
  currentTVL: string,
  operation: 'add' | 'subtract',
  amount: string,
  context: string
): string {
  const tvl = new Decimal(currentTVL || "0");
  const amt = new Decimal(amount || "0");
  
  const result = operation === 'add' ? tvl.plus(amt) : tvl.minus(amt);
  
  if (result.lt(0)) {
    console.error(`🚨 PREVENTED NEGATIVE TVL: ${context}`, {
      currentTVL,
      operation,
      amount,
      wouldBe: result.toString()
    });
    
    return "0"; // Prevent negative
  }
  
  return result.toString();
}