import { ponder } from "ponder:registry";
import { factory as sFactory, pool as sPool, swap as sSwap, token as sToken } from "ponder:schema";
import { getOrCreateTransaction } from "./helpers";
import { CONTRACTS } from "@repo/contracts";
import { 
  abs, 
  sqrtPriceX96ToTokenPrices 
} from "./utils/bigint-math";
import { Decimal } from "decimal.js";
import { formatUnits } from "viem";
import { findBeraPerToken, getBeraPriceInUSD, getTrackedAmountUSD } from "./utils/pricing";

const DEBUG = false

ponder.on("WinniePool:Swap", async ({ event, context }) => {
  const factoryEntity = await context.db.find(sFactory, { id: CONTRACTS.FACTORY });
  if (!factoryEntity) return;
  const factory = {...factoryEntity}

  let poolEntity = await context.db.find(sPool, { id: event.log.address });
  if (!poolEntity) return;
  const pool = { ...poolEntity }

  let token0Entity = await context.db.find(sToken, { id: poolEntity.token0 })
  let token1Entity = await context.db.find(sToken, { id: poolEntity.token1 })
  if (!token0Entity || !token1Entity) return
  const token0 = {...token0Entity}
  const token1 = {...token1Entity}

  DEBUG && console.debug("##################################################################")
  DEBUG && console.debug("New swap", token0.symbol, token1.symbol, event.transaction.hash)

  const swapId = `${event.transaction.hash}#${event.log.logIndex}`;
  let beraPriceUSD = await getBeraPriceInUSD(context)
  DEBUG && console.debug("beraPriceUSD", beraPriceUSD)

  const amount0 = event.args.amount0
  const amount1 = event.args.amount1
  DEBUG && console.debug("amounts", amount0, amount1)

  const amount0Abs = abs(amount0)
  const amount1Abs = abs(amount1)
  DEBUG && console.debug("amountAbs", amount0Abs, amount1Abs)

  const amount0Bera = Decimal(amount0Abs).mul(token0.derivedBERA)
  const amount1Bera = Decimal(amount1Abs).mul(token1.derivedBERA)
  DEBUG && console.debug("Amount Bera", amount0Bera, amount1Bera)
  DEBUG && DEBUG && console.debug("token0.derivedBERA", token0.derivedBERA)
  DEBUG && console.debug("token1.derivedBERA", token1.derivedBERA)

  const amount0USD = amount0Bera.mul(beraPriceUSD)
  const amount1USD = amount1Bera.mul(beraPriceUSD)
  DEBUG && console.debug("Amount USD", amount0Bera, amount1Bera)

  const amountTotalUSDTracked = getTrackedAmountUSD(amount0Abs, token0, amount1Abs, token1, beraPriceUSD).div(2)
  const amountTotalBeraTracked = amountTotalUSDTracked.div(beraPriceUSD)
  const amountTotalUSDUntracked = amount0USD.plus(amount1USD).div(2)
  DEBUG && console.debug("amountTotalUSDTracked", amountTotalUSDTracked)
  DEBUG && console.debug("amountTotalBeraTracked", amountTotalBeraTracked)
  DEBUG && console.debug("amountTotalUSDUntracked", amountTotalUSDUntracked)
  
  const feeBera = amountTotalBeraTracked.mul(pool.feeTier).div(1000000)
  const feeUSD = amountTotalUSDTracked.mul(pool.feeTier).div(1000000)
  DEBUG && console.debug("feeBera", feeBera)
  DEBUG && console.debug("feeUSD", feeUSD)
  
    
  // Create TX
  const txEntity = await getOrCreateTransaction(context, event);

  // Global update - BigInt operations
  factory.txCount += 1
  factory.totalVolumeBERA = new Decimal(factory.totalVolumeBERA).plus(amountTotalBeraTracked).toString()
  factory.totalVolumeUSD = new Decimal(factory.totalVolumeUSD).plus(amountTotalUSDTracked).toString()
  factory.untrackedVolumeUSD = new Decimal(factory.untrackedVolumeUSD).plus(amountTotalUSDUntracked).toString()
  factory.totalFeesBERA = new Decimal(factory.totalFeesBERA).plus(feeBera).toString()
  factory.totalFeesUSD = new Decimal(factory.totalFeesUSD).plus(feeUSD).toString()
  // reset aggregate tvl before individual pool tvl updates
  factory.totalValueLockedBERA = new Decimal(factory.totalValueLockedBERA).minus(pool.totalValueLockedBERA).toString()

  // Update pool volume
  pool.txCount += 1
  pool.volumeToken0 += amount0Abs
  pool.volumeToken1 += amount1Abs
  pool.volumeUSD = new Decimal(pool.volumeUSD).plus(amountTotalUSDTracked).toString()
  pool.untrackedVolumeUSD = new Decimal(pool.untrackedVolumeUSD).plus(amountTotalUSDUntracked).toString()
  pool.feesUSD = new Decimal(pool.feesUSD).plus(feeUSD).toString()
  // Update the pool with the new active liquidity, price, and tick.
  pool.liquidity += event.args.liquidity
  pool.tick = event.args.tick
  pool.sqrtPrice = event.args.sqrtPriceX96
  pool.totalValueLockedToken0 += amount0
  pool.totalValueLockedToken1 += amount1

  // update token0
  token0.volume += amount0Abs
  token0.totalValueLocked = Decimal(token0.totalValueLocked).plus(amount0).toString()
  token0.volumeUSD = Decimal(token0.volumeUSD).plus(amountTotalUSDTracked).toString()
  token0.untrackedVolumeUSD = Decimal(token0.untrackedVolumeUSD).plus(amountTotalUSDUntracked).toString()
  token0.feesUSD = Decimal(token0.feesUSD).plus(feeUSD).toString()
  token0.txCount += 1

  // update token1
  token1.volume += amount1Abs
  token1.totalValueLocked = new Decimal(token1.totalValueLocked).plus(amount1).toString()
  token1.volumeUSD = new Decimal(token1.volumeUSD).plus(amountTotalUSDTracked).toString()
  token1.untrackedVolumeUSD = new Decimal(token1.untrackedVolumeUSD).plus(amountTotalUSDUntracked).toString()
  token1.feesUSD = new Decimal(token1.feesUSD).plus(feeUSD).toString()
  token1.txCount += 1

  // update pool rates
  const [price0Ratio, price1Ratio] = sqrtPriceX96ToTokenPrices(poolEntity.sqrtPrice, token0.decimals, token1.decimals)
  pool.token0Price = formatUnits(price0Ratio, 18)
  pool.token1Price = formatUnits(price1Ratio, 18)
  await context.db.update(sPool, {id: pool.id}).set({...Object.fromEntries(Object.entries(pool).filter(([key]) => key !== 'id'))})
  
  // update USD pricing
  beraPriceUSD = await getBeraPriceInUSD(context)
  token0.derivedBERA = (await findBeraPerToken(token0, context)).toString()
  token1.derivedBERA = (await findBeraPerToken(token1, context)).toString()
  
  // Things afffected by new USD rates
  pool.totalValueLockedBERA = new Decimal(pool.totalValueLockedToken0).mul(token0.derivedBERA).plus(pool.totalValueLockedToken0).mul(token1.derivedBERA).toString()
  pool.totalValueLockedUSD = new Decimal(pool.totalValueLockedBERA).mul(beraPriceUSD).toString()

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
    amount0: amount0, // BigInt direct
    amount1: amount1, // BigInt direct
    amountUSD: amountTotalUSDTracked.toString(),
    tick: Number(event.args.tick),
    sqrtPriceX96: event.args.sqrtPriceX96,
    liquidity: event.args.liquidity,
    logIndex: event.log.logIndex,
  })

  await context.db.update(sFactory, { id: CONTRACTS.FACTORY }).set({...Object.fromEntries(Object.entries(factory).filter(([key]) => key !== 'id'))})
  await context.db.update(sPool, {id: pool.id}).set({...Object.fromEntries(Object.entries(pool).filter(([key]) => key !== 'id'))})
  await context.db.update(sToken, {id: token0.id}).set({...Object.fromEntries(Object.entries(token0).filter(([key]) => key !== 'id'))})
  await context.db.update(sToken, {id: token1.id}).set({...Object.fromEntries(Object.entries(token1).filter(([key]) => key !== 'id'))})
});
