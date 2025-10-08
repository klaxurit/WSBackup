import { ponder } from "ponder:registry";
import { autoWinVault, autoWinWithdraw, autoWinUserPosition, transaction } from "ponder:schema";
import { getOrCreateTransaction } from "../v3/helpers";
import Decimal from "decimal.js";
import { formatUnits } from "viem";

ponder.on("autoWinVaults:Withdraw", async ({ event, context }) => {
  // Verify that the AutoWin vault exists
  const vaultEntity = await context.db.find(autoWinVault, { id: event.log.address });
  if (!vaultEntity) {
    console.warn(
      `No AutoWin vault found for withdrawal! Vault: ${event.log.address} (tx hash: ${event.transaction.hash})`,
    );
    return;
  }

  const vault = { ...vaultEntity };

  // Create or get the transaction entity
  const tx = await getOrCreateTransaction(context, event);

  // Create the withdraw event entity
  await context.db.insert(autoWinWithdraw).values({
    id: `${event.transaction.hash}#${event.log.logIndex}`,
    transaction: tx.id,
    timestamp: event.block.timestamp,
    autoWinVault: event.log.address,
    user: event.args.owner,
    assets: event.args.assets,
    shares: event.args.shares,
  });

  // Update user position
  const userPosId = `${event.args.owner}-${event.log.address}`;
  let userPosEntity = await context.db.find(autoWinUserPosition, { id: userPosId });

  if (!userPosEntity) {
    console.warn(`No AutoWin position found for ${event.args.owner} in vault ${event.log.address}`);
  } else {
    // Update existing position
    const withdrawnShares = new Decimal(formatUnits(event.args.shares, 18));
    const currentShares = new Decimal(userPosEntity.shares);
    const newShares = currentShares.minus(withdrawnShares);

    await context.db.update(autoWinUserPosition, { id: userPosId }).set({
      shares: newShares.toString(),
      lastUpdateAt: event.block.timestamp,
    });
    console.log(`📉 AutoWin position updated for ${event.args.owner}: ${currentShares.toString()} → ${newShares.toString()} shares`);
  }

  // Update vault aggregated stats
  const withdrawAmount = new Decimal(formatUnits(event.args.assets, 18));
  vault.totalWithdrawals = new Decimal(vault.totalWithdrawals).plus(withdrawAmount).toString();
  vault.withdrawCount += 1;

  // Update the vault entity
  await context.db.update(autoWinVault, { id: vault.id }).set({
    totalWithdrawals: vault.totalWithdrawals,
    withdrawCount: vault.withdrawCount,
  });

  console.log(`💸 AutoWin withdrawal: ${withdrawAmount.toString()} assets for ${event.args.owner}`);
});
