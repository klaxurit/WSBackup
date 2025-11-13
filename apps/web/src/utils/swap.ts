import type { Address, Hex } from "viem";

export const encodePath = (tokens: Address[], fees: number[]): Hex => {
  if (tokens.length !== fees.length + 1) {
    throw new Error('Invalid path: tokens length must be fees length + 1')
  }

  let encoded = '0x' as Hex;
  for (let i = 0; i < fees.length; i++) {
    encoded = (encoded + tokens[i].slice(2) + fees[i].toString(16).padStart(6, '0')) as Hex
  }
  encoded = (encoded + tokens[tokens.length - 1].slice(2)) as Hex

  return encoded
}

export const calculateSlippageAmount = (
  amount: bigint,
  slippageTolerance: number
): bigint => {
  const receivePercent = 1 - slippageTolerance
  const precision = 10n ** 18n // 18 decimal precision pour une meilleure précision
  const receivePercentageBigInt = BigInt(Math.floor(receivePercent * Number(precision)))
  const minAmount = (amount * receivePercentageBigInt) / precision

  return minAmount
}

export const calculatePriceImpact = (
  amountIn: bigint,
  expectedOut: bigint,
  sqrtPriceX96: bigint,
  decimals0: number,
  decimals1: number
): number => {
  // Handle edge cases
  if (amountIn === 0n || expectedOut === 0n || sqrtPriceX96 === 0n) return 0

  try {
    const Q96 = 2n ** 96n

    // Calculate spot price from sqrtPriceX96
    // price = (sqrtPriceX96 / 2^96)^2
    // This gives us the price of token1 in terms of token0
    const sqrtPrice = sqrtPriceX96
    const spotPrice = (sqrtPrice * sqrtPrice) / Q96

    // Adjust for decimals: we need the price in the same units as our amounts
    // For token0 -> token1 swap: expectedSpotOut = amountIn * spotPrice * (10^decimals1 / 10^decimals0) / Q96
    const decimalAdjustment = 10n ** BigInt(decimals1 - decimals0)
    const expectedSpotOut = (amountIn * spotPrice * decimalAdjustment) / Q96

    // If expected spot output is too small, price impact is effectively 100%
    if (expectedSpotOut === 0n) return 100

    // Calculate actual execution price vs spot price
    // Price impact = (1 - actualOutput / expectedSpotOutput) * 100
    // We use 10000 for 2 decimal precision in percentage
    const impactBasisPoints = ((expectedSpotOut - expectedOut) * 10000n) / expectedSpotOut
    const impact = Number(impactBasisPoints) / 100

    // Price impact should always be positive (we always get less than spot due to slippage)
    // Cap at 100% to handle edge cases
    return Math.max(0, Math.min(100, impact))
  } catch (error) {
    console.error('Error calculating price impact:', error)
    return 0
  }
}

/**
 * Calculate weighted price impact for split routes
 * This provides a more accurate representation of price impact when the swap is split across multiple routes
 *
 * @param routes - Array of routes with their amounts, quotes, and pool info
 * @param decimalsIn - Decimals of input token
 * @param decimalsOut - Decimals of output token
 * @returns Weighted average price impact as a percentage
 */
export const calculateWeightedPriceImpact = (
  routes: Array<{
    amountIn: bigint
    quote: bigint
    sqrtPriceX96: bigint
  }>,
  decimalsIn: number,
  decimalsOut: number
): number => {
  if (routes.length === 0) return 0

  try {
    // Calculate total amounts
    const totalAmountIn = routes.reduce((sum, route) => sum + route.amountIn, 0n)
    const totalAmountOut = routes.reduce((sum, route) => sum + route.quote, 0n)

    if (totalAmountIn === 0n || totalAmountOut === 0n) return 0

    // Calculate price impact for each route and weight by amount
    let weightedImpactSum = 0
    let totalWeight = 0

    for (const route of routes) {
      if (route.amountIn === 0n || route.sqrtPriceX96 === 0n) continue

      const routeImpact = calculatePriceImpact(
        route.amountIn,
        route.quote,
        route.sqrtPriceX96,
        decimalsIn,
        decimalsOut
      )

      // Weight by the proportion of total input amount
      const weight = Number(route.amountIn * 10000n / totalAmountIn) / 10000
      weightedImpactSum += routeImpact * weight
      totalWeight += weight
    }

    // Return weighted average, or 0 if no valid weights
    return totalWeight > 0 ? weightedImpactSum : 0
  } catch (error) {
    console.error('Error calculating weighted price impact:', error)
    return 0
  }
}


