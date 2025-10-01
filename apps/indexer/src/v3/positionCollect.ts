import { ponder } from "ponder:registry";
import { position as sPosition, token } from "ponder:schema";
import Decimal from "decimal.js";
import { formatUnits } from "viem";

/**
 * Handler pour l'événement Collect du PositionManager
 * Cet événement contient directement le tokenId, ce qui évite le mapping complexe
 *
 * Event Collect(uint256 indexed tokenId, address recipient, uint256 amount0, uint256 amount1)
 */
ponder.on("v3PositionManager:Collect", async ({ event, context }) => {
  const tokenId = event.args.tokenId.toString();

  const existingPosition = await context.db.find(sPosition, { id: tokenId });
  if (!existingPosition) {
    console.warn(`Position ${tokenId} not found for Collect event`);
    return;
  }

  const positionData = await context.client.readContract({
    address: context.contracts.v3PositionManager.address,
    abi: context.contracts.v3PositionManager.abi,
    functionName: "positions",
    args: [event.args.tokenId],
  });

  if (!positionData) return;

  const token0 = await context.db.find(token, { id: existingPosition.token0 })
  const token1 = await context.db.find(token, { id: existingPosition.token1 })
  if (!token0 || !token1) return

  const amount0 = new Decimal(formatUnits(event.args.amount0, token0.decimals));
  const amount1 = new Decimal(formatUnits(event.args.amount1, token1.decimals));

  await context.db.update(sPosition, { id: tokenId }).set({
    collectedFeesToken0: new Decimal(existingPosition.collectedFeesToken0).plus(amount0).toString(),
    collectedFeesToken1: new Decimal(existingPosition.collectedFeesToken1).plus(amount1).toString(),
    feeGrowthInside0LastX128: positionData[8],
    feeGrowthInside1LastX128: positionData[9],
  });
});