import { Price, Token } from "@uniswap/sdk-core"
import { encodeSqrtRatioX96, TickMath, Pool, Position } from "@uniswap/v3-sdk"
import JSBI from 'jsbi'
import { parseUnits } from "viem"

export const priceToTick = (sqrtPriceX96: JSBI | null = null): number | null => {
  try {
    if (!sqrtPriceX96) return null
    return TickMath.getTickAtSqrtRatio(sqrtPriceX96)
  } catch (err) {
    console.error('Error calculating tick from price:', err)
    return null
  }
}

export const tickToPrice = (tick: number, token0: Token, token1: Token): number => {
  const sqrtRatioX96 = TickMath.getSqrtRatioAtTick(tick)
  const price = new Price(token0, token1, '1', sqrtRatioX96.toString())
  return parseFloat(price.toSignificant(6))
}

export const getInitialSqrtPriceX96 = (token0: Token, token1: Token, initialPrice: bigint, priceIsToken1PerToken0: boolean) => {
  try {
    const token0Amount = priceIsToken1PerToken0 ? parseUnits("1", token1.decimals) : initialPrice
    const token1Amount = priceIsToken1PerToken0 ? initialPrice : parseUnits("1", token0.decimals)

    // encodeSqrtRatioX96(the amount of token1, the amount of token0)
    return encodeSqrtRatioX96(token1Amount.toString(), token0Amount.toString())
  } catch (err) {
    console.error('Error calculate initial sqrtPriceX96:', err)

    return null
  }
}

/**
 * Calcule la quantité exacte de token0 et token1 pour une position Uniswap V3 (SDK natif)
 * @param params Voir détails ci-dessous
 * @returns { amount0: string, amount1: string }
 *
 * params = {
 *   liquidity: string | bigint,
 *   tickLower: number,
 *   tickUpper: number,
 *   tickCurrent: number,
 *   sqrtPriceX96: string | bigint,
 *   fee: number,
 *   token0: { address: string, decimals: number, symbol: string },
 *   token1: { address: string, decimals: number, symbol: string },
 * }
 */
export function getAmountsForPosition({
  liquidity,
  tickLower,
  tickUpper,
  tickCurrent,
  sqrtPriceX96,
  fee,
  token0,
  token1
}: {
  liquidity: string | bigint,
  tickLower: number,
  tickUpper: number,
  tickCurrent: number,
  sqrtPriceX96: string | bigint,
  fee: number,
  token0: { address: string, decimals: number, symbol: string },
  token1: { address: string, decimals: number, symbol: string },
}): { amount0: string, amount1: string } {
  // Instancier les tokens du SDK
  const T0 = new Token(80069, token0.address, token0.decimals, token0.symbol);
  const T1 = new Token(80069, token1.address, token1.decimals, token1.symbol);

  // Instancier la pool
  const pool = new Pool(
    T0,
    T1,
    fee,
    sqrtPriceX96.toString(),
    '1', // dummy liquidity, la vraie liquidité est sur la position
    tickCurrent
  );

  // Instancier la position
  const position = new Position({
    pool,
    liquidity: JSBI.BigInt(liquidity.toString()),
    tickLower,
    tickUpper
  });

  // Les quantités sont des JSBI, on les convertit en string décimale
  const amount0 = position.amount0.toSignificant(6);
  const amount1 = position.amount1.toSignificant(6);

  return { amount0, amount1 };
}