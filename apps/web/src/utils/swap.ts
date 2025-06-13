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
  const precision = 1000000 // 6 decimal precesion
  const receivePercentageBigInt = BigInt(Math.floor(receivePercent * precision))
  const minAmount = (amount * receivePercentageBigInt) / BigInt(precision)

  return minAmount
}

export const calculatePriceImpact = (
  amountIn: bigint,
  expectedOut: bigint,
  spotPrice: bigint
) => {
  const expectedWithoutImpact = (amountIn * spotPrice) / 10n ** 18n
  const impact = Number((expectedWithoutImpact - expectedOut) * 10000n / expectedWithoutImpact) / 100

  return Math.max(0, impact)
}


