import { formatUnits } from 'viem';

/**
 * Formate un montant de token avec un nombre limité de décimales
 * @param amount - Le montant en BigInt
 * @param decimals - Les décimales du token (généralement 18)
 * @param maxDecimals - Nombre maximum de décimales à afficher (par défaut 6)
 */
export function formatTokenAmount(
  amount: bigint,
  decimals: number,
  maxDecimals: number = 6
): string {
  const formatted = formatUnits(amount, decimals);
  const [integer, decimal] = formatted.split('.');

  if (!decimal) {
    return integer;
  }

  // Limiter les décimales
  const limitedDecimal = decimal.slice(0, maxDecimals);

  // Supprimer les zéros trailing
  const trimmedDecimal = limitedDecimal.replace(/0+$/, '');

  if (trimmedDecimal === '') {
    return integer;
  }

  return `${integer}.${trimmedDecimal}`;
}

