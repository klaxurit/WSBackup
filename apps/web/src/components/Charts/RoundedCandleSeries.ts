import {
  type CustomSeriesOptions,
  type CustomSeriesPricePlotValues,
  type ICustomSeriesPaneView,
  type ICustomSeriesPaneRenderer,
  type PaneRendererCustomData,
  type Time,
  type UTCTimestamp,
  type CandlestickData,
  type PriceToCoordinateConverter,
  customSeriesDefaultOptions,
  type CustomSeriesWhitespaceData,
} from 'lightweight-charts';

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

// --- Simple positioning utils ---
function positionsLine(x: number, pixelRatio: number, width: number) {
  const position = Math.round(x * pixelRatio - width * 0.5);
  return { position, length: Math.max(1, Math.floor(width)) };
}
function positionsBox(y1: number, y2: number, pixelRatio: number) {
  const position = Math.round(Math.min(y1, y2) * pixelRatio);
  const length = Math.max(1, Math.abs(Math.round((y2 - y1) * pixelRatio)));
  return { position, length };
}

export interface RoundedCandleSeriesOptions extends CustomSeriesOptions {
  upColor: string;
  downColor: string;
  wickUpColor: string;
  wickDownColor: string;
  radius: (barSpacing: number) => number;
}
const defaultOptions: RoundedCandleSeriesOptions = {
  ...customSeriesDefaultOptions,
  upColor: '#26a69a',
  downColor: '#ef5350',
  wickUpColor: '#26a69a',
  wickDownColor: '#ef5350',
  radius: (bs) => (bs < 4 ? 0 : bs / 3),
};

class RoundedCandleSeriesRenderer<TData extends CandlestickData<UTCTimestamp>> implements ICustomSeriesPaneRenderer {
  _data: PaneRendererCustomData<Time, TData> | null = null;
  _options: RoundedCandleSeriesOptions | null = null;

  draw(target: any, priceConverter: PriceToCoordinateConverter): void {
    target.useBitmapCoordinateSpace((scope: any) => this._drawImpl(scope, priceConverter));
  }

  update(data: PaneRendererCustomData<Time, TData>, options: RoundedCandleSeriesOptions): void {
    this._data = data;
    this._options = options;
  }

  _drawImpl(renderingScope: any, priceToCoordinate: PriceToCoordinateConverter): void {
    if (!this._data || !this._options || !this._data.bars.length || !this._data.visibleRange) return;
    const ctx = renderingScope.context;
    const { horizontalPixelRatio, verticalPixelRatio } = renderingScope;
    const bars = this._data.bars.map((bar) => {
      const openY = priceToCoordinate(bar.originalData.open as number) ?? 0;
      const highY = priceToCoordinate(bar.originalData.high as number) ?? 0;
      const lowY = priceToCoordinate(bar.originalData.low as number) ?? 0;
      const closeY = priceToCoordinate(bar.originalData.close as number) ?? 0;
      const isUp = bar.originalData.close >= bar.originalData.open;
      return { openY, highY, lowY, closeY, x: bar.x, isUp };
    });
    const radius = this._options.radius(this._data.barSpacing);
    // Wicks
    for (let i = this._data.visibleRange.from; i < this._data.visibleRange.to; i++) {
      const bar = bars[i];
      ctx.fillStyle = bar.isUp ? this._options.wickUpColor : this._options.wickDownColor;
      const wickWidth = 1;
      const verticalPositions = positionsBox(bar.lowY, bar.highY, verticalPixelRatio);
      const linePositions = positionsLine(bar.x, horizontalPixelRatio, wickWidth);
      ctx.fillRect(linePositions.position, verticalPositions.position, linePositions.length, verticalPositions.length);
    }
    // Candles
    const candleBodyWidth = Math.max(3, Math.floor(this._data.barSpacing * 0.7));
    for (let i = this._data.visibleRange.from; i < this._data.visibleRange.to; i++) {
      const bar = bars[i];
      ctx.fillStyle = bar.isUp ? this._options.upColor : this._options.downColor;
      const verticalPositions = positionsBox(bar.openY, bar.closeY, verticalPixelRatio);
      const linePositions = positionsLine(bar.x, horizontalPixelRatio, candleBodyWidth);
      const height = Math.max(verticalPositions.length, 1);
      const effectiveRadius = height <= 2 ? 0 : radius;
      roundRect(
        ctx,
        linePositions.position,
        verticalPositions.position,
        linePositions.length,
        height,
        effectiveRadius
      );
    }
  }
}

export class RoundedCandleSeries<TData extends CandlestickData<UTCTimestamp>> implements ICustomSeriesPaneView<Time, TData, RoundedCandleSeriesOptions> {
  _renderer: RoundedCandleSeriesRenderer<TData>;
  constructor() {
    this._renderer = new RoundedCandleSeriesRenderer();
  }
  priceValueBuilder(plotRow: TData): CustomSeriesPricePlotValues {
    return [plotRow.high, plotRow.low, plotRow.close];
  }
  renderer(): RoundedCandleSeriesRenderer<TData> {
    return this._renderer;
  }
  isWhitespace(data: TData | CustomSeriesWhitespaceData<Time>): data is CustomSeriesWhitespaceData<Time> {
    return !('open' in data) && !('close' in data);
  }
  update(data: PaneRendererCustomData<Time, TData>, options: RoundedCandleSeriesOptions): void {
    this._renderer.update(data, options);
  }
  defaultOptions() {
    return defaultOptions;
  }
} 