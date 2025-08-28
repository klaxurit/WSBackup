import Decimal from "decimal.js";
import { Context } from "ponder:registry";
import { pool as sPool, token as sToken } from "ponder:schema";
import { formatUnits, parseUnits } from "viem";
import { PRECISION_18, Q192, safeDiv, safeMul, safePow, tokenToRatio, ZERO } from "./bigint-math";

const MINIMUM_NATIVE_LOCKED = 1n
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

export async function getBeraPriceInUSD(context: Context): Promise<bigint> {
  let honeyPool = await context.db.find(sPool, { id: STABLE_TOKEN_POOL })
  if (!honeyPool) {
    console.warn('Stable pool not found, using default BERA price 1.0')
    return PRECISION_18
  }

  if (honeyPool.token0 === REFERENCE_TOKEN) {
    const priceDecimal = honeyPool.token1Price || "1.0"
    return parseUnits(priceDecimal, 18)
  } else if (honeyPool.token1 === REFERENCE_TOKEN) {
    const priceDecimal = honeyPool.token0Price || "1.0"
    return parseUnits(priceDecimal, 18)
  } else {
    console.warn('Bera token not found in stable pool')
    return PRECISION_18
  }
}

export async function findBeraPerToken(token: typeof sToken.$inferSelect, context: Context) {
  // if is wBera return 1
  if (token.id === REFERENCE_TOKEN) {
    return PRECISION_18
  }

  const whitelist = token.whitelistPools
  let largestLiquidityBERA = 0n
  let priceSoFar = 0n

  let beraPriceUSD = await getBeraPriceInUSD(context)

  // if it's a stablecoin, price based on Bera/USD
  if (STABLE_COINS.includes(token.id)) {
    // If 1 Bera = 2.5 USD, then 1 USD = 0.4 Bera
    // berapriceUSD = 2500000000000000000n (2.5)
    // return = 1e18 * 1e18 / 2.5e18 = 0.4e18
    priceSoFar = safeDiv(safeMul(PRECISION_18, PRECISION_18), beraPriceUSD)
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

            const [price0, price1] = sqrtPriceX96ToTokenPrices(
              pool.sqrtPrice,
              token.decimals,
              token1.decimals
            )

            const beraLiquidity = tokenToRatio(
              pool.totalValueLockedToken1,
              token1.decimals
            )
            
            if (beraLiquidity > largestLiquidityBERA) {
              largestLiquidityBERA = beraLiquidity
              priceSoFar = price0
            }
          }
        }

        if (pool.token1 === token.id) {
          const token0 = await context.db.find(sToken, { id: pool.token0 })
          if (token0 && token0.id === REFERENCE_TOKEN) {
            const [price0, price1] = sqrtPriceX96ToTokenPrices(
              pool.sqrtPrice,
              token0.decimals,
              token.decimals
            )

            const beraLiquidity = tokenToRatio(
              pool.totalValueLockedToken0,
              token0.decimals
            )

            if (beraLiquidity > largestLiquidityBERA) {
              largestLiquidityBERA = beraLiquidity
              priceSoFar = price1
            }
          }
        }
      }
    }
  }

  // Final limit 
  const MAX_DERIVED = safeMul(PRECISION_18, parseUnits("1000000", 18)) // 1M max
    if (priceSoFar > MAX_DERIVED) {
      console.warn(`derivedBERA too high for token ${token.id}: ${formatUnits(priceSoFar, 18)}, capping`)
      return MAX_DERIVED
    }
  
  return priceSoFar
}

export function getTrackedAmountUSD(
  amount0: bigint,
  token0: typeof sToken.$inferSelect,
  amount1: bigint,
  token1: typeof sToken.$inferSelect,
  beraPriceUSD: bigint
): bigint {
  const amount0Normalized = tokenToRatio(amount0, token0.decimals)
  const amount1Normalized = tokenToRatio(amount1, token1.decimals)

  const amount0Bera = safeMul(amount0Normalized, token0.derivedBERA)
  const amount1Bera = safeMul(amount1Normalized, token1.derivedBERA)

  // both are whitelist tokens, return sum of both amounts
  if (WHITELIST_TOKENS.includes(token0.id) && WHITELIST_TOKENS.includes(token1.id)) {
    return safeMul(amount0Bera + amount1Bera, beraPriceUSD)
  }

  // take double value of the whitelisted token amount
  if (WHITELIST_TOKENS.includes(token0.id) && !WHITELIST_TOKENS.includes(token1.id)) {
    return safeMul(safeMul(amount0Bera, 2n), beraPriceUSD)
  }

  // take double value of the whitelisted token amount
  if (!WHITELIST_TOKENS.includes(token0.id) && WHITELIST_TOKENS.includes(token1.id)) {
    return safeMul(safeMul(amount1Bera, 2n), beraPriceUSD)
  }
  // neither token is on white list, tracked amount is 0
  return 0n
}

export function sqrtPriceX96ToTokenPrices(
  sqrtPriceX96: bigint,
  token0Decimal: number,
  token1Decimal: number
): [bigint, bigint] {
  if (sqrtPriceX96 === 0n) {
    return [0n, 0n];
  }

  let num = safeMul(sqrtPriceX96, sqrtPriceX96)
  const rawPrice = safeDiv(num, Q192)

  const token0Multiplier = safePow(10n, token0Decimal)
  const token1Multiplier = safePow(10n, token1Decimal)

  const price1Numerator = safeMul(rawPrice, token0Multiplier)
  
  const price1 = safeDiv(price1Numerator, token1Multiplier)
  // price0 = 1/price1 (inversé)
  const price0 = price1 > 0n ? safeDiv(safeMul(PRECISION_18, PRECISION_18), price1) : 0n
  
  return [price0, price1];
}