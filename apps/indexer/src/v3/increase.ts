import Decimal from "decimal.js";
import { ponder } from "ponder:registry";
import { position, positionSnapshot, token } from "ponder:schema";
import { formatUnits } from "viem";

ponder.on("v3PositionManager:IncreaseLiquidity", async ({ event, context }) => {
  const positionId = event.args.tokenId.toString();
  let existingPosition = await context.db.find(position, { id: positionId });
  if (!existingPosition) return

  const token0 = await context.db.find(token, { id: existingPosition.token0 })
  const token1 = await context.db.find(token, { id: existingPosition.token1 })
  if (!token0 || !token1) return

  const amount0 = new Decimal(formatUnits(event.args.amount0, token0.decimals))
  const amount1 = new Decimal(formatUnits(event.args.amount1, token1.decimals))

  existingPosition = await context.db.update(position, { id: positionId })
    .set((row) => ({
      liquidity: row.liquidity + event.args.liquidity,
      depositedToken0: new Decimal(row.depositedToken0).plus(amount0).toString(),
      depositedToken1: new Decimal(row.depositedToken1).plus(amount1).toString(),
    }));

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
    depositedToken0: existingPosition.depositedToken0 || amount0.toString(),
    depositedToken1: existingPosition.depositedToken1 || amount1.toString(),
    withdrawnToken0: existingPosition.withdrawnToken0 || "0",
    withdrawnToken1: existingPosition.withdrawnToken1 || "0",
    collectedFeesToken0: existingPosition.collectedFeesToken0 || "0",
    collectedFeesToken1: existingPosition.collectedFeesToken1 || "0",
    transaction: event.transaction.hash,
    feeGrowthInside0LastX128: existingPosition.feeGrowthInside0LastX128 || 0n,
    feeGrowthInside1LastX128: existingPosition.feeGrowthInside1LastX128 || 0n,
  });
})