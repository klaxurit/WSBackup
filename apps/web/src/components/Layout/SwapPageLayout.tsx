import React, { useState, useMemo } from 'react';
import { SwapBanner } from '../Common/SwapBanner';
import SwapForm from '../SwapForm/SwapForm';
import { useResponsiveLayout } from '../../hooks/useResponsiveLayout';
import type { BerachainToken } from '../../hooks/useBerachainTokenList';
import { usePoolAddress } from '../../utils/getPoolAddress';

interface SwapPageLayoutProps {
  onToggleSidebar: () => void;
}

export const SwapPageLayout: React.FC<SwapPageLayoutProps> = ({
  onToggleSidebar,
}) => {
  const { containerGap } = useResponsiveLayout();

  // Pool par défaut si aucun couple reconnu
  const DEFAULT_POOL = '0x56abfaf40f5b7464e9cc8cff1af13863d6914508';
  const [fromToken, setFromToken] = useState<BerachainToken | null>(null);
  const [toToken, setToToken] = useState<BerachainToken | null>(null);

  // Logique pour choisir le fee selon le couple de tokens
  const fee = useMemo(() => {
    if (!fromToken || !toToken) return 3000;
    // Adresses à adapter selon ton projet
    const mHoney = '0x41936CA1174EE86B24c05a07653Df4Be68A0ED02'.toLowerCase();
    const mBera = '0xC672D663A6945E4D7fCd3b8dcb73f9a5116F19E1'.toLowerCase();
    const mUSDCe = '0xEB587A20C3fF1aa2B6DA888483eb1ffb7009c020'.toLowerCase();

    const a = fromToken.address.toLowerCase();
    const b = toToken.address.toLowerCase();

    if ((a === mHoney && b === mBera) || (a === mBera && b === mHoney)) return 3000;
    if ((a === mHoney && b === mUSDCe) || (a === mUSDCe && b === mHoney)) return 500;
    return 3000; // fallback
  }, [fromToken, toToken]);

  const { poolAddress, isLoading } = usePoolAddress(fromToken?.address, toToken?.address, fee);

  const handlePoolChange = (pool: string | null, from: BerachainToken | null, to: BerachainToken | null) => {
    setFromToken(from);
    setToToken(to);
  };

  // Si la pool n'existe pas, fallback sur la pool par défaut
  const poolAddressStr = typeof poolAddress === 'string' ? poolAddress : undefined;
  const validPool = poolAddressStr && /^0x[0-9a-fA-F]{40}$/.test(poolAddressStr) && !/^0x0{40}$/.test(poolAddressStr);
  const chartPoolAddress = validPool ? poolAddressStr : DEFAULT_POOL;

  return (
    <div className="swap-page-layout">
      {/* Bannière pleine largeur */}
      <section className="swap-page-layout__banner">
        <SwapBanner
          title="Swap"
        />
      </section>

      {/* Section principale avec Chart + SwapForm */}
      <section className="swap-page-layout__main">
        <div
          className="swap-page-layout__container"
          style={{ gap: containerGap }}
        >
          {/* Chart - 70% sur desktop */}
          <div className="swap-page-layout__chart">
            <iframe
              src={`https://dexscreener.com/hyperevm/${chartPoolAddress}?embed=1&theme=dark&info=0&tabs=0&footer=0&interval=60&trades=0&loadChartSettings=0`}
              title="DexScreener Chart"
              className="dexscreener-chart"
            />
          </div>

          {/* SwapForm - 30% sur desktop */}
          <div className="swap-page-layout__swap">
            <SwapForm
              toggleSidebar={onToggleSidebar}
              isSticky={true}
              onPoolChange={handlePoolChange}
            />
          </div>
        </div>
      </section>
    </div>
  );
};