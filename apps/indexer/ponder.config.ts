import { createConfig, factory } from "ponder";
import { CONTRACTS, FactoryABI, PoolABI, PositionManagerABI, StickyVaultFactoryABI, StickyVaultRouter, StickyVaultWithRouter, AutoWinFactoryABI, AutowinABI } from "./src/utils/abi";

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
    v3Factory: {
      chain: "mainnet",
      abi: FactoryABI,
      address: CONTRACTS.FACTORY,
      startBlock: 7402490,
    },
    v3Pool: {
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
      startBlock: 7402490,
    },
    v3PositionManager: {
      chain: "mainnet",
      abi: PositionManagerABI,
      address: CONTRACTS.POSITION_MANAGER,
      startBlock: 7402490,
    },
    svFactory: {
      chain: "mainnet",
      abi: StickyVaultFactoryABI,
      address: CONTRACTS.STICKYVAULT_FACTORY,
      startBlock: 9742600
    },
    svVaults: {
      chain: "mainnet",
      abi: StickyVaultWithRouter,
      address: factory({
        address: CONTRACTS.STICKYVAULT_FACTORY,
        event: {
          anonymous: false,
          inputs: [
            { indexed: true, name: "uniPool", type: "address" },
            { indexed: true, name: "manager", type: "address" },
            { indexed: true, name: "stickyVault", type: "address" },
            { indexed: false, name: "implementation", type: "address" },
          ],
          name: "StickyVaultCreated",
          type: "event"
        },
        parameter: "stickyVault"
      }),
      startBlock: 9742600
    },
    svRouter: {
      chain: "mainnet",
      abi: StickyVaultRouter,
      address: CONTRACTS.STICKYVAULT_ROUTER,
      startBlock: 9742600
    },
    autoWinFactory: {
      chain: "mainnet",
      abi: AutoWinFactoryABI,
      address: CONTRACTS.AUTOWIN_FACTORY,
      startBlock: 9742600
    },
    autoWinVaults: {
      chain: "mainnet",
      abi: AutowinABI,
      address: factory({
        address: CONTRACTS.AUTOWIN_FACTORY,
        event: {
          anonymous: false,
          inputs: [
            { indexed: true, name: "autoWin", type: "address" },
            { indexed: false, name: "implementation", type: "address" },
            { indexed: true, name: "stakingToken", type: "address" }
          ],
          name: "AutoWinDeployed",
          type: "event"
        },
        parameter: "autoWin"
      }),
      startBlock: 9742600
    }
  },
  // blocks: {
  //   autoStatsUpdate: {
  //     chain: 'mainnet',
  //     interval: 10,
  //     startBlock: 9742600
  //   }
  // }
});
