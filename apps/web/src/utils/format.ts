export function formatTokenAmount(amount: number | string) {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (num === 0) return '0';
  let formatted = '';
  if (num >= 1) formatted = num.toFixed(2);
  else if (num >= 0.01) formatted = num.toFixed(4);
  else if (num >= 0.0001) formatted = num.toFixed(6);
  else if (num > 0) return '<0.0001';
  else return '0';
  return formatted.replace(/\.?0+$/, '');
}

export function formatUsdAmount(amount: number | string) {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (num < 0.01 && num > 0) return '<$0.01';
  return `$${num.toFixed(2)}`;
}
