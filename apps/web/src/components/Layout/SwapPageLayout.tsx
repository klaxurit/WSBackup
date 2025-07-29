// SwapPageLayout.tsx - Modifications à apporter

import React, { useState } from 'react';
import { NewBanner } from '../Common/NewBanner';
import bear from '../../assets/bear_icon.png';
import SwapForm from '../SwapForm/SwapForm';
import type { Address } from 'viem';
import LineChart from '../Charts/LineChart';
import { useQuery } from '@tanstack/react-query';
import { DEFAULT_TOKEN } from '../../utils/lineChart';
import { getTokenLineChartData } from '../../utils/tokenLineChartData';
// NOUVEAU IMPORT :
import { shouldShowNoDataOverlay } from '../../utils/chartDataValidation';

interface SwapPageLayoutProps {
  className?: string;
  onToggleSidebar: () => void;
}

function useTokenLineChart(tokenAddress?: string | null) {
  return useQuery({
    queryKey: ['token-line-chart', tokenAddress],
    enabled: !!tokenAddress,
    queryFn: async () => {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/stats/token/${tokenAddress}`);
      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      return data.map((d: any) => ({
        time: Math.floor(d.timestamp / 1000),
        value: d.price,
      }));
    },
    staleTime: 60 * 1000,
  });
}

const priceFormatter = (price: number) => price.toFixed(2);

export const SwapPageLayout: React.FC<SwapPageLayoutProps> = ({
  className = "",
  onToggleSidebar
}) => {
  const [poolAddress, setPoolAddress] = useState<Address | null>(null);
  const [fromTokenAddress, setFromTokenAddress] = useState<string | null>(null);
  const [fromToken, setFromToken] = useState<any>(null);
  const [interval, setInterval] = useState<'1H' | '1D' | '1W' | '1M' | 'MAX'>('1D');

  // NOUVEAU STATE :
  const [selectedInterval, setSelectedInterval] = useState('1H');

  const handlePoolChange = (
    address: string | null,
    fromTokenObj?: any
  ) => {
    setPoolAddress(address as Address | null);
    if (fromTokenObj?.address) setFromTokenAddress(fromTokenObj.address);
    if (fromTokenObj) setFromToken(fromTokenObj);
  };

  const handleIntervalChange = (interval: string) => {
    setInterval(interval as '1H' | '1D' | '1W' | '1M' | 'MAX');
    setSelectedInterval(interval);
  };

  const { data: lineData = [], isLoading: lineLoading, error: lineError } = useTokenLineChart(fromTokenAddress);
  const { data: defaultLineData = [], isLoading: defaultLoading, error: defaultError } = useTokenLineChart(DEFAULT_TOKEN);
  const chartData = getTokenLineChartData(lineData, fromToken?.decimals, interval);
  const defaultChartData = getTokenLineChartData(defaultLineData, undefined, interval);
  const showOverlayForSelectedPool = shouldShowNoDataOverlay(
    lineData,
    selectedInterval,
    !!poolAddress
  );

  const showOverlayForDefault = shouldShowNoDataOverlay(
    defaultLineData,
    selectedInterval,
    false
  );

  const getNoDataMessage = (hasData: boolean, interval: string, isPoolSelected: boolean) => {
    if (!hasData) {
      return isPoolSelected
        ? "No data available for this token pair. Select a different pool or try again later."
        : "These chart numbers aren't real—just a placeholder flex for now. No on‑chain juice yet… stay locked in, we're gonna pump in live data soon.";
    }

    return `Not enough data available for ${interval} interval. We need more historical data to display this timeframe.`;
  };

  return (
    <div className={`swap-page-layout ${className}`}>
      <div className="swap-page-layout__banner">
        <NewBanner title="Swap" subtitle="Trade your winners tokens" image={bear} imageAlt="bear head" />
      </div>
      <div className="swap-page-layout__container">
        <div className="swap-page-layout__chart">
          {poolAddress && fromTokenAddress ? (
            lineLoading ? (
              <div style={{ padding: 32 }}>Loading chart…</div>
            ) : lineError ? (
              <div style={{ padding: 32, color: 'red' }}>Error loading chart</div>
            ) : (
              <LineChart
                data={chartData}
                height={340}
                priceFormatter={priceFormatter}
                onIntervalChange={handleIntervalChange}
                showNoDataOverlay={showOverlayForSelectedPool}
                noDataMessage={getNoDataMessage(lineData.length > 0, selectedInterval, true)}
              />
            )
          ) : (
            defaultLoading ? (
              <div style={{ padding: 32 }}>Loading chart…</div>
            ) : defaultError ? (
              <div style={{ padding: 32, color: 'red' }}>Error loading default chart</div>
            ) : (
              <LineChart
                data={defaultChartData}
                height={340}
                priceFormatter={priceFormatter}
                onIntervalChange={handleIntervalChange}
                showNoDataOverlay={showOverlayForDefault}
                noDataMessage={getNoDataMessage(defaultLineData.length > 0, selectedInterval, false)}
              />
            )
          )}
        </div>
        <div className="swap-page-layout__swap">
          <SwapForm
            onPoolChange={(address, fromToken) => handlePoolChange(address, fromToken)}
            toggleSidebar={onToggleSidebar}
            isSticky={true}
          />
        </div>
      </div>
    </div>
  );
};