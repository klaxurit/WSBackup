import { ponder } from "ponder:registry";
import { pool, stickyVault } from "ponder:schema";

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

  const sv = await context.db.insert(stickyVault).values({
    id: event.args.stickyVault,
    createdAtTimestamp: event.block.timestamp,
    createdAtBlockNumber: event.block.number,
    pool: event.args.uniPool,
    name,
    manager: event.args.manager,
  });
});
