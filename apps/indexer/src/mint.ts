import { ponder } from "ponder:registry";
import { factory as sFactory, mint as sMint, pool as sPool, tick as sTick, token as sToken, transaction as sTransaction } from "ponder:schema";
import { getOrCreateTransaction, getTickId } from "./helpers";
import { CONTRACTS } from "@repo/contracts";
import { getBeraPriceInUSD } from "./utils/pricing";
import Decimal from "decimal.js";
import { updateProtocolDayData } from "./stats/porotocolDay";
import { updateDayPoolData, updateHourPoolData } from "./stats/pool";
import { updateDayTokenData, updateHourTokenData } from "./stats/token";
import { formatUnits, parseUnits } from "viem";

ponder.on("WinniePool:Mint", async ({ event, context }) => {
  const factoryEntity = await context.db.find(sFactory, { id: CONTRACTS.FACTORY });
  if (!factoryEntity) return;
  const factory = { ...factoryEntity }

  let poolEntity = await context.db.find(sPool, { id: event.log.address });
  if (!poolEntity) return;
  const pool = { ...poolEntity }

  let token0Entity = await context.db.find(sToken, { id: poolEntity.token0 })
  let token1Entity = await context.db.find(sToken, { id: poolEntity.token1 })
  if (!token0Entity || !token1Entity) return
  const token0 = { ...token0Entity }
  const token1 = { ...token1Entity }

  const mintId = `${event.transaction.hash}#${event.log.logIndex}`;
  const beraPriceUSD = await getBeraPriceInUSD(context)

  const amount0 = event.args.amount0
  const amount1 = event.args.amount1

  const amountUSD = Decimal(amount0).mul(token0.derivedBERA).plus(Decimal(amount1).mul(token1.derivedBERA))

  factory.totalValueLockedBERA = Decimal(factory.totalValueLockedBERA).minus(pool.totalValueLockedBERA).toString()
  factory.txCount += 1

  token0.txCount += 1
  token0.totalValueLocked = Decimal(token0.totalValueLocked).plus(amount0).toString()
  token0.totalValueLockedUSD = Decimal(token0.totalValueLocked).mul(Decimal(token0.derivedBERA).mul(beraPriceUSD)).toString()

  token1.txCount += 1
  token1.totalValueLocked = Decimal(token1.totalValueLocked).plus(amount1).toString()
  token1.totalValueLockedUSD = Decimal(token1.totalValueLocked).mul(Decimal(token1.derivedBERA).mul(beraPriceUSD)).toString()

  pool.txCount += 1
  pool.liquidity += event.args.amount
  pool.totalValueLockedToken0 += amount0
  pool.totalValueLockedToken1 += amount1

  // console.log("########################################################")
  // console.log(`Mint ${token0.symbol}/${token1.symbol}`)
  // console.log("totalValueLockedToken0:", pool.totalValueLockedToken0)
  // console.log("token0 derivedBERA:", token0.derivedBERA)
  // console.log("TVLBera * token0derivedBera", Decimal(formatUnits(pool.totalValueLockedToken0, token0.decimals)).mul(token0.derivedBERA))

  // console.log("totalValueLockedToken1:", pool.totalValueLockedToken1)
  // console.log("token1 derivedBERA:", token1.derivedBERA)
  // console.log("TVLBera * token1derivedBera", Decimal(formatUnits(pool.totalValueLockedToken1, token1.decimals)).mul(token1.derivedBERA))

  // console.log("Addition des deux", Decimal(formatUnits(pool.totalValueLockedToken0, token0.decimals))
  //   .mul(token0.derivedBERA)
  //   .plus(Decimal(formatUnits(pool.totalValueLockedToken1, token1.decimals)).mul(token1.derivedBERA))
  //   .toString())


  pool.totalValueLockedBERA = Decimal(formatUnits(pool.totalValueLockedToken0, token0.decimals))
    .mul(token0.derivedBERA)
    .plus(Decimal(formatUnits(pool.totalValueLockedToken1, token1.decimals)).mul(token1.derivedBERA))
    .toString()

  // console.log("USD BERA PRICE", beraPriceUSD)
  // console.log("totalValueLockedBERA", pool.totalValueLockedBERA)
  // console.log("totalValueLockedUSD", Decimal(pool.totalValueLockedBERA).mul(beraPriceUSD).toString())
  pool.totalValueLockedUSD = Decimal(pool.totalValueLockedBERA).mul(beraPriceUSD).toString()

  // reset aggregates with new amounts
  factory.totalValueLockedBERA = Decimal(factory.totalValueLockedBERA).plus(pool.totalValueLockedBERA).toString()
  factory.totalValueLockedUSD = Decimal(factory.totalValueLockedBERA).mul(beraPriceUSD).toString()

  // Create transaction
  const txEntity = await getOrCreateTransaction(context, event);

  // Update transaction
  await context.db.update(sTransaction, { id: txEntity.id })
    .set((row) => ({
      mints: [...row.mints, mintId],
    }));

  // create Mint event
  await context.db.insert(sMint).values({
    id: mintId,
    transaction: event.transaction.hash,
    timestamp: BigInt(event.block.timestamp),
    pool: event.log.address,
    token0: poolEntity.token0,
    token1: poolEntity.token1,
    owner: event.args.owner,
    sender: event.args.sender,
    origin: event.transaction.from,
    amount: event.args.amount,
    amount0,
    amount1,
    amountUSD: amountUSD.toString(),
    tickLower: Number(event.args.tickLower),
    tickUpper: Number(event.args.tickUpper),
    logIndex: event.log.logIndex,
  });

  // Create or update ticks
  const tickLowerId = getTickId(event.log.address, Number(event.args.tickLower));
  const tickUpperId = getTickId(event.log.address, Number(event.args.tickUpper));

  const tickLower = await context.db.find(sTick, { id: tickLowerId });
  if (!tickLower) {
    await context.db.insert(sTick).values({
      id: tickLowerId,
      poolAddress: event.log.address,
      tickIdx: Number(event.args.tickLower),
      pool: event.log.address,
      liquidityGross: event.args.amount,
      liquidityNet: event.args.amount,
      price0: "0",
      price1: "0",
      volumeToken0: 0n,
      volumeToken1: 0n,
      volumeUSD: "0",
      untrackedVolumeUSD: "0",
      feesUSD: "0",
      collectedFeesToken0: 0n,
      collectedFeesToken1: 0n,
      collectedFeesUSD: "0",
      createdAtTimestamp: BigInt(event.block.timestamp),
      createdAtBlockNumber: BigInt(event.block.number),
      liquidityProviderCount: 1,
      feeGrowthOutside0X128: 0n,
      feeGrowthOutside1X128: 0n,
    });
  } else {
    await context.db.update(sTick, { id: tickLowerId })
      .set((row) => ({
        liquidityGross: row.liquidityGross + event.args.amount,
        liquidityNet: row.liquidityNet + event.args.amount,
        liquidityProviderCount: row.liquidityProviderCount + 1,
      }));
  }

  const tickUpper = await context.db.find(sTick, { id: tickUpperId });
  if (!tickUpper) {
    await context.db.insert(sTick).values({
      id: tickUpperId,
      poolAddress: event.log.address,
      tickIdx: Number(event.args.tickUpper),
      pool: event.log.address,
      liquidityGross: event.args.amount,
      liquidityNet: -event.args.amount, // Négatif pour le tick supérieur
      price0: "0",
      price1: "0",
      volumeToken0: 0n,
      volumeToken1: 0n,
      volumeUSD: "0",
      untrackedVolumeUSD: "0",
      feesUSD: "0",
      collectedFeesToken0: 0n,
      collectedFeesToken1: 0n,
      collectedFeesUSD: "0",
      createdAtTimestamp: BigInt(event.block.timestamp),
      createdAtBlockNumber: BigInt(event.block.number),
      liquidityProviderCount: 1,
      feeGrowthOutside0X128: 0n,
      feeGrowthOutside1X128: 0n,
    });
  } else {
    await context.db.update(sTick, { id: tickUpperId })
      .set((row) => ({
        liquidityGross: row.liquidityGross + event.args.amount,
        liquidityNet: row.liquidityNet - event.args.amount,
        liquidityProviderCount: row.liquidityProviderCount + 1,
      }));
  }

  await context.db.update(sFactory, { id: CONTRACTS.FACTORY }).set({ ...Object.fromEntries(Object.entries(factory).filter(([key]) => key !== 'id')) })
  await context.db.update(sPool, { id: pool.id }).set({ ...Object.fromEntries(Object.entries(pool).filter(([key]) => key !== 'id')) })
  await context.db.update(sToken, { id: token0.id }).set({ ...Object.fromEntries(Object.entries(token0).filter(([key]) => key !== 'id')) })
  await context.db.update(sToken, { id: token1.id }).set({ ...Object.fromEntries(Object.entries(token1).filter(([key]) => key !== 'id')) })

  await updateProtocolDayData(event.block.timestamp, context)
  await updateDayPoolData(event.block.timestamp, pool.id, context)
  await updateHourPoolData(event.block.timestamp, pool.id, context)
  await updateDayTokenData(event.block.timestamp, token0.id, context)
  await updateHourTokenData(event.block.timestamp, token0.id, context)
  // TODO Start all daily data update
});
