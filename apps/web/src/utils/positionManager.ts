import { Price, Token } from "@uniswap/sdk-core"
import { encodeSqrtRatioX96, priceToClosestTick, TickMath } from "@uniswap/v3-sdk"
import JSBI from 'jsbi'

export const priceToTick = (token0: Token, token1: Token, price: bigint): number => {
  const priceObj = new Price(
    token0,
    token1,
    JSBI.BigInt(10 ** token0.decimals).toString(),
    price.toString()
  )
  return priceToClosestTick(priceObj)
}

export const tickToPrice = (tick: number, token0: Token, token1: Token): number => {
  const sqrtRatioX96 = TickMath.getSqrtRatioAtTick(tick)
  const price = new Price(token0, token1, '1', sqrtRatioX96.toString())
  return parseFloat(price.toFixed(6))
}

export const getInitialSqrtPriceX96 = (token0: Token, token1: Token, initialPrice: bigint) => {
  console.log(token1)
  try {
    return encodeSqrtRatioX96(
      // JSBI.BigInt(initialPrice).toString(),
      initialPrice.toString(),
      JSBI.BigInt(10 ** token0.decimals).toString()
    )
  } catch (err) {
    console.error('Error calculate initial sqrtPriceX96', err)
    return null
  }
}
