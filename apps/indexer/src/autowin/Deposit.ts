import { ponder } from "ponder:registry";
import { autoWinVault, autoWinDeposit, autoWinUserPosition, transaction } from "ponder:schema";
import { getOrCreateTransaction } from "../v3/helpers";
import Decimal from "decimal.js";
import { formatUnits } from "viem";

ponder.on("autoWinVaults:Deposit", async ({ event, context }) => {
  // Verify that the AutoWin vault exists
  const vaultEntity = await context.db.find(autoWinVault, { id: event.log.address });
  if (!vaultEntity) {
    console.warn(
      `No AutoWin vault found for deposit! Vault: ${event.log.address} (tx hash: ${event.transaction.hash})`,
    );
    return;
  }

  const vault = { ...vaultEntity };

  // Create or get the transaction entity
  const tx = await getOrCreateTransaction(context, event);

  // Create the deposit event entity
  await context.db.insert(autoWinDeposit).values({
    id: `${event.transaction.hash}#${event.log.logIndex}`,
    transaction: tx.id,
    timestamp: event.block.timestamp,
    autoWinVault: event.log.address,
    user: event.args.owner,
    assets: event.args.assets,
    shares: event.args.shares,
  });

  // Update or create user position
  const userPosId = `${event.args.owner}-${event.log.address}`;
  let userPosEntity = await context.db.find(autoWinUserPosition, { id: userPosId });

  const depositedShares = new Decimal(formatUnits(event.args.shares, 18));

  if (!userPosEntity) {
    // Create new position
    await context.db.insert(autoWinUserPosition).values({
      id: userPosId,
      user: event.args.owner,
      autoWinVault: event.log.address,
      shares: depositedShares.toString(),
      firstDepositAt: event.block.timestamp,
      lastUpdateAt: event.block.timestamp,
    });
    console.log(`✨ New AutoWin position created for ${event.args.owner}: ${depositedShares.toString()} shares`);
  } else {
    // Update existing position
    const currentShares = new Decimal(userPosEntity.shares);
    const newShares = currentShares.plus(depositedShares);

    await context.db.update(autoWinUserPosition, { id: userPosId }).set({
      shares: newShares.toString(),
      lastUpdateAt: event.block.timestamp,
    });
    console.log(`📈 AutoWin position updated for ${event.args.owner}: ${currentShares.toString()} → ${newShares.toString()} shares`);
  }

  // Update vault aggregated stats
  const depositAmount = new Decimal(formatUnits(event.args.assets, 18));
  vault.totalDeposits = new Decimal(vault.totalDeposits).plus(depositAmount).toString();
  vault.depositCount += 1;

  // Update the vault entity
  await context.db.update(autoWinVault, { id: vault.id }).set({
    totalDeposits: vault.totalDeposits,
    depositCount: vault.depositCount,
  });

  console.log(`💰 AutoWin deposit: ${depositAmount.toString()} assets for ${event.args.owner}`);
});
