import { ponder } from "ponder:registry";
import { pools, swaps } from "ponder:schema";

ponder.on("WinnieFactory:PoolCreated", async ({ event, context }) => {
  const { token0, token1, pool, fee } = event.args;

  await context.db.insert(pools).values({
    address: pool,
    token0: token0.toLowerCase(),
    token1: token1.toLowerCase(),
    fee: Number(fee),
    createdAt: new Date(Number(event.block.timestamp) * 1000),
    createdAtBlock: event.block.number
  })
})

ponder.on("WinniePool:Swap", async ({ event, context }) => {
  const { sender, recipient, amount0, amount1, sqrtPriceX96, liquidity, tick } = event.args;

  await context.db.insert(swaps).values({
    id: `${event.transaction.hash}-${event.log.logIndex}`,
    poolAddress: event.log.address.toLowerCase(),
    sender: sender.toLowerCase(),
    recipient: recipient.toLowerCase(),
    amount0,
    amount1,
    timestamp: new Date(Number(event.block.timestamp) * 1000),
    blockNumber: event.block.number,
    transactionHash: event.transaction.hash,
  });
});
