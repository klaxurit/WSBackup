import React, { useMemo } from 'react';

interface DexScreenerChartProps {
  poolAddress: string | null;
}

// Default pool containing BERA (should be dynamic later)
const DEFAULT_BERA_POOL = '0x4a2ca01312065a96a93cb37172217e4b42003c0d'; // Real BERA/USDC pool

export const DexScreenerChart: React.FC<DexScreenerChartProps> = ({ poolAddress }) => {
  // Fallback to a BERA pool if no pool is selected
  const effectivePoolAddress = useMemo(() => {
    if (poolAddress) return poolAddress;
    // TODO: Make dynamic (fetch pools and find a pool with BERA)
    return DEFAULT_BERA_POOL;
  }, [poolAddress]);

  if (!effectivePoolAddress || effectivePoolAddress === '0x0000000000000000000000000000000000000000') {
    return <div style={{ minHeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>No BERA pool found</div>;
  }
  // DexScreener widget URL for the pool
  const url = `https://dexscreener.com/berachain/${effectivePoolAddress}?embed=1&theme=dark&trades=0&info=0&tools=0&header=0`;
  return (
    <iframe
      src={url}
      style={{ width: '100%', minHeight: 500, border: 'none', borderRadius: 8 }}
      allowFullScreen
      title="DexScreener Chart"
    />
  );
}; 