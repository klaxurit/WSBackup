import React, { useState } from 'react';
import { NewBanner } from '../Common/NewBanner';
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
  // Suppression de poolAddress car non utilisé
  const [fromToken] = useState<BerachainToken | null>(null);
  const [toToken] = useState<BerachainToken | null>(null);
  const [chartType, setChartType] = useState<ChartType>('area');
  const [interval, setInterval] = useState<ChartInterval>('1H');

  const chartConfig = React.useMemo(() => {
    if (!fromToken) {
      return {
        type: 'default',
        tokenAddress: DEFAULT_TOKEN,
        message: "These chart numbers aren't real—just a placeholder flex for now. No on‑chain juice yet… stay locked in, we're gonna pump in live data soon.",
        showOverlay: true,
        dataType: 'token' as const
      };
    }

    const statsAddress = getStatsAddress(fromToken.address);
    return {
      type: 'single-token',
      tokenAddress: statsAddress,
      message: `Showing price data for ${fromToken.symbol}${statsAddress !== fromToken.address ? ' (using WBERA data)' : ''}`,
      showOverlay: false,
      dataType: 'token' as const
    };
  }, [fromToken]);

  const handleChartTypeChange = (newType: ChartType) => {
    setChartType(newType);
  };

  const handleIntervalChange = (newInterval: ChartInterval) => {
    setInterval(newInterval);
  };

  const getNoDataMessage = () => {
    return chartConfig.message;
  };

  return (
    <div className={`swap-page-layout ${className}`}>
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
          {/* DEBUG INFO - à retirer en production */}
          {process.env.NODE_ENV === 'development' && (
            <div style={{ padding: '8px', background: '#f0f0f0', fontSize: '12px', marginBottom: '8px' }}>
              <strong>Chart Debug:</strong> Type: {chartConfig.type} |
              Token: {chartConfig.tokenAddress} |
              FromToken: {fromToken?.symbol || 'none'} |
              ToToken: {toToken?.symbol || 'none'} |
              DataType: {chartConfig.dataType}
            </div>
          )}

          <ChartWidget
            tokenAddress={chartConfig.tokenAddress}
            chartType={chartType}
            interval={interval}
            height={500}
            showToolbar={true}
            priceFormatter={priceFormatter}
            onChartTypeChange={handleChartTypeChange}
            onIntervalChange={handleIntervalChange}
            tokenDecimals={fromToken?.decimals}
            showNoDataOverlay={chartConfig.showOverlay}
            noDataMessage={getNoDataMessage()}
            dataType={chartConfig.dataType}
          />
        </div>

        <div className="swap-page-layout__swap">
          <SwapForm
            toggleSidebar={onToggleSidebar}
            isSticky={true}
          />
        </div>
      </div>
    </div>
  );
};