import { and, eq } from "ponder";
import { ponder } from "ponder:registry";
import { pool as sPool, position, token } from "ponder:schema";
import { zeroAddress } from "viem";
import { updatePoolStats } from "../stats/pool";
import { updateTokenStats } from "../stats/token";

ponder.on("v3PositionManager:Transfer", async ({ event, context }) => {
  const positionId = event.args.tokenId.toString();
  if (event.args.from === zeroAddress) { // Mint
    try {
      const positionData = await context.client.readContract({
        address: context.contracts.v3PositionManager.address,
        abi: context.contracts.v3PositionManager.abi,
        functionName: "positions",
        args: [event.args.tokenId],
      });
      if (!positionData) return

      const posPool = await context.db.sql
        .select()
        .from(sPool)
        .where(
          and(
            eq(sPool.token0, positionData[2]),
            eq(sPool.token1, positionData[3]),
          )
        )

      if (!posPool || posPool.length === 0) return

      await context.db.insert(position).values({
        id: positionId,
        owner: event.args.to,
        pool: posPool[0]?.id || "0x",
        token0: positionData[2] || "0x",
        token1: positionData[3] || "0x",
        tickLower: /* positionData[5] || */ "0x0", // Id of tick row in DB.
        tickUpper: /* positionData[6] || */ "0x0", // Id of tick row in DB.
        liquidity: positionData[7] || 0n,
        depositedToken0: "0",
        depositedToken1: "0",
        withdrawnToken0: "0",
        withdrawnToken1: "0",
        collectedFeesToken0: "0",
        collectedFeesToken1: "0",
        transaction: event.transaction.hash,
        feeGrowthInside0LastX128: positionData[8] || 0n,
        feeGrowthInside1LastX128: positionData[9] || 0n,
        tokenId: event.args.tokenId
      });

      if (posPool[0]) {
        const pool = await context.db.find(sPool, { id: posPool[0].id })
        if (pool) {
          await updatePoolStats(event.block.timestamp, pool, context)
        }
      }
      if (positionData) {
        const token0 = await context.db.find(token, { id: positionData[2] })
        if (token0) {
          await updateTokenStats(event.block.timestamp, token0, context)
        }
        const token1 = await context.db.find(token, { id: positionData[3] })
        if (token1) {
          await updateTokenStats(event.block.timestamp, token1, context)
        }
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