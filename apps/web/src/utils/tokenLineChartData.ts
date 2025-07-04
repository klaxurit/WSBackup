import { cleanLineData, filterOutliers, shouldNormalize, normalizeLineData, filterLWCBounds } from './lineChart';
import { aggregateLineData } from './aggregateLineData';
import type { LineChartPoint } from '../types/chart';

export function getTokenLineChartData(
  rawData: LineChartPoint[],
  tokenDecimals: number | undefined,
  interval: '1H' | '1D' | '1W' | '1M' | 'MAX'
): LineChartPoint[] {
  const filtered = filterOutliers(rawData as any);
  const normalized = shouldNormalize(filtered) && tokenDecimals
    ? normalizeLineData(filtered, tokenDecimals)
    : filtered;
  const cleaned = filterLWCBounds(cleanLineData(normalized));
  return aggregateLineData(cleaned, interval);
} 