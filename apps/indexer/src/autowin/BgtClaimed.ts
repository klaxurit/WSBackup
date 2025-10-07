import { ponder } from "ponder:registry";
import { autoWinVault, autoWinBgtClaim, transaction } from "ponder:schema";
import { getOrCreateTransaction } from "../v3/helpers";
import Decimal from "decimal.js";
import { formatUnits } from "viem";

ponder.on("autoWinVaults:BgtClaimed", async ({ event, context }) => {
  // Verify that the AutoWin vault exists
  const vaultEntity = await context.db.find(autoWinVault, { id: event.log.address });
  if (!vaultEntity) {
    console.warn(
      `No AutoWin vault found for BGT claim! Vault: ${event.log.address} (tx hash: ${event.transaction.hash})`,
    );
    return;
  }

  const vault = { ...vaultEntity };

  // Create or get the transaction entity
  const tx = await getOrCreateTransaction(context, event);

  // Get current TVL snapshot by reading totalAssets from the vault contract
  let tvlSnapshot = "0";
  try {
    const totalAssets = await context.client.readContract({
      address: event.log.address,
      abi: context.contracts.autoWinVaults.abi,
      functionName: "totalAssets",
    });
    tvlSnapshot = formatUnits(totalAssets, 18);
  } catch (error) {
    console.warn(`Could not fetch totalAssets for vault ${event.log.address}:`, (error as Error).message);
  }

  // Create the BGT claim event entity
  await context.db.insert(autoWinBgtClaim).values({
    id: `${event.transaction.hash}#${event.log.logIndex}`,
    transaction: tx.id,
    timestamp: event.block.timestamp,
    autoWinVault: event.log.address,
    bountySender: event.args.bountySender,
    bgtRecipient: event.args.bgtRecipient,
    compoundAmount: event.args.compoundAmount,
    compoundFee: event.args.compoundFee,
    tokenToRecipient: event.args.tokenToRecipient,
    tvlSnapshot,
  });

  // Update vault aggregated stats
  const bgtClaimed = new Decimal(formatUnits(event.args.compoundAmount, 18));
  const compoundFee = new Decimal(formatUnits(event.args.compoundFee, 18));
  const bountyPaid = new Decimal(formatUnits(event.args.tokenToRecipient, 18));

  vault.totalBgtClaimed = new Decimal(vault.totalBgtClaimed).plus(bgtClaimed).toString();
  vault.totalCompoundFees = new Decimal(vault.totalCompoundFees).plus(compoundFee).toString();
  vault.totalBountyPaid = new Decimal(vault.totalBountyPaid).plus(bountyPaid).toString();
  vault.claimCount += 1;
  vault.lastClaimTimestamp = event.block.timestamp;

  // Calculate average BGT per claim
  vault.avgBgtPerClaim = new Decimal(vault.totalBgtClaimed)
    .div(vault.claimCount)
    .toString();

  // Calculate estimated APR based on 24h rolling window
  // Formula: dailyYield = dailyBGT / avgTVL; APR = dailyYield * 365 * 100
  // For a simple estimation, we use the last claim to approximate daily yields
  const SECONDS_IN_DAY = 86400n;
  const DAYS_IN_YEAR = 365;

  if (tvlSnapshot !== "0" && Number(tvlSnapshot) > 0) {
    // Use simple approximation: assume this claim represents average daily yield
    // More sophisticated: query all claims in last 24h, but that requires more complex logic
    const dailyYield = bgtClaimed.div(tvlSnapshot);
    const estimatedAPR = dailyYield.mul(DAYS_IN_YEAR).mul(100);
    vault.estimatedAPR = estimatedAPR.toString();
  }

  // Update the vault entity
  await context.db.update(autoWinVault, { id: vault.id }).set({
    totalBgtClaimed: vault.totalBgtClaimed,
    totalCompoundFees: vault.totalCompoundFees,
    totalBountyPaid: vault.totalBountyPaid,
    claimCount: vault.claimCount,
    avgBgtPerClaim: vault.avgBgtPerClaim,
    lastClaimTimestamp: vault.lastClaimTimestamp,
    estimatedAPR: vault.estimatedAPR,
  });

  console.log(
    `🎉 BGT claimed for AutoWin ${event.log.address}: ${bgtClaimed.toString()} BGT, ` +
    `fee: ${compoundFee.toString()}, bounty: ${bountyPaid.toString()}, ` +
    `APR: ${vault.estimatedAPR}%`
  );
});
