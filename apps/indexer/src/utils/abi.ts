import { StickyVaultFactoryABI } from "./abis/StickyVaultFactory"
export { FactoryABI } from "./abis/FactoryABI"
export { MockERC20ABI } from "./abis/MockERC20ABI"
export { MultiCall2ABI } from "./abis/MultiCall2ABI"
export { PoolABI } from "./abis/PoolABI"
export { PositionManagerABI } from "./abis/PositionManagerABI"
export { QuoterV2ABI } from "./abis/QuoterV2ABI"
export { SwapRouterABI } from "./abis/SwapRouterABI"
export { WBeraABI } from "./abis/WBeraABI"
export { UniversalRouteABI } from "./abis/UniversalRouteABI"

export { StickyVaultFactoryABI } from "./abis/StickyVaultFactory"
export { StickyVaultWithRouter } from "./abis/StickyVaultWithRouter"
export { StickyVaultRouter } from "./abis/StickyVaultRouter"


export const CONTRACTS = {
  FACTORY: "0x76fD9D07d5e4D889CAbED96884F15f7ebdcd6B63" as const,
  QUOTER: '0x35E02133b7Ee5E4cDE7cb7FF278a19c35d4cd965' as const,
  ROUTER: '0x86e02f3D4Cb55974B7EE7E7c98c199e65F9023a4' as const,
  MULTICALL: '0x2B35c459e86fABd62b9C37fb652091671C5aA3ad' as const,
  POSITION_MANAGER: '0xEf089afF769bC068520a1A90f0773037eF31fbBC' as const,
  UNIVERSAL_ROUTER: "0x66a9893cc07d91d95644aedd05d03f95e1dba8af" as const,

  STICKYVAULT_FACTORY: "0x18B9ABf2E821E2fE7A08Dc255d5a7e77fFc0b844" as const,
  STICKYVAULT_IMPLEMNTATION: "0x32a56Da6f958BBFB24797DD47C7d1146D55C4052" as const,
  STICKYVAULT_ROUTER: "0xbb962d8805e2B4AF087C4702F088Cf9BE9862F30" as const
} as const