export { FactoryABI } from "./FactoryABI"
export { MockERC20ABI } from "./MockERC20ABI"
export { MultiCall2ABI } from "./MultiCall2ABI"
export { PoolABI } from "./PoolABI"
export { PositionManagerABI } from "./PositionManagerABI"
export { QuoterV2ABI } from "./QuoterV2ABI"
export { SwapRouterABI } from "./SwapRouterABI"
export { WBeraABI } from "./WBeraABI"
export { UniversalRouteABI } from "./UniversalRouteABI"


export const CONTRACTS = {
  FACTORY: "0x76fD9D07d5e4D889CAbED96884F15f7ebdcd6B63" as const,
  QUOTER: '0x35E02133b7Ee5E4cDE7cb7FF278a19c35d4cd965' as const,
  ROUTER: '0x86e02f3D4Cb55974B7EE7E7c98c199e65F9023a4' as const,
  MULTICALL: '0x2B35c459e86fABd62b9C37fb652091671C5aA3ad' as const,
  POSITION_MANAGER: '0xEf089afF769bC068520a1A90f0773037eF31fbBC' as const,
  UNIVERSAL_ROUTER: "0x66a9893cc07d91d95644aedd05d03f95e1dba8af" as const
} as const
