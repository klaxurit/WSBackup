import { CONTRACTS } from "@repo/contracts";
import { Context } from "ponder:registry";
import { protocolDayData, factory as sFactory } from "ponder:schema";

export async function updateProtocolDayData(timestamp: bigint, context: Context) {
  const factoryEntity = await context.db.find(sFactory, { id: CONTRACTS.FACTORY });
  if (!factoryEntity) return;

  const dayId = Math.round(Number(timestamp) / 86400)
  const dayStartTimestamp = dayId * 86400

  const dayData = await context.db.find(protocolDayData, { id: dayId })

  if (!dayData) {
    await context.db.insert(protocolDayData).values({
      id: dayId,
      date: dayStartTimestamp,
      volumeBERA: factoryEntity.totalVolumeBERA,
      volumeUSD: factoryEntity.totalVolumeUSD,
      volumeUSDUntracked: factoryEntity.untrackedVolumeUSD,
      feesBERA: factoryEntity.totalFeesBERA,
      feesUSD: factoryEntity.totalFeesUSD,
      txCount: factoryEntity.txCount,
      tvlUSD: factoryEntity.totalValueLockedUSD
    })
  } else {
    await context.db.update(protocolDayData, { id: dayId }).set({
      volumeBERA: factoryEntity.totalVolumeBERA,
      volumeUSD: factoryEntity.totalVolumeUSD,
      volumeUSDUntracked: factoryEntity.untrackedVolumeUSD,
      feesBERA: factoryEntity.totalFeesBERA,
      feesUSD: factoryEntity.totalFeesUSD,
      txCount: factoryEntity.txCount,
      tvlUSD: factoryEntity.totalValueLockedUSD
    })
  }
}