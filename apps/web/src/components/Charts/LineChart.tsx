import React, { useEffect, useRef, useState, useMemo } from 'react';
import { createChart, ColorType, AreaSeries, type IChartApi, type Time, createTextWatermark } from 'lightweight-charts';
import type { LineChartPoint } from '../../types/chart';
import lilBear from '../../assets/lil_bear.png';

export interface LineChartProps {
  data: LineChartPoint[];
  height?: number;
  backgroundColor?: string;
  lineColor?: string;
  priceFormatter?: (price: number) => string;
  onIntervalChange?: (interval: string) => void;
  availableIntervals?: string[];
  activeFilterColor?: string;
  showNoDataOverlay?: boolean;
  noDataMessage?: string;
}

const BERYL_PURE = '#E39229';
const defaultLineColor = BERYL_PURE;
const defaultBg = 'transparent';
const defaultIntervals = ['1H', '1D', '1W', '1M', 'MAX'];

export const LineChart: React.FC<LineChartProps> = ({
  data,
  height = 300,
  backgroundColor = defaultBg,
  lineColor = defaultLineColor,
  priceFormatter,
  onIntervalChange,
  availableIntervals = defaultIntervals,
  activeFilterColor = BERYL_PURE,
  showNoDataOverlay = false,
  noDataMessage = "No data available",
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<any>(null);
  const [selectedInterval, setSelectedInterval] = useState('1H');
  const [legend] = useState<{ time: Time | null, value: number | null }>({ time: null, value: null });
  const isFakeInterval = !['1H', '1D'].includes(selectedInterval);

  const fakeData = useMemo(() => {
    const now = Math.floor(Date.now() / 1000);
    return Array.from({ length: 30 }, (_, i) => ({
      time: now - (30 - i) * 3600,
      value: 100 + Math.sin(i / 5) * 10 + Math.random() * 5,
    }));
  }, []);

  useEffect(() => {
    if (!chartContainerRef.current) return;
    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
    }
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

    const areaSeries = chart.addSeries(AreaSeries, {
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
    areaSeries.setData(isFakeInterval ? fakeData : (data as any || []));
    chart.timeScale().fitContent();
    seriesRef.current = areaSeries;
  }, [data, height, backgroundColor, lineColor, priceFormatter, isFakeInterval, fakeData]);

  const handleIntervalChange = (interval: string) => {
    setSelectedInterval(interval);
    if (onIntervalChange) onIntervalChange(interval);
  };

  useEffect(() => {
    if (onIntervalChange) {
      onIntervalChange('1H');
    }
  }, []);

  return (
    <div
      style={{ width: '100%', position: 'relative', overflow: 'hidden', background: backgroundColor }}
    >
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '12px',
        marginTop: '30px',
        position: 'relative'
      }}>
        {availableIntervals.map(interval => (
          <div key={interval} style={{ position: 'relative' }}>
            {selectedInterval === interval && (
              <img
                src={lilBear}
                alt="Selected"
                style={{
                  position: 'absolute',
                  top: '-23px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '45px',
                  zIndex: 10,
                  pointerEvents: 'none',
                }}
              />
            )}
            <button
              onClick={() => handleIntervalChange(interval)}
              style={{
                padding: '10px 16px',
                fontSize: '14px',
                fontWeight: '600',
                borderRadius: '20px',
                border: selectedInterval === interval
                  ? `1px solid ${activeFilterColor}`
                  : '1px solid #4B5563',
                background: selectedInterval === interval
                  ? `${activeFilterColor}1A` // 10% d'opacité
                  : 'transparent',
                color: selectedInterval === interval ? '#fff' : '#D1D5DB',
                cursor: 'pointer',
                transition: 'all 0.2s ease-in-out',
                boxShadow: selectedInterval === interval
                  ? `0 4px 12px ${activeFilterColor}33` // 20% d'opacité pour l'ombre
                  : 'none',
              }}
              onMouseEnter={(e) => {
                if (selectedInterval !== interval) {
                  e.currentTarget.style.borderColor = '#6B7280';
                  e.currentTarget.style.background = 'rgba(75, 85, 99, 0.3)';
                  e.currentTarget.style.color = '#fff';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedInterval !== interval) {
                  e.currentTarget.style.borderColor = '#4B5563';
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '#D1D5DB';
                }
              }}
            >
              {interval}
            </button>
          </div>
        ))}
      </div>

      {/* Légende dynamique */}
      {legend.value !== null && (
        <div style={{ position: 'absolute', top: 8, right: 16, background: '#181A20', color: '#fff', borderRadius: 4, padding: '4px 12px', fontSize: 14, zIndex: 2, opacity: 0.95 }}>
          <span>Value: <b>{legend.value}</b></span>
        </div>
      )}
      <div
        ref={chartContainerRef}
        style={{
          width: '100%',
          height,
          minHeight: 150,
          background: backgroundColor,
          position: 'relative',
          overflow: 'hidden',
          pointerEvents: isFakeInterval ? 'none' : 'auto',
        }}
      />
      {/* Overlay de carde pour les intervalles non supportés OU pour manque de données */}
      {(isFakeInterval || showNoDataOverlay) && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: height,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
            zIndex: 10,
          }}
        >
          <div
            style={{
              background: 'rgba(24, 26, 32, 0.97)',
              borderRadius: 16,
              boxShadow: '0 4px 24px 0 rgba(0,0,0,0.12)',
              padding: '24px',
              maxWidth: 420,
              width: '90%',
              textAlign: 'left',
              color: '#fff',
              fontSize: 16,
              fontWeight: 500,
              lineHeight: 1.5,
              border: '1px solid #23242a',
              pointerEvents: 'auto',
            }}
          >
            {showNoDataOverlay
              ? noDataMessage
              : "These chart numbers aren't real—just a placeholder flex for now. No on‑chain juice yet… stay locked in, we're gonna pump in live data soon."
            }
          </div>
        </div>
      )}
    </div>
  );
};

export default LineChart;