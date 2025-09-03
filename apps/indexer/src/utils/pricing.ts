import Decimal from "decimal.js";
import { Context } from "ponder:registry";
import { pool as sPool, token as sToken } from "ponder:schema";
import { formatUnits } from "viem";

const REFERENCE_TOKEN = "0x6969696969696969696969696969696969696969" // wBera
const STABLE_COINS = [
  "0xFCBD14DC51f0A4d49d5E53C2E0950e0bC26d0Dce".toLowerCase(), // Honey
  "0x779Ded0c9e1022225f8E0630b35a9b54bE713736".toLowerCase(), // USDT0
  "0x549943e04f40284185054145c6E4e9568C1D3241".toLowerCase() // USDC.e
]
const STABLE_TOKEN_POOL = "0x3b9dba6dacf92eea27dff0a1f9c646e12d739df2" // wBera/Honey
const WHITELIST_TOKENS: `0x${string}`[] = [
  REFERENCE_TOKEN,
  "0xFCBD14DC51f0A4d49d5E53C2E0950e0bC26d0Dce".toLowerCase() as `0x${string}`
]

export async function getBeraPriceInUSD(context: Context): Promise<Decimal> {
  let honeyPool = await context.db.find(sPool, { id: STABLE_TOKEN_POOL })

  if (honeyPool) {
    if (honeyPool.token0 === REFERENCE_TOKEN) return new Decimal('1').div(new Decimal(honeyPool.token1Price))
    else return new Decimal(honeyPool.token0Price)
  } else {
    return new Decimal("0")
  }
  // if (!honeyPool) {
  //   console.warn('Stable pool not found, using default BERA price 1.0')
  //   return Decimal("1")
  // }

  // if (honeyPool.token0 === REFERENCE_TOKEN) {
  //   const price = (Number(honeyPool.sqrtPrice) / (2 ** 96)) ** 2;
  //   return Decimal(price)
  // } else if (honeyPool.token1 === REFERENCE_TOKEN) {
  //   const price = (Number(honeyPool.sqrtPrice) / (2 ** 96)) ** 2;
  //   return Decimal(1 / price)
  // } else {
  //   console.warn('Bera token not found in stable pool')
  //   return Decimal("1")
  // }
}

export async function findBeraPerToken(token: typeof sToken.$inferSelect, context: Context, beraPriceUSD?: Decimal, logs = false): Promise<Decimal> {
  if (!logs && token.symbol === "POLLEN") {
    logs = true
  }
  // if is wBera return 1
  if (token.id === REFERENCE_TOKEN) {
    logs && console.log(`c'est le reference token retourne 1`)
    return Decimal("1")
  }

  const whitelist = token.whitelistPools
  let largestLiquidityBERA = Decimal("0")
  let priceSoFar = Decimal("0")

  if (!beraPriceUSD) {
    beraPriceUSD = await getBeraPriceInUSD(context)
  }

  logs && console.log(`Get le prix de ${token.symbol} (berapriceUSD : ${beraPriceUSD})`)

  // if it's a stablecoin, price based on Bera/USD
  if (STABLE_COINS.includes(token.id)) {
    logs && console.log(`Stable coin, retourne ${beraPriceUSD}`)
    priceSoFar = Decimal("1").div(beraPriceUSD)
  } else {
    // Search in whitelisted whitelistPools
    for (let i = 0; i < whitelist.length; i++) {
      const poolAddress = whitelist[i] as `0x${string}`
      const pool = await context.db.find(sPool, {
        id: poolAddress
      })
      logs && console.log(`test de la pool #${i} liquidity:${pool?.liquidity}`)
      if (pool && pool.liquidity > 0n) {
        logs && console.log(`Pool OK`)
        if (pool.token0 === token.id) {
          const token1 = await context.db.find(sToken, { id: pool.token1 })
          logs && console.log(`token0 c'est ${token.symbol} donc on prend le 1 (${token1?.symbol})`)
          if (token1) {
            const beraLocked = Decimal(pool.totalValueLockedToken1).mul(token1.derivedBERA)
            logs && console.log(`beralocked = (${pool.totalValueLockedToken1} * ${token1.derivedBERA}) ${beraLocked}`)
            if (beraLocked.gt(largestLiquidityBERA)) {
              largestLiquidityBERA = beraLocked
              priceSoFar = Decimal(pool.token1Price).mul(token1.derivedBERA)
              logs && console.log(`C'est plus grand on save et priceSoFar = (${pool.token1Price} * ${token1.derivedBERA}) ${priceSoFar}`)
            }
          }
        }

        if (pool.token1 === token.id) {
          const token0 = await context.db.find(sToken, { id: pool.token0 })
          logs && console.log(`token1 c'est ${token.symbol} donc on prend le 0 (${token0?.symbol})`)
          if (token0) {
            const beraLocked = Decimal(pool.totalValueLockedToken1).mul(token0.derivedBERA)
            logs && console.log(`beralocked = (${pool.totalValueLockedToken1} * ${token0.derivedBERA}) ${beraLocked}`)
            if (beraLocked.gt(largestLiquidityBERA)) {
              largestLiquidityBERA = beraLocked
              priceSoFar = Decimal(pool.token0Price).mul(token0.derivedBERA)
              logs && console.log(`C'est plus grand on save et priceSoFar = (${pool.token0Price} * ${token0.derivedBERA}) ${priceSoFar}`)
            }
          }
        }
      }
    }
  }

  return priceSoFar
}

export function getTrackedAmount(
  amount0Bera: Decimal,
  token0: typeof sToken.$inferSelect,
  amount1Bera: Decimal,
  token1: typeof sToken.$inferSelect
): Decimal {
  // both are whitelist tokens, return sum of both amounts
  if (WHITELIST_TOKENS.includes(token0.id) && WHITELIST_TOKENS.includes(token1.id)) {
    return (amount0Bera.plus(amount1Bera))
  }

  // take double value of the whitelisted token amount
  if (WHITELIST_TOKENS.includes(token0.id) && !WHITELIST_TOKENS.includes(token1.id)) {
    return (amount0Bera.mul(2))
  }

  // take double value of the whitelisted token amount
  if (!WHITELIST_TOKENS.includes(token0.id) && WHITELIST_TOKENS.includes(token1.id)) {
    return (amount1Bera.mul(2))
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
  const denom = 2n ** 192n

  const basePrice = Number(num) / Number(denom)
  const price = (basePrice * (10 ** token0Decimal)) / (10 ** token1Decimal)

  // const decimalsAdjust = 10 ** (token1Decimal - token0Decimal)
  // const price = basePrice * decimalsAdjust

  return [price, 1 / price];
}

// private calculatePriceFromSqrtPriceX96(
//     sqrtPriceX96: bigint,
//     decimals0: number,
//     decimals1: number,
//   ): number {
//     // Prix de token0 en termes de token1
//     // price = (sqrtPriceX96 / 2^96)^2 * 10^(decimals0 - decimals1)

//     const Q96 = 2n ** 96n;
//     const sqrtPrice = Number(sqrtPriceX96) / Number(Q96);
//     const price = sqrtPrice * sqrtPrice;

//     // Ajuster pour les décimales
//     const decimalAdjustment = Math.pow(10, decimals0 - decimals1);

//     return price * decimalAdjustment;
//   }