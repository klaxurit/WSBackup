import { ponder } from "ponder:registry";
import { position, positionSnapshot } from "ponder:schema";

ponder.on("WinniePositionManager:IncreaseLiquidity", async ({ event, context }) => {
  const positionId = event.args.tokenId.toString();
  let existingPosition = await context.db.find(position, { id: positionId });

  if (existingPosition) {
    existingPosition = await context.db.update(position, { id: positionId })
      .set((row) => ({
        liquidity: row.liquidity + event.args.liquidity,
        depositedToken0: row.depositedToken0 + event.args.amount0,
        depositedToken1: row.depositedToken1 + event.args.amount1,
      }));
  }

  // Créer un snapshot de la position
  const snapshotId = `${positionId}#${event.block.number}`;
  await context.db.insert(positionSnapshot).values({
    id: snapshotId,
    owner: existingPosition?.owner || "0x",
    pool: existingPosition?.pool || "0x",
    position: positionId,
    timestamp: BigInt(event.block.timestamp),
    blockNumber: BigInt(event.block.number),
    liquidity: (existingPosition?.liquidity || 0n) + event.args.liquidity,
    depositedToken0: (existingPosition?.depositedToken0 || 0n) + event.args.amount0,
    depositedToken1: (existingPosition?.depositedToken1 || 0n) + event.args.amount1,
    withdrawnToken0: existingPosition?.withdrawnToken0 || 0n,
    withdrawnToken1: existingPosition?.withdrawnToken1 || 0n,
    collectedFeesToken0: existingPosition?.collectedFeesToken0 || 0n,
    collectedFeesToken1: existingPosition?.collectedFeesToken1 || 0n,
    transaction: event.transaction.hash,
    feeGrowthInside0LastX128: existingPosition?.feeGrowthInside0LastX128 || 0n,
    feeGrowthInside1LastX128: existingPosition?.feeGrowthInside1LastX128 || 0n,
  });
})