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

  const b = await context.db.find(bundle, { id: "1" })
  let beraPriceUSD = new Decimal(b?.beraPriceUSD || "0")

  const amount0 = new Decimal(formatUnits(event.args.feesEarned0, t0.decimals))
  const amount1 = new Decimal(formatUnits(event.args.feesEarned1, t1.decimals))

  const amount0USD = amount0.mul(new Decimal(t0.derivedBERA).mul(beraPriceUSD))
  const amount1USD = amount1.mul(new Decimal(t1.derivedBERA).mul(beraPriceUSD))
  const totalUSD = amount0USD.plus(amount1USD)

  vault.collectedFeesToken0 = new Decimal(vault.collectedFeesToken0).plus(amount0).toString()
  vault.collectedFeesToken1 = new Decimal(vault.collectedFeesToken1).plus(amount1).toString()
  vault.collectedFeesUSD = new Decimal(vault.collectedFeesUSD).plus(totalUSD).toString()

  await context.db.update(stickyVault, { id: vault.id }).set({ ...Object.fromEntries(Object.entries(vault).filter(([key]) => key !== 'id')) })

  await updateVaultStats(event.block.timestamp, vault, beraPriceUSD, context)
})