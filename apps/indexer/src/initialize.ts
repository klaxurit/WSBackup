import { ponder } from "ponder:registry";
import { pool as sPool, token } from "ponder:schema";
import { findBeraPerToken } from "./utils/pricing";
import { updateDayPoolData, updateHourPoolData } from "./stats/pool";
import { updateDayTokenData, updateHourTokenData } from "./stats/token";

ponder.on("WinniePool:Initialize", async ({ event, context }) => {
  const pool = await context.db.update(sPool, { id: event.log.address }).set(row => ({
    sqrtPrice: event.args.sqrtPriceX96,
    tick: Number(event.args.tick)
  }))

  const token0 = await context.db.find(token, { id: pool.token0 })
  const token1 = await context.db.find(token, { id: pool.token1 })

  if (token0 && token1) {
    const t0derivedBera = await findBeraPerToken(token0, context)
    const t1derivedBera = await findBeraPerToken(token1, context)

    await context.db.update(token, { id: token0.id }).set({
      derivedBERA: t0derivedBera.toString()
    })
    await context.db.update(token, { id: token1.id }).set({
      derivedBERA: t1derivedBera.toString()
    })


    await updateDayPoolData(event.block.timestamp, pool.id, context)
    await updateHourPoolData(event.block.timestamp, pool.id, context)
    await updateDayTokenData(event.block.timestamp, token0.id, context)
    await updateHourTokenData(event.block.timestamp, token0.id, context)
  }
});