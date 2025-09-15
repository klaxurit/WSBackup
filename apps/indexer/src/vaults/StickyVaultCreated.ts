import { ponder } from "ponder:registry";
import { pool, stickyVault } from "ponder:schema";
import { setVaultForPool } from "../utils/vaultCache";

ponder.on("svFactory:StickyVaultCreated", async ({ event, context }) => {
  // Ajouter une factory pour tracker le nombre de vault et les TVL ?
  const v3Pool = await context.db.find(pool, { id: event.args.uniPool });
  if (!v3Pool) {
    console.warn(
      `No uniPool found for this vault creation ! (tx hash: ${event.transaction.hash})`,
    );
    return;
  }

  const name = await context.client.readContract({
    address: event.args.stickyVault,
    abi: context.contracts.svVaults.abi,
    functionName: "name",
  });

  // Fetch fee structure from the vault contract
  let managementFee = 0;

  try {
    // Get management fee (in basis points)
    const feeResult = await context.client.readContract({
      address: event.args.stickyVault,
      abi: context.contracts.svVaults.abi,
      functionName: "managerFeeBPS",
    });
    managementFee = Number(feeResult);

    // SAFETY: Cap management fees at reasonable maximum (5% = 500 BPS)
    // if (rawFee > 500) {
    //   console.warn(`🚨 ABNORMAL managerFeeBPS for vault ${event.args.stickyVault}: ${rawFee} (${rawFee / 100}%)`);
    //   console.warn(`   Capping at 500 BPS (5%) to prevent calculation errors`);
    //   managementFee = 500; // Cap at 5%
    // } else {
    //   managementFee = rawFee;
    // }

    // DEBUG: Also check slippage settings to compare
    const slippageResult = await context.client.readContract({
      address: event.args.stickyVault,
      abi: context.contracts.svVaults.abi,
      functionName: "compounderSlippageBPS",
    });
  } catch (error) {
    console.log(`Could not fetch fees for vault ${event.args.stickyVault}:`, (error as Error).message);
  }

  const sv = await context.db.insert(stickyVault).values({
    id: event.args.stickyVault,
    createdAtTimestamp: event.block.timestamp,
    createdAtBlockNumber: event.block.number,
    pool: event.args.uniPool,
    name,
    manager: event.args.manager,
    managementFee: managementFee,
    performanceFee: 0, // Arrakis V1 vaults don't have separate performance fees
  });

  // Add the pool → vault mapping to our cache for fast lookup
  setVaultForPool(event.args.uniPool, event.args.stickyVault);
});
