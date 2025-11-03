import React, { useEffect, useRef, useState } from 'react';
import {
  createChart,
  ColorType,
  AreaSeries,
  type IChartApi,
  type Time,
  createTextWatermark,
} from 'lightweight-charts';
import { useMobileTokenChart, type MobileChartInterval } from '../../hooks/useMobileTokenChart';
import { Loader } from '../Loader/Loader';

export interface MobileTokenChartProps {
  tokenAddress: string | null;
  height?: number;
  showStats?: boolean;
  showIntervalButtons?: boolean;
  defaultInterval?: MobileChartInterval;
  backgroundColor?: string;
  lineColor?: string;
}

const BERYL_PURE = '#E39229';

/**
 * Composant de chart simplifié pour mobile
 * - Affiche uniquement le prix USD d'un token
 * - Optimisé pour les petits écrans tactiles
 * - Design minimaliste
 */
export const MobileTokenChart: React.FC<MobileTokenChartProps> = ({
  tokenAddress,
  height = 280,
  showStats = true,
  showIntervalButtons = true,
  defaultInterval = '1M',
  backgroundColor = 'transparent',
  lineColor = BERYL_PURE,
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<any>(null);

  const [interval, setInterval] = useState<MobileChartInterval>(defaultInterval);

  const { data, tokenSymbol, isLoading, error, stats } = useMobileTokenChart(tokenAddress, interval);

  // Créer le chart
  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Nettoyer le chart existant
    if (chartRef.current) {
      try {
        chartRef.current.remove();
      } catch (error) {
        console.warn('Error removing chart:', error);
      } finally {
        chartRef.current = null;
        seriesRef.current = null;
      }
    }

    // Créer le nouveau chart
    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height,
      layout: {
        background: { type: ColorType.Solid, color: backgroundColor },
        textColor: '#fff',
      },
      grid: {
        vertLines: { visible: false },
        horzLines: { visible: false },
      },
      timeScale: {
        borderColor: 'rgba(197, 203, 206, 0.08)',
        timeVisible: true,
        secondsVisible: false,
        minBarSpacing: 8,
      },
      rightPriceScale: {
        borderColor: 'rgba(197, 203, 206, 0.08)',
      },
      crosshair: {
        mode: 1,
        vertLine: {
          width: 1,
          color: 'rgba(227, 146, 41, 0.5)',
          style: 2,
        },
        horzLine: {
          width: 1,
          color: 'rgba(227, 146, 41, 0.5)',
          style: 2,
        },
      },
      handleScale: {
        axisPressedMouseMove: {
          time: true,
          price: true,
        },
      },
      handleScroll: {
        mouseWheel: true,
        pressedMouseMove: true,
        horzTouchDrag: true,
        vertTouchDrag: true,
      },
    });

    chartRef.current = chart;

    // Ajouter le watermark avec le symbole du token
    if (tokenSymbol) {
      try {
        const firstPane = chart.panes()[0];
        createTextWatermark(firstPane, {
          horzAlign: 'center',
          vertAlign: 'center',
          lines: [
            {
              text: tokenSymbol,
              color: 'rgba(227,146,41,0.08)',
              fontSize: 64,
              fontStyle: 'bold',
            },
          ],
        });
      } catch (error) {
        console.warn('Error creating watermark:', error);
      }
    }

    // Créer la série Area
    seriesRef.current = chart.addSeries(AreaSeries, {
      lineColor: lineColor,
      topColor: 'rgba(227,146,41,0.15)',
      bottomColor: 'rgba(227,146,41,0.00)',
      lineWidth: 2,
      priceFormat: {
        type: 'price',
        precision: 6,
        minMove: 0.000001,
      },
    });

    // Gérer le resize
    const handleResize = () => {
      if (chartRef.current && chartContainerRef.current) {
        try {
          chartRef.current.applyOptions({
            width: chartContainerRef.current.clientWidth,
          });
        } catch (error) {
          console.warn('Error resizing chart:', error);
        }
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (chartRef.current) {
        try {
          chartRef.current.remove();
        } catch (error) {
          console.warn('Error cleaning up chart:', error);
        } finally {
          chartRef.current = null;
          seriesRef.current = null;
        }
      }
    };
  }, [height, backgroundColor, lineColor, tokenSymbol]);

  // Mettre à jour les données du chart
  useEffect(() => {
    if (seriesRef.current && data && Array.isArray(data) && data.length > 0) {
      try {
        // Convertir les données au format lightweight-charts
        const chartData = data.map(point => ({
          time: point.time as Time,
          value: point.value,
        }));

        seriesRef.current.setData(chartData);

        if (chartRef.current) {
          try {
            chartRef.current.timeScale().fitContent();
          } catch (error) {
            console.warn('Error fitting chart content:', error);
          }
        }
      } catch (error) {
        console.warn('Error setting chart data:', error);
      }
    }
  }, [data]);

  // Format du prix pour l'affichage
  const formatPrice = (price: number) => {
    if (price === 0) return '$0.00';
    if (price < 0.01) return `$${price.toFixed(6)}`;
    if (price < 1) return `$${price.toFixed(4)}`;
    return `$${price.toFixed(2)}`;
  };

  // Format du pourcentage
  const formatPercent = (percent: number) => {
    const sign = percent >= 0 ? '+' : '';
    return `${sign}${percent.toFixed(2)}%`;
  };

  const intervals: MobileChartInterval[] = ['1H', '1D', '1W', '1M', '1Y', 'ALL'];

  return (
    <div className="mobile-token-chart">
      {/* Stats au-dessus du chart */}
      {showStats && stats && !isLoading && (
        <div className="mobile-token-chart__stats">
          <div className="mobile-token-chart__price-info">
            <span className="mobile-token-chart__current-price">
              {formatPrice(stats.currentPrice)}
            </span>
            <span
              className={`mobile-token-chart__price-change ${stats.priceChangePercent >= 0 ? 'mobile-token-chart__price-change--positive' : 'mobile-token-chart__price-change--negative'
                }`}
            >
              {formatPercent(stats.priceChangePercent)}
            </span>
          </div>
        </div>
      )}

      {/* Container du chart */}
      <div className="mobile-token-chart__container" style={{ position: 'relative' }}>
        <div
          ref={chartContainerRef}
          className="mobile-token-chart__chart"
          style={{ height, width: '100%' }}
        />

        {/* Overlay de chargement ou erreur */}
        {(isLoading || error) && (
          <div className="mobile-token-chart__overlay">
            <div className="mobile-token-chart__overlay-content">
              {isLoading && (
                <>
                  <Loader size="mobile" />
                  <p className="mobile-token-chart__overlay-message">Loading price data...</p>
                </>
              )}
              {error && (
                <>
                  <p className="mobile-token-chart__overlay-message mobile-token-chart__overlay-message--error">
                    Error loading data
                  </p>
                  <button
                    className="mobile-token-chart__retry-button btn btn--tiny btn__main"
                    onClick={() => window.location.reload()}
                  >
                    Retry
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Boutons d'intervalle en dessous */}
      {showIntervalButtons && (
        <div className="mobile-token-chart__intervals">
          {intervals.map((int) => (
            <button
              key={int}
              className={`mobile-token-chart__interval-btn ${interval === int ? 'mobile-token-chart__interval-btn--active' : ''
                }`}
              onClick={() => setInterval(int)}
              disabled={isLoading}
            >
              {int}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default MobileTokenChart;

