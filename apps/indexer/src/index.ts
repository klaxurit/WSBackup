import { ponder } from "ponder:registry";
import { liquidityEvent, pools, positions, swaps } from "ponder:schema";

ponder.on("WinnieFactory:PoolCreated", async ({ event, context }) => {
  const { token0, token1, pool, fee, tickSpacing } = event.args;

  await context.db.insert(pools).values({
    address: pool,
    token0Address: token0.toLowerCase(),
    token1Address: token1.toLowerCase(),
    fee,
    tickSpacing,
    createdAt: event.block.timestamp,
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
    sqrtPriceX96,
    liquidity,
    tick,
    createdAt: event.block.timestamp,
    blockNumber: event.block.number,
    transactionHash: event.transaction.hash,
  });
});

ponder.on("WinniePool:Mint", async ({ event, context }) => {
  const { owner, tickLower, tickUpper, amount, amount0, amount1 } = event.args

  await context.db.insert(liquidityEvent).values({
    id: `${event.transaction.hash}-${event.log.logIndex}`,
    poolAddress: event.log.address.toLowerCase(),
    owner,
    type: "MINT",
    tickLower,
    tickUpper,
    amount,
    amount0,
    amount1,
    createdAt: event.block.timestamp,
    blockNumber: event.block.number,
    transactionHash: event.transaction.hash
  })

  await context.db.insert(positions).values({
    poolAddress: event.log.address.toLowerCase(),
    owner,
    tickLower,
    tickUpper,
    liquidity: amount,
    amount0,
    amount1,
    createdAt: event.block.timestamp,
    updatedAt: event.block.timestamp
  }).onConflictDoUpdate((row) => ({
    liquidity: row.liquidity + amount,
    amount0: row.amount0 + amount0,
    amount1: row.amount1 + amount1,
    updatedAt: event.block.timestamp
  }))
})

ponder.on("WinniePool:Burn", async ({ event, context }) => {
  const { owner, tickLower, tickUpper, amount, amount0, amount1 } = event.args

  await context.db.insert(liquidityEvent).values({
    id: `${event.transaction.hash}-${event.log.logIndex}`,
    poolAddress: event.log.address.toLowerCase(),
    owner,
    type: "BURN",
    tickLower,
    tickUpper,
    amount,
    amount0,
    amount1,
    createdAt: event.block.timestamp,
    blockNumber: event.block.number,
    transactionHash: event.transaction.hash
  })

  await context.db.update(positions, {
    poolAddress: event.log.address.toLowerCase(),
    owner,
    tickLower,
    tickUpper
  }).set((row) => ({
    liquidity: row.liquidity - amount,
    amount0: row.amount0 - amount0,
    amount1: row.amount1 - amount1,
    updatedAt: event.block.timestamp
  }))
})


