import React, { useState } from 'react';
import { SwapBanner } from '../Common/SwapBanner';
import SwapForm from '../SwapForm/SwapForm';
import type { Address } from 'viem';
import LineChart from '../Charts/LineChart';
import { useQuery } from '@tanstack/react-query';
import { DEFAULT_TOKEN } from '../../utils/lineChart';
import { getTokenLineChartData } from '../../utils/tokenLineChartData';

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
  };

  // Hook pour récupérer les données du line chart (token from)
  const { data: lineData = [], isLoading: lineLoading, error: lineError } = useTokenLineChart(fromTokenAddress);
  const { data: defaultLineData = [], isLoading: defaultLoading, error: defaultError } = useTokenLineChart(DEFAULT_TOKEN);

  const chartData = getTokenLineChartData(lineData, fromToken?.decimals, interval);
  const defaultChartData = getTokenLineChartData(defaultLineData, undefined, interval);

  return (
    <div className={`swap-page-layout ${className}`}>
      <div className="swap-page-layout__banner">
        <SwapBanner />
      </div>
      <div className="swap-page-layout__container">
        <div className="swap-page-layout__chart">
          {poolAddress && fromTokenAddress ? (
            lineLoading ? (
              <div style={{ padding: 32 }}>Loading chart…</div>
            ) : lineError ? (
              <div style={{ padding: 32, color: 'red' }}>Error loading chart</div>
            ) : lineData.length === 0 ? (
              <div style={{ width: '100%', height: 360, overflow: 'hidden', background: '#181A20' }}>
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
              <LineChart
                data={chartData}
                height={340}
                priceFormatter={priceFormatter}
                onIntervalChange={handleIntervalChange}
              />
            )
          ) : (
            defaultLoading ? (
              <div style={{ padding: 32 }}>Loading chart…</div>
            ) : defaultError ? (
              <div style={{ padding: 32, color: 'red' }}>Error loading default chart</div>
            ) : defaultLineData.length === 0 ? (
              <div style={{ width: '100%', height: 360, overflow: 'hidden', background: '#181A20' }}>
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
              <LineChart
                data={defaultChartData}
                height={340}
                priceFormatter={priceFormatter}
                onIntervalChange={handleIntervalChange}
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