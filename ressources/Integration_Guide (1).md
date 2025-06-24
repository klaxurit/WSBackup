# Uniswap V3 Integration Reference
## MockBERA/MockHONEY Pool on Berachain Bepolia

Complete Uniswap V3 on Berachain testnet deployment with custom MockBERA/MockHONEY trading pair.

ALL contracts verified on Bepolia Explorer.

Please check `state_bepolia.json` file for addresses.

## Infrastructure Overview

Complete Uniswap V3 deployment with dual trading pairs optimized for different market dynamics.

**Volatile Pool - BERA/HONEY:**
- **Token Pair**: MockBERA/MockHONEY (both 18 decimals)
- **Fee Tier**: 30bp (0.3%) - Optimized for volatile assets
- **Tick Spacing**: 60 - Standard for 30bp pools
- **Initial Price**: 0.37037 MockHONEY/MockBERA (1 BERA = 2.7 HONEY)
- **Liquidity**: Full-range concentrated liquidity deployed

**Stable Pool - USDC.e/HONEY:**
- **Token Pair**: MockUSDC.e (6 decimals) / MockHONEY (18 decimals)
- **Fee Tier**: 5bp (0.05%) - Optimized for stable pairs
- **Tick Spacing**: 10 - Tight spreads for stable assets
- **Initial Price**: 1.0 (1 USDC.e = 1 HONEY)
- **Liquidity**: Full-range concentrated liquidity deployed

**Contract Addresses**: See `state_bepolia.json` for complete infrastructure mapping with detailed descriptions.

---

## Integration Examples

### Liquidity Provision Script

```javascript
#!/usr/bin/env node
/**
 * Automated liquidity provision for BERA/HONEY V3 pool
 * Handles token minting, approval optimization, and position management
 */

import { ethers } from 'ethers';
import stateData from './state_bepolia.json' assert { type: 'json' };

const PROVIDER = new ethers.JsonRpcProvider("https://bepolia.rpc.berachain.com");
const PRIVATE_KEY = process.env.PRIVATE_KEY || "YOUR_PRIVATE_KEY";
const signer = new ethers.Wallet(PRIVATE_KEY, PROVIDER);

// Contract interfaces
const ERC20_ABI = [
  "function mint(address to, uint256 amount) external",
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function balanceOf(address owner) view returns (uint256)"
];

const POSITION_MANAGER_ABI = [
  "function mint(tuple(address token0, address token1, uint24 fee, int24 tickLower, int24 tickUpper, uint256 amount0Desired, uint256 amount1Desired, uint256 amount0Min, uint256 amount1Min, address recipient, uint256 deadline)) external payable returns (uint256 tokenId, uint128 liquidity, uint256 amount0, uint256 amount1)"
];

async function deployLiquidity() {
  const wallet = await signer.getAddress();
  
  // Contract instances
  const beraToken = new ethers.Contract(stateData.mockBeraAddress, ERC20_ABI, signer);
  const honeyToken = new ethers.Contract(stateData.mockHoneyAddress, ERC20_ABI, signer);
  const positionManager = new ethers.Contract(stateData.nonfungibleTokenPositionManagerAddress, POSITION_MANAGER_ABI, signer);

  // Liquidity parameters - maintain optimal 2.7:1 ratio
  const BERA_AMOUNT = ethers.parseEther("1000");
  const HONEY_AMOUNT = ethers.parseEther("2700");

  console.log("Initializing liquidity deployment...");
  
  // Mint development tokens
  await beraToken.mint(wallet, BERA_AMOUNT);
  await honeyToken.mint(wallet, HONEY_AMOUNT);
  
  // Optimize approvals for gas efficiency
  await Promise.all([
    beraToken.approve(stateData.nonfungibleTokenPositionManagerAddress, BERA_AMOUNT),
    honeyToken.approve(stateData.nonfungibleTokenPositionManagerAddress, HONEY_AMOUNT)
  ]);

  // Deploy full-range liquidity position
  const mintParams = {
    token0: stateData.mockHoneyAddress,  // Lower address = token0
    token1: stateData.mockBeraAddress,   // Higher address = token1
    fee: stateData.beraHoneyPoolFee,
    tickLower: -887220,  // Full range coverage
    tickUpper: 887220,
    amount0Desired: HONEY_AMOUNT,
    amount1Desired: BERA_AMOUNT,
    amount0Min: ethers.parseEther("2500"), // 7.4% slippage tolerance
    amount1Min: ethers.parseEther("925"),
    recipient: wallet,
    deadline: Math.floor(Date.now() / 1000) + 1800
  };

  const tx = await positionManager.mint(mintParams);
  const receipt = await tx.wait();
  
  // Extract position NFT ID from logs
  const mintEvent = receipt.logs.find(log => 
    log.topics[0] === ethers.id("IncreaseLiquidity(uint256,uint128,uint256,uint256)")
  );
  
  console.log(`Position deployed | TX: ${receipt.hash}`);
  console.log(`Liquidity: ${ethers.formatEther(BERA_AMOUNT)} BERA + ${ethers.formatEther(HONEY_AMOUNT)} HONEY`);
  console.log(`Pool: ${stateData.beraHoneyPoolAddress}`);
}

deployLiquidity().catch(console.error);
```

### Swap Engine

```javascript
#!/usr/bin/env node
/**
 * Optimized swap execution engine for BERA/HONEY pair
 */

import { ethers } from 'ethers';
import stateData from './state_bepolia.json' assert { type: 'json' };

const PROVIDER = new ethers.JsonRpcProvider("https://bepolia.rpc.berachain.com");
const PRIVATE_KEY = process.env.PRIVATE_KEY || "YOUR_PRIVATE_KEY";
const signer = new ethers.Wallet(PRIVATE_KEY, PROVIDER);

// Swap Router V2 interface
const SWAP_ROUTER_ABI = [
  "function exactInputSingle(tuple(address tokenIn, address tokenOut, uint24 fee, address recipient, uint256 amountIn, uint256 amountOutMinimum, uint160 sqrtPriceLimitX96)) external payable returns (uint256 amountOut)"
];

const ERC20_ABI = [
  "function mint(address to, uint256 amount) external",
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function balanceOf(address owner) view returns (uint256)"
];

class SwapEngine {
  constructor() {
    this.swapRouter = new ethers.Contract(stateData.swapRouter02, SWAP_ROUTER_ABI, signer);
    this.honeyToken = new ethers.Contract(stateData.mockHoneyAddress, ERC20_ABI, signer);
    this.beraToken = new ethers.Contract(stateData.mockBeraAddress, ERC20_ABI, signer);
  }

  async executeSwap(tokenIn, tokenOut, amountIn, maxSlippage = 0.005) {
    const wallet = await signer.getAddress();
    
    // Ensure sufficient balance
    if (tokenIn === stateData.mockHoneyAddress) {
      await this.honeyToken.mint(wallet, amountIn);
      await this.honeyToken.approve(stateData.swapRouter02, amountIn);
    } else {
      await this.beraToken.mint(wallet, amountIn);
      await this.beraToken.approve(stateData.swapRouter02, amountIn);
    }

    // Calculate minimum output with slippage protection
    const estimatedOutput = await this.calculateExpectedOutput(tokenIn, tokenOut, amountIn);
    const minAmountOut = estimatedOutput * BigInt(Math.floor((1 - maxSlippage) * 10000)) / 10000n;

    const swapParams = {
      tokenIn,
      tokenOut,
      fee: stateData.beraHoneyPoolFee,
      recipient: wallet,
      amountIn,
      amountOutMinimum: minAmountOut,
      sqrtPriceLimitX96: 0 // No price limit
    };

    console.log(`🔄 Executing swap: ${this.getTokenSymbol(tokenIn)} → ${this.getTokenSymbol(tokenOut)}`);
    console.log(`💱 Amount In: ${ethers.formatEther(amountIn)}`);
    console.log(`📊 Min Out: ${ethers.formatEther(minAmountOut)} (${maxSlippage * 100}% slippage)`);

    const tx = await this.swapRouter.exactInputSingle(swapParams);
    const receipt = await tx.wait();

    console.log(`Swap executed | TX: ${receipt.hash}`);
    return receipt;
  }

  async calculateExpectedOutput(tokenIn, tokenOut, amountIn) {
    // Simplified calculation based on current pool price
    const currentPrice = stateData.beraHoneyPoolInitialPrice;
    
    if (tokenIn === stateData.mockHoneyAddress) {
      // HONEY → BERA
      return (amountIn * ethers.parseEther("1")) / ethers.parseEther(currentPrice.toString());
    } else {
      // BERA → HONEY  
      return (amountIn * ethers.parseEther(currentPrice.toString())) / ethers.parseEther("1");
    }
  }

  getTokenSymbol(address) {
    return address === stateData.mockHoneyAddress ? "HONEY" : "BERA";
  }
}

// Execute token0 → token1 swap (HONEY → BERA)
async function main() {
  const engine = new SwapEngine();
  const swapAmount = ethers.parseEther("100");
  
  await engine.executeSwap(
    stateData.mockHoneyAddress,  // token0 (HONEY)
    stateData.mockBeraAddress,   // token1 (BERA)
    swapAmount,
    0.01 // 1% max slippage
  );
}

main().catch(console.error);
```

---

## Contract ABI Reference

```javascript
// Essential interfaces for V3 integration
export const CORE_ABIS = {
  ERC20: [
    "function mint(address to, uint256 amount) external",
    "function approve(address spender, uint256 amount) external returns (bool)",
    "function balanceOf(address owner) view returns (uint256)",
    "function transfer(address to, uint256 amount) external returns (bool)"
  ],
  
  SwapRouter: [
    "function exactInputSingle(tuple(address tokenIn, address tokenOut, uint24 fee, address recipient, uint256 amountIn, uint256 amountOutMinimum, uint160 sqrtPriceLimitX96)) external payable returns (uint256 amountOut)",
    "function exactOutputSingle(tuple(address tokenIn, address tokenOut, uint24 fee, address recipient, uint256 amountOut, uint256 amountInMaximum, uint160 sqrtPriceLimitX96)) external payable returns (uint256 amountIn)"
  ],
  
  PositionManager: [
    "function mint(tuple(address token0, address token1, uint24 fee, int24 tickLower, int24 tickUpper, uint256 amount0Desired, uint256 amount1Desired, uint256 amount0Min, uint256 amount1Min, address recipient, uint256 deadline)) external payable returns (uint256 tokenId, uint128 liquidity, uint256 amount0, uint256 amount1)",
    "function increaseLiquidity(tuple(uint256 tokenId, uint256 amount0Desired, uint256 amount1Desired, uint256 amount0Min, uint256 amount1Min, uint256 deadline)) external payable returns (uint128 liquidity, uint256 amount0, uint256 amount1)"
  ],
  
  Pool: [
    "function slot0() external view returns (uint160 sqrtPriceX96, int24 tick, uint16 observationIndex, uint16 observationCardinality, uint16 observationCardinalityNext, uint8 feeProtocol, bool unlocked)",
    "function liquidity() external view returns (uint128)",
    "function ticks(int24 tick) external view returns (uint128 liquidityGross, int128 liquidityNet, uint256 feeGrowthOutside0X128, uint256 feeGrowthOutside1X128, int56 tickCumulativeOutside, uint160 secondsPerLiquidityOutsideX128, uint32 secondsOutside, bool initialized)"
  ]
};
```

---

## Technical Specifications

**Network Configuration:**
- Chain ID: `80069` (Berachain Bepolia)
- RPC: `https://bepolia.rpc.berachain.com`

**Volatile Pool Mechanics (BERA/HONEY):**
- Token0: MockHONEY (`0x41936...ED02`) - Lower lexicographic address (18 decimals)
- Token1: MockBERA (`0xC672...19E1`) - Higher lexicographic address (18 decimals)
- Fee: 30bp (0.3%) - Tick spacing: 60
- Price Range: Full range (-887220 to 887220 ticks)
- Target Ratio: 1 BERA = 2.7 HONEY

**Stable Pool Mechanics (USDC.e/HONEY):**
- Token0/Token1: Ordered by address (MockUSDC.e 6 decimals, MockHONEY 18 decimals)
- Fee: 5bp (0.05%) - Tick spacing: 10
- Price Range: Full range (-887220 to 887220 ticks)  
- Target Ratio: 1 USDC.e = 1 HONEY (stable peg)

**Integration Patterns:**
- Use `multicall2` for batch operations
- Implement proper slippage protection (min 0.5% for volatile pairs, 0.1% for stable pairs)
- Monitor pool `slot0()` for price impact calculations
- Leverage `quoterV2` for accurate swap estimates
- Choose appropriate pool based on trading strategy (volatile vs stable)


---

## Annex: State Variables Reference

Complete reference for all variables in `state_bepolia.json`:

**Core Uniswap V3 Infrastructure:**
- `v3CoreFactoryAddress` - Uniswap V3 Factory contract that creates and manages all V3 pool deployments
- `multicall2Address` - Multicall2 contract for batching multiple contract calls into single transactions (gas optimization)
- `proxyAdminAddress` - Proxy Admin contract managing upgradeable proxy contracts in the Uniswap V3 ecosystem
- `tickLensAddress` - Tick Lens contract providing gas-efficient queries for tick data and liquidity information across price ranges
- `nftDescriptorLibraryAddressV1_3_0` - NFT Descriptor Library V1.3.0 generating SVG and metadata for liquidity position NFTs
- `nonfungibleTokenPositionDescriptorAddressV1_3_0` - Position Descriptor V1.3.0 rendering visual representation and metadata for LP positions
- `descriptorProxyAddress` - Descriptor Proxy providing upgradeable proxy for position descriptor functionality
- `nonfungibleTokenPositionManagerAddress` - Position Manager ERC721-compliant NFT contract for managing concentrated liquidity positions
- `v3MigratorAddress` - V3 Migrator contract facilitating migration of liquidity from Uniswap V2 to V3 with minimal slippage
- `v3StakerAddress` - V3 Staker incentive contract for rewarding liquidity providers with additional tokens
- `quoterV2Address` - Quoter V2 advanced price quotation engine with gas-optimized calculations for swap estimates
- `swapRouter02` - Swap Router 02 latest router with improved gas efficiency and multi-hop swap capabilities

**Mock Token Deployments:**
- `mockBeraAddress` - Mock BERA Token testnet ERC20 with public mint function for development and testing
- `mockHoneyAddress` - Mock HONEY Token testnet ERC20 representing Berachain's native stablecoin with public mint function
- `mockUSDCeAddress_2` - Mock USDC.e Token testnet ERC20 (6 decimals) with public mint function for stable pair testing
- `mockHoneyAddress_2` - Secondary Mock HONEY Token deployment for stable pair integration

**Pool Configurations:**

*Volatile Pool (BERA/HONEY):*
- `beraHoneyPoolAddress` - BERA/HONEY V3 Pool with 0.3% fee tier and concentrated liquidity
- `beraHoneyPoolFee` - Pool fee tier set at 30 basis points (0.3%) optimized for volatile token pairs
- `beraHoneyPoolInitialPrice` - Initial pool price representing HONEY per BERA calculated from 1 BERA = 2.7 HONEY ratio

*Stable Pool (USDC.e/HONEY):*
- `usdceHoneyPoolAddress` - USDC.e/HONEY V3 Pool with 0.05% fee tier optimized for stable pairs
- `usdceHoneyPoolFee` - Pool fee tier set at 5 basis points (0.05%) for minimal stable pair trading costs
- `usdceHoneyPoolInitialPrice` - Initial pool price set at 1.0 for 1:1 USDC.e to HONEY stable peg