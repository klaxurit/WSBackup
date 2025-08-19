import { Price, Token } from "@uniswap/sdk-core"
import { encodeSqrtRatioX96, priceToClosestTick, TickMath, Pool, Position } from "@uniswap/v3-sdk"
import JSBI from 'jsbi'

export const priceToTick = (token0: Token, token1: Token, price: bigint): number => {
  try {
    // Le prix est en unités du token sélectionné (initialPrice)
    // On doit créer un objet Price qui représente le ratio token0/token1
    // price représente combien de token1 on obtient pour 1 token0

    // Créer un objet Price avec la base correcte
    // Pour token0/token1, on utilise 10^decimals0 comme base et price * 10^decimals1 comme quote
    const priceObj = new Price(
      token0,
      token1,
      JSBI.BigInt(10 ** token0.decimals).toString(),
      JSBI.multiply(JSBI.BigInt(price.toString()), JSBI.BigInt(10 ** token1.decimals)).toString()
    )

    return priceToClosestTick(priceObj)
  } catch (err) {
    console.error('Error calculating tick from price:', err)
    // Fallback: calculer le tick directement
    const priceDecimal = Number(price) / (10 ** token1.decimals)
    const tick = Math.log(priceDecimal) / Math.log(1.0001)
    return Math.floor(tick)
  }
}

export const tickToPrice = (tick: number, token0: Token, token1: Token): number => {
  const sqrtRatioX96 = TickMath.getSqrtRatioAtTick(tick)
  const price = new Price(token0, token1, '1', sqrtRatioX96.toString())
  return parseFloat(price.toSignificant(6))
}

export const getInitialSqrtPriceX96 = (token0: Token, token1: Token, initialPrice: bigint) => {
  try {
    // initialPrice est en unités de token1
    // On veut calculer le prix de token0 en termes de token1
    // Pour 1 token0, on obtient initialPrice unités de token1

    // Convertir initialPrice en prix décimal
    const priceDecimal = Number(initialPrice) / (10 ** token1.decimals)

    // Pour encodeSqrtRatioX96, on doit fournir le ratio des amounts
    // Si 1 token0 = priceDecimal token1, alors le ratio est 1:priceDecimal
    // encodeSqrtRatioX96(amount0, amount1) où amount0 et amount1 sont en unités de base

    // Ajuster pour les decimals
    const amount0 = JSBI.BigInt(10 ** token0.decimals)  // 1 token0 en unités de base
    const amount1 = JSBI.BigInt(Math.floor(priceDecimal * 10 ** token1.decimals))  // priceDecimal token1 en unités de base

    // Utiliser encodeSqrtRatioX96 pour calculer sqrtPriceX96
    // Cette fonction gère automatiquement les decimals
    return encodeSqrtRatioX96(amount0, amount1)
  } catch (err) {
    console.error('Error calculate initial sqrtPriceX96:', err)

    // Fallback: utiliser encodeSqrtRatioX96 avec des valeurs par défaut
    try {
      return encodeSqrtRatioX96(
        JSBI.BigInt(10 ** token0.decimals).toString(),
        JSBI.BigInt(10 ** token1.decimals).toString()
      )
    } catch (fallbackErr) {
      console.error('Fallback calculation also failed:', fallbackErr)
      return null
    }
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
