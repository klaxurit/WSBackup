import type { LineChartPoint, ChartInterval } from '../types/chart';

/**
 * Agrège les données selon l'intervalle demandé
 * Supporte maintenant 1H, 1D, 1W, 1M, 1Y, MAX
 */
export function aggregateLineData(
  data: LineChartPoint[],
  interval: ChartInterval
): LineChartPoint[] {
  if (interval === 'MAX') return data;
  if (!data || data.length === 0) return [];

  const groupBy = (timestamp: number): string => {
    const date = new Date(timestamp * 1000);

    switch (interval) {
      case '1H':
        return `${date.getUTCFullYear()}-${date.getUTCMonth()}-${date.getUTCDate()}-${date.getUTCHours()}`;

      case '1D':
        return `${date.getUTCFullYear()}-${date.getUTCMonth()}-${date.getUTCDate()}`;

      case '1W': {
        // Calcul de la semaine ISO 8601
        const firstDayOfYear = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
        const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
        const week = Math.ceil((pastDaysOfYear + firstDayOfYear.getUTCDay() + 1) / 7);
        return `${date.getUTCFullYear()}-W${week}`;
      }

      case '1M':
        return `${date.getUTCFullYear()}-${date.getUTCMonth()}`;

      case '1Y':
        return `${date.getUTCFullYear()}`;

      default:
        return '';
    }
  };

  // Regroupement des données
  const grouped: { [key: string]: LineChartPoint[] } = {};
  data.forEach(point => {
    const key = groupBy(point.time as number);
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(point);
  });

  // Pour chaque groupe, on prend la dernière valeur chronologique
  // (peut être étendu plus tard pour calculer OHLCV)
  const aggregated = Object.entries(grouped).map(([, points]) => {
    // Trier les points du groupe par timestamp
    const sortedPoints = points.sort((a, b) => (a.time as number) - (b.time as number));

    // Pour l'instant, on prend la dernière valeur
    // Plus tard, on pourra calculer open/high/low/close pour les candlesticks
    return {
      time: sortedPoints[sortedPoints.length - 1].time,
      value: sortedPoints[sortedPoints.length - 1].value,
    };
  });

  // Trier le résultat final par timestamp
  return aggregated.sort((a, b) => (a.time as number) - (b.time as number));
}

/**
 * Calcule les données OHLCV pour les candlesticks à partir de données groupées
 * Cette fonction sera utilisée dans le prochain fichier
 */
export function calculateOHLCFromGroup(points: LineChartPoint[]) {
  if (points.length === 0) return null;

  const sortedPoints = points.sort((a, b) => (a.time as number) - (b.time as number));
  const values = sortedPoints.map(p => p.value);

  return {
    time: sortedPoints[sortedPoints.length - 1].time,
    open: values[0],
    high: Math.max(...values),
    low: Math.min(...values),
    close: values[values.length - 1],
    volume: 0 // Sera calculé si les données de volume sont disponibles
  };
}