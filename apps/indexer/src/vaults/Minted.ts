import Decimal from "decimal.js";
import { ponder } from "ponder:registry";
import { bundle, pool, stickyVault, token, vaultDeposit, vaultUserPosition } from "ponder:schema";
import { formatUnits } from "viem";
import { getOrCreateTransaction } from "../v3/helpers";
import { updateVaultStats } from "../stats/vault";
import { calculatePositionValue, calculateWeightedAverageEntryPrice, createPositionSnapshot } from "../utils/positionCalculations";

ponder.on("svVaults:Minted", async ({ event, context }) => {
  const ve = await context.db.find(stickyVault, { id: event.log.address })
  if (!ve) {
    console.warn(`No vault found for this svVaults:Minted (${event.transaction.hash})`)
    return
  }
  const vault = { ...ve }

  const pe = await context.db.find(pool, { id: vault.pool })
  if (!pe) {
    console.warn(`No pool found for this vault: (${vault.id})`)
    return
  }
  const vPool = { ...pe }

  const t0e = await context.db.find(token, { id: vPool.token0 })
  const t1e = await context.db.find(token, { id: vPool.token1 })
  if (!t0e || !t1e) {
    console.warn(`No token found for this pool: (${vPool.id})`)
    return
  }
  const t0 = { ...t0e }
  const t1 = { ...t1e }

  const b = await context.db.find(bundle, { id: "1" })
  let beraPriceUSD = new Decimal(b?.beraPriceUSD || "0")

  const userPosId = `${event.args.receiver}-${vault.id}`

  const shares = new Decimal(formatUnits(event.args.mintAmount, 18))
  const depositedToken0 = new Decimal(formatUnits(event.args.amount0In, t0.decimals))
  const depositedToken1 = new Decimal(formatUnits(event.args.amount1In, t1.decimals))

  // Update vault datas
  vault.txCount += 1
  vault.totalSupply = new Decimal(vault.totalSupply).plus(shares).toString()
  vault.liquidity += event.args.liquidityMinted

  const depositedT0Bera = depositedToken0.mul(t0.derivedBERA)
  const depositedT1Bera = depositedToken1.mul(t1.derivedBERA)
  const totalDepositedBera = depositedT0Bera.plus(depositedT1Bera)
  const totalDepositeUSD = totalDepositedBera.mul(beraPriceUSD)

  // FIXED: Add to deposit/withdraw volume, not trading volume
  vault.depositWithdrawVolumeUSD = new Decimal(vault.depositWithdrawVolumeUSD || "0").plus(totalDepositeUSD).toString()

  // Use event data for precise TVL calculation (no RPC call during mint)
  vault.totalValueLockedToken0 = new Decimal(vault.totalValueLockedToken0).plus(depositedToken0).toString()
  vault.totalValueLockedToken1 = new Decimal(vault.totalValueLockedToken1).plus(depositedToken1).toString()
  vault.totalValueLockedBERA = new Decimal(vault.totalValueLockedBERA).plus(totalDepositedBera).toString()
  vault.totalValueLockedUSD = new Decimal(vault.totalValueLockedBERA).mul(beraPriceUSD).toString()

  // Update user vault position
  let uPE = await context.db.find(vaultUserPosition, { id: userPosId })
  const isNewPosition = !uPE;

  if (!uPE) {
    uPE = await context.db.insert(vaultUserPosition).values({
      id: userPosId,
      user: event.args.receiver,
      vault: event.log.address,
      firstDepositAt: event.block.timestamp,
      lastUpdateAt: event.block.timestamp,
    })
  }
  const userPos = { ...uPE }

  // Update basic position info
  const oldShares = new Decimal(userPos.shares);
  const oldDepositedToken0 = new Decimal(userPos.depositedToken0);
  const oldDepositedToken1 = new Decimal(userPos.depositedToken1);

  userPos.depositedToken0 = oldDepositedToken0.plus(depositedToken0).toString()
  userPos.depositedToken1 = oldDepositedToken1.plus(depositedToken1).toString()
  userPos.shares = oldShares.plus(shares).toString()
  userPos.lastUpdateAt = event.block.timestamp;

  // Calculate weighted average entry prices
  const token0PriceAtDeposit = new Decimal(t0.derivedBERA).mul(beraPriceUSD);
  const token1PriceAtDeposit = new Decimal(t1.derivedBERA).mul(beraPriceUSD);

  const oldAvgPriceToken0 = new Decimal(userPos.avgEntryPriceToken0 || "0");
  const oldAvgPriceToken1 = new Decimal(userPos.avgEntryPriceToken1 || "0");

  userPos.avgEntryPriceToken0 = calculateWeightedAverageEntryPrice(
    oldDepositedToken0, oldAvgPriceToken0, depositedToken0, token0PriceAtDeposit
  ).toString();

  userPos.avgEntryPriceToken1 = calculateWeightedAverageEntryPrice(
    oldDepositedToken1, oldAvgPriceToken1, depositedToken1, token1PriceAtDeposit
  ).toString();

  // Update initial investment values for new positions
  if (isNewPosition) {
    userPos.initialValueBERA = totalDepositedBera.toString();
    userPos.initialValueUSD = totalDepositeUSD.toString();
  } else {
    userPos.initialValueBERA = new Decimal(userPos.initialValueBERA).plus(totalDepositedBera).toString();
    userPos.initialValueUSD = new Decimal(userPos.initialValueUSD).plus(totalDepositeUSD).toString();
  }

  // Calculate current position value and performance metrics
  try {
    const positionMetrics = await calculatePositionValue(userPos, vault, beraPriceUSD, context, event.block.number);

    // Update position with calculated metrics
    userPos.currentValueToken0 = positionMetrics.currentValueToken0;
    userPos.currentValueToken1 = positionMetrics.currentValueToken1;
    userPos.currentValueBERA = positionMetrics.currentValueBERA;
    userPos.currentValueUSD = positionMetrics.currentValueUSD;
    userPos.totalValue = positionMetrics.totalValue;
    userPos.unrealizedPnLBERA = positionMetrics.unrealizedPnLBERA;
    userPos.unrealizedPnLUSD = positionMetrics.unrealizedPnLUSD;
    userPos.totalPnLUSD = positionMetrics.totalPnLUSD;
    userPos.totalReturn = positionMetrics.totalReturn;
    userPos.annualizedReturn = positionMetrics.annualizedReturn;

  } catch (error) {
    console.warn(`Could not calculate position metrics for ${userPosId}:`, (error as Error).message);
    // Fallback to basic calculations
    userPos.currentValueToken0 = (new Decimal(userPos.shares).div(vault.totalSupply)).mul(vault.totalValueLockedToken0).toString()
    userPos.currentValueToken1 = (new Decimal(userPos.shares).div(vault.totalSupply)).mul(vault.totalValueLockedToken1).toString()

    const currentValueBERA = new Decimal(userPos.currentValueToken0).mul(t0.derivedBERA)
      .plus(new Decimal(userPos.currentValueToken1).mul(t1.derivedBERA));
    const currentValueUSD = currentValueBERA.mul(beraPriceUSD);

    userPos.currentValueBERA = currentValueBERA.toString();
    userPos.currentValueUSD = currentValueUSD.toString();
    userPos.totalValue = currentValueUSD.toString();
  }

  // Create transaction
  const tx = await getOrCreateTransaction(context, event)
  // Create Vault deposit
  await context.db.insert(vaultDeposit).values({
    id: `${event.transaction.hash}#${event.log.logIndex}`,
    transaction: tx.id,
    timestamp: event.block.timestamp,
    user: event.args.receiver,
    vault: vault.id,
    vaultUserPosition: userPos.id,
    amount0: event.args.amount0In,
    amount1: event.args.amount1In,
    shares: event.args.mintAmount,
    liquidityMinted: event.args.liquidityMinted
  })

  await context.db.update(stickyVault, { id: vault.id }).set({ ...Object.fromEntries(Object.entries(vault).filter(([key]) => key !== 'id')) })
  await context.db.update(vaultUserPosition, { id: userPos.id }).set({ ...Object.fromEntries(Object.entries(userPos).filter(([key]) => key !== 'id')) })

  // Create position snapshot for deposit event
  try {
    await createPositionSnapshot(
      userPos,
      vault,
      "deposit",
      event.transaction.hash,
      event.block.timestamp,
      event.block.number,
      context
    );
  } catch (error) {
    console.warn(`Could not create position snapshot for ${userPosId}:`, (error as Error).message);
  }

  // await updateVaultStats(event.block.timestamp, vault, beraPriceUSD, context, { skipRpcCalls: true })
})