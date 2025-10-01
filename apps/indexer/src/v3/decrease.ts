import { CONTRACTS } from "../utils/abi";
import Decimal from "decimal.js";
import { ponder } from "ponder:registry";
import { bundle, position as sPosition, token, factory as sFactory, pool as sPool } from "ponder:schema";
import { formatUnits } from "viem";

ponder.on("v3PositionManager:DecreaseLiquidity", async ({ event, context }) => {
  const factoryEntity = await context.db.find(sFactory, { id: CONTRACTS.FACTORY })
  if (!factoryEntity) return
  const factory = { ...factoryEntity }

  let existingPosition = await context.db.find(sPosition, { id: event.args.tokenId.toString() });
  if (!existingPosition) return
  const position = { ...existingPosition }

  const poolEntity = await context.db.find(sPool, { id: position.pool })
  if (!poolEntity) return
  const pool = { ...poolEntity }

  const token0 = await context.db.find(token, { id: existingPosition.token0 })
  const token1 = await context.db.find(token, { id: existingPosition.token1 })
  if (!token0 || !token1) return

  const amount0 = new Decimal(formatUnits(event.args.amount0, token0.decimals))
  const amount1 = new Decimal(formatUnits(event.args.amount1, token1.decimals))

  const b = await context.db.find(bundle, { id: "1" })
  const beraPriceUSD = new Decimal(b?.beraPriceUSD || "0")

  const amount0Bera = amount0.mul(token0.derivedBERA)
  const amount1Bera = amount1.mul(token1.derivedBERA)
  const totalAmountBera = amount0Bera.plus(amount1Bera)

  factory.txCount += 1
  factory.totalValueLockedBERA = Decimal(factory.totalValueLockedBERA).minus(pool.totalValueLockedBERA).toString()

  token0.txCount += 1
  token0.totalValueLocked = Decimal(token0.totalValueLocked).minus(amount0).toString()
  token0.totalValueLockedUSD = Decimal(token0.totalValueLocked).mul(Decimal(token0.derivedBERA).mul(beraPriceUSD)).toString()

  token1.txCount += 1
  token1.totalValueLocked = Decimal(token1.totalValueLocked).minus(amount1).toString()
  token1.totalValueLockedUSD = Decimal(token1.totalValueLocked).mul(Decimal(token1.derivedBERA).mul(beraPriceUSD)).toString()

  pool.txCount += 1
  pool.totalValueLockedToken0 = new Decimal(pool.totalValueLockedToken0).minus(amount0).toString()
  pool.totalValueLockedToken1 = new Decimal(pool.totalValueLockedToken1).minus(amount1).toString()
  pool.totalValueLockedBERA = Decimal(pool.totalValueLockedBERA).minus(totalAmountBera).toString()
  pool.totalValueLockedUSD = Decimal(pool.totalValueLockedBERA).mul(beraPriceUSD).toString()

  // Update factory TVL (add back updated pool TVL)
  factory.totalValueLockedBERA = Decimal(factory.totalValueLockedBERA).plus(pool.totalValueLockedBERA).toString()
  factory.totalValueLockedUSD = Decimal(factory.totalValueLockedBERA).mul(beraPriceUSD).toString()

  position.liquidity -= event.args.liquidity
  position.withdrawnToken0 = new Decimal(position.withdrawnToken0).plus(amount0).toString()
  position.withdrawnToken1 = new Decimal(position.withdrawnToken1).plus(amount1).toString()

  const positionData = await context.client.readContract({
    address: context.contracts.v3PositionManager.address,
    abi: context.contracts.v3PositionManager.abi,
    functionName: "positions",
    args: [event.args.tokenId],
  });
  if (positionData) {
    position.feeGrowthInside0LastX128 = positionData[8]
    position.feeGrowthInside1LastX128 = positionData[9]

    // Fix rounding issues: if liquidity is 0, set withdrawn = deposited
    const onChainLiquidity = positionData[7] as bigint
    if (onChainLiquidity === 0n) {
      position.withdrawnToken0 = position.depositedToken0
      position.withdrawnToken1 = position.depositedToken1
    }
  }

  await context.db.update(sFactory, { id: CONTRACTS.FACTORY }).set({
    ...Object.fromEntries(Object.entries(factory).filter(([key]) => key !== 'id'))
  })
  await context.db.update(sPool, { id: pool.id }).set({
    ...Object.fromEntries(Object.entries(pool).filter(([key]) => key !== 'id'))
  })
  await context.db.update(token, { id: token0.id }).set({
    ...Object.fromEntries(Object.entries(token0).filter(([key]) => key !== 'id'))
  })
  await context.db.update(token, { id: token1.id }).set({
    ...Object.fromEntries(Object.entries(token1).filter(([key]) => key !== 'id'))
  })
  await context.db.update(sPosition, { id: position.id }).set({
    ...Object.fromEntries(Object.entries(position).filter(([key]) => key !== 'id'))
  })
})