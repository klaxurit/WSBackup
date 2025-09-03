import { ponder } from "ponder:registry";
import { factory as sFactory, pool as sPool, swap as sSwap, token as sToken } from "ponder:schema";
import { getOrCreateTransaction } from "./helpers";
import { CONTRACTS } from "@repo/contracts";
import { Decimal } from "decimal.js";
import { formatUnits } from "viem";
import { findBeraPerToken, getBeraPriceInUSD, getTrackedAmount, sqrtPriceX96ToTokenPrices } from "./utils/pricing";
import { updateProtocolDayData } from "./stats/porotocolDay";
import { updatePoolStats } from "./stats/pool";
import { updateTokenStats } from "./stats/token";

ponder.on("WinniePool:Swap", async ({ event, context }) => {
  const factoryEntity = await context.db.find(sFactory, { id: CONTRACTS.FACTORY });
  if (!factoryEntity) return;
  const factory = { ...factoryEntity }

  let poolEntity = await context.db.find(sPool, { id: event.log.address });
  if (!poolEntity) return;
  const pool = { ...poolEntity }
  const debug = pool.id === "0xc224af3a407ddf03867eec22162a9d39345ec88b"

  let token0Entity = await context.db.find(sToken, { id: poolEntity.token0 })
  let token1Entity = await context.db.find(sToken, { id: poolEntity.token1 })
  if (!token0Entity || !token1Entity) return
  const token0 = { ...token0Entity }
  const token1 = { ...token1Entity }

  // const logContext = {
  //   event: 'swap',
  //   pool: pool.id,
  //   token0: token0.symbol,
  //   token1: token1.symbol,
  //   txHash: event.transaction.hash,
  //   blockNumber: event.block.number
  // }

  // logDebug(logContext, "Processing Swap event", {
  //   token0Symbol: token0.symbol,
  //   token1Symbol: token1.symbol,
  //   poolId: pool.id
  // })

  const swapId = `${event.transaction.hash}#${event.log.logIndex}`;
  let beraPriceUSD = await getBeraPriceInUSD(context)

  const amount0 = new Decimal(formatUnits(event.args.amount0, token0.decimals))
  const amount1 = new Decimal(formatUnits(event.args.amount1, token1.decimals))

  const amount0Abs = amount0.abs()
  const amount1Abs = amount1.abs()
  // const totalAmount = amount0Abs.plus(amount1Abs)

  const amount0Bera = amount0Abs.mul(token0.derivedBERA)
  const amount1Bera = amount1Abs.mul(token1.derivedBERA)
  const totalAmountBera = amount0Bera.plus(amount1Bera)

  const amount0USD = amount0Bera.mul(beraPriceUSD)
  const amount1USD = amount1Bera.mul(beraPriceUSD)
  const totalAmountUSD = amount0USD.plus(amount1USD)

  // const amountTotalBeraTracked = getTrackedAmount(amount0Bera, token0, amount1Bera, token1)
  // const amountTotalUSDTracked = amountTotalBeraTracked.mul(beraPriceUSD)
  // const amountTotalUSDUntracked = totalAmountUSD.minus(amountTotalUSDTracked)

  const feeBera = totalAmountBera.mul(pool.feeTier).div(1000000)
  const feeUSD = totalAmountUSD.mul(pool.feeTier).div(1000000) // Check la div par 1000000

  // logDebug(logContext, "Swap calculations completed", {
  //   beraPriceUSD: beraPriceUSD.toString(),
  //   amounts: { amount0: amount0.toString(), amount1: amount1.toString() },
  //   amountsAbs: { amount0Abs: amount0Abs.toString(), amount1Abs: amount1Abs.toString() },
  //   amountsBera: { amount0Bera: amount0Bera.toString(), amount1Bera: amount1Bera.toString() },
  //   amountsUSD: { amount0USD: amount0USD.toString(), amount1USD: amount1USD.toString() },
  //   totalTracked: {
  //     usd: amountTotalUSDTracked.toString(),
  //     bera: amountTotalBeraTracked.toString(),
  //     untracked: amountTotalUSDUntracked.toString()
  //   },
  //   fees: { feeBera: feeBera.toString(), feeUSD: feeUSD.toString() }
  // })

  // Create TX
  const txEntity = await getOrCreateTransaction(context, event);

  // Global update
  factory.txCount += 1
  factory.totalVolumeBERA = new Decimal(factory.totalVolumeBERA).plus(totalAmountBera).toString()
  factory.totalVolumeUSD = new Decimal(factory.totalVolumeUSD).plus(totalAmountUSD).toString()
  // factory.untrackedVolumeUSD = new Decimal(factory.untrackedVolumeUSD).plus(amountTotalUSDUntracked).toString()
  factory.totalFeesBERA = new Decimal(factory.totalFeesBERA).plus(feeBera).toString()
  factory.totalFeesUSD = new Decimal(factory.totalFeesUSD).plus(feeUSD).toString()
  // reset aggregate tvl before individual pool tvl updates
  factory.totalValueLockedBERA = new Decimal(factory.totalValueLockedBERA).minus(pool.totalValueLockedBERA).toString()

  // Update pool volume
  pool.txCount += 1
  pool.volumeToken0 = new Decimal(pool.volumeToken0).plus(amount0Abs).toString()
  pool.volumeToken1 = new Decimal(pool.volumeToken1).plus(amount1Abs).toString()
  pool.volumeUSD = new Decimal(pool.volumeUSD).plus(totalAmountUSD).toString()
  // pool.untrackedVolumeUSD = new Decimal(pool.untrackedVolumeUSD).plus(amountTotalUSDUntracked).toString()
  pool.feesUSD = new Decimal(pool.feesUSD).plus(feeUSD).toString()
  // Update the pool with the new active liquidity, price, and tick.
  pool.liquidity += event.args.liquidity
  pool.tick = event.args.tick
  pool.sqrtPrice = event.args.sqrtPriceX96
  pool.totalValueLockedToken0 = new Decimal(pool.totalValueLockedToken0).plus(amount0).toString()
  pool.totalValueLockedToken1 = new Decimal(pool.totalValueLockedToken1).plus(amount1).toString()

  // update token0
  token0.txCount += 1
  token0.volume = new Decimal(token0.volume).plus(amount0Abs).toString()
  token0.totalValueLocked = Decimal(token0.totalValueLocked).plus(amount0).toString()
  token0.volumeUSD = Decimal(token0.volumeUSD).plus(totalAmountUSD).toString()
  // token0.untrackedVolumeUSD = Decimal(token0.untrackedVolumeUSD).plus(amountTotalUSDUntracked).toString()
  token0.feesUSD = Decimal(token0.feesUSD).plus(feeUSD).toString()

  // update token1
  token1.txCount += 1
  token1.volume = new Decimal(token1.volume).plus(amount1Abs).toString()
  token1.totalValueLocked = new Decimal(token1.totalValueLocked).plus(amount1).toString()
  token1.volumeUSD = new Decimal(token1.volumeUSD).plus(amount1USD).toString()
  // token1.untrackedVolumeUSD = new Decimal(token1.untrackedVolumeUSD).plus(amountTotalUSDUntracked).toString()
  token1.feesUSD = new Decimal(token1.feesUSD).plus(feeUSD).toString()

  // update pool rates
  const [price0Ratio, price1Ratio] = sqrtPriceX96ToTokenPrices(poolEntity.sqrtPrice, token0.decimals, token1.decimals)
  pool.token0Price = price0Ratio.toString()
  pool.token1Price = price1Ratio.toString()
  // pool.token0Price = ((Number(pool.sqrtPrice) / (2 ** 96)) ** 2).toString()
  // pool.token1Price = (1 / ((Number(pool.sqrtPrice) / (2 ** 96)) ** 2)).toString()
  await context.db.update(sPool, { id: pool.id }).set({ ...Object.fromEntries(Object.entries(pool).filter(([key]) => key !== 'id')) })

  if (debug) {
    console.log("-------------------------------")
    console.log(`pool: ${token0.symbol} / ${token1.symbol}`)
    console.log(`price0Ratio => ${price0Ratio}`)
    console.log(`price1Ratio => ${price1Ratio}`)
  }

  // update USD pricing
  beraPriceUSD = await getBeraPriceInUSD(context)
  token0.derivedBERA = (await findBeraPerToken(token0, context, beraPriceUSD)).toString()
  token1.derivedBERA = (await findBeraPerToken(token1, context, beraPriceUSD)).toString()

  // Things afffected by new USD rates
  const poolTVLt0Bera = new Decimal(pool.totalValueLockedToken0).mul(token0.derivedBERA)
  const poolTVLt1Bera = new Decimal(pool.totalValueLockedToken1).mul(token1.derivedBERA)
  pool.totalValueLockedBERA = poolTVLt0Bera.plus(poolTVLt1Bera).toString()
  pool.totalValueLockedUSD = new Decimal(pool.totalValueLockedBERA).mul(beraPriceUSD).toString()

  if (debug) {
    console.log("-------------------------------")
    console.log(`pool: ${token0.symbol} / ${token1.symbol}`)
    console.log(`poolTVLt0Bera => tvlT0 * t0.derived => ${pool.totalValueLockedToken0} * ${token0.derivedBERA} = ${poolTVLt0Bera}`)
    console.log(`poolTVLt1Bera => tvlT1 * t1.derived => ${pool.totalValueLockedToken1} * ${token1.derivedBERA} = ${poolTVLt1Bera}`)
    console.log(`poolTVLBERA => poolTVLt0Bera + poolTVLt1Bera => ${poolTVLt0Bera} + ${poolTVLt1Bera} = ${pool.totalValueLockedBERA}`)
    console.log(`TVLUSD => poolTVLBERA * beraPriceUSD => ${pool.totalValueLockedBERA} * ${beraPriceUSD} = ${pool.totalValueLockedUSD}`)
  }

  factory.totalValueLockedBERA = new Decimal(factory.totalValueLockedBERA).plus(pool.totalValueLockedBERA).toString()
  factory.totalValueLockedUSD = new Decimal(factory.totalValueLockedBERA).mul(beraPriceUSD).toString()

  token0.totalValueLockedUSD = new Decimal(token0.totalValueLocked).mul(token0.derivedBERA).mul(beraPriceUSD).toString()
  token1.totalValueLockedUSD = new Decimal(token1.totalValueLocked).mul(token1.derivedBERA).mul(beraPriceUSD).toString()

  // Create Swap event - BigInt direct
  await context.db.insert(sSwap).values({
    id: swapId, // tx hash + "#" + index
    transaction: txEntity.id,
    timestamp: txEntity.timestamp,
    pool: poolEntity.id,
    token0: token0.id,
    token1: token1.id,
    sender: event.args.sender,
    recipient: event.args.recipient,
    origin: event.transaction.from,
    amount0: event.args.amount0,
    amount1: event.args.amount1,
    amountUSD: totalAmountUSD.toString(),
    tick: Number(event.args.tick),
    sqrtPriceX96: event.args.sqrtPriceX96,
    liquidity: event.args.liquidity,
    logIndex: event.log.logIndex,
  })

  await context.db.update(sFactory, { id: CONTRACTS.FACTORY }).set({ ...Object.fromEntries(Object.entries(factory).filter(([key]) => key !== 'id')) })
  await context.db.update(sPool, { id: pool.id }).set({ ...Object.fromEntries(Object.entries(pool).filter(([key]) => key !== 'id')) })
  await context.db.update(sToken, { id: token0.id }).set({ ...Object.fromEntries(Object.entries(token0).filter(([key]) => key !== 'id')) })
  await context.db.update(sToken, { id: token1.id }).set({ ...Object.fromEntries(Object.entries(token1).filter(([key]) => key !== 'id')) })

  await updateProtocolDayData(event.block.timestamp, context)
  await updatePoolStats(event.block.timestamp, pool, context)
  await updateTokenStats(event.block.timestamp, token0, context)
  await updateTokenStats(event.block.timestamp, token1, context)

  // logSwap(logContext, {
  //   swapId,
  //   amounts: {
  //     amount0: amount0.toString(),
  //     amount1: amount1.toString(),
  //     amountUSD: amountTotalUSDTracked.toString()
  //   },
  //   prices: {
  //     beraPriceUSD: beraPriceUSD.toString(),
  //     token0Price: pool.token0Price,
  //     token1Price: pool.token1Price,
  //     sqrtPriceX96: pool.sqrtPrice.toString()
  //   },
  //   liquidity: pool.liquidity.toString(),
  //   tick: pool.tick,
  //   fees: {
  //     feeBera: feeBera.toString(),
  //     feeUSD: feeUSD.toString(),
  //     feeTier: pool.feeTier
  //   },
  //   volume: {
  //     totalUSDTracked: amountTotalUSDTracked.toString(),
  //     totalBeraTracked: amountTotalBeraTracked.toString(),
  //     totalUSDUntracked: amountTotalUSDUntracked.toString()
  //   },
  //   participants: {
  //     sender: event.args.sender,
  //     recipient: event.args.recipient,
  //     origin: event.transaction.from
  //   }
  // })
});
