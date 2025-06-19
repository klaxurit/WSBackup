import React, { useMemo } from 'react';
import type { Address } from 'viem';

interface DexScreenerChartProps {
  poolAddress: Address | null;
  className?: string;
}

export const DexScreenerChart: React.FC<DexScreenerChartProps> = ({
  poolAddress,
  className = ""
}) => {
  const iframeUrl = useMemo(() => {
    if (!poolAddress) {
      // URL par défaut si aucune pool n'est sélectionnée
      return 'https://dexscreener.com/berachain?embed=1&theme=dark&info=0&tabs=0&footer=0&interval=60&trades=0&loadChartSettings=0';
    }

    // URL avec l'adresse de la pool spécifique
    return `https://dexscreener.com/berachain/${poolAddress}?embed=1&theme=dark&info=0&tabs=0&footer=0&interval=60&trades=0&loadChartSettings=0`;
  }, [poolAddress]);

  return (
    <iframe
      src={iframeUrl}
      className={`dexscreener-chart ${className}`}
      title="DexScreener Chart"
      frameBorder="0"
      allowFullScreen
    />
  );
}; 