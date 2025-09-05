import { ponder } from "ponder:registry";
import { getOrCreateToken } from "../v3/helpers";
import { pool, stickyVault } from "ponder:schema";

ponder.on('svFactory:StickyVaultCreated', async ({ event, context }) => {
  // Ajouter une factory pour tracker le nombre de vault et les TVL ?
  console.log("New vault !")
  const v3Pool = await context.db.find(pool, { id: event.args.uniPool })
  if (!v3Pool) {
    console.warn(`No uniPool found for this vault creation ! (tx hash: ${event.transaction.hash})`)
    return
  }

  const sv = await context.db.insert(stickyVault).values({
    id: event.args.stickyVault,
    createdAtTimestamp: event.block.timestamp,
    createdAtBlockNumber: event.block.number,
    pool: event.args.uniPool,
    // token0: v3Pool.token0,
    // token1: v3Pool.token1,
    // feeTier: v3Pool.feeTier,
    manager: event.args.manager,
  })
})