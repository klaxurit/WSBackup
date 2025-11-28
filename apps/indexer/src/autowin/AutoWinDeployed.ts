import { ponder } from "ponder:registry";
import { autoWinVault, stickyVault } from "ponder:schema";

ponder.on("autoWinFactory:AutoWinDeployed", async ({ event, context }) => {
  // Verify that the staking token (StickyVault) exists
  const stakingVault = await context.db.find(stickyVault, { id: event.args.stakingToken });
  if (!stakingVault) {
    console.warn(
      `No StickyVault found for AutoWin creation! StakingToken: ${event.args.stakingToken} (tx hash: ${event.transaction.hash})`,
    );
    return;
  }

  // Create the AutoWin vault entity
  await context.db.insert(autoWinVault).values({
    id: event.args.autoWin,
    stakingToken: event.args.stakingToken,
    implementation: event.args.implementation,
    createdAtTimestamp: event.block.timestamp,
    createdAtBlockNumber: event.block.number,

    // Initialize aggregated stats with default values
    totalDeposits: "0",
    totalWithdrawals: "0",
    totalBgtClaimed: "0",
    totalCompoundFees: "0",
    totalBountyPaid: "0",
    claimCount: 0,
    depositCount: 0,
    withdrawCount: 0,

    // Initialize performance metrics
    avgBgtPerClaim: "0",
    lastClaimTimestamp: 0n,
    estimatedAPR: "0",
  });

  // Update the StickyVault with the AutoWin vault reference
  await context.db.update(stickyVault, { id: event.args.stakingToken })
    .set({
      autoWinVault: event.args.autoWin,
    });

  console.log(`✅ AutoWin vault created: ${event.args.autoWin} for StickyVault: ${event.args.stakingToken}`);
});
