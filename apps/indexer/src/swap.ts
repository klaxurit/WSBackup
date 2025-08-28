import { ponder } from "ponder:registry";
import { factory, pool, swap, token } from "ponder:schema";
import { getOrCreateTransaction } from "./helpers";
import { CONTRACTS } from "@repo/contracts";
import { 
  PRECISION_18, 
  abs, 
  safeDiv, 
  safeMul, 
  tokenToRatio, 
  sqrtPriceX96ToTokenPrices 
} from "./utils/bigint-math";
import { Decimal } from "decimal.js";
import { formatUnits } from "viem";
import { findBeraPerToken, getBeraPriceInUSD } from "./utils/pricing";

// Constants
const REFERENCE_TOKEN = "0x6969696969696969696969696969696969696969" // wBera

ponder.on("WinniePool:Swap", async ({ event, context }) => {
  let poolEntity = await context.db.find(pool, { id: event.log.address });
  if (!poolEntity) return;

  let token0 = await context.db.find(token, { id: poolEntity.token0 })
  let token1 = await context.db.find(token, { id: poolEntity.token1 })
  if (!token0 || !token1) return

  console.log("##################################################################")
  console.log("New swap", token0.symbol, token1.symbol, event.transaction.hash)

  const txEntity = await getOrCreateTransaction(context, event);
  const swapId = `${event.transaction.hash}#${event.log.logIndex}`;

  const amount0 = event.args.amount0
  const amount1 = event.args.amount1
  console.log("amounts", amount0, amount1)

  const amount0Abs = abs(amount0)
  const amount1Abs = abs(amount1)
  console.log("amountAbs", amount0Abs, amount1Abs)

  const amount0Ratio = tokenToRatio(amount0Abs, token0.decimals)
  const amount1Ratio = tokenToRatio(amount1Abs, token1.decimals)
  console.log("Amount Ratio", amount0Ratio, amount1Ratio)

  const amount0Bera = safeDiv(safeMul(amount0Ratio, token0.derivedBERA), PRECISION_18)
  const amount1Bera = safeDiv(safeMul(amount1Ratio, token1.derivedBERA), PRECISION_18)
  console.log("Amount Bera", amount0Bera, amount1Bera)
  console.log("token0.derivedBERA", token0.derivedBERA)
  console.log("token1.derivedBERA", token1.derivedBERA)

  const beraPriceUSD = await getBeraPriceInUSD(context)
  console.log("beraPriceUSD", beraPriceUSD)
  
  const amountTotalBeraTracked = safeDiv(amount0Bera + amount1Bera, 2n)
  console.log("amountTotalBeraTracked", amountTotalBeraTracked)
  
  const feeBera = safeMul(amountTotalBeraTracked, BigInt(poolEntity.feeTier)) / 1000000n
  console.log("feeBera", feeBera)
  
  const amountTotalUSDTracked = new Decimal(formatUnits(safeMul(amountTotalBeraTracked, beraPriceUSD), 18))
  const feeUSD = new Decimal(formatUnits(safeMul(feeBera, beraPriceUSD), 18))
  console.log("amountTotalUSDTracked", amountTotalUSDTracked)
  console.log("feeUSD", feeUSD)
    
  const currentPoolTVLBera = poolEntity.totalValueLockedBERA
  console.log("currentPoolTVLBera", currentPoolTVLBera)

  // Global update - BigInt operations
  await context.db.update(factory, { id: CONTRACTS.FACTORY }).set(row => ({
    txCount: row.txCount + 1,
    totalVolumeBERA: row.totalVolumeBERA + amountTotalBeraTracked,
    totalVolumeUSD: new Decimal(row.totalVolumeUSD).plus(amountTotalUSDTracked).toString(),
    totalFeesBERA: row.totalFeesBERA + feeBera,
    totalFeesUSD: new Decimal(row.totalFeesUSD).plus(feeUSD).toString(),
    totalValueLockedBERA: row.totalValueLockedBERA - currentPoolTVLBera
  }))
  console.log("factory updated")
  // Update pool - BigInt operations
  poolEntity = await context.db.update(pool, { id: poolEntity.id }).set(row => ({
    txCount: row.txCount + 1,
    volumeToken0: row.volumeToken0 + amount0Abs,
    volumeToken1: row.volumeToken1 + amount1Abs,
    volumeUSD: new Decimal(row.volumeUSD).plus(amountTotalUSDTracked).toString(),
    feesUSD: new Decimal(row.feesUSD).plus(feeUSD).toString(),
    liquidity: event.args.liquidity,
    tick: Number(event.args.tick),
    sqrtPrice: event.args.sqrtPriceX96,
    totalValueLockedToken0: row.totalValueLockedToken0 + amount0,
    totalValueLockedToken1: row.totalValueLockedToken1 + amount1,
  }))
console.log("pool updated")
  // update token0 - BigInt operations
  token0 = await context.db.update(token, { id: token0.id }).set(row => ({
    volume: row.volume + amount0Abs,
    totalValueLocked: row.totalValueLocked + amount0,
    volumeUSD: new Decimal(row.volumeUSD).plus(amountTotalUSDTracked).toString(),
    feesUSD: new Decimal(row.feesUSD).plus(feeUSD).toString(),
    txCount: row.txCount + 1
  }))
  console.log("token0 updated")
  // update token1 - BigInt operations
  token1 = await context.db.update(token, { id: token1.id }).set(row => ({
    volume: row.volume + amount1Abs,
    totalValueLocked: row.totalValueLocked + amount1,
    volumeUSD: new Decimal(row.volumeUSD).plus(amountTotalUSDTracked).toString(),
    feesUSD: new Decimal(row.feesUSD).plus(feeUSD).toString(),
    txCount: row.txCount + 1
  }))
console.log("token1 updated")
  // update pool prices - BigInt calculation, Decimal pour affichage
  const [price0Ratio, price1Ratio] = sqrtPriceX96ToTokenPrices(poolEntity.sqrtPrice, token0.decimals, token1.decimals)
  poolEntity = await context.db.update(pool, { id: poolEntity.id }).set({
    token0Price: formatUnits(price0Ratio, 18),
    token1Price: formatUnits(price1Ratio, 18)
  })
console.log("pool #2 updated")
  // update USD pricing - BigInt calculations
  // Pour l'instant utiliser des valeurs simples, à améliorer plus tard
  let t0DerivedBera = token0.id === REFERENCE_TOKEN ? PRECISION_18 : await findBeraPerToken(token0, context)
  let t1DerivedBera = token1.id === REFERENCE_TOKEN ? PRECISION_18 : await findBeraPerToken(token1, context)
  console.log("t0DerivedBera RECALCULATED", t0DerivedBera)
  console.log("t1DerivedBera RECALCULATED", t1DerivedBera)
  
  // Calcul TVL avec BigInt
  const token0ValueBera = safeDiv(safeMul(tokenToRatio(poolEntity.totalValueLockedToken0, token0.decimals), t0DerivedBera), PRECISION_18)
  const token1ValueBera = safeDiv(safeMul(tokenToRatio(poolEntity.totalValueLockedToken1, token1.decimals), t1DerivedBera), PRECISION_18)
  const poolTotalValueLockedBERA = token0ValueBera + token1ValueBera
  
  poolEntity = await context.db.update(pool, { id: poolEntity.id }).set({
    totalValueLockedBERA: poolTotalValueLockedBERA,
    totalValueLockedUSD: new Decimal(formatUnits(safeMul(poolTotalValueLockedBERA, beraPriceUSD), 18)).toString()
  })
console.log("pool #3 updated")
  await context.db.update(factory, { id: CONTRACTS.FACTORY }).set(row => ({
    totalValueLockedBERA: row.totalValueLockedBERA + poolEntity.totalValueLockedBERA,
    totalValueLockedUSD: new Decimal(formatUnits(
      safeMul(row.totalValueLockedBERA, beraPriceUSD),
      18
    )).toString()
  }))
console.log("factory #2 updated")
  token0 = await context.db.update(token, { id: token0.id }).set(row => ({
    derivedBERA: t0DerivedBera,
    totalValueLockedUSD: new Decimal(formatUnits(
      safeDiv(safeMul(safeMul(tokenToRatio(row.totalValueLocked, token0?.decimals || 18), t0DerivedBera), beraPriceUSD), PRECISION_18),
      18
    )).toString(),
  }))
  console.log("token0 #2 updated")
  // update token1
  token1 = await context.db.update(token, { id: token1.id }).set(row => ({
    derivedBERA: t1DerivedBera,
    totalValueLockedUSD: new Decimal(formatUnits(
      safeDiv(safeMul(safeMul(tokenToRatio(row.totalValueLocked, token1?.decimals || 18), t1DerivedBera), beraPriceUSD), PRECISION_18),
      18
    )).toString(),
  }))
console.log("token1 #2 updated")
  // Create Swap event - BigInt direct
  await context.db.insert(swap).values({
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
});
