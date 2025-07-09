import type { Address } from "viem";

const TESTNET_CONTRACTS = {
  v3CoreFactory: '0x76fD9D07d5e4D889CAbED96884F15f7ebdcd6B63' as Address,
  quoterV2: '0x35E02133b7Ee5E4cDE7cb7FF278a19c35d4cd965' as Address,
  swapRouter02: '0x86e02f3D4Cb55974B7EE7E7c98c199e65F9023a4' as Address,
  multicall2: '0x2B35c459e86fABd62b9C37fb652091671C5aA3ad' as Address,
  positionManager: '0xEf089afF769bC068520a1A90f0773037eF31fbBC' as Address,
  universalRouter: "0x66a9893cc07d91d95644aedd05d03f95e1dba8af" as Address
}

const MAINNET_CONTRACTS = {
  v3CoreFactory: '0x76fD9D07d5e4D889CAbED96884F15f7ebdcd6B63' as Address,
  quoterV2: '0x35E02133b7Ee5E4cDE7cb7FF278a19c35d4cd965' as Address,
  swapRouter02: '0x86e02f3D4Cb55974B7EE7E7c98c199e65F9023a4' as Address,
  multicall2: '0x2B35c459e86fABd62b9C37fb652091671C5aA3ad' as Address,
  positionManager: '0xEf089afF769bC068520a1A90f0773037eF31fbBC' as Address,
  universalRouter: "0x66a9893cc07d91d95644aedd05d03f95e1dba8af" as Address
}

export const CONTRACTS_ADDRESS = import.meta.env.NODE_ENV === "production"
  ? MAINNET_CONTRACTS
  : TESTNET_CONTRACTS
