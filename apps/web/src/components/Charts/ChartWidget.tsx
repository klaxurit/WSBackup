import React, { useEffect, useRef, useState, useMemo } from 'react';
import {
  createChart,
  ColorType,
  AreaSeries,
  LineSeries,
  CandlestickSeries,
  type IChartApi,
  type Time,
  createTextWatermark
} from 'lightweight-charts';
import type { ChartType, ChartInterval, LineChartPoint, CandlestickPoint } from '../../types/chart';
import { useChartData } from '../../utils/useChartData';
import { ChartToolbar } from './ChartToolbar';

export interface ChartWidgetProps {
  tokenAddress?: string | null;
  chartType?: ChartType;
  interval?: ChartInterval;
  height?: number;
  showToolbar?: boolean;
  backgroundColor?: string;
  lineColor?: string;
  priceFormatter?: (price: number) => string;
  onChartTypeChange?: (type: ChartType) => void;
  onIntervalChange?: (interval: ChartInterval) => void;
  tokenDecimals?: number;
  showNoDataOverlay?: boolean;
  noDataMessage?: string;
}

const BERYL_PURE = '#E39229';
const defaultLineColor = BERYL_PURE;
const defaultBg = 'transparent';

export const ChartWidget: React.FC<ChartWidgetProps> = ({
  tokenAddress,
  chartType = 'area',
  interval = '1D',
  height = 500,
  showToolbar = true,
  backgroundColor = defaultBg,
  lineColor = defaultLineColor,
  priceFormatter,
  onChartTypeChange,
  onIntervalChange,
  tokenDecimals,
  showNoDataOverlay = false,
  noDataMessage = "No data available",
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<any>(null);

  // États locaux pour les contrôles
  const [localChartType, setLocalChartType] = useState<ChartType>(chartType);
  const [localInterval, setLocalInterval] = useState<ChartInterval>(interval);

  // Hook de données unifié
  const { data, isLoading, error } = useChartData(
    tokenAddress || null,
    localChartType,
    localInterval,
    tokenDecimals
  );

  // Données factices pour les cas où on n'a pas de données réelles
  const fakeData = useMemo(() => {
    const now = Math.floor(Date.now() / 1000);
    return Array.from({ length: 30 }, (_, i) => ({
      time: (now - (30 - i) * 3600) as Time,
      value: 100 + Math.sin(i / 5) * 10 + Math.random() * 5,
    }));
  }, []);

  // Détermine si on doit utiliser les données factices
  const shouldUseFakeData = !data || data.length === 0 || error;
  const chartData = shouldUseFakeData ? fakeData : data;

  // Initialisation et mise à jour du chart
  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Nettoyage sécurisé du chart existant
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

    // Création du nouveau chart
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
        minBarSpacing: 10,
      },
      rightPriceScale: {
        borderColor: 'rgba(197, 203, 206, 0.08)',
      },
      crosshair: {
        mode: 1,
      },
    });

    chartRef.current = chart;

    // Ajout du watermark WinnieSwap
    try {
      const firstPane = chart.panes()[0];
      createTextWatermark(firstPane, {
        horzAlign: 'center',
        vertAlign: 'center',
        lines: [
          {
            text: 'WinnieSwap',
            color: 'rgba(227,146,41,0.15)',
            fontSize: 36,
            fontStyle: 'bold',
          },
        ],
      });
    } catch (error) {
      console.warn('Error creating watermark:', error);
    }

    // Création de la série selon le type
    createSeries(chart, localChartType);

    // Gestion du resize
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
  }, [localChartType, height, backgroundColor]);

  // Fonction pour créer la série selon le type
  const createSeries = (chart: IChartApi, type: ChartType) => {
    try {
      switch (type) {
        case 'area':
          seriesRef.current = chart.addSeries(AreaSeries, {
            lineColor: lineColor,
            topColor: 'rgba(227,146,41,0.10)',
            bottomColor: 'rgba(227,146,41,0.00)',
            lineWidth: 2,
            priceFormat: {
              type: 'custom',
              minMove: 0.01,
              formatter: priceFormatter || ((p: number) => p.toFixed(2)),
            },
          });
          break;

        case 'line':
          seriesRef.current = chart.addSeries(LineSeries, {
            color: lineColor,
            lineWidth: 2,
            priceFormat: {
              type: 'custom',
              minMove: 0.01,
              formatter: priceFormatter || ((p: number) => p.toFixed(2)),
            },
          });
          break;

        case 'candlestick':
          seriesRef.current = chart.addSeries(CandlestickSeries, {
            upColor: '#4CAF50',
            downColor: '#F44336',
            borderUpColor: '#4CAF50',
            borderDownColor: '#F44336',
            wickUpColor: '#4CAF50',
            wickDownColor: '#F44336',
            priceFormat: {
              type: 'custom',
              minMove: 0.01,
              formatter: priceFormatter || ((p: number) => p.toFixed(2)),
            },
          });
          break;

        default:
          console.warn(`Unknown chart type: ${type}`);
          break;
      }
    } catch (error) {
      console.error('Error creating series:', error);
      seriesRef.current = null;
    }
  };

  // Mise à jour des données de la série
  useEffect(() => {
    if (seriesRef.current && chartData && Array.isArray(chartData)) {
      try {
        if (localChartType === 'candlestick') {
          // Pour les candlesticks, on doit s'assurer d'avoir le bon format
          if (shouldUseFakeData) {
            // Convertir les données factices en format candlestick
            const candlestickData = (chartData as LineChartPoint[]).map(point => ({
              time: point.time,
              open: point.value * 0.98,
              high: point.value * 1.02,
              low: point.value * 0.96,
              close: point.value,
            }));
            seriesRef.current.setData(candlestickData);
          } else {
            seriesRef.current.setData(chartData as CandlestickPoint[]);
          }
        } else {
          // Pour area et line charts
          if (shouldUseFakeData) {
            seriesRef.current.setData(chartData as LineChartPoint[]);
          } else {
            // Si les données viennent d'un candlestick, extraire les prix de clôture
            if (chartData.length > 0 && 'close' in chartData[0]) {
              const lineData = (chartData as CandlestickPoint[]).map(candle => ({
                time: candle.time,
                value: candle.close,
              }));
              seriesRef.current.setData(lineData);
            } else {
              seriesRef.current.setData(chartData as LineChartPoint[]);
            }
          }
        }

        // Auto-fit du chart
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
  }, [chartData, localChartType, shouldUseFakeData]);

  // Gestionnaires d'événements
  const handleChartTypeChange = (newType: ChartType) => {
    setLocalChartType(newType);
    onChartTypeChange?.(newType);
  };

  const handleIntervalChange = (newInterval: ChartInterval) => {
    setLocalInterval(newInterval);
    onIntervalChange?.(newInterval);
  };

  // Affichage du message de chargement ou d'erreur
  const showOverlay = isLoading || showNoDataOverlay || (error && !shouldUseFakeData);
  const overlayMessage = isLoading
    ? 'Loading chart data...'
    : error
      ? 'Error loading data'
      : noDataMessage;

  return (
    <div className="chart-widget">
      {showToolbar && (
        <ChartToolbar
          chartType={localChartType}
          interval={localInterval}
          onChartTypeChange={handleChartTypeChange}
          onIntervalChange={handleIntervalChange}
          isLoading={isLoading}
        />
      )}

      <div className="chart-widget__container" style={{ position: 'relative' }}>
        <div
          ref={chartContainerRef}
          className="chart-widget__chart"
          style={{ height, width: '100%' }}
        />

        {showOverlay && (
          <div className="chart-widget__overlay">
            <div className="chart-widget__overlay-content">
              {isLoading && <div className="chart-widget__spinner" />}
              <p className="chart-widget__overlay-message">{overlayMessage}</p>
              {error && !shouldUseFakeData && (
                <button
                  className="chart-widget__retry-button"
                  onClick={() => window.location.reload()}
                >
                  Retry
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChartWidget;