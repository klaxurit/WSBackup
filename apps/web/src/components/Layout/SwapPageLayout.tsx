import React, { useState, useCallback } from 'react';
import { NewBanner } from '../Common/NewBanner';
import { PageContentTransition } from '../Transitions/PageContentTransition';
import bear from '../../assets/bear_icon.png';
import SwapForm from '../SwapForm/SwapForm';
import { ChartWidget } from '../Charts/ChartWidget';
import type { ChartType, ChartInterval } from '../../types/chart';
import { DEFAULT_TOKEN } from '../../utils/lineChart';
import { getStatsAddress } from '../../utils/tokenMapping';
import type { BerachainToken } from '../../hooks/useBerachainTokenList';

interface SwapPageLayoutProps {
  className?: string;
  onToggleSidebar: () => void;
}

const priceFormatter = (price: number) => price.toFixed(2);

export const SwapPageLayout: React.FC<SwapPageLayoutProps> = ({
  className = "",
  onToggleSidebar
}) => {
  const [fromToken, setFromToken] = useState<BerachainToken | null>(null);
  const [toToken, setToToken] = useState<BerachainToken | null>(null);
  const [chartType, setChartType] = useState<ChartType>('area');
  const [interval, setInterval] = useState<ChartInterval>('1H');

  const handleTokensChange = useCallback((
    _poolAddress: string | null,
    newFromToken: BerachainToken | null,
    newToToken: BerachainToken | null
  ) => {
    setFromToken(newFromToken);
    setToToken(newToToken);
  }, []);

  // Configuration du chart basée sur le token sélectionné
  const chartConfig = React.useMemo(() => {
    // Priorité : fromToken d'abord, puis toToken si pas de fromToken
    const selectedToken = fromToken || toToken;

    if (!selectedToken) {
      return {
        type: 'default',
        tokenAddress: DEFAULT_TOKEN,
        message: "These chart numbers aren't real—just a placeholder flex for now. No on‑chain juice yet… stay locked in, we're gonna pump in live data soon.",
        showOverlay: true,
        dataType: 'token' as const
      };
    }

    const statsAddress = getStatsAddress(selectedToken.address as `0x${string}`);
    return {
      type: 'single-token',
      tokenAddress: statsAddress,
      message: `Showing price data for ${selectedToken.symbol}${statsAddress !== selectedToken.address ? ' (using WBERA data)' : ''}`,
      showOverlay: false,
      dataType: 'token' as const
    };
  }, [fromToken, toToken]);

  const handleChartTypeChange = (newType: ChartType) => {
    setChartType(newType);
  };

  const handleIntervalChange = (newInterval: ChartInterval) => {
    setInterval(newInterval);
  };

  const getNoDataMessage = () => {
    return chartConfig.message;
  };

  // Déterminer le token à utiliser pour les décimales
  const selectedToken = fromToken || toToken;

  return (
    <PageContentTransition className={`swap-page-layout ${className}`}>
      <div className="swap-page-layout__banner">
        <NewBanner
          title="Swap"
          subtitle="Trade your winners tokens"
          image={bear}
          imageAlt="bear head"
        />
      </div>

      <div className="swap-page-layout__container">
        <div className="swap-page-layout__chart">

          <ChartWidget
            tokenAddress={chartConfig.tokenAddress}
            chartType={chartType}
            interval={interval}
            height={500}
            showToolbar={true}
            priceFormatter={priceFormatter}
            onChartTypeChange={handleChartTypeChange}
            onIntervalChange={handleIntervalChange}
            tokenDecimals={selectedToken?.decimals}
            showNoDataOverlay={chartConfig.showOverlay}
            noDataMessage={getNoDataMessage()}
            dataType={chartConfig.dataType}
          />
        </div>
        <div className="swap-page-layout__swap">
          <SwapForm
            toggleSidebar={onToggleSidebar}
            isSticky={true}
            onPoolChange={handleTokensChange}
          />
        </div>
      </div>
    </PageContentTransition>
  );
};