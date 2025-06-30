import React, { useEffect, useRef } from 'react';
import {
  createChart,
  ColorType,
  CandlestickSeries,
  type IChartApi,
  type UTCTimestamp,
  type CandlestickData,
} from 'lightweight-charts';

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

    // Clean up the previous chart if it exists
    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
    }

    // Create the chart
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

    // Add the standard candlestick series (API v5)
    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor,
      downColor,
      borderUpColor: upColor,
      borderDownColor: downColor,
      wickUpColor: upColor,
      wickDownColor: downColor,
    });
    candleSeries.setData(data || []);
    seriesRef.current = candleSeries;

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
    <div style={{ width: '100%', position: 'relative', overflow: 'hidden', background: backgroundColor }}>
      {header && <div style={{ marginBottom: 8 }}>{header}</div>}
      <div
        ref={chartContainerRef}
        style={{ width: '100%', height, minHeight: 200, background: backgroundColor, position: 'relative' }}
      />
    </div>
  );
};

export default ChartCandle; 