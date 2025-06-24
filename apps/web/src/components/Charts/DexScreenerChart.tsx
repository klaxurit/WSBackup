import React, { useMemo } from 'react';
import type { Address } from 'viem';

interface DexScreenerChartProps {
  poolAddress: Address | null;
  className?: string;
  theme?: 'dark' | 'light';
  showInfo?: boolean;
  showTabs?: boolean;
  showFooter?: boolean;
  interval?: 1 | 5 | 15 | 30 | 60 | 240 | 720 | 1440; // minutes
  showTrades?: boolean;
  showChartSettings?: boolean;
}

export const DexScreenerChart: React.FC<DexScreenerChartProps> = ({
  poolAddress,
  className = "",
  theme = 'dark',
  showInfo = false,
  showTabs = false,
  showFooter = false,
  interval = 60,
  showTrades = false,
  showChartSettings = false
}) => {
  const iframeUrl = useMemo(() => {
    const baseUrl = !poolAddress
      ? 'https://dexscreener.com/berachain'
      : `https://dexscreener.com/berachain/${poolAddress}`;

    const params = new URLSearchParams({
      embed: '1',
      theme,
      info: showInfo ? '1' : '0',
      tabs: showTabs ? '1' : '0',
      footer: showFooter ? '1' : '0',
      interval: interval.toString(),
      trades: showTrades ? '1' : '0',
      loadChartSettings: showChartSettings ? '1' : '0'
    });

    return `${baseUrl}?${params.toString()}`;
  }, [poolAddress, theme, showInfo, showTabs, showFooter, interval, showTrades, showChartSettings]);

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