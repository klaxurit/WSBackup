import { ponder } from "ponder:registry";
import { bundle, pool as sPool, token as sToken } from "ponder:schema";
import { findBeraPerToken, getBeraPriceInUSD, sqrtPriceX96ToTokenPrices, STABLE_TOKEN_POOL } from "../utils/pricing";
import { updatePoolStats } from "../stats/pool";
import { updateTokenStats } from "../stats/token";

ponder.on("v3Pool:Initialize", async ({ event, context }) => {
  let poolEntity = await context.db.find(sPool, { id: event.log.address });
  if (!poolEntity) return;
  const pool = { ...poolEntity }

  // const debug = pool.id === "0xc224af3a407ddf03867eec22162a9d39345ec88b"
  const debug = false

  let token0Entity = await context.db.find(sToken, { id: poolEntity.token0 })
  let token1Entity = await context.db.find(sToken, { id: poolEntity.token1 })
  if (!token0Entity || !token1Entity) return
  const token0 = { ...token0Entity }
  const token1 = { ...token1Entity }

  pool.sqrtPrice = event.args.sqrtPriceX96
  pool.tick = Number(event.args.tick)

  const [price0Ratio, price1Ratio] = sqrtPriceX96ToTokenPrices(event.args.sqrtPriceX96, token0.decimals, token1.decimals)
  pool.token0Price = price0Ratio.toString()
  pool.token1Price = price1Ratio.toString()
  await context.db.update(sPool, { id: pool.id }).set({ ...Object.fromEntries(Object.entries(pool).filter(([key]) => key !== 'id')) })

  // update basePrice only one after sWbera pool init
  if (pool.id === STABLE_TOKEN_POOL) {
    const beraPriceUSD = await getBeraPriceInUSD(context)
    await context.db.update(bundle, { id: '1' }).set(({ beraPriceUSD: beraPriceUSD.toString() }))
  }

  if (debug) {
    console.log("-------------------------------")
    console.log(`pool: ${token0.symbol} / ${token1.symbol}`)
    console.log(`sqrtPrice => ${event.args.sqrtPriceX96}`)
    console.log(`price0Ratio => ${price0Ratio}`)
    console.log(`price1Ratio => ${price1Ratio}`)
  }

  const t0derivedBera = await findBeraPerToken(token0, context, undefined, debug)
  const t1derivedBera = await findBeraPerToken(token1, context, undefined, debug)

  await context.db.update(sToken, { id: token0.id }).set({
    derivedBERA: t0derivedBera.toString()
  })
  await context.db.update(sToken, { id: token1.id }).set({
    derivedBERA: t1derivedBera.toString()
  })

  debug && console.log(`initialize: ${token0.symbol}/${token1.symbol} // ${token0.symbol} DerivedBera: ${t0derivedBera} // ${token1.symbol} DerivedBera: ${t1derivedBera} // hash: ${event.transaction.hash}`)
  await updatePoolStats(event.block.timestamp, pool, context)
  await updateTokenStats(event.block.timestamp, token0, context)
  await updateTokenStats(event.block.timestamp, token1, context)
});