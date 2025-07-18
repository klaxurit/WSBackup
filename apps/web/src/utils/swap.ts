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
  const Q96 = 2n ** 96n
  const price = (sqrtPriceX96 * sqrtPriceX96) / Q96

  const decimalAdjustment = 10n ** BigInt(decimals1)
  const adjustedPrice = (price * decimalAdjustment) / (Q96 * 10n ** BigInt(decimals0))

  const expectedWithoutImpact = (amountIn * adjustedPrice) / 10n ** BigInt(decimals1)

  if (expectedWithoutImpact === 0n) return 0

  const impact = Number((expectedWithoutImpact - expectedOut) * 10000n / expectedWithoutImpact) / 100

  return Math.max(0, impact)
}


