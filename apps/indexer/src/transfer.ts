import { and, eq } from "ponder";
import { ponder } from "ponder:registry";
import { pool, position } from "ponder:schema";
import { zeroAddress } from "viem";
import { updateDayPoolData, updateHourPoolData } from "./stats/pool";
import { updateDayTokenData, updateHourTokenData } from "./stats/token";

ponder.on("WinniePositionManager:Transfer", async ({ event, context }) => {
  const positionId = event.args.tokenId.toString();
  if (event.args.from === zeroAddress) { // Mint
    try {
      const positionData = await context.client.readContract({
        address: context.contracts.WinniePositionManager.address,
        abi: context.contracts.WinniePositionManager.abi,
        functionName: "positions",
        args: [event.args.tokenId],
      });
      if (!positionData) return

      const posPool = await context.db.sql
        .select()
        .from(pool)
        .where(
          and(
            eq(pool.token0, positionData[2]),
            eq(pool.token1, positionData[3]),
          )
        )

      if (!posPool || posPool.length === 0) return

      await context.db.insert(position).values({
        id: positionId,
        owner: event.args.to,
        pool: posPool[0]?.id || "0x",
        token0: positionData[2] || "0x",
        token1: positionData[3] || "0x",
        tickLower: /* positionData[5] || */ "0x0",
        tickUpper: /* positionData[6] || */ "0x0",
        liquidity: positionData[7] || 0n,
        depositedToken0: 0n,
        depositedToken1: 0n,
        withdrawnToken0: 0n,
        withdrawnToken1: 0n,
        collectedFeesToken0: 0n,
        collectedFeesToken1: 0n,
        transaction: event.transaction.hash,
        feeGrowthInside0LastX128: positionData[8] || 0n,
        feeGrowthInside1LastX128: positionData[9] || 0n,
        tokenId: event.args.tokenId
      });

      if (posPool[0]) {
        await updateDayPoolData(event.block.timestamp, posPool[0]?.id, context)
        await updateHourPoolData(event.block.timestamp, posPool[0]?.id, context)
      }
      if (positionData) {
        await updateDayTokenData(event.block.timestamp, positionData[2], context)
        await updateHourTokenData(event.block.timestamp, positionData[3], context)
      }
    } catch (error) {
      console.error(`Error fetching position data for ${positionId}:`, error);
    }
  } else if (event.args.to === zeroAddress) { // Burn
    await context.db.delete(position, { id: positionId });
  }
  else { // Transfer
    const existingPosition = await context.db.find(position, { id: positionId });
    if (existingPosition) {
      await context.db.update(position, { id: positionId })
        .set({
          owner: event.args.to,
        });
    }
  }

})