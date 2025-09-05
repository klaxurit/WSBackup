import Decimal from "decimal.js";
import { ponder } from "ponder:registry";
import { bundle, pool, stickyVault, token, vaultDeposit, vaultUserPosition } from "ponder:schema";
import { formatUnits, parseUnits } from "viem";
import { getOrCreateTransaction } from "../v3/helpers";
import { Context } from "hono";

ponder.on("svVaults:Minted", async ({ event, context }) => {
  console.log("NEW MINTER", event)

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
  vault.totalValueLockedToken0 = new Decimal(vault.totalValueLockedToken0).plus(depositedToken0).toString()
  vault.totalValueLockedToken1 = new Decimal(vault.totalValueLockedToken1).plus(depositedToken1).toString()
  vault.liquidity += event.args.liquidityMinted

  const depositedT0Bera = depositedToken0.mul(t0.derivedBERA)
  const depositedT1Bera = depositedToken1.mul(t1.derivedBERA)
  const totalDepositedBera = depositedT0Bera.plus(depositedT1Bera)
  vault.totalValueLockedBERA = new Decimal(vault.totalValueLockedBERA).plus(totalDepositedBera).toString()
  vault.totalValueLockedUSD = new Decimal(vault.totalValueLockedBERA).mul(beraPriceUSD).toString()


  // Update user vault position
  let uPE = await context.db.find(vaultUserPosition, { id: userPosId })
  if (!uPE) {
    uPE = await context.db.insert(vaultUserPosition).values({
      id: userPosId,
      user: event.args.receiver,
      vault: event.log.address
    })
  }
  const userPos = { ...uPE }

  userPos.depositedToken0 = new Decimal(userPos.depositedToken0).plus(depositedToken0).toString()
  userPos.depositedToken1 = new Decimal(userPos.depositedToken1).plus(depositedToken1).toString()
  userPos.shares = new Decimal(userPos.shares).plus(shares).toString()
  // currentValueToken0 = (user.shares / vault.totalSupply) * vault.totalAssets0
  userPos.currentValueToken0 = (new Decimal(userPos.shares).div(vault.totalSupply)).mul(vault.totalValueLockedToken0).toString()
  userPos.currentValueToken1 = (new Decimal(userPos.shares).div(vault.totalSupply)).mul(vault.totalValueLockedToken1).toString()
  // // Calcul unrealized PnL
  // unrealizedPnL = currentValueUSD - initialValueUSD
  // unrealizedPnL = 10660 - 10000 = +660 USD (+6.6% gain)

  // Create transaction
  const tx = await getOrCreateTransaction(event, context)
  // Create Vault deposit
  await context.db.insert(vaultDeposit).values({
    id: `${event.transaction.hash}#${event.log.logIndex}`,
    transaction: tx.id,
    timestamp: event.block.timestamp,
    user: event.args.receiver,
    vault: vault.id,
    amount0: event.args.amount0In,
    amount1: event.args.amount1In,
    shares: event.args.mintAmount,
    liquidityMinted: event.args.liquidityMinted
  })

  await context.db.update(stickyVault, { id: vault.id }).set({ ...Object.fromEntries(Object.entries(vault).filter(([key]) => key !== 'id')) })
  await context.db.update(vaultUserPosition, { id: userPos.id }).set({ ...Object.fromEntries(Object.entries(userPos).filter(([key]) => key !== 'id')) })
})