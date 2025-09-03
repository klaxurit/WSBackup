import Decimal from "decimal.js";
import { ponder } from "ponder:registry";
import { position, positionSnapshot, token } from "ponder:schema";
import { formatUnits } from "viem";

ponder.on("WinniePositionManager:DecreaseLiquidity", async ({ event, context }) => {
  const positionId = event.args.tokenId.toString();
  let existingPosition = await context.db.find(position, { id: positionId });
  if (!existingPosition) return

  const token0 = await context.db.find(token, { id: existingPosition.token0 })
  const token1 = await context.db.find(token, { id: existingPosition.token1 })
  if (!token0 || !token1) return

  const amount0 = new Decimal(formatUnits(event.args.amount0, token0.decimals))
  const amount1 = new Decimal(formatUnits(event.args.amount1, token1.decimals))

  if (existingPosition) {
    existingPosition = await context.db.update(position, { id: positionId })
      .set((row) => ({
        liquidity: row.liquidity - event.args.liquidity,
        withdrawnToken0: new Decimal(row.withdrawnToken0).plus(amount0).toString(),
        withdrawnToken1: new Decimal(row.withdrawnToken1).plus(amount1).toString(),
      }));
  }
})