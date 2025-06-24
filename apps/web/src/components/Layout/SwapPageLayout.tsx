import React, { useState } from 'react';
import { SwapBanner } from '../Common/SwapBanner';
import SwapForm from '../SwapForm/SwapForm';
import { DexScreenerChart } from '../Charts/DexScreenerChart';
import type { Address } from 'viem';

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

  return (
    <div className={`swap-page-layout ${className}`}>
      <div className="swap-page-layout__banner">
        <SwapBanner />
      </div>
      <div className="swap-page-layout__container">
        <div className="swap-page-layout__chart">
          <DexScreenerChart poolAddress={poolAddress} />
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