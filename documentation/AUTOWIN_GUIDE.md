# AutoWin Router Frontend Guide

Contract: `AutoWinRouter.sol`

## Contract Address
AUTOWIN_ROUTER=0x674FC8955E28207E12156622DdeB875c7678A15c

Other addresses for reference:
AUTOWIN_FACTORY=0x21b35a3dcF462540cb8EEA0e5d8594FF9e93C2e1
AUTOWIN_IMPLEMENTATION=0x8Dd1D56a896490c6AAF04d8C5e6Cb3359cb94A62
BOUNTY_HELPER=0xc1300DC6dFe075166EbF71e3be00Fb7E9B1315A7
BOUNTY_FUNDER=0xe02E8340A39806e3d87C2ddF5aFF9881B96aB8cE

## What are AutoWin Vaults?

AutoWin vaults are ERC4626-compliant auto-compounding vaults for Berachain's Proof-of-Liquidity (PoL) system. Users deposit staking tokens (e.g., BEX LP tokens) and receive vault shares. The vault automatically claims BGT rewards and compounds them back into the staking position. Exit fees fund ongoing compounding operations. Treasury receives compound fees.

**Note:** This router also supports depositing into StickyVaults (inherited from `StickyVaultRouter`). 

## Functions

### 1. Deposit into AutoWin Vault

```solidity
function depositIntoAutoWin(
    address autoWin,
    uint256 assets,
    uint256 minSharesOut,
    address receiver
) external returns (uint256 shares)
```

**Parameters:**
- `autoWin` - AutoWin vault address
- `assets` - Amount of staking tokens to deposit
- `minSharesOut` - Minimum vault shares expected (slippage protection)
- `receiver` - Address to receive vault shares

**Steps:**
1. Approve staking token to router
2. Call `depositIntoAutoWin()`
3. Receive vault shares

**Example:**
```javascript
// 1. Get staking token
const stakingToken = await autoWinVault.stakingToken();

// 2. Approve
await stakingToken.approve(routerAddress, amount);

// 3. Deposit
await router.depositIntoAutoWin(
    vaultAddress,
    amount,
    minShares, // e.g., amount * 0.99 for 1% slippage
    userAddress
);
```

---

### 2. Redeem from AutoWin Vault

```solidity
function redeemFromAutoWin(
    address autoWin,
    uint256 shares,
    uint256 minAssetsOut,
    address receiver
) external returns (uint256 assets)
```

**Parameters:**
- `autoWin` - AutoWin vault address
- `shares` - Amount of vault shares to redeem
- `minAssetsOut` - Minimum staking tokens expected (slippage protection)
- `receiver` - Address to receive staking tokens

**Steps:**
1. Approve vault shares to router
2. Call `redeemFromAutoWin()`
3. Receive staking tokens (minus exit fee)

**Example:**
```javascript
// 1. Approve vault shares
await autoWinVault.approve(routerAddress, shares);

// 2. Redeem
await router.redeemFromAutoWin(
    vaultAddress,
    shares,
    minAssets, // e.g., expectedAssets * 0.99 for 1% slippage
    userAddress
);
```

---

## View Functions

### Get Staking Token
```javascript
const stakingToken = await autoWinVault.stakingToken();
```

### Preview Deposit
```javascript
const expectedShares = await autoWinVault.previewDeposit(amount);
```

### Preview Redeem
```javascript
const expectedAssets = await autoWinVault.previewRedeem(shares);
```

### Check Balance
```javascript
const vaultShares = await autoWinVault.balanceOf(userAddress);
const stakingBalance = await stakingToken.balanceOf(userAddress);
```

---

## Fees

- **Exit Fee:** 0.1% (10 BPS) - deducted on withdrawal
- **Compound Fee:** 4.2% (420 BPS) - taken when BGT is claimed

---

## Slippage Calculation

```javascript
// Deposit slippage (1% tolerance)
const minSharesOut = expectedShares * 99n / 100n;

// Redeem slippage (1% tolerance + exit fee)
const minAssetsOut = expectedAssets * 98n / 100n;
```

---

## Error Messages

- `"AutoWinRouter: invalid autoWin"` - Vault not deployed by factory
- `"AutoWinRouter: cannot deposit for self"` - Cannot set receiver as router
- `"AutoWinRouter: insufficient autoWin shares minted"` - Slippage exceeded
- `"AutoWinRouter: insufficient assets received"` - Slippage exceeded on redeem

---

## Notes

- Router validates vault is legitimate via factory
- Staking tokens must be approved before deposit
- Vault shares must be approved before redeem
- Exit fee is automatically deducted on redeem
- Receiver cannot be the router address