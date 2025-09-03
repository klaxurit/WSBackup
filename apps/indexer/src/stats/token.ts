import { Context } from "ponder:registry";
import { token as sToken, tokenDayData, tokenHourData } from "ponder:schema";
import { findBeraPerToken, getBeraPriceInUSD } from "../utils/pricing";
import Decimal from "decimal.js";

export async function updateTokenStats(timestamp: bigint, token: typeof sToken.$inferSelect, context: Context) {
  const dayId = Math.floor(Number(timestamp) / 86400)
  const dayStartTimestamp = dayId * 86400
  const dayTokenId = `${token.id}-${dayId}`

  const hourId = Math.floor(Number(timestamp) / 3600)
  const hourStartUnix = hourId * 3600
  const hourTokenID = `${token.id} -${hourId} `

  const tokenPrice = await getPriceInUSD(token, context)
  const oneDayEvo = await getPriceEvo(tokenPrice, `${token.id} -${hourId - 24} `, context)
  const oneMonthEvo = await getPriceEvo(tokenPrice, `${token.id} -${hourId - (24 * 30)} `, context)
  const marketCap = await getMarketcap(token, tokenPrice)
  const fdv = await getFDV(token, tokenPrice)
  const volume24hUSD = await getVolumeByPeriod(token, `${token.id} -${hourId - 24} `, context)

  await updateDayTokenData(token, dayTokenId, dayStartTimestamp, tokenPrice, oneDayEvo, oneMonthEvo, marketCap, fdv, volume24hUSD, context)
  await updateHourTokenData(token, hourTokenID, hourStartUnix, tokenPrice, context)
}

async function updateDayTokenData(
  token: typeof sToken.$inferSelect,
  dayTokenId: string,
  ts: number,
  tokenPrice: string,
  oneDayEvo: string,
  oneMonthEvo: string,
  marketCap: string,
  fdv: string,
  volume24hUSD: string,
  context: Context
) {
  const tokenData = await context.db.find(tokenDayData, { id: dayTokenId })
  if (!tokenData) {
    await context.db.insert(tokenDayData).values({
      id: dayTokenId, // pool address + "-" + day id
      date: ts,
      token: token.id,
      volume: token.volume,
      volumeUSD: token.volumeUSD,
      untrackedVolumeUSD: token.untrackedVolumeUSD,
      totalValueLocked: token.totalValueLocked,
      totalValueLockedUSD: token.totalValueLockedUSD,
      priceUSD: tokenPrice,
      feesUSD: token.feesUSD,
      open: tokenPrice,
      high: tokenPrice,
      low: tokenPrice,
      close: tokenPrice,
      oneDayEvo,
      oneMonthEvo,
      marketCap,
      fdv,
      volume24hUSD
    })
  } else {
    await context.db.update(tokenDayData, { id: dayTokenId }).set((r) => ({
      volume: token.volume,
      volumeUSD: token.volumeUSD,
      untrackedVolumeUSD: token.untrackedVolumeUSD,
      totalValueLocked: token.totalValueLocked,
      totalValueLockedUSD: token.totalValueLockedUSD,
      priceUSD: tokenPrice,
      feesUSD: token.feesUSD,
      ...(r.open === "0" && { open: tokenPrice }),
      ...(parseFloat(r.high) < parseFloat(tokenPrice) && { high: tokenPrice }),
      ...(parseFloat(r.low) > parseFloat(tokenPrice) && { low: tokenPrice }),
      close: tokenPrice,
      oneDayEvo,
      oneMonthEvo,
      marketCap,
      fdv,
      volume24hUSD
    }))
  }
}

async function updateHourTokenData(
  token: typeof sToken.$inferSelect,
  hourTokenID: string,
  ts: number,
  tokenPrice: string,
  context: Context
) {
  const tokenData = await context.db.find(tokenHourData, { id: hourTokenID })
  if (!tokenData) {
    await context.db.insert(tokenHourData).values({
      id: hourTokenID, // pool address + "-" + day id
      periodStartUnix: ts,
      token: token.id,
      volume: token.volume,
      volumeUSD: token.volumeUSD,
      untrackedVolumeUSD: token.untrackedVolumeUSD,
      totalValueLocked: token.totalValueLocked,
      totalValueLockedUSD: token.totalValueLockedUSD,
      priceUSD: tokenPrice,
      feesUSD: token.feesUSD,
      open: tokenPrice,
      high: tokenPrice,
      low: tokenPrice,
      close: tokenPrice,
    })
  } else {
    await context.db.update(tokenHourData, { id: hourTokenID }).set((r) => ({
      volume: token.volume,
      volumeUSD: token.volumeUSD,
      untrackedVolumeUSD: token.untrackedVolumeUSD,
      totalValueLocked: token.totalValueLocked,
      totalValueLockedUSD: token.totalValueLockedUSD,
      priceUSD: tokenPrice,
      feesUSD: token.feesUSD,
      ...(r.open === "0" && { open: tokenPrice }),
      ...(parseFloat(r.high) < parseFloat(tokenPrice) && { high: tokenPrice }),
      ...(parseFloat(r.low) > parseFloat(tokenPrice) && { low: tokenPrice }),
      close: tokenPrice,
    }))
  }
}

async function getPriceInUSD(token: typeof sToken.$inferSelect, context: Context): Promise<string> {
  const beraPriceUSD = await getBeraPriceInUSD(context)

  if (token.derivedBERA !== "0") {
    return new Decimal(token.derivedBERA).mul(beraPriceUSD).toString()
  }

  const beraPrice = await findBeraPerToken(token, context)
  return beraPrice.mul(beraPriceUSD).toString()
}

async function getPriceEvo(currentPrice: string, fromId: string, context: Context): Promise<string> {
  const fromData = await context.db.find(tokenHourData, { id: fromId })
  if (!fromData || fromData.priceUSD === "0" || currentPrice === "0") return "0"

  return new Decimal(currentPrice)
    .minus(fromData.priceUSD)
    .div(fromData.priceUSD)
    .mul(100)
    .toString()
}

async function getMarketcap(token: typeof sToken.$inferSelect, currentPrice: string): Promise<string> {
  if (!token.totalSupply || new Decimal(token.totalSupply) === new Decimal("0")) return "0"
  const supply = new Decimal(token.totalSupply).div(10 ** token.decimals)

  return supply.mul(currentPrice).toString()
}

async function getFDV(token: typeof sToken.$inferSelect, currentPrice: string): Promise<string> {
  if (!token.maxSupply || new Decimal(token.maxSupply) === new Decimal("0")) return "0"

  const supply = new Decimal(token.maxSupply).div(10 ** token.decimals)

  return supply.mul(currentPrice).toString()
}

async function getVolumeByPeriod(token: typeof sToken.$inferSelect, fromId: string, context: Context): Promise<string> {
  const fromData = await context.db.find(tokenHourData, { id: fromId })
  if (!fromData || fromData.volumeUSD === "0" || token.volumeUSD === "0") return "0"

  return new Decimal(token.volumeUSD)
    .minus(fromData.volumeUSD)
    .toString()
}