import type { LineChartPoint } from '../types/chart';

export function aggregateLineData(
  data: LineChartPoint[],
  interval: '1H' | '1D' | '1W' | '1M' | 'MAX'
): LineChartPoint[] {
  if (interval === 'MAX') return data;

  const groupBy = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    if (interval === '1H') return `${date.getUTCFullYear()}-${date.getUTCMonth()}-${date.getUTCDate()}-${date.getUTCHours()}`;
    if (interval === '1D') return `${date.getUTCFullYear()}-${date.getUTCMonth()}-${date.getUTCDate()}`;
    if (interval === '1W') {
      const firstDayOfYear = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
      const week = Math.ceil((((date.getTime() - firstDayOfYear.getTime()) / 86400000) + firstDayOfYear.getUTCDay() + 1) / 7);
      return `${date.getUTCFullYear()}-W${week}`;
    }
    if (interval === '1M') return `${date.getUTCFullYear()}-${date.getUTCMonth()}`;
    return '';
  };

  const grouped: { [key: string]: LineChartPoint[] } = {};
  data.forEach(point => {
    const key = groupBy(point.time as number);
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(point);
  });

  // Pour chaque groupe, on prend la dernière valeur (ou la moyenne, ou l'OHLC si besoin)
  return Object.entries(grouped).map(([, points]) => ({
    time: points[points.length - 1].time,
    value: points[points.length - 1].value,
  })).sort((a, b) => (a.time as number) - (b.time as number));
} 