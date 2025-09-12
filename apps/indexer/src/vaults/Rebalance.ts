import { ponder } from "ponder:registry";
import { stickyVault, swap } from "ponder:schema";

ponder.on("svVaults:Rebalance", async ({ event, context }) => {
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

  // const receipt = await context.client.getTransactionReceipt({
  //   hash: event.transaction.hash
  // });
  // const swapLogs = receipt.logs.filter(log => {
  //   // Check si c'est un event Swap
  //   if (log.topics[0] !== context.contracts.svVaults) return false;

  //   // Decode pour vérifier si vault impliqué
  //   const decodedSwap = decodeSwapEvent(log);
  //   return decodedSwap.sender === vaultAddress || 
  //          decodedSwap.recipient === vaultAddress;
  // });
  // const rebalanceSwap = await context.db.find(swap, {id: `${event.transaction.hash}-${event.log.logIndex}`})

  await context.db.update(stickyVault, { id: vault.id }).set({ ...Object.fromEntries(Object.entries(vault).filter(([key]) => key !== 'id')) })
})
