export function formatNumber(value: number | null | undefined) {
  if (value === null || value === undefined || isNaN(value)) return '-';

  // S'assurer que la valeur est un nombre
  const numValue = typeof value === 'number' ? value : Number(value);
  if (isNaN(numValue)) return '-';

  const absValue = Math.abs(numValue);
  const sign = numValue < 0 ? '-' : '';

  const suffixes = [
    { value: 1e15, suffix: 'Q' },  // Quadrillions
    { value: 1e12, suffix: 'T' },  // Trillions
    { value: 1e9, suffix: 'B' },   // Milliards
    { value: 1e6, suffix: 'M' },   // Millions
    { value: 1e3, suffix: 'K' }    // Milliers
  ];

  for (const { value: threshold, suffix } of suffixes) {
    if (absValue >= threshold) {
      const formatted = (absValue / threshold).toFixed(2);
      const cleaned = parseFloat(formatted).toString();
      return `${sign}${cleaned}${suffix}`;

    }
  }

  return parseFloat(numValue.toFixed(2)).toString()
} 
