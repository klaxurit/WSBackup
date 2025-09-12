import Decimal from "decimal.js";
import { ponder } from "ponder:registry";
import { bundle, pool, stickyVault, swap, token, vaultUserPosition } from "ponder:schema";
import { formatUnits } from "viem";
import { updateVaultStats } from "../stats/vault";
import { calculatePositionValue, createPositionSnapshot } from "../utils/positionCalculations";

ponder.on("svVaults:Rebalance", async ({ event, context }) => {
  const ve = await context.db.find(stickyVault, { id: event.log.address })
  if (!ve) {
    console.warn(`No vault found for this svVaults:Rebalance (${event.transaction.hash})`)
    return
  }
  const vault = { ...ve }

  // Get pool and token info for IL calculation
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

  // Store balances before rebalance
  const liquidityBefore = vault.liquidity
  const tickLowerBefore = vault.tickLower
  const tickUpperBefore = vault.tickUpper

  // Update vault position info
  vault.tickLower = event.args.lowerTick_
  vault.tickUpper = event.args.upperTick_
  vault.liquidity = event.args.liquidityAfter
  vault.rebalanceCount += 1

  // Calculate impermanent loss from this rebalance
  if (liquidityBefore && liquidityBefore > 0) {
    try {
      const [amount0After, amount1After] = await context.client.readContract({
        address: vault.id,
        abi: context.contracts.svVaults.abi,
        functionName: "getUnderlyingBalances",
      });

      const amount0AfterDecimal = new Decimal(formatUnits(amount0After, t0.decimals));
      const amount1AfterDecimal = new Decimal(formatUnits(amount1After, t1.decimals));

      // Calculate IL: This is a simplified version
      // Real IL = (valueInVault / valueIfHODL) - 1
      // For simplicity, we track the USD difference between old and new position values
      const valueAfterUSD = amount0AfterDecimal.mul(t0.derivedBERA).mul(beraPriceUSD)
        .plus(amount1AfterDecimal.mul(t1.derivedBERA).mul(beraPriceUSD))

      const valueBefore = new Decimal(vault.totalValueLockedUSD || "0")

      if (valueBefore.gt(0)) {
        const ilChange = valueAfterUSD.minus(valueBefore).div(valueBefore).mul(100)
        // Accumulate IL over time (negative = loss, positive = gain)
        vault.impermanentLoss = new Decimal(vault.impermanentLoss || "0").plus(ilChange).toString()
      }

      // Update real TVL after rebalance
      vault.totalValueLockedToken0 = amount0AfterDecimal.toString()
      vault.totalValueLockedToken1 = amount1AfterDecimal.toString()
      const tvlBera = amount0AfterDecimal.mul(t0.derivedBERA).plus(amount1AfterDecimal.mul(t1.derivedBERA))
      vault.totalValueLockedBERA = tvlBera.toString()
      vault.totalValueLockedUSD = tvlBera.mul(beraPriceUSD).toString()

    } catch (error) {
      console.warn(`Could not calculate IL for rebalance ${vault.id}:`, error.message);
    }
  }

  await context.db.update(stickyVault, { id: vault.id }).set({ ...Object.fromEntries(Object.entries(vault).filter(([key]) => key !== 'id')) })

  // Update all user positions and create snapshots after rebalance
  // Rebalancing affects all users' position values
  // try {
  //   const userPositions = await context.db
  //     .select()
  //     .from(vaultUserPosition)
  //     .where(({ vault: posVault }) => posVault.equals(vault.id));

  //   for (const userPos of userPositions) {
  //     try {
  //       // Skip positions with no shares
  //       if (new Decimal(userPos.shares).eq(0)) {
  //         continue;
  //       }

  //       // Calculate updated position metrics after rebalance
  //       const positionMetrics = await calculatePositionValue(userPos, vault, beraPriceUSD, context);

  //       // Update position with new values
  //       await context.db.update(vaultUserPosition, { id: userPos.id }).set({
  //         currentValueToken0: positionMetrics.currentValueToken0,
  //         currentValueToken1: positionMetrics.currentValueToken1,
  //         currentValueBERA: positionMetrics.currentValueBERA,
  //         currentValueUSD: positionMetrics.currentValueUSD,
  //         totalValue: positionMetrics.totalValue,
  //         unrealizedPnLBERA: positionMetrics.unrealizedPnLBERA,
  //         unrealizedPnLUSD: positionMetrics.unrealizedPnLUSD,
  //         totalPnLUSD: positionMetrics.totalPnLUSD,
  //         totalReturn: positionMetrics.totalReturn,
  //         annualizedReturn: positionMetrics.annualizedReturn,
  //         lastUpdateAt: event.block.timestamp,
  //       });

  //       // Create position snapshot after rebalance
  //       await createPositionSnapshot(
  //         { ...userPos, ...positionMetrics, lastUpdateAt: event.block.timestamp },
  //         vault,
  //         "rebalance",
  //         event.transaction.hash,
  //         event.block.timestamp,
  //         event.block.number,
  //         context
  //       );

  //     } catch (error) {
  //       console.warn(`Could not update position ${userPos.id} after rebalance:`, (error as Error).message);
  //     }
  //   }
  // } catch (error) {
  //   console.warn(`Could not update user positions after rebalance for vault ${vault.id}:`, (error as Error).message);
  // }

  await updateVaultStats(event.block.timestamp, vault, beraPriceUSD, context)
})
