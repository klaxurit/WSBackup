# Frontend Architecture Guide - WinnieSwap

## 📋 Overview

This guide provides a comprehensive state overview of the WinnieSwap frontend application. It is intended for developers and AI agents to quickly navigate the codebase and identify the right files to modify.

### Tech Stack
- **Framework**: React 19 + Vite
- **State Management**: Redux Toolkit
- **Routing**: React Router v6
- **Web3**: Wagmi + Viem + Reown AppKit
- **Styling**: SCSS + CSS Modules
- **Animations**: Framer Motion
- **Build**: Vite + Turborepo

### Folder Structure
```
apps/web/src/
├── components/          # Reusable components
├── pages/              # Pages/Routes
├── hooks/              # Custom hooks
├── store/              # Redux store
├── utils/              # Utility functions
├── config/             # Configuration (ABIs, contracts)
├── styles/             # Global SCSS
└── types/              # TypeScript types
```

---

## 🗺️ Navigation Map (Routing)

| Route | Component | Description | File |
|-------|-----------|-------------|------|
| `/` | SwapPageLayout + SwapForm | Main swap page | `pages/SwapPage/page.tsx` |
| `/explore` | ExplorePage | Explore pools/tokens/vaults | `pages/ExplorePage/page.tsx` |
| `/pools/:address` | PoolPage | Pool details | `pages/PoolPage/page.tsx` |
| `/tokens/:address` | TokenPage | Token details | `pages/TokenPage/page.tsx` |
| `/positions` | PositionPage | Positions list | `pages/PositionPage/page.tsx` |
| `/positions/create` | PositionPage (create mode) | Create position | `pages/PositionPage/create/page.tsx` |
| `/positions/:tokenId` | PositionPage (view mode) | View position | `pages/PositionPage/[tokenId]/page.tsx` |
| `/vaults` | VaultsPage | Vaults list | `pages/VaultsPage/page.tsx` |
| `/vaults/:address` | VaultDetailPage | Vault details | `pages/VaultDetailPage/page.tsx` |

### Entry Points by Feature
- **Swap**: `SwapForm.tsx` + `useSwap.ts`
- **Liquidity**: `PositionPage/` + `usePositionManager.ts`
- **Pools**: `PoolPage/` + `usePoolManager.ts`
- **Vaults**: `VaultsPage/` + `useVault.ts`
- **Analytics**: `ExplorePage/` + charts components

---

## 🧩 Component Inventory

### Core UI Components
| Component | Usage | File | Used By |
|-----------|-------|------|---------|
| **Button** | Main actions | `Buttons/ConnectButton.tsx` | Navbar, SwapForm |
| **Modal** | Overlays/dialogs | `Common/Modal.tsx` | TransactionStatusModal, MobileMenuModal |
| **Tooltip** | Contextual info | `Common/Tooltip.tsx` | SwapDetails, PoolStats |
| **Loader** | Loading states | `Loader/Loader.tsx` | Pages, async hooks |
| **TokenSelector** | Token selection | `Buttons/TokenSelector.tsx` | SwapForm, LiquidityInput |

### Business Components
| Component | Responsibility | File | Dependencies |
|-----------|----------------|------|-------------|
| **SwapForm** | Main swap interface | `SwapForm/SwapForm.tsx` | useSwap, TokenSelector, SwapDetails |
| **PoolHeader** | Pool page header | `PoolView/PoolHeader.tsx` | TokenPairLogos, PoolStats |
| **PoolActions** | Pool actions | `PoolView/PoolActions.tsx` | usePositionManager, Modal |
| **VaultActionButton** | Vault actions | `Vault/VaultActionButton.tsx` | useVault, TransactionStatusModal |
| **LiquidityInput** | Liquidity input | `Inputs/LiquidityInput.tsx` | TokenSelector, usePositions |

### Layout Components
| Component | Role | File | Contains |
|-----------|------|------|----------|
| **Navbar** | Main navigation | `Navbar/Navbar.tsx` | Menu, ConnectButton |
| **Footer** | Footer | `Footer/Footer.tsx` | External links |
| **SwapPageLayout** | Swap page layout | `Layout/SwapPageLayout.tsx` | SwapForm, banners |
| **Menu** | Navigation menu | `Navbar/Menu.tsx` | Internal links |

### Data Display Components
| Component | Function | File | Data Sources |
|-----------|----------|------|-------------|
| **Table** | Generic tables | `Table/Table.tsx` | All explore tables |
| **PoolTransactionsTable** | Pool transactions | `Table/PoolTransactionsTable.tsx` | usePonderChartData |
| **TokenTransactionsTable** | Token transactions | `Table/TokenTransactionsTable.tsx` | usePonderChartData |
| **LineChart** | Line charts | `Charts/LineChart.tsx` | chartDataProcessor |
| **MiniChart** | Small charts | `Charts/MiniChart.tsx` | aggregateLineData |

### Web3 Components
| Component | Web3 Function | File | Web3 Hooks |
|-----------|---------------|------|------------|
| **AppKitConnectButton** | Wallet connection | `Buttons/AppKitConnectButton.tsx` | useWallet |
| **WalletConnect** | Wallet interface | `WalletConnect/WalletConnect.tsx` | Wagmi hooks |
| **RouteDisplay** | Swap routes display | `RouteDisplay/RouteDisplay.tsx` | useSwap |
| **TransactionStatusModal** | Transaction status | `TransactionStatusModal/` | useWallet |

### Utility Components
| Component | Utility | File | Usage |
|-----------|---------|------|-------|
| **FallbackImg** | Fallback images | `utils/FallbackImg.tsx` | TokenPairLogos |
| **SafeImage** | Safe images | `utils/SafeImage.tsx` | Token displays |
| **TokenPairLogos** | Pair logos | `Common/TokenPairLogos.tsx` | PoolHeader, Tables |
| **StickyIcon** | Sticky vault icon | `Common/StickyIcon.tsx` | Vault components |

---

## 🎣 Custom Hooks

### Web3 & Blockchain Hooks
| Hook | Responsibility | File | Returns |
|------|----------------|------|---------|
| **useSwap** | Swap logic | `hooks/useSwap.ts` | swap functions, state |
| **useVault** | Vault management | `hooks/useVault.ts` | vault data, actions |
| **usePositions** | NFT positions | `hooks/usePositions.ts` | positions array, management |
| **usePositionManager** | Position management | `hooks/usePositionManager.ts` | create, modify, close |
| **usePoolManager** | Pool management | `hooks/usePoolManager.ts` | pool data, stats |
| **useWallet** | Wallet state | `hooks/useWallet.ts` | connection, account |

### Data Fetching Hooks
| Hook | Source | File | Cache |
|------|--------|------|-------|
| **usePonderChartData** | Ponder indexer | `hooks/usePonderChartData.ts` | React Query |
| **useCoingeckoData** | External prices | `hooks/useCoingeckoData.ts` | Local storage |
| **useTokenDataGraphQL** | Token data | `hooks/useTokenDataGraphQL.ts` | GraphQL cache |
| **usePositionsGraphQL** | Positions via GraphQL | `hooks/usePositionsGraphQL.ts` | GraphQL cache |

### UI & UX Hooks
| Hook | Function | File | Usage |
|------|----------|------|-------|
| **useDebounce** | Input delays | `hooks/useDebounce.ts` | Search, typing |
| **usePageTransition** | Page transitions | `hooks/usePageTransition.ts` | Router navigation |
| **useDisplayPools** | Pool filtering | `hooks/useDisplayPools.ts` | ExplorePage |

### Optimization Hooks
| Hook | Performance | File | Optimization |
|------|-------------|------|-------------|
| **useTokenBalancesOptimized** | Token balances | `hooks/useTokenBalancesOptimized.ts` | Batch calls |
| **useTokenCache** | Token cache | `hooks/useTokenCache.ts` | Local cache |
| **useRouteCache** | Route cache | `hooks/useRouteCache.ts` | Route optimization |
| **useSwapCacheManager** | Swap cache | `hooks/useSwapCacheManager.ts` | Transaction cache |

---

## 🏪 State Management (Redux)

### Store Structure
```typescript
{
  swap: SwapState,
  wallet: WalletState
}
```

### Swap Slice (`store/slices/swapSlice.ts`)
| Action | Payload | Description |
|--------|---------|-------------|
| `setFromToken` | Token | Source token selection |
| `setToToken` | Token | Destination token selection |
| `setFromAmount` | string | Source amount |
| `setToAmount` | string | Destination amount |
| `setSlippage` | number | Slippage tolerance |
| `setRoute` | Route | Calculated swap route |
| `resetSwap` | void | State reset |

### Wallet Slice (`store/slices/walletSlice.ts`)
| Action | Payload | Description |
|--------|---------|-------------|
| `setConnected` | boolean | Connection state |
| `setAddress` | string | Wallet address |
| `setChainId` | number | Chain ID |
| `setBalances` | TokenBalance[] | Token balances |

---

## 🛠️ Utilities

### Formatting Utils
| Function | Usage | File |
|----------|-------|------|
| `formatNumber` | Number formatting | `utils/formatNumber.ts` |
| `formatCurrency` | Currency formatting | `utils/format.ts` |
| `formatAddress` | Address formatting | `utils/format.ts` |

### Chart Utils
| Function | Usage | File |
|----------|-------|------|
| `chartDataProcessor` | Process chart data | `utils/chartDataProcessor.ts` |
| `aggregateLineData` | Data aggregation | `utils/aggregateLineData.ts` |
| `candleStickData` | OHLC data | `utils/candleStickData.ts` |

### DeFi Calculations
| Function | Usage | File |
|----------|-------|------|
| `positionManager` | Position calculations | `utils/positionManager.ts` |
| `getPoolAddress` | Pool address | `utils/getPoolAddress.ts` |
| `swap` | Swap calculations | `utils/swap.ts` |

### Validation Utils
| Function | Usage | File |
|----------|-------|------|
| `dataValidation` | Data validation | `utils/dataValidation.ts` |
| `chartDataValidation` | Chart validation | `utils/chartDataValidation.ts` |
| `imageValidation` | Image validation | `utils/imageValidation.ts` |

---

## 🔗 Web3 Integration Points

### Contract Configuration
| File | Content | Usage |
|------|---------|-------|
| `config/contractsAddress.ts` | Contract addresses | All Web3 hooks |
| `config/wagmi.ts` | Wagmi config | App.tsx |
| `config/vaults.ts` | Vault config | VaultComponents |

### Used ABIs
| ABI | Contract | File |
|-----|---------|------|
| `poolABI` | Uniswap V3 Pool | `config/abis/poolABI.ts` |
| `positionManagerABI` | Position Manager | `config/abis/positionManagerABI.ts` |
| `swapRouter` | Swap Router | `config/abis/swapRouter.ts` |
| `StickyVaultRouter` | Vault Router | `config/abis/StickyVaultRouter.ts` |

### Wagmi Hooks Patterns
```typescript
// Standard pattern for reads
const { data, isLoading } = useReadContract({
  address: contractAddress,
  abi: contractABI,
  functionName: 'functionName',
  args: [args]
});

// Pattern for writes
const { writeContract, isPending } = useWriteContract();
```

---

## 🧹 Unused Components (To Clean)

### Identified Orphan Components
| Component | File | Reason |
|-----------|------|--------|
| `SwapWithCacheDemo` | `SwapWithCacheDemo.tsx` | Demo component |
| `Banner` | `Common/Banner.tsx` | Replaced by NewBanner |
| `useSwapWithCache.example` | `hooks/useSwapWithCache.example.ts` | Example file |

### Unused Style Files
| File | Reason |
|------|--------|
| `ErrorMessage.scss` | Styles integrated into component |
| `TransactionStatus.scss` | Styles integrated into component |

### Rarely Used Transitions
| Component | Usage |
|-----------|-------|
| `BannerTransition` | Only used in Banner (deprecated) |
| `ToastTransition` | No toast system implementation |

---

## 🚀 Quick Modification Guide

### To modify Swap
- **Interface**: `SwapForm/SwapForm.tsx`
- **Logic**: `hooks/useSwap.ts`
- **State**: `store/slices/swapSlice.ts`
- **Styles**: `styles/components/swap/_swapForm.scss`

### To add a Pool
- **List**: `ExploreTables/pools.tsx`
- **Detail page**: `PoolPage/page.tsx`
- **Components**: `PoolView/*.tsx`
- **Hook**: `hooks/usePoolManager.ts`

### To modify Vaults
- **List**: `VaultsPage/page.tsx`
- **Actions**: `Vault/VaultActionButton.tsx`
- **Hook**: `hooks/useVault.ts`
- **Config**: `config/vaults.ts`

### To change Navigation
- **Routes**: `App.tsx`
- **Navbar**: `Navbar/Navbar.tsx`
- **Menu**: `Navbar/Menu.tsx`

### To modify Charts
- **Widgets**: `Charts/ChartWidget.tsx`
- **Data**: `hooks/usePonderChartData.ts`
- **Processing**: `utils/chartDataProcessor.ts`

### To add a Token
- **Config**: Public token list + `hooks/useBerachainTokenList.ts`
- **Icons**: `components/SVGs/TokenSVGs.tsx`
- **Mapping**: `utils/tokenMapping.ts`

### To modify Wallet
- **Connection**: `WalletConnect/WalletConnect.tsx`
- **Buttons**: `Buttons/*ConnectButton.tsx`
- **State**: `store/slices/walletSlice.ts`
- **Hook**: `hooks/useWallet.ts`

---

## 📊 Codebase Metrics

- **Total components**: ~70
- **Pages**: 8
- **Custom hooks**: 27
- **Style files**: 50+
- **Utilities**: 20+
- **Configuration files**: 10+

**Last updated**: Generated by Claude Code