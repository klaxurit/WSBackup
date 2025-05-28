import React, { useEffect, useRef } from 'react';
import {
  createChart,
  ColorType,
  type IChartApi,
  type UTCTimestamp,
  type CandlestickData,
} from 'lightweight-charts';
import { RoundedCandleSeries } from './RoundedCandleSeries';

// --- Rounded Candle Plugin (extrait du dossier ressources, adapté ici) ---
function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
  ctx.fill();
}

function drawRoundedCandles(ctx: CanvasRenderingContext2D, bars: any[], options: any, radius: number) {
  bars.forEach(bar => {
    ctx.fillStyle = bar.isUp ? options.upColor : options.downColor;
    roundRect(
      ctx,
      bar.x - bar.width / 2,
      Math.min(bar.openY, bar.closeY),
      bar.width,
      Math.abs(bar.closeY - bar.openY) || 1,
      radius
    );
    // Wick
    ctx.fillStyle = bar.isUp ? options.wickUpColor : options.wickDownColor;
    ctx.fillRect(bar.x, bar.highY, 1, bar.lowY - bar.highY);
  });
}

// --- Fin plugin ---

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

    // Ajout de la Custom Series bougies arrondies
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

    // Redimensionnement responsive
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