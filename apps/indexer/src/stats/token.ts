import { Context } from "ponder:registry";
import { token as sToken, tokenDayData, tokenHourData } from "ponder:schema";
import { Address } from "viem";

export async function updateDayTokenData(timestamp: bigint, address: Address, context: Context) {
  const dayId = Math.round(Number(timestamp) / 86400)
  const dayStartTimestamp = dayId * 86400
  const dayTokenId = `${address}-${dayId}`

  const token = await context.db.find(sToken, { id: address })
  if (!token) return

  const tokenData = await context.db.find(tokenDayData, { id: dayTokenId })

  if (!tokenData) {
    await context.db.insert(tokenDayData).values({
      id: dayTokenId, // pool address + "-" + day id
      date: dayStartTimestamp,
      token: address,
      volume: token.volume,
      volumeUSD: token.volumeUSD,
      untrackedVolumeUSD: token.untrackedVolumeUSD,
      totalValueLocked: token.totalValueLocked,
      totalValueLockedUSD: token.totalValueLockedUSD,
      priceUSD: "0",
      feesUSD: token.feesUSD,
      open: "0",
      high: "0",
      low: "0",
      close: "0",
    })
  } else {
    await context.db.update(tokenDayData, { id: dayTokenId }).set({
      volume: token.volume,
      volumeUSD: token.volumeUSD,
      untrackedVolumeUSD: token.untrackedVolumeUSD,
      totalValueLocked: token.totalValueLocked,
      totalValueLockedUSD: token.totalValueLockedUSD,
      priceUSD: "0",
      feesUSD: token.feesUSD,
      open: "0",
      high: "0",
      low: "0",
      close: "0",
    })
  }
}

export async function updateHourTokenData(timestamp: bigint, address: Address, context: Context) {
  const hourId = Math.round(Number(timestamp) / 3600)
  const hourStartUnix = hourId * 3600
  const hourTokenID = `${address}-${hourId}`

  const token = await context.db.find(sToken, { id: address })
  if (!token) return

  const tokenData = await context.db.find(tokenHourData, { id: hourTokenID })

  if (!tokenData) {
    await context.db.insert(tokenHourData).values({
      id: hourTokenID, // pool address + "-" + day id
      periodStartUnix: hourStartUnix,
      token: address,
      volume: token.volume,
      volumeUSD: token.volumeUSD,
      untrackedVolumeUSD: token.untrackedVolumeUSD,
      totalValueLocked: token.totalValueLocked,
      totalValueLockedUSD: token.totalValueLockedUSD,
      priceUSD: "0",
      feesUSD: token.feesUSD,
      open: "0",
      high: "0",
      low: "0",
      close: "0",
    })
  } else {
    await context.db.update(tokenHourData, { id: hourTokenID }).set({
      volume: token.volume,
      volumeUSD: token.volumeUSD,
      untrackedVolumeUSD: token.untrackedVolumeUSD,
      totalValueLocked: token.totalValueLocked,
      totalValueLockedUSD: token.totalValueLockedUSD,
      priceUSD: "0",
      feesUSD: token.feesUSD,
      open: "0",
      high: "0",
      low: "0",
      close: "0",
    })
  }
}