import React, { useMemo } from 'react';

interface DexScreenerChartProps {
  poolAddress: string | null;
}

// Pool par défaut contenant BERA (à rendre dynamique plus tard)
const DEFAULT_BERA_POOL = '0x4a2ca01312065a96a93cb37172217e4b42003c0d'; // Pool BERA/USDC réelle

export const DexScreenerChart: React.FC<DexScreenerChartProps> = ({ poolAddress }) => {
  // Fallback sur une pool BERA si aucune pool sélectionnée
  const effectivePoolAddress = useMemo(() => {
    if (poolAddress) return poolAddress;
    // TODO: Rendre dynamique (fetch pools et trouver une pool avec BERA)
    return DEFAULT_BERA_POOL;
  }, [poolAddress]);

  if (!effectivePoolAddress || effectivePoolAddress === '0x0000000000000000000000000000000000000000') {
    return <div style={{ minHeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>No BERA pool found</div>;
  }
  // URL DexScreener widget pour la pool
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