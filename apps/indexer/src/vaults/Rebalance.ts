import { ponder } from "ponder:registry";
import { stickyVault } from "ponder:schema";

ponder.on("svVaults:Rebalance", async ({ event, context }) => {
  console.log("REBALANCE", event)
  const ve = await context.db.find(stickyVault, { id: event.log.address })
  if (!ve) {
    console.warn(`No vault found for this svVaults:Rebalance (${event.transaction.hash})`)
    return
  }
  const vault = { ...ve }

  vault.tickLower = event.args.lowerTick_
  vault.tickUpper = event.args.upperTick_
  vault.liquidity = event.args.liquidityAfter
  vault.rebalanceCount += 1
})