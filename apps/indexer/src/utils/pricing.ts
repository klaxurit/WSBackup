import Decimal from "decimal.js";
import { Context } from "ponder:registry";
import { pool as sPool, token as sToken } from "ponder:schema";

const REFERENCE_TOKEN = "0x6969696969696969696969696969696969696969" // wBera
const STABLE_COINS = [
  "0xFCBD14DC51f0A4d49d5E53C2E0950e0bC26d0Dce", // Honey
  "0x779Ded0c9e1022225f8E0630b35a9b54bE713736", // USDT0
  "0x549943e04f40284185054145c6E4e9568C1D3241" // USDC.e
]
const STABLE_TOKEN_POOL = "0x3b9dba6dacf92eea27dff0a1f9c646e12d739df2" // wBera/Honey
const WHITELIST_TOKENS: `0x${string}`[] = [
  REFERENCE_TOKEN,
  "0xFCBD14DC51f0A4d49d5E53C2E0950e0bC26d0Dce"
]

export async function getBeraPriceInUSD(context: Context): Promise<Decimal> {
  let honeyPool = await context.db.find(sPool, { id: STABLE_TOKEN_POOL })
  if (!honeyPool) {
    console.warn('Stable pool not found, using default BERA price 1.0')
    return Decimal("1")
  }

  if (honeyPool.token0 === REFERENCE_TOKEN) {
    const price = (Number(honeyPool.sqrtPrice) / (2 ** 96)) ** 2;
    return Decimal(price)
  } else if (honeyPool.token1 === REFERENCE_TOKEN) {
    const price = (Number(honeyPool.sqrtPrice) / (2 ** 96)) ** 2;
    return Decimal(1 / price)
  } else {
    console.warn('Bera token not found in stable pool')
    return Decimal("1")
  }
}

export async function findBeraPerToken(token: typeof sToken.$inferSelect, context: Context): Promise<Decimal> {
  // if is wBera return 1
  if (token.id === REFERENCE_TOKEN) {
    return Decimal("1")
  }

  const whitelist = token.whitelistPools
  let largestLiquidityBERA = Decimal("0")
  let priceSoFar = Decimal("0")

  let beraPriceUSD = await getBeraPriceInUSD(context)

  // if it's a stablecoin, price based on Bera/USD
  if (STABLE_COINS.includes(token.id)) {
    priceSoFar = Decimal("1").div(beraPriceUSD)
  } else {
    // Search in whitelisted whitelistPools
    for (let i = 0; i < whitelist.length; i++) {
      const poolAddress = whitelist[i] as `0x${string}`
      const pool = await context.db.find(sPool, {
        id: poolAddress
      })

      if (pool && pool.liquidity > 0n) {
        if (pool.token0 === token.id) {
          const token1 = await context.db.find(sToken, { id: pool.token1 })
          if (token1 && token1.id === REFERENCE_TOKEN) {
            const beraLocked = Decimal(pool.totalValueLockedToken1).mul(token1.derivedBERA)
            if (beraLocked.gt(largestLiquidityBERA)) {
              largestLiquidityBERA = beraLocked
              priceSoFar = Decimal(pool.token1Price).mul(token1.derivedBERA)
            }
          }
        }

        if (pool.token1 === token.id) {
          const token0 = await context.db.find(sToken, { id: pool.token0 })
          if (token0 && token0.id === REFERENCE_TOKEN) {
            const beraLocked = Decimal(pool.totalValueLockedToken1).mul(token0.derivedBERA)
            if (beraLocked.gt(largestLiquidityBERA)) {
              largestLiquidityBERA = beraLocked
              priceSoFar = Decimal(pool.token1Price).mul(token0.derivedBERA)
            }
          }
        }
      }
    }
  }

  return priceSoFar
}

export function getTrackedAmountUSD(
  amount0: bigint,
  token0: typeof sToken.$inferSelect,
  amount1: bigint,
  token1: typeof sToken.$inferSelect,
  beraPriceUSD: Decimal
): Decimal {
  const amount0Bera = Decimal(amount0).mul(token0.derivedBERA)
  const amount1Bera = Decimal(amount0).mul(token1.derivedBERA)

  // both are whitelist tokens, return sum of both amounts
  if (WHITELIST_TOKENS.includes(token0.id) && WHITELIST_TOKENS.includes(token1.id)) {
    return (amount0Bera.plus(amount1Bera)).mul(beraPriceUSD)
  }

  // take double value of the whitelisted token amount
  if (WHITELIST_TOKENS.includes(token0.id) && !WHITELIST_TOKENS.includes(token1.id)) {
    return (amount0Bera.mul(2)).mul(beraPriceUSD)
  }

  // take double value of the whitelisted token amount
  if (!WHITELIST_TOKENS.includes(token0.id) && WHITELIST_TOKENS.includes(token1.id)) {
    return (amount1Bera.mul(2)).mul(beraPriceUSD)
  }
  // neither token is on white list, tracked amount is 0
  return Decimal("0")
}

export function sqrtPriceX96ToTokenPrices(
  sqrtPriceX96: bigint,
  token0Decimal: number,
  token1Decimal: number
): [number, number] {
  if (sqrtPriceX96 === 0n) {
    return [0, 0];
  }
  const num = sqrtPriceX96 * sqrtPriceX96
  const denom = BigInt(2 ** 192)

  const decimalsAdjust = BigInt(10 ** token1Decimal) / BigInt(10 ** token0Decimal)
  
  const price = Number(num * decimalsAdjust) / Number(denom)
  
  return [price, 1 / price];
}