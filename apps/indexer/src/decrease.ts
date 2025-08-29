import { ponder } from "ponder:registry";
import { position, positionSnapshot } from "ponder:schema";

ponder.on("WinniePositionManager:DecreaseLiquidity", async ({ event, context }) => {
  const positionId = event.args.tokenId.toString();
  let existingPosition = await context.db.find(position, { id: positionId });

  if (existingPosition) {
    existingPosition = await context.db.update(position, { id: positionId })
      .set((row) => ({
        liquidity: row.liquidity - event.args.liquidity,
        withdrawnToken0: row.withdrawnToken0 + event.args.amount0,
        withdrawnToken1: row.withdrawnToken1 + event.args.amount1,
      }));
  }
})