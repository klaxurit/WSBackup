# Contracts Overview

## StickyVault (the Vault / LP share token)
- Holds a Uniswap v3 position (range) and mints vault shares (an ERC-20) representing proportional ownership.  
- **Key entrypoints (used indirectly by the router):**
  - `getMintAmounts(amount0Max, amount1Max)` → asks: *“If I contribute up to these amounts, how much will the vault actually use, and how many shares will I mint?”*
  - `mint(mintAmount, receiver)` / `burn(burnAmount, receiver)` → handled by the router so users don’t call them directly.  
- The sizing math mirrors Uniswap v3 **LiquidityAmounts** (`getLiquidityForAmounts` / `getAmountsForLiquidity`).

---

## StickyVaultRouter (user-facing router; you will call this)
- Provides safe deposit/withdraw helpers around the vault:
  - **Two-token deposit**: `addLiquidity(stickyVault, amount0Max, amount1Max, amount0Min, amount1Min, amountSharesMin, receiver)`
  - **Two-token deposit (native)**: `addLiquidityNative(...)`
  - **Single-sided deposit**: `addLiquiditySingle(...)`
  - **Single-sided deposit (native)**: `addLiquiditySingleNative(...)`
  - **Withdraw (burn shares)**: `removeLiquidity(...)` and `removeLiquidityNative(...)`  

- The Arrakis router flow your system follows is:  
  `quote → approvals (or Permit2) → router call with slippage minima`.

---

## StickyVaultWithRouter (manager tooling)
- Adds manager-only rebalance helpers that swap via whitelisted routers.  
- Useful for ops, not required for user deposits/withdrawals.

---

# Exactly what your frontend must support

### 1. Two-token deposit (the common case)
- Compute a quote via `vault.getMintAmounts(amount0Max, amount1Max)`  
- Set minima (`amount0Min`, `amount1Min`, `amountSharesMin`) with a tight slippage buffer  
- Approve exact amounts (or use Permit2)  
- (Optional) Preview with `router.addLiquidity.staticCall(...)`, then send the real tx  
- Call `router.addLiquidity(...)` with minima  

### 2. Single-sided deposit (swap-and-add)
- Build a route for your swap executor (the router expects `swapData`)  
- Provide `minAmountOut`, `amountSharesMin`, and `maxStakingSlippageBPS`  
- Approve only the input token (or Permit2)  
- Consider private RPC (Flashbots / MEV Blocker) for larger trades to reduce sandwich risk  

### 3. Native-token variants
- Use `addLiquidityNative(...)` or `addLiquiditySingleNative(...)` with `msg.value` carrying the native side.  
- Refunds handled in the router.  

### 4. Withdraw
- Approve router to spend vault shares (or Permit2 for the share token)  
- (Optional) Preview with `router.removeLiquidity.staticCall(...)` (or `removeLiquidityNative.staticCall`)  
- Compute minima and call `removeLiquidity(...)` (or `removeLiquidityNative(...)`)  

### 5. Approvals
- Use exact allowances  
- When changing a non-zero allowance follow the **zero-then-set pattern** (race-condition mitigation)  
- Or use **Permit2** to avoid ERC-20 approvals entirely  

### 6. Safe (Gnosis Safe) batching (optional, recommended for treasuries)
- Batch:  
  `approve0 → approve1 → addLiquidity → reset approve0 → reset approve1`  
- All in a single MultiSend with Safe Protocol Kit.  

---

# Minimal ABIs (frontend)

```ts
// Router
export const routerAbi = [
  // deposits
  "function addLiquidity(address,uint256,uint256,uint256,uint256,uint256,address) returns (uint256,uint256,uint256)",
  "function addLiquidityNative(address,uint256,uint256,uint256,uint256,uint256,address) payable returns (uint256,uint256,uint256)",
  "function addLiquiditySingle(address,uint256,uint256,uint256,(address router,uint256 amountIn,uint256 minAmountOut,bool zeroForOne,bytes routeData),address) returns (uint256,uint256,uint256)",
  "function addLiquiditySingleNative(address,uint256,uint256,(address router,uint256 minAmountOut,bool zeroForOne,bytes routeData),address) payable returns (uint256,uint256,uint256)",

  // withdrawals
  "function removeLiquidity(address,uint256,uint256,uint256,address) returns (uint256,uint256,uint128)",
  "function removeLiquidityNative(address,uint256,uint256,uint256,address payable) returns (uint256,uint256,uint128)",
];

// Vault
export const vaultAbi = [
  "function token0() view returns (address)",
  "function token1() view returns (address)",
  "function getMintAmounts(uint256,uint256) view returns (uint256 amount0, uint256 amount1, uint256 mintAmount)",
  "function totalSupply() view returns (uint256)",
];

// ERC20
export const erc20Abi = [
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
  "function balanceOf(address) view returns (uint256)",
  "function allowance(address,address) view returns (uint256)",
  "function approve(address,uint256) returns (bool)",
];


⸻

Shared helpers (ethers v6)

import { Contract, JsonRpcSigner, parseUnits } from "ethers";
import { routerAbi, vaultAbi, erc20Abi } from "./abis";

export async function connectContracts(
  signer: JsonRpcSigner,
  routerAddr: string,
  vaultAddr: string
) {
  const router = new Contract(routerAddr, routerAbi, signer);
  const vault = new Contract(vaultAddr, vaultAbi, signer);
  const t0 = new Contract(await vault.token0(), erc20Abi, signer);
  const t1 = new Contract(await vault.token1(), erc20Abi, signer);
  return { router, vault, t0, t1 };
}

// basis point helpers
export const bpsDown = (x: bigint, bps: number) =>
  (x * BigInt(10000 - bps)) / 10000n;
export const pctBps = (x: bigint, bps: number) =>
  (x * BigInt(bps)) / 10_000n;

⚠️ Important: Always fetch decimals() for each token. Never hardcode 18 — stablecoins like USDC use 6.

⸻

A. Two-token deposit (addLiquidity)

Flow
	1.	Parse user input to on-chain units using token decimals()
	2.	vault.getMintAmounts(amount0Max, amount1Max) → expected spends & shares
	3.	Compute slippage minima (amount0Min, amount1Min, amountSharesMin)
	4.	Approve exact amounts (or use Permit2)
	5.	(Optional) static preview via .staticCall
	6.	Send router.addLiquidity(...)

import { parseUnits } from "ethers";

export async function depositTwoSided(
  signer: any,
  routerAddr: string,
  vaultAddr: string,
  uiAmt0: string,
  uiAmt1: string,
  slippageBps = 100 // 1%
) {
  const { router, vault, t0, t1 } = await connectContracts(signer, routerAddr, vaultAddr);

  const [d0, d1] = await Promise.all([t0.decimals(), t1.decimals()]);
  const amt0Max = parseUnits(uiAmt0, d0);
  const amt1Max = parseUnits(uiAmt1, d1);

  // 1) quote
  const [spend0, spend1, shares] = await vault.getMintAmounts(amt0Max, amt1Max);

  // 2) slippage minima
  const min0 = bpsDown(spend0, slippageBps);
  const min1 = bpsDown(spend1, slippageBps);
  const minShares = bpsDown(shares, slippageBps);

  // 3) approvals
  for (const [tk, need] of [[t0, spend0], [t1, spend1]] as const) {
    if (need === 0n) continue;
    const owner = await signer.getAddress();
    const cur = await tk.allowance(owner, routerAddr);
    if (cur < need) {
      if (cur > 0n) await (await tk.approve(routerAddr, 0n)).wait();
      await (await tk.approve(routerAddr, need)).wait();
    }
  }

  // 4) preview
  await router.addLiquidity.staticCall(
    vaultAddr,
    amt0Max,
    amt1Max,
    min0,
    min1,
    minShares,
    await signer.getAddress()
  );

  // 5) send
  const tx = await router.addLiquidity(
    vaultAddr,
    amt0Max,
    amt1Max,
    min0,
    min1,
    minShares,
    await signer.getAddress()
  );
  return tx.wait();
}


⸻

B. Single-sided deposit (addLiquiditySingle)

Flow differences
	•	Approve only the input token
	•	Provide swapData with your swap executor/aggregator
	•	Set amountSharesMin and maxStakingSlippageBPS
	•	Offer a “send privately” toggle (Flashbots / MEV Blocker) for larger trades

type RouterSwapParams = {
  router: string;
  amountIn: bigint;
  minAmountOut: bigint;
  zeroForOne: boolean;
  routeData: string;
};

export async function depositSingleSided(
  signer: any,
  routerAddr: string,
  vaultAddr: string,
  tokenInIs0: boolean,
  uiTotalIn: string,
  uiMinOut: string,
  amountSharesMin: bigint,
  maxStakingSlippageBps = 100,
  swapExecutor: string,
  routeData: string
) {
  const { router, vault, t0, t1 } = await connectContracts(signer, routerAddr, vaultAddr);
  const tokenIn = tokenInIs0 ? t0 : t1;
  const tokenOut = tokenInIs0 ? t1 : t0;

  const [dIn, dOut] = await Promise.all([tokenIn.decimals(), tokenOut.decimals()]);
  const totalIn = parseUnits(uiTotalIn, dIn);
  const minOut = parseUnits(uiMinOut, dOut);

  // approve only input token
  const owner = await signer.getAddress();
  const cur = await tokenIn.allowance(owner, routerAddr);
  if (cur < totalIn) {
    if (cur > 0n) await (await tokenIn.approve(routerAddr, 0n)).wait();
    await (await tokenIn.approve(routerAddr, totalIn)).wait();
  }

  const swapData: RouterSwapParams = {
    router: swapExecutor,
    amountIn: totalIn,
    minAmountOut: minOut,
    zeroForOne: tokenInIs0,
    routeData,
  };

  const tx = await router.addLiquiditySingle(
    vaultAddr,
    totalIn,
    amountSharesMin,
    maxStakingSlippageBps,
    swapData,
    owner
  );
  return tx.wait();
}


⸻

C. Withdraw (burn shares → receive token0/token1)

Flow
	1.	Approve router to spend vault shares (or Permit2)
	2.	Preview with .staticCall
	3.	Compute minima (amount0Min, amount1Min)
	4.	Call removeLiquidity or removeLiquidityNative

import { parseUnits } from "ethers";

export async function withdraw(
  signer: any,
  routerAddr: string,
  vaultAddr: string,
  uiBurnShares: string,
  slippageBps = 100,
  asNative = false
) {
  const owner = await signer.getAddress();
  const vaultErc20 = new Contract(vaultAddr, erc20Abi, signer);
  const router = new Contract(routerAddr, routerAbi, signer);

  const sharesDecimals = 18; // adjust if different
  const burnAmount = parseUnits(uiBurnShares, sharesDecimals);

  // approve shares
  const cur = await vaultErc20.allowance(owner, routerAddr);
  if (cur < burnAmount) {
    if (cur > 0n) await (await vaultErc20.approve(routerAddr, 0n)).wait();
    await (await vaultErc20.approve(routerAddr, burnAmount)).wait();
  }

  // preview
  const [exp0, exp1] = asNative
    ? await router.removeLiquidityNative.staticCall(vaultAddr, burnAmount, 0, 0, owner)
    : await router.removeLiquidity.staticCall(vaultAddr, burnAmount, 0, 0, owner);

  const min0 = bpsDown(exp0, slippageBps);
  const min1 = bpsDown(exp1, slippageBps);

  const tx = asNative
    ? await router.removeLiquidityNative(vaultAddr, burnAmount, min0, min1, owner)
    : await router.removeLiquidity(vaultAddr, burnAmount, min0, min1, owner);

  return tx.wait();
}


⸻

## Approvals: Standard vs Permit2
	•	Standard ERC-20 approvals
	•	Set exact allowances
	•	Reset to 0 before raising allowance (race-condition mitigation)
	•	Permit2 (recommended UX)
	•	One signature replaces approvals
	•	Safer & consistent across tokens
	•	Use Permit2 AllowanceTransfer or SignatureTransfer

⸻

## Optional: Batching from a Safe (Gnosis Safe)

Batch atomically:
	1.	approve(token0, spend0)
	2.	approve(token1, spend1)
	3.	router.addLiquidity(...)
	4.	approve(token0, 0)
	5.	approve(token1, 0)

Build with Safe Protocol Kit createTransaction([...MetaTransactionData]).

⸻

## MEV & Execution Safety
	•	Offer a “Send privately” toggle with private RPC (Flashbots Protect, MEV Blocker)
	•	Reduces sandwich risk when swaps are involved

⸻
```
## UX Guardrails & Edge Cases
	•	Always respect decimals() (don’t hardcode 18)
	•	Always set minima (amount0Min, amount1Min, amountSharesMin)
	•	Fee-on-transfer/rebasing tokens → not compatible
	•	.staticCall is only a preview — still enforce slippage minima at execution
	•	For single-sided, base minAmountOut on a fresh aggregator quote
	•	If vault has manager restrictions, surface revert reasons to users

⸻

## References
	•	Arrakis Router “Add Liquidity” Quickstart
	•	Kodiak Islands
	•	Uniswap v3 LiquidityAmounts
	•	ethers v6 docs (contracts, staticCall)
	•	OpenZeppelin ERC-20 approval best practices
	•	Permit2 overview & integration
	•	Safe Protocol Kit batching / MultiSend
	•	Flashbots Protect / MEV Blocker

⸻

## TL;DR for the Engineer
	•	Implement four calls:
addLiquidity, addLiquiditySingle, removeLiquidity, and native variants
	•	Always:
quote with getMintAmounts → approvals (or Permit2) → router call with minima
	•	For single-sided:
set minAmountOut, amountSharesMin, maxStakingSlippageBPS
	•	offer a private RPC toggle

