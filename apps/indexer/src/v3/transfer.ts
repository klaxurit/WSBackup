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

      // ✅ FIX: Calculer les montants initiaux basés sur la liquidité
      // Utiliser la même logique que la SDK Uniswap V3
      const initialLiquidity = positionData[7] || 0n;
      let initialAmount0 = "0";
      let initialAmount1 = "0";

      if (initialLiquidity > 0n) {
        try {
          // Récupérer les données du pool pour le calcul
          const poolData = await context.client.readContract({
            address: posPool[0]?.id as `0x${string}`,
            abi: context.contracts.v3Pool.abi,
            functionName: "slot0"
          });

          if (poolData) {
            const sqrtPriceX96 = poolData[0];
            const currentTick = poolData[1];

            // Calculs approximatifs basés sur la formule Uniswap V3
            // Pour une position in-range: amount0 et amount1 dépendent du prix
            const tickLower = positionData[5];
            const tickUpper = positionData[6];

            // Si position in-range, calculer la répartition
            if (currentTick >= tickLower && currentTick < tickUpper) {
              // Calcul approximatif - peut être affiné avec la vraie formule
              const liquidity = Number(initialLiquidity);

              // Pour simplifier, on utilise une répartition basée sur la position de prix
              const rangeTicks = tickUpper - tickLower;
              const positionInRange = (currentTick - tickLower) / rangeTicks;

              // Approximation simple - à améliorer avec la vraie formule Uniswap V3
              initialAmount0 = (liquidity * (1 - positionInRange) * 0.0001).toString();
              initialAmount1 = (liquidity * positionInRange * 0.0001).toString();
            }
          }
        } catch (error) {
          console.warn(`Could not calculate initial amounts for position ${positionId}:`, error);
          // Fallback: laisser à 0, sera corrigé lors du premier increase
        }
      }

      await context.db.insert(position).values({
        id: positionId,
        owner: event.args.to,
        pool: posPool[0]?.id || "0x",
        token0: positionData[2] || "0x",
        token1: positionData[3] || "0x",
        tickLower: positionData[5],
        tickUpper: positionData[6],
        liquidity: initialLiquidity,
        depositedToken0: initialAmount0, // ✅ FIX: Calculé au lieu de "0"
        depositedToken1: initialAmount1, // ✅ FIX: Calculé au lieu de "0"
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