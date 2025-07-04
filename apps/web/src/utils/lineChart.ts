// Utilitaires pour le traitement des données du line chart Lightweight Charts™
import type { UTCTimestamp } from 'lightweight-charts';

// Adresse par défaut du token BERA
export const DEFAULT_TOKEN = '0x0000000000000000000000000000000000000000';

// Bornes supportées par Lightweight Charts™
export const LWC_MIN = -90071992547409.91;
export const LWC_MAX = 90071992547409.91;

/**
 * Trie, dédoublonne et cast les timestamps pour Lightweight Charts™
 */
export const cleanLineData = (data: { time: number, value: number }[]) => {
  const sorted = [...data].sort((a, b) => a.time - b.time);
  return sorted
    .filter((point, i, arr) => i === 0 || point.time !== arr[i - 1].time)
    .map(point => ({
      time: point.time as UTCTimestamp,
      value: point.value,
    }));
};

/**
 * Filtre les valeurs aberrantes (outliers) sur la base de la médiane
 */
export const filterOutliers = (data: { time: number, value: number }[]) => {
  if (data.length < 3) return data;
  const values = data.map(d => d.value).sort((a, b) => a - b);
  const median = values[Math.floor(values.length / 2)];
  return data
    .filter(d => d.value < median * 1e6 && d.value > median / 1e6)
    .map(point => ({
      time: point.time as UTCTimestamp,
      value: point.value,
    }));
};

/**
 * Détecte si la normalisation est nécessaire (majorité des valeurs > 1e6)
 */
export const shouldNormalize = (data: { value: number }[]) => {
  if (!data.length) return false;
  const sample = data.slice(0, 10);
  const bigValues = sample.filter(d => Math.abs(d.value) > 1e6).length;
  return bigValues > sample.length / 2;
};

/**
 * Normalise les valeurs selon les décimales du token
 */
export const normalizeLineData = (data: { time: number, value: number }[], decimals?: number) => {
  if (!decimals) return data;
  return data.map(point => ({
    time: point.time as UTCTimestamp,
    value: point.value / Math.pow(10, decimals),
  }));
};

/**
 * Filtre les valeurs hors bornes Lightweight Charts™
 */
export const filterLWCBounds = (data: { time: number, value: number }[]) =>
  data
    .filter(d => d.value >= LWC_MIN && d.value <= LWC_MAX)
    .map(point => ({
      time: point.time as UTCTimestamp,
      value: point.value,
    })); 