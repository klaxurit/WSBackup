export function formatNumber(value: number | null | undefined, options?: { currency?: boolean }) {
  if (value === null || value === undefined || isNaN(value)) return '-';
  const abs = Math.abs(value);
  let formatted = '';
  if (abs >= 1e9) {
    formatted = (value / 1e9).toFixed(2) + 'B';
  } else if (abs >= 1e6) {
    formatted = (value / 1e6).toFixed(2) + 'M';
  } else if (abs >= 1e3) {
    formatted = (value / 1e3).toFixed(2) + 'K';
  } else {
    formatted = value.toLocaleString('fr-FR', { maximumFractionDigits: 0 });
  }
  if (options?.currency) return '$' + formatted;
  return formatted;
} 