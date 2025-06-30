import React, { useState } from 'react';
import { SwapBanner } from '../Common/SwapBanner';
import SwapForm from '../SwapForm/SwapForm';
import type { Address } from 'viem';
import ChartCandle from '../Charts/ChartCandle';
import { usePoolHistory } from '../../hooks/usePoolHistory';

interface SwapPageLayoutProps {
  className?: string;
  onToggleSidebar: () => void;
}

export const SwapPageLayout: React.FC<SwapPageLayoutProps> = ({
  className = "",
  onToggleSidebar
}) => {
  const [poolAddress, setPoolAddress] = useState<Address | null>(null);

  const handlePoolChange = (
    address: string | null
  ) => {
    setPoolAddress(address as Address | null);
  };

  // Hook to fetch the selected pool's price history
  const { data: candles = [], isLoading } = usePoolHistory(poolAddress);

  return (
    <div className={`swap-page-layout ${className}`}>
      <div className="swap-page-layout__banner">
        <SwapBanner />
      </div>
      <div className="swap-page-layout__container">
        <div className="swap-page-layout__chart">
          {isLoading ? (
            <div style={{ padding: 32 }}>Loading chart…</div>
          ) : candles.length === 0 ? (
            <div style={{ width: '100%', height: 360, borderRadius: 12, overflow: 'hidden', background: '#181A20' }}>
              <iframe
                src="https://fr.tradingview.com/widgetembed/?symbol=BERAUSDC&interval=D&hidesidetoolbar=1&hidetoptoolbar=1&theme=dark&style=1&locale=en"
                style={{
                  width: '100%',
                  height: '100%',
                  border: 'none',
                  outline: 'none',
                  boxShadow: 'none',
                  background: 'transparent'
                }}
                allowFullScreen
                title="Default TradingView Chart"
                scrolling="no"
              />
            </div>
          ) : (
            <ChartCandle data={candles} height={340} />
          )}
        </div>
        <div className="swap-page-layout__swap">
          <SwapForm
            onPoolChange={handlePoolChange}
            toggleSidebar={onToggleSidebar}
            isSticky={true}
          />
        </div>
      </div>
    </div>
  );
};