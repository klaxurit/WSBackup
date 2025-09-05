import { useState, useCallback, useMemo, useEffect } from 'react';
import { useAccount, useReadContract, useSimulateContract, useWaitForTransactionReceipt, useWriteContract } from 'wagmi';
import { CONTRACTS_ADDRESS } from '../config/contractsAddress';
import { StickyVaultRouter } from '../config/abis/StickyVaultRouter';
import { currentChain } from '../config/wagmi';
import { erc20Abi, type Address, type Hex } from 'viem';
import { StickyVaultWithRouter } from '../config/abis/StickyVaultWithRouter';



interface VaultConfig {
  vault?: any;
  amount0: bigint
  amount1: bigint
  slippageBps: number
}

export interface VaultManager {
  isReady: boolean
  quote: {
    amount0Max: bigint | null
    amount0Min: bigint | null
    amount1Max: bigint | null
    amount1Min: bigint | null
    minShares: bigint | null
  },
  isQuoted: boolean
  t0Allowance: {
    isNeed: boolean
    current?: bigint
    allow: () => void
    isLoading: boolean
    isApprove: boolean
    hash?: Hex
    refetch: () => void
  }
  t10Allowance: {
    isNeed: boolean
    current?: bigint
    allow: () => void
    isLoading: boolean
    isApprove: boolean
    hash?: Hex
    refetch: () => void
  }
  isAllow: boolean
  depositeTwoSide: {
    depose: () => void
    isPending: boolean
    hash?: Hex
  }
}

const bpsDown = (x: bigint, bps: number) =>
  (x * BigInt(10000 - bps)) / 10000n;
const pctBps = (x: bigint, bps: number) =>
  (x * BigInt(bps)) / 10_000n;

export const useVault = (config: VaultConfig) => {
  const { address } = useAccount();

  const vaultAddr: Address = config.vault?.id
  const isReady = !!address && !!vaultAddr && config.amount0 > 0n && config.amount1 > 0n

  // Setup Max amount
  const amount0Max = config.amount0
  const amount1Max = config.amount1

  // Quote
  const { data: quote } = useReadContract({
    address: vaultAddr,
    abi: StickyVaultWithRouter,
    functionName: "getMintAmounts",
    args: [amount0Max, amount1Max],
    query: {
      enabled: isReady
    }
  })

  // Slippage minima
  const [amount0Min, amount1Min, minShares] = useMemo(() => {
    if (!quote) return [null, null, null]
    return [
      bpsDown(quote[0], config.slippageBps),
      bpsDown(quote[1], config.slippageBps),
      bpsDown(quote[2], config.slippageBps)
    ]
  }, [quote])
  const isQuoted = !!amount0Max && !!amount0Min && !!amount1Max && !!amount1Min && !!minShares

  // Allowance token0
  const { data: t0Allowance, isLoading: loadT0Allowance, refetch: checkT0Allowance } = useReadContract({
    address: (config.vault?.poolRef?.token0Ref?.id as Address),
    abi: erc20Abi,
    functionName: "allowance",
    args: address ? [address, CONTRACTS_ADDRESS.STICKYVAULT_ROUTER] : undefined,
    query: {
      enabled: isQuoted
    }
  })
  const t0NeedApproval = (t0Allowance || 0n) < amount0Max
  const { data: approveT0Config } = useSimulateContract({
    address: (config.vault?.poolRef?.token0Ref?.id as Address),
    abi: erc20Abi,
    functionName: 'approve',
    args: [CONTRACTS_ADDRESS.STICKYVAULT_ROUTER, amount0Max],
    chainId: currentChain.id,
    query: {
      enabled: isQuoted && t0NeedApproval
    }
  })
  const { data: approveT0Hash, writeContract: approveT0, isPending: waitT0Approv } = useWriteContract()
  const t0ApproveResult = useWaitForTransactionReceipt({
    hash: approveT0Hash,
    query: {
      enabled: !!approveT0Hash
    }
  })
  useEffect(() => {
    if (t0ApproveResult.isSuccess) {
      checkT0Allowance()
    }
  }, [t0ApproveResult.isSuccess, checkT0Allowance])
  const handleApproveT0 = () => {
    if (!approveT0Config?.request) return
    approveT0(approveT0Config.request)
  }

  // Allowance token1
  const { data: t1Allowance, isLoading: loadT1Allowance, refetch: checkT1Allowance } = useReadContract({
    address: (config.vault?.poolRef?.token1Ref?.id as Address),
    abi: erc20Abi,
    functionName: "allowance",
    args: address ? [address, CONTRACTS_ADDRESS.STICKYVAULT_ROUTER] : undefined,
    query: {
      enabled: isQuoted
    }
  })
  const t1NeedApproval = (t1Allowance || 0n) < amount1Max
  const { data: approveT1Config } = useSimulateContract({
    address: (config.vault?.poolRef?.token1Ref?.id as Address),
    abi: erc20Abi,
    functionName: 'approve',
    args: [CONTRACTS_ADDRESS.STICKYVAULT_ROUTER, amount1Max],
    chainId: currentChain.id,
    query: {
      enabled: isQuoted && t1NeedApproval
    }
  })
  const { data: approveT1Hash, writeContract: approveT1, isPending: waitT1Approv } = useWriteContract()
  const t1ApproveResult = useWaitForTransactionReceipt({
    hash: approveT1Hash,
    query: {
      enabled: !!approveT1Hash
    }
  })
  useEffect(() => {
    if (t1ApproveResult.isSuccess) {
      checkT1Allowance()
    }
  }, [t1ApproveResult.isSuccess, checkT1Allowance])
  const handleApproveT1 = () => {
    if (!approveT1Config?.request) return
    approveT1(approveT1Config.request)
  }

  const isAllow = !t0NeedApproval && !t1NeedApproval

  // Deposite two side
  const { data: depositeTwoSideConfig } = useSimulateContract({
    address: CONTRACTS_ADDRESS.STICKYVAULT_ROUTER,
    abi: StickyVaultRouter,
    functionName: "addLiquidity",
    args: [vaultAddr, amount0Max, amount1Max, amount0Min!, amount1Min!, minShares!, address!],
    chainId: currentChain.id,
    query: {
      enabled: isQuoted && isAllow
    }
  })
  const { data: depositeTwoHash, writeContract: depositeTwo, isPending: waitDepositeTwo } = useWriteContract()
  const handleDepositeTwo = () => {
    if (!depositeTwoSideConfig) return
    depositeTwo(depositeTwoSideConfig.request)
  }

  return {
    isReady,
    quote: {
      amount0Max,
      amount0Min,
      amount1Max,
      amount1Min,
      minShares
    },
    isQuoted,
    t0Allowance: {
      isNeed: t0NeedApproval,
      current: t0Allowance,
      allow: handleApproveT0,
      isLoading: loadT0Allowance,
      isApprove: waitT0Approv,
      hash: approveT0Hash,
      refetch: checkT0Allowance
    },
    t10Allowance: {
      isNeed: t1NeedApproval,
      current: t1Allowance,
      allow: handleApproveT1,
      isLoading: loadT1Allowance,
      isApprove: waitT1Approv,
      hash: approveT1Hash,
      refetch: checkT1Allowance
    },
    isAllow,
    depositeTwoSide: {
      depose: handleDepositeTwo,
      isPending: waitDepositeTwo,
      hash: depositeTwoHash
    }
  }
  // const depositTwoSided = useCallback(async (params: DepositParams) => {
  //   if (!address) throw new Error('Wallet not connected');

  //   setIsLoading(true);
  //   setError(null);

  //   try {
  //     // Simulation d'un délai
  //     await new Promise(resolve => setTimeout(resolve, 2000));
  //     console.log('Mock depositTwoSided:', params);
  //     return { hash: '0x123...' };
  //   } catch (err: any) {
  //     setError(err.message);
  //     throw err;
  //   } finally {
  //     setIsLoading(false);
  //   }
  // }, [address, config]);

  // // Dépôt single-sided (version mockée)
  // const depositSingleSided = useCallback(async (params: SingleDepositParams) => {
  //   if (!address) throw new Error('Wallet not connected');

  //   setIsLoading(true);
  //   setError(null);

  //   try {
  //     // Simulation d'un délai
  //     await new Promise(resolve => setTimeout(resolve, 2000));
  //     console.log('Mock depositSingleSided:', params);
  //     return { hash: '0x456...' };
  //   } catch (err: any) {
  //     setError(err.message);
  //     throw err;
  //   } finally {
  //     setIsLoading(false);
  //   }
  // }, [address, config]);

  // // Retrait (version mockée)
  // const withdraw = useCallback(async (params: WithdrawParams) => {
  //   if (!address) throw new Error('Wallet not connected');

  //   setIsLoading(true);
  //   setError(null);

  //   try {
  //     // Simulation d'un délai
  //     await new Promise(resolve => setTimeout(resolve, 2000));
  //     console.log('Mock withdraw:', params);
  //     return { hash: '0x789...' };
  //   } catch (err: any) {
  //     setError(err.message);
  //     throw err;
  //   } finally {
  //     setIsLoading(false);
  //   }
  // }, [address, config]);

  // // Obtenir les informations du vault (version mockée)
  // const getVaultInfo = useCallback(async () => {
  //   try {
  //     // Retourner des données mockées
  //     return {
  //       token0Address: '0x1234567890123456789012345678901234567890',
  //       token1Address: '0x0987654321098765432109876543210987654321',
  //       symbol0: 'WBERA',
  //       symbol1: 'HONEY',
  //       decimals0: 18,
  //       decimals1: 18,
  //       totalSupply: '1000000000000000000000000'
  //     };
  //   } catch (err: any) {
  //     setError(err.message);
  //     throw err;
  //   }
  // }, []);

  // // Obtenir la position utilisateur (version mockée)
  // const getUserPosition = useCallback(async () => {
  //   if (!address) throw new Error('Wallet not connected');

  //   try {
  //     // Retourner des données mockées
  //     return {
  //       shares: '1234.56',
  //       valueUSD: 1500.00
  //     };
  //   } catch (err: any) {
  //     setError(err.message);
  //     throw err;
  //   }
  // }, [address, config]);

  // return {
  //   depositTwoSided,
  //   depositSingleSided,
  //   withdraw,
  //   getVaultInfo,
  //   getUserPosition,
  //   isLoading,
  //   error
  // };
};
