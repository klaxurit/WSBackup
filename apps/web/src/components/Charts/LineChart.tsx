import React, { useEffect, useRef, useState, useMemo } from 'react';
import { createChart, ColorType, AreaSeries, type IChartApi, type Time, createTextWatermark } from 'lightweight-charts';
import type { LineChartPoint } from '../../types/chart';

export interface LineChartProps {
  data: LineChartPoint[];
  height?: number;
  backgroundColor?: string;
  lineColor?: string;
  priceFormatter?: (price: number) => string;
  onIntervalChange?: (interval: string) => void;
  availableIntervals?: string[];
  activeFilterColor?: string;
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
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<any>(null);
  const [selectedInterval, setSelectedInterval] = useState('1H');
  const [legend] = useState<{ time: Time | null, value: number | null }>({ time: null, value: null });

  // Détection de l'intervalle "fake"
  const isFakeInterval = !['1H', '1D'].includes(selectedInterval);

  // Génération d'un fake dataset pour les intervalles non supportés
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

    // Ajout du watermark (API v5)
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

  // Gestion du changement d'intervalle
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
      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
        {availableIntervals.map(interval => (
          <button
            key={interval}
            className={selectedInterval === interval ? 'active' : ''}
            onClick={() => handleIntervalChange(interval)}
            style={{
              padding: '4px 12px',
              borderRadius: 4,
              border: 'none',
              background: selectedInterval === interval ? activeFilterColor : '#222',
              color: '#fff',
              cursor: 'pointer',
              fontWeight: selectedInterval === interval ? 700 : 400,
              letterSpacing: 1,
            }}
          >
            {interval}
          </button>
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
      {/* Overlay de carde pour les intervalles non supportés */}
      {isFakeInterval && (
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
            These chart numbers aren’t real—just a placeholder flex for now. No on‑chain juice yet… stay locked in, we're gonna pump in live data soon.
          </div>
        </div>
      )}
    </div>
  );
};

export default LineChart;