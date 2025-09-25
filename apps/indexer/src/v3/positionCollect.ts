import { ponder } from "ponder:registry";
import { position as sPosition } from "ponder:schema";
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

  // Récupérer la position par son ID (direct grâce au tokenId)
  const existingPosition = await context.db.find(sPosition, { id: tokenId });
  if (!existingPosition) {
    console.warn(`Position ${tokenId} not found for Collect event`);
    return;
  }

  // Lire la position on-chain pour obtenir les décimales des tokens
  const positionData = await context.client.readContract({
    address: context.contracts.v3PositionManager.address,
    abi: context.contracts.v3PositionManager.abi,
    functionName: "positions",
    args: [event.args.tokenId],
  });

  if (!positionData) return;

  // Pour les décimales, on peut récupérer les infos des tokens depuis l'existingPosition
  // ou faire des appels aux contracts ERC20, mais pour simplifier on va assumer 18 decimals
  // TODO: Récupérer les vraies décimales des tokens si nécessaire
  const decimals0 = 18; // Peut être amélioré en récupérant depuis le contract token
  const decimals1 = 18; // Peut être amélioré en récupérant depuis le contract token

  const amount0 = new Decimal(formatUnits(event.args.amount0, decimals0));
  const amount1 = new Decimal(formatUnits(event.args.amount1, decimals1));

  // ✅ Mise à jour CORRECTE : fees collectées sur la position spécifique
  await context.db.update(sPosition, { id: tokenId }).set({
    collectedFeesToken0: new Decimal(existingPosition.collectedFeesToken0).plus(amount0).toString(),
    collectedFeesToken1: new Decimal(existingPosition.collectedFeesToken1).plus(amount1).toString(),

    // Mettre à jour les feeGrowth pour la prochaine fois
    feeGrowthInside0LastX128: positionData[8],
    feeGrowthInside1LastX128: positionData[9],
  });

  console.log(`Position ${tokenId}: Collected ${amount0} token0 + ${amount1} token1`);
});