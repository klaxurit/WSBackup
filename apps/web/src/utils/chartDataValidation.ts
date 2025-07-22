import type { LineChartPoint } from "../types/chart";

export function hasEnoughDataForInterval(
  data: LineChartPoint[],
  interval: '1H' | '1D' | '1W' | '1M' | 'MAX'
): boolean {
  if (!data || data.length === 0) return false;

  // Calculer la durée totale des données disponibles
  const sortedData = data.sort((a, b) => Number(a.time) - Number(b.time));
  const firstTime = Number(sortedData[0].time);
  const lastTime = Number(sortedData[sortedData.length - 1].time);
  const durationInSeconds = lastTime - firstTime;
  const durationInHours = durationInSeconds / 3600;
  const durationInDays = durationInHours / 24;

  // Vérifier selon l'intervalle sélectionné
  switch (interval) {
    case '1H':
      return durationInHours >= 24; // Besoin de 24h de données
    case '1D':
      return durationInDays >= 7;   // Besoin de 7 jours de données
    case '1W':
      return durationInDays >= 30;  // Besoin de 30 jours de données
    case '1M':
      return durationInDays >= 90;  // Besoin de 3 mois de données
    case 'MAX':
      return true; // MAX accepte toujours les données disponibles
    default:
      return false;
  }
}

// Dans vos composants, utilisez cette fonction comme ceci :
export function shouldShowNoDataOverlay(
  data: LineChartPoint[],
  selectedInterval: string,
  hasPoolData: boolean
): boolean {
  // Cas 1: Pas de données du tout
  if (!data || data.length === 0) return true;

  // Cas 2: Pool sélectionnée mais pas assez de données pour l'intervalle
  if (hasPoolData && !hasEnoughDataForInterval(data, selectedInterval as any)) {
    return true;
  }

  return false;
}