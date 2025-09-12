import Decimal from "decimal.js";
import { ponder } from "ponder:registry";
import { bundle, pool, stickyVault, token } from "ponder:schema";
import { formatUnits } from "viem";
import { updateVaultStats } from "../stats/vault";

ponder.on('svVaults:FeesEarned', async ({ event, context }) => {
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

  // Get fresh pricing data at time of fee collection
  const b = await context.db.find(bundle, { id: "1" })
  let beraPriceUSD = new Decimal(b?.beraPriceUSD || "0")

  // Refresh token prices to ensure they're current
  // In a production system, you might want to trigger a price update here
  // For now, we'll use the latest prices from the database
  const t0Fresh = await context.db.find(token, { id: vPool.token0 })
  const t1Fresh = await context.db.find(token, { id: vPool.token1 })
  const t0DerivedBERA = new Decimal(t0Fresh?.derivedBERA || t0.derivedBERA)
  const t1DerivedBERA = new Decimal(t1Fresh?.derivedBERA || t1.derivedBERA)

  const amount0 = new Decimal(formatUnits(event.args.feesEarned0, t0.decimals))
  const amount1 = new Decimal(formatUnits(event.args.feesEarned1, t1.decimals))

  // FIXED: Use fresh prices for USD conversion
  const amount0USD = amount0.mul(t0DerivedBERA.mul(beraPriceUSD))
  const amount1USD = amount1.mul(t1DerivedBERA.mul(beraPriceUSD))
  const totalUSD = amount0USD.plus(amount1USD)

  vault.collectedFeesToken0 = new Decimal(vault.collectedFeesToken0).plus(amount0).toString()
  vault.collectedFeesToken1 = new Decimal(vault.collectedFeesToken1).plus(amount1).toString()
  vault.collectedFeesUSD = new Decimal(vault.collectedFeesUSD).plus(totalUSD).toString()

  await context.db.update(stickyVault, { id: vault.id }).set({ ...Object.fromEntries(Object.entries(vault).filter(([key]) => key !== 'id')) })

  await updateVaultStats(event.block.timestamp, vault, beraPriceUSD, context)
})