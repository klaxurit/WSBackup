import React, { useState } from 'react';
import { NewBanner } from '../Common/NewBanner';
import bear from '../../assets/bear_icon.png';
import SwapForm from '../SwapForm/SwapForm';
import type { Address } from 'viem';
import { ChartWidget } from '../Charts/ChartWidget';
import type { ChartType, ChartInterval } from '../../types/chart';
import { DEFAULT_TOKEN } from '../../utils/lineChart';

interface SwapPageLayoutProps {
  className?: string;
  onToggleSidebar: () => void;
}

const priceFormatter = (price: number) => price.toFixed(2);

export const SwapPageLayout: React.FC<SwapPageLayoutProps> = ({
  className = "",
  onToggleSidebar
}) => {
  // États pour le pool sélectionné
  const [poolAddress, setPoolAddress] = useState<Address | null>(null);
  const [fromTokenAddress, setFromTokenAddress] = useState<string | null>(null);
  const [fromToken, setFromToken] = useState<any>(null);

  // États pour les contrôles du chart (nouveaux)
  const [chartType, setChartType] = useState<ChartType>('area');
  const [interval, setInterval] = useState<ChartInterval>('1H');

  // Gestionnaires d'événements
  const handlePoolChange = (
    address: string | null,
    fromTokenObj?: any
  ) => {
    setPoolAddress(address as Address | null);
    if (fromTokenObj?.address) setFromTokenAddress(fromTokenObj.address);
    if (fromTokenObj) setFromToken(fromTokenObj);
  };

  const handleChartTypeChange = (newType: ChartType) => {
    setChartType(newType);
  };

  const handleIntervalChange = (newInterval: ChartInterval) => {
    setInterval(newInterval);
  };

  // Déterminer quelle adresse de token utiliser pour le chart
  const chartTokenAddress = fromTokenAddress || DEFAULT_TOKEN;

  // Messages personnalisés selon le contexte
  const getNoDataMessage = () => {
    if (fromTokenAddress && poolAddress) {
      return "No data available for this token pair. Select a different pool or try again later.";
    }
    return "These chart numbers aren't real—just a placeholder flex for now. No on‑chain juice yet… stay locked in, we're gonna pump in live data soon.";
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
          <ChartWidget
            tokenAddress={chartTokenAddress}
            chartType={chartType}
            interval={interval}
            height={500}
            showToolbar={true}
            priceFormatter={priceFormatter}
            onChartTypeChange={handleChartTypeChange}
            onIntervalChange={handleIntervalChange}
            tokenDecimals={fromToken?.decimals}
            showNoDataOverlay={!fromTokenAddress} // Afficher overlay seulement si pas de token sélectionné
            noDataMessage={getNoDataMessage()}
          />
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