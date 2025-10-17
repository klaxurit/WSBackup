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

  // Calculate average BGT per claim
  vault.avgBgtPerClaim = new Decimal(vault.totalBgtClaimed)
    .div(vault.claimCount)
    .toString();

  // Calculate estimated APR based on time since last claim
  // Formula: APR = (bgtClaimed / tvl) * (secondsInYear / timeSinceLastClaim) * 100
  const SECONDS_IN_DAY = 86400;
  const SECONDS_IN_YEAR = 365 * SECONDS_IN_DAY;

  if (tvlSnapshot !== "0" && Number(tvlSnapshot) > 0) {
    // Calculate time since last claim (BEFORE updating lastClaimTimestamp)
    const previousClaimTimestamp = vault.lastClaimTimestamp;
    const timeSinceLastClaim = previousClaimTimestamp > 0n
      ? Number(event.block.timestamp - previousClaimTimestamp)
      : SECONDS_IN_DAY; // Default to 1 day for first claim

    // Prevent division by zero and ensure minimum claim interval
    const effectiveTimeDelta = Math.max(timeSinceLastClaim, 60); // At least 1 minute

    // Calculate annualized yield based on actual time elapsed
    // yield = (rewards / tvl) * (time normalization) * 100
    const instantYield = bgtClaimed.div(tvlSnapshot); // Yield for this period
    const annualizedYield = instantYield.mul(SECONDS_IN_YEAR).div(effectiveTimeDelta);
    const estimatedAPR = annualizedYield.mul(100);

    vault.estimatedAPR = estimatedAPR.toString();

    console.log(
      `📊 APR calculation: ${bgtClaimed.toString()} BGT over ${effectiveTimeDelta}s ` +
      `(${(effectiveTimeDelta / SECONDS_IN_DAY).toFixed(2)} days) = ${vault.estimatedAPR}% APR`
    );
  } else {
    console.warn(
      `⚠️ Cannot calculate APR: TVL is ${tvlSnapshot} (must be > 0)`
    );
  }

  // Update lastClaimTimestamp AFTER calculating APR
  vault.lastClaimTimestamp = event.block.timestamp;

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
