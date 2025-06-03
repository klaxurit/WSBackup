import React, { useEffect, useRef } from 'react';
import {
  createChart,
  ColorType,
  type IChartApi,
  type UTCTimestamp,
  type CandlestickData,
} from 'lightweight-charts';
import { RoundedCandleSeries } from './RoundedCandleSeries';

export interface ChartCandleProps {
  data: CandlestickData<UTCTimestamp>[];
  height?: number;
  header?: React.ReactNode;
  upColor?: string;
  downColor?: string;
  backgroundColor?: string;
}

const defaultUpColor = '#26a69a';
const defaultDownColor = '#ef5350';
const defaultBg = 'transparent';

export const ChartCandle: React.FC<ChartCandleProps> = ({
  data,
  height = 340,
  header,
  upColor = defaultUpColor,
  downColor = defaultDownColor,
  backgroundColor = defaultBg,
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<any>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
    }

    // Création du chart
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
        minBarSpacing: 20,
      },
      rightPriceScale: {
        borderColor: 'rgba(197, 203, 206, 0.08)',
      },
      crosshair: {
        mode: 1,
      },
    });
    chartRef.current = chart;

    const roundedSeries = new RoundedCandleSeries();
    const customSeries = chart.addCustomSeries(roundedSeries, {
      upColor,
      downColor,
      wickUpColor: upColor,
      wickDownColor: downColor,
      radius: (barSpacing: number) => Math.max(2, barSpacing / 6),
      priceLineColor: '#E39229',
    });
    customSeries.setData(data);
    seriesRef.current = customSeries;

    function handleResize() {
      chart.resize(chartContainerRef.current!.clientWidth, height);
    }
    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
      chartRef.current = null;
    };
  }, [data, height, upColor, downColor, backgroundColor]);

  return (
    <div style={{ width: '100%', position: 'relative' }}>
      {header && <div style={{ marginBottom: 8 }}>{header}</div>}
      <div
        ref={chartContainerRef}
        style={{ width: '100%', height, minHeight: 200, background: backgroundColor, borderRadius: 12, position: 'relative' }}
      />
    </div>
  );
};

export default ChartCandle; 