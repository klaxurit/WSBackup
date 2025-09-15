import Decimal from "decimal.js";
import { ponder } from "ponder:registry";
import { bundle, pool, stickyVault, token, vaultUserPosition, vaultWithdrawal } from "ponder:schema";
import { formatUnits } from "viem";
import { getOrCreateTransaction } from "../v3/helpers";
import { updateVaultStats } from "../stats/vault";
import { calculatePositionValue, createPositionSnapshot } from "../utils/positionCalculations";

ponder.on("svVaults:Burned", async ({ event, context }) => {
  const ve = await context.db.find(stickyVault, { id: event.log.address })
  if (!ve) {
    console.warn(`No vault found for this svVaults:Burned (${event.transaction.hash})`)
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

  let uPE = await context.db.find(vaultUserPosition, { id: userPosId })
  if (!uPE) {
    console.warn(`No token found for this pool: (${vPool.id})`)
    return
  }
  const userPos = { ...uPE }

  const sharesBurned = new Decimal(formatUnits(event.args.burnAmount, 18))
  const burnedToken0 = new Decimal(formatUnits(event.args.amount0Out, t0.decimals))
  const burnedToken1 = new Decimal(formatUnits(event.args.amount1Out, t1.decimals))

  // Update vault datas
  vault.txCount += 1
  vault.totalSupply = new Decimal(vault.totalSupply).minus(sharesBurned).toString()
  vault.liquidity -= event.args.liquidityBurned

  const depositedT0Bera = burnedToken0.mul(t0.derivedBERA)
  const depositedT1Bera = burnedToken1.mul(t1.derivedBERA)
  const totalBurnedBera = depositedT0Bera.plus(depositedT1Bera)
  const totalBurnedUSD = totalBurnedBera.mul(beraPriceUSD)

  // FIXED: Add to deposit/withdraw volume, not trading volume
  vault.depositWithdrawVolumeUSD = new Decimal(vault.depositWithdrawVolumeUSD || "0").plus(totalBurnedUSD).toString()

  // Use event data for precise TVL calculation (no RPC call during burn)
  vault.totalValueLockedToken0 = new Decimal(vault.totalValueLockedToken0).minus(burnedToken0).toString()
  vault.totalValueLockedToken1 = new Decimal(vault.totalValueLockedToken1).minus(burnedToken1).toString()
  vault.totalValueLockedBERA = new Decimal(vault.totalValueLockedBERA).minus(totalBurnedBera).toString()
  vault.totalValueLockedUSD = new Decimal(vault.totalValueLockedBERA).mul(beraPriceUSD).toString()

  // Calculate realized PnL before updating position
  const shareRatio = sharesBurned.div(new Decimal(userPos.shares));
  const realizedValueToken0 = burnedToken0;
  const realizedValueToken1 = burnedToken1;
  const realizedValueBERA = depositedT0Bera.plus(depositedT1Bera);
  const realizedValueUSD = totalBurnedUSD;

  // Calculate the initial cost of the shares being withdrawn
  const initialValueRatio = shareRatio;
  const initialCostUSD = new Decimal(userPos.initialValueUSD || "0").mul(initialValueRatio);
  const realizedPnLUSD = realizedValueUSD.minus(initialCostUSD);
  const realizedPnLBERA = realizedPnLUSD.div(beraPriceUSD.gt(0) ? beraPriceUSD : new Decimal(1));

  // Update user vault position
  userPos.depositedToken0 = new Decimal(userPos.depositedToken0).minus(burnedToken0).toString()
  userPos.depositedToken1 = new Decimal(userPos.depositedToken1).minus(burnedToken1).toString()
  userPos.shares = new Decimal(userPos.shares).minus(sharesBurned).toString()
  userPos.lastUpdateAt = event.block.timestamp;

  // Update realized PnL
  userPos.realizedPnLBERA = new Decimal(userPos.realizedPnLBERA).plus(realizedPnLBERA).toString();
  userPos.realizedPnLUSD = new Decimal(userPos.realizedPnLUSD).plus(realizedPnLUSD).toString();

  // Reduce initial investment proportionally
  userPos.initialValueBERA = new Decimal(userPos.initialValueBERA).minus(new Decimal(userPos.initialValueBERA).mul(initialValueRatio)).toString();
  userPos.initialValueUSD = new Decimal(userPos.initialValueUSD).minus(initialCostUSD).toString();

  // Check if position is completely closed
  const remainingShares = new Decimal(userPos.shares);
  if (remainingShares.eq(0)) {
    // Position is completely closed - reset entry prices and initial values
    userPos.initialValueBERA = "0";
    userPos.initialValueUSD = "0";
    userPos.avgEntryPriceToken0 = "0";
    userPos.avgEntryPriceToken1 = "0";
    userPos.currentValueToken0 = "0";
    userPos.currentValueToken1 = "0";
    userPos.currentValueBERA = "0";
    userPos.currentValueUSD = "0";
    userPos.totalValue = "0";
    userPos.unrealizedPnLBERA = "0";
    userPos.unrealizedPnLUSD = "0";
  } else {
    // Calculate remaining position value and performance metrics
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
      userPos.totalReturn = positionMetrics.totalReturn;
      userPos.annualizedReturn = positionMetrics.annualizedReturn;

    } catch (error) {
      console.warn(`Could not calculate remaining position metrics for ${userPosId}:`, (error as Error).message);
      // Fallback to basic calculations
      if (new Decimal(vault.totalSupply).gt(0)) {
        userPos.currentValueToken0 = remainingShares.div(vault.totalSupply).mul(vault.totalValueLockedToken0).toString();
        userPos.currentValueToken1 = remainingShares.div(vault.totalSupply).mul(vault.totalValueLockedToken1).toString();
      } else {
        userPos.currentValueToken0 = "0";
        userPos.currentValueToken1 = "0";
      }

      const currentValueBERA = new Decimal(userPos.currentValueToken0).mul(t0.derivedBERA)
        .plus(new Decimal(userPos.currentValueToken1).mul(t1.derivedBERA));
      const currentValueUSD = currentValueBERA.mul(beraPriceUSD);

      userPos.currentValueBERA = currentValueBERA.toString();
      userPos.currentValueUSD = currentValueUSD.toString();
      userPos.totalValue = currentValueUSD.toString();
    }
  }

  // Update total PnL (realized + unrealized)
  userPos.totalPnLUSD = new Decimal(userPos.realizedPnLUSD).plus(userPos.unrealizedPnLUSD).toString();

  // Create transaction
  const tx = await getOrCreateTransaction(context, event)
  // Create Vault deposit
  await context.db.insert(vaultWithdrawal).values({
    id: `${event.transaction.hash}#${event.log.logIndex}`,
    transaction: tx.id,
    timestamp: event.block.timestamp,
    user: event.args.receiver,
    vault: vault.id,
    vaultUserPosition: userPos.id,
    amount0: event.args.amount0Out,
    amount1: event.args.amount1Out,
    shares: event.args.burnAmount,
    liquidityBurned: event.args.liquidityBurned
  })

  await context.db.update(stickyVault, { id: vault.id }).set({ ...Object.fromEntries(Object.entries(vault).filter(([key]) => key !== 'id')) })
  await context.db.update(vaultUserPosition, { id: userPos.id }).set({ ...Object.fromEntries(Object.entries(userPos).filter(([key]) => key !== 'id')) })

  // Create position snapshot for withdrawal event
  try {
    await createPositionSnapshot(
      userPos,
      vault,
      "withdraw",
      event.transaction.hash,
      event.block.timestamp,
      event.block.number,
      context
    );
  } catch (error) {
    console.warn(`Could not create position snapshot for ${userPosId}:`, (error as Error).message);
  }

  await updateVaultStats(event.block.timestamp, vault, beraPriceUSD, context, event.block.number)
})