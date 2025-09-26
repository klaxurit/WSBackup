import React, { useState, useCallback, useMemo } from 'react';
import { NewBanner } from '../Common/NewBanner';
import { PageContentTransition } from '../Transitions/PageContentTransition';
import bear from '../../assets/bear_icon.png';
import SwapForm from '../SwapForm/SwapForm';
import { ChartWidget } from '../Charts/ChartWidget';
import type { ChartType, ChartInterval, ChartMetric } from '../../types/chart';
import { usePoolSelectionWithFallback } from '../../hooks/usePoolSelection';
import { usePoolByTokens } from '../../hooks/usePonderChartData';
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
  const [interval, setInterval] = useState<ChartInterval>('1D');
  const [metric, setMetric] = useState<ChartMetric>('price');

  const handleTokensChange = useCallback((
    _poolAddress: string | null,
    newFromToken: BerachainToken | null,
    newToToken: BerachainToken | null
  ) => {
    setFromToken(newFromToken);
    setToToken(newToToken);
  }, []);

  // Gestion de la sélection de pool avec fallback
  const poolSelection = usePoolSelectionWithFallback(fromToken, toToken);

  // Adresses par défaut pour WBERA/HONEY
  const DEFAULT_WBERA_ADDRESS = '0x6969696969696969696969696969696969696969';
  const DEFAULT_HONEY_ADDRESS = '0xFCBD14DC51f0A4d49d5E53C2E0950e0bC26d0Dce';

  // Recherche de la pool par défaut WBERA/HONEY
  const { data: defaultPoolData } = usePoolByTokens(
    DEFAULT_WBERA_ADDRESS,
    DEFAULT_HONEY_ADDRESS
  );

  // Configuration du chart basée sur la sélection de pool
  const chartConfig = useMemo(() => {
    // Si on a une pool trouvée (soit pour les tokens sélectionnés, soit en fallback)
    if (poolSelection.poolAddress || poolSelection.fallbackPoolAddress || defaultPoolData) {
      const poolAddress = poolSelection.poolAddress || poolSelection.fallbackPoolAddress || defaultPoolData?.id;
      const isUsingFallback = poolSelection.isUsingFallback || !poolSelection.poolAddress;

      return {
        type: 'pool',
        poolAddress,
        message: isUsingFallback
          ? "Affichage de la pool WBERA/HONEY par défaut"
          : `Données de la pool ${fromToken?.symbol || 'Token1'}/${toToken?.symbol || 'Token2'}`,
        showOverlay: false,
        dataType: 'pool' as const
      };
    }

    // Si on a un seul token, afficher ses données
    if (fromToken || toToken) {
      const selectedToken = fromToken || toToken;
      return {
        type: 'token',
        tokenAddress: selectedToken!.address,
        message: `Données de ${selectedToken!.symbol}`,
        showOverlay: false,
        dataType: 'token' as const
      };
    }

    // Par défaut, afficher un message d'attente
    return {
      type: 'waiting',
      message: "Sélectionnez des tokens pour voir les données de chart",
      showOverlay: true,
      dataType: 'token' as const
    };
  }, [fromToken, toToken, poolSelection, defaultPoolData]);

  const handleChartTypeChange = (newType: ChartType) => {
    setChartType(newType);
  };

  const handleIntervalChange = (newInterval: ChartInterval) => {
    setInterval(newInterval);
  };

  const handleMetricChange = (newMetric: ChartMetric) => {
    setMetric(newMetric);
  };

  const getNoDataMessage = () => {
    if (poolSelection.isLoading) {
      return "Recherche de la pool...";
    }
    if (poolSelection.error && !poolSelection.isUsingFallback) {
      return poolSelection.error;
    }
    return chartConfig.message;
  };


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
            tokenAddress={chartConfig.type === 'token' ? chartConfig.tokenAddress : null}
            poolAddress={chartConfig.type === 'pool' ? chartConfig.poolAddress : null}
            chartType={chartType}
            interval={interval}
            metric={metric}
            height={500}
            showToolbar={true}
            priceFormatter={priceFormatter}
            onChartTypeChange={handleChartTypeChange}
            onIntervalChange={handleIntervalChange}
            onMetricChange={handleMetricChange}
            showNoDataOverlay={chartConfig.showOverlay || poolSelection.isLoading}
            noDataMessage={getNoDataMessage()}
            dataType={chartConfig.dataType}
            hideMetricsDropdown={true}
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