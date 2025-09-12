import Decimal from "decimal.js";
import { ponder } from "ponder:registry";
import { bundle, pool, stickyVault, token, vaultDeposit, vaultUserPosition } from "ponder:schema";
import { formatUnits } from "viem";
import { getOrCreateTransaction } from "../v3/helpers";
import { updateVaultStats } from "../stats/vault";

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
  
  // FIXED: Get real TVL from vault contract instead of accumulating
  try {
    const [amount0Current, amount1Current] = await context.client.readContract({
      address: vault.id,
      abi: context.contracts.svVaults.abi,
      functionName: "getUnderlyingBalances",
    });

    const amount0Decimal = new Decimal(formatUnits(amount0Current, t0.decimals));
    const amount1Decimal = new Decimal(formatUnits(amount1Current, t1.decimals));

    // Update with real balances from contract
    vault.totalValueLockedToken0 = amount0Decimal.toString()
    vault.totalValueLockedToken1 = amount1Decimal.toString()
    
    const tvl0Bera = amount0Decimal.mul(t0.derivedBERA)
    const tvl1Bera = amount1Decimal.mul(t1.derivedBERA)
    vault.totalValueLockedBERA = tvl0Bera.plus(tvl1Bera).toString()
    vault.totalValueLockedUSD = tvl0Bera.plus(tvl1Bera).mul(beraPriceUSD).toString()
  } catch (error) {
    console.warn(`Could not fetch real TVL for vault ${vault.id}:`, error.message);
    // Fallback to accumulative calculation (deprecated)
    vault.totalValueLockedBERA = new Decimal(vault.totalValueLockedBERA).plus(totalDepositedBera).toString()
    vault.totalValueLockedUSD = new Decimal(vault.totalValueLockedBERA).mul(beraPriceUSD).toString()
    vault.totalValueLockedToken0 = new Decimal(vault.totalValueLockedToken0).plus(depositedToken0).toString()
    vault.totalValueLockedToken1 = new Decimal(vault.totalValueLockedToken1).plus(depositedToken1).toString()
  }

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

  await updateVaultStats(event.block.timestamp, vault, beraPriceUSD, context)
})