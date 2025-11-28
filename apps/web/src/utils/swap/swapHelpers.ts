import { formatUnits, type Address, type Hex } from "viem"
import type { SingleRoute, OptimizedRoute } from "../../hooks/swap/types"

/**
 * Encodes a trading path for Uniswap V3 multi-hop swaps
 * @param tokens Array of token addresses in the trading path
 * @param fees Array of fee tiers for each hop
 * @returns Encoded path as hex string
 */
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

/**
 * Calculates the minimum amount out considering slippage tolerance
 * @param amount The expected amount out
 * @param slippageTolerance Slippage tolerance as decimal (0.05 = 5%)
 * @returns Minimum amount after applying slippage
 */
export const calculateSlippageAmount = (
  amount: bigint,
  slippageTolerance: number
): bigint => {
  const receivePercent = 1 - slippageTolerance
  const precision = 10n ** 18n // 18 decimal precision for better accuracy
  const receivePercentageBigInt = BigInt(Math.floor(receivePercent * Number(precision)))
  const minAmount = (amount * receivePercentageBigInt) / precision

  return minAmount
}

/**
 * Calculates price impact based on expected vs actual output amounts
 * @param amountIn Input amount
 * @param expectedOut Expected output amount
 * @param sqrtPriceX96 Current pool price in sqrt(price) * 2^96 format
 * @param decimalsIn Input token decimals
 * @param decimalsOut Output token decimals
 * @returns Price impact as percentage (positive number)
 */
export const calculatePriceImpact = (
  amountIn: bigint,
  expectedOut: bigint,
  sqrtPriceX96: bigint,
  decimalsIn: number,
  decimalsOut: number
): number => {
  const Q96 = 2n ** 96n
  const price = (sqrtPriceX96 * sqrtPriceX96) / Q96

  const decimalAdjustment = 10n ** BigInt(decimalsOut)
  const adjustedPrice = (price * decimalAdjustment) / (Q96 * 10n ** BigInt(decimalsIn))

  const expectedWithoutImpact = (amountIn * adjustedPrice) / 10n ** BigInt(decimalsOut)

  if (expectedWithoutImpact === 0n) return 0

  const impact = Number((expectedWithoutImpact - expectedOut) * 10000n / expectedWithoutImpact) / 100

  return Math.max(0, impact)
}

/**
 * Formats a route for display purposes
 * @param route Single route to format
 * @returns Human-readable route description
 */
export const formatRouteDisplay = (route: SingleRoute): string => {
  const symbols = route.path.map(token => token.symbol)
  const fees = route.fees.map(fee => `${fee / 10000}%`)

  if (symbols.length === 2) {
    return `${symbols[0]} → ${symbols[1]} (${fees[0]} fee)`
  }

  return symbols.reduce((acc, symbol, index) => {
    if (index === 0) return symbol
    return `${acc} → ${symbol} (${fees[index - 1]} fee)`
  })
}

/**
 * Formats an optimized route for display
 * @param optimizedRoute Optimized route to format
 * @returns Human-readable optimized route description
 */
export const formatOptimizedRouteDisplay = (optimizedRoute: OptimizedRoute): string => {
  if (optimizedRoute.type === 'single') {
    return formatRouteDisplay(optimizedRoute.routes[0].route)
  }

  return `Split: ${optimizedRoute.routes
    .map(r => `${r.percentage}% via ${formatRouteDisplay(r.route)}`)
    .join(' + ')}`
}

/**
 * Calculates the net amount after gas costs
 * @param quote Quote amount
 * @param gasEstimate Gas estimate
 * @param gasPrice Gas price in wei
 * @returns Net amount after gas costs
 */
export const calculateNetAmount = (
  quote: bigint,
  gasEstimate: bigint,
  gasPrice: bigint
): bigint => {
  const gasCost = gasEstimate * gasPrice
  return quote > gasCost ? quote - gasCost : 0n
}

/**
 * Compares two routes and returns the better one based on net output
 * @param routeA First route to compare
 * @param routeB Second route to compare
 * @param gasPrice Gas price for calculation
 * @returns The better route (higher net output)
 */
export const compareBestRoute = (
  routeA: { quote: bigint; gasEstimate: bigint },
  routeB: { quote: bigint; gasEstimate: bigint },
  gasPrice: bigint
): typeof routeA | typeof routeB => {
  const netA = calculateNetAmount(routeA.quote, routeA.gasEstimate, gasPrice)
  const netB = calculateNetAmount(routeB.quote, routeB.gasEstimate, gasPrice)

  return netA >= netB ? routeA : routeB
}

/**
 * Validates if a route is potentially valid
 * @param route Route to validate
 * @returns true if route appears valid
 */
export const validateRoute = (route: SingleRoute): boolean => {
  return !!(
    route.path?.length >= 2 &&
    route.fees?.length === route.path.length - 1 &&
    route.quote > 0n &&
    route.pools?.length === route.fees.length
  )
}

/**
 * Formats amount with proper decimal places
 * @param amount Amount in wei
 * @param decimals Token decimals
 * @param maxDecimals Maximum decimal places to show
 * @returns Formatted amount string
 */
export const formatAmount = (
  amount: bigint,
  decimals: number,
  maxDecimals: number = 6
): string => {
  const formatted = formatUnits(amount, decimals)
  const num = parseFloat(formatted)

  if (num === 0) return '0'
  if (num < 0.000001) return '< 0.000001'

  return num.toFixed(Math.min(maxDecimals, decimals)).replace(/\.?0+$/, '')
}

/**
 * Creates a structured error object
 * @param message Error message
 * @param originalError Original error object
 * @param code Error code
 * @param context Error context
 * @returns Structured error object
 */
export const createSwapError = (
  message: string,
  originalError?: unknown,
  code?: string,
  context?: string
) => ({
  message,
  originalError,
  code,
  context
})

/**
 * Generates a unique route identifier for caching
 * @param tokenIn Input token address
 * @param tokenOut Output token address
 * @param fees Fee array
 * @returns Unique route identifier
 */
export const generateRouteId = (
  tokenIn: Address,
  tokenOut: Address,
  fees: number[]
): string => {
  return `${tokenIn}-${tokenOut}-${fees.join('-')}`
}

/**
 * Sorts routes by best output considering gas costs
 * @param routes Array of routes to sort
 * @param gasPrice Gas price for net calculation
 * @returns Sorted routes (best first)
 */
export const sortRoutesByBestOutput = (
  routes: SingleRoute[],
  gasPrice: bigint
): SingleRoute[] => {
  return [...routes].sort((a, b) => {
    const netA = calculateNetAmount(a.quote, a.gasEstimate, gasPrice)
    const netB = calculateNetAmount(b.quote, b.gasEstimate, gasPrice)
    return netB > netA ? 1 : -1
  })
}