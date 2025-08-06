import { createConfig, factory } from "ponder";
import { CONTRACTS, FactoryABI, PoolABI } from "@repo/contracts";

export default createConfig({
  database: {
    kind: "postgres",
    connectionString: process.env.DATABASE_URL,
  },
  chains: {
    mainnet: {
      id: 80094,
      rpc: process.env.PONDER_RPC_URL!,
    },
  },
  contracts: {
    WinnieFactory: {
      chain: "mainnet",
      abi: FactoryABI,
      address: CONTRACTS.FACTORY,
      startBlock: 7402490,
    },
    WinniePool: {
      chain: "mainnet",
      abi: PoolABI,
      address: factory({
        address: CONTRACTS.FACTORY,
        event: {
          anonymous: false,
          inputs: [
            { indexed: true, name: "token0", type: "address" },
            { indexed: true, name: "token1", type: "address" },
            { indexed: true, name: "fee", type: "uint24" },
            { indexed: false, name: "tickSpacing", type: "int24" },
            { indexed: false, name: "pool", type: "address" }
          ],
          name: "PoolCreated",
          type: "event"
        },
        parameter: "pool",
      }),
      startBlock: 7402490
    }
  },
});
