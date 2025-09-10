import { useMemo, useEffect } from 'react';
import { useAccount, useReadContract, useSimulateContract, useWaitForTransactionReceipt, useWriteContract } from 'wagmi';
import { CONTRACTS_ADDRESS } from '../config/contractsAddress';
import { StickyVaultRouter } from '../config/abis/StickyVaultRouter';
import { currentChain } from '../config/wagmi';
import { encodeAbiParameters, erc20Abi, type Address, type Hex } from 'viem';
import { StickyVaultWithRouter } from '../config/abis/StickyVaultWithRouter';
import { useSwap } from './useSwap';

interface VaultConfig {
  vault?: any;
  amount0: bigint
  amount1: bigint
  amountOneSide: bigint
  tokenOneSide: 'token0' | 'token1'
  burnAmount: bigint
  slippageBps: number
  mode: "double" | "single" | "withdraw"
}

export interface VaultManager {
  mode: "double" | "single" | "withdraw",
  isDeposite: boolean
  isWithdraw: boolean
  isReady: boolean
  isOneSide: boolean
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
  t1Allowance: {
    isNeed: boolean
    current?: bigint
    allow: () => void
    isLoading: boolean
    isApprove: boolean
    hash?: Hex
    refetch: () => void
  },
  osAllowance: {
    isNeed: boolean
    current?: bigint
    allow: () => void
    isLoading: boolean
    isApprove: boolean
    hash?: Hex
    refetch: () => void
  }
  burnAllowance: {
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
  },
  depositeOneSide: {
    depose: () => void
    isPending: boolean
    hash?: Hex
  },
  withdraw: {
    burn: () => void
    isPending: boolean
    hash?: Hex
  }
}

const bpsDown = (x: bigint, bps: number) =>
  (x * BigInt(10000 - bps)) / 10000n;
// const pctBps = (x: bigint, bps: number) =>
//   (x * BigInt(bps)) / 10_000n;

export const useVault = (config: VaultConfig): VaultManager => {
  const { address } = useAccount();

  const vaultAddr: Address = config.vault?.id

  const isDeposite = config.mode === "double" || config.mode === "single"
  const isWithdraw = config.mode === "withdraw"
  const isOneSide = config.mode === "single"

  const oneSideTokenIn = config.tokenOneSide === "token0"
    ? config.vault?.poolRef?.token0Ref?.id as Address
    : config.vault?.poolRef?.token1Ref?.id as Address
  const oneSideTokenOut = config.tokenOneSide === "token0"
    ? config.vault?.poolRef?.token1Ref?.id as Address
    : config.vault?.poolRef?.token0Ref?.id as Address

  const isReady = isDeposite
    ? !!address && !!vaultAddr && (config.mode === "double" ? (config.amount0 > 0n && config.amount1 > 0n) : (config.amountOneSide > 0n && !!oneSideTokenIn))
    : !!address && !!vaultAddr && config.burnAmount > 0n

  // Setup Max amount
  const amount0Max = config.amount0
  const amount1Max = config.amount1

  // Deposite - Quote
  const { data: quote } = useReadContract({
    address: vaultAddr,
    abi: StickyVaultWithRouter,
    functionName: "getMintAmounts",
    args: [amount0Max, amount1Max],
    query: {
      enabled: isReady && isDeposite
    }
  })

  // Deposite - Slippage minima
  const [amount0Min, amount1Min, minShares] = useMemo(() => {
    if (!quote) return [null, null, null]
    return [
      bpsDown(quote[0], config.slippageBps),
      bpsDown(quote[1], config.slippageBps),
      bpsDown(quote[2], config.slippageBps)
    ]
  }, [quote])
  const isQuoted = !!amount0Max && !!amount0Min && !!amount1Max && !!amount1Min && !!minShares

  // Deposite - Two Side - Allowance token0
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

  // Deposite - Two Side - Allowance token1
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

  // Deposite - One Side - Allowance token
  const { data: osAllowance, isLoading: osLoadAllowance, refetch: osCheckAllowance } = useReadContract({
    address: oneSideTokenIn,
    abi: erc20Abi,
    functionName: "allowance",
    args: address ? [address, CONTRACTS_ADDRESS.STICKYVAULT_ROUTER] : undefined,
    query: {
      enabled: isOneSide && isReady
    }
  })
  const osNeedApproval = (osAllowance || 0n) < config.amountOneSide
  const { data: osApproveConfig } = useSimulateContract({
    address: oneSideTokenIn,
    abi: erc20Abi,
    functionName: 'approve',
    args: [CONTRACTS_ADDRESS.STICKYVAULT_ROUTER, config.amountOneSide],
    chainId: currentChain.id,
    query: {
      enabled: isOneSide && isReady && osNeedApproval
    }
  })
  const { data: osApproveHash, writeContract: osApprove, isPending: osWaitApprov } = useWriteContract()
  const osApproveResult = useWaitForTransactionReceipt({
    hash: osApproveHash,
    query: {
      enabled: !!osApproveHash
    }
  })
  useEffect(() => {
    if (osApproveResult.isSuccess) {
      osCheckAllowance()
    }
  }, [osApproveResult.isSuccess, osCheckAllowance])
  const osHandleApprove = () => {
    if (!osApproveConfig?.request) return
    osApprove(osApproveConfig.request)
  }

  // Withdraw - Allowance VaultErc20
  const { data: burnAllowance, isLoading: loadBurnAllowance, refetch: checkBurnAllowance } = useReadContract({
    address: vaultAddr,
    abi: erc20Abi,
    functionName: "allowance",
    args: address ? [address, CONTRACTS_ADDRESS.STICKYVAULT_ROUTER] : undefined,
    query: {
      enabled: isWithdraw && isReady
    }
  })
  const burnNeedApproval = (burnAllowance || 0n) < config.burnAmount
  const { data: approveBurnConfig } = useSimulateContract({
    address: vaultAddr,
    abi: erc20Abi,
    functionName: 'approve',
    args: [CONTRACTS_ADDRESS.STICKYVAULT_ROUTER, config.burnAmount],
    chainId: currentChain.id,
    query: {
      enabled: isWithdraw && burnNeedApproval
    }
  })
  const { data: approveBurnHash, writeContract: approveBurn, isPending: waitBurnApprov } = useWriteContract()
  const burnApproveResult = useWaitForTransactionReceipt({
    hash: approveBurnHash,
    query: {
      enabled: !!approveBurnHash
    }
  })
  useEffect(() => {
    if (burnApproveResult.isSuccess) {
      checkBurnAllowance()
    }
  }, [t1ApproveResult.isSuccess, checkT1Allowance])
  const handleApproveBurn = () => {
    if (!approveBurnConfig?.request) return
    approveBurn(approveBurnConfig.request)
  }

  const isAllow = isDeposite
    ? isOneSide ? !osNeedApproval : !t0NeedApproval && !t1NeedApproval
    : !burnNeedApproval

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

  // Deposite One side
  const swap = useSwap({
    tokenIn: oneSideTokenIn,
    tokenOut: oneSideTokenOut,
    amountIn: config.amountOneSide / 2n,
  })
  const swapData = useMemo(() => {
    if (swap.status !== "ready" || !swap?.quote?.amountOutMinimum || !swap.optimizedRoute?.transactionData?.args) return null

    const functionName = swap.optimizedRoute?.transactionData?.functionName
    const to = swap.optimizedRoute?.transactionData?.to
    if (!functionName || !to) return null
    const abi = swap.optimizedRoute?.transactionData?.abi.filter((a: any) => a.name === functionName)
    if (!abi[0].inputs) return null

    return {
      router: to,
      amountIn: config.amountOneSide,
      minAmountOut: swap.quote.amountOutMinimum,
      zeroForOne: config.tokenOneSide === "token0",
      routeData: encodeAbiParameters(
        abi[0].inputs,
        swap.optimizedRoute.transactionData.args
      )
    }
  }, [swap])
  const { data: osQuote } = useReadContract({
    address: vaultAddr,
    abi: StickyVaultWithRouter,
    functionName: "getMintAmounts",
    args: [config.amountOneSide / 2n, (swap.quote?.amountOut || 0n)],
    query: {
      enabled: isReady && isOneSide && isAllow && !!swap.quote
    }
  })
  const { data: depositeOneSideConfig } = useSimulateContract({
    address: CONTRACTS_ADDRESS.STICKYVAULT_ROUTER,
    abi: StickyVaultRouter,
    functionName: "addLiquiditySingle",
    args: [
      vaultAddr,
      config.amountOneSide,
      bpsDown((osQuote?.[2] || 0n), config.slippageBps),
      BigInt(config.slippageBps),
      swapData!,
      address!
    ],
    query: {
      enabled: isOneSide && isReady && !!swapData && !!osQuote && isAllow
    }
  })
  console.log("ICI", depositeOneSideConfig)
  const { data: depositeOneHash, writeContract: depositeone, isPending: waitDepositeOne } = useWriteContract()
  const handleDepositeOne = () => {
    if (!depositeOneSideConfig) return
    depositeone(depositeOneSideConfig.request)
  }

  // Withdraw
  const { data: burnConfig } = useSimulateContract({
    address: CONTRACTS_ADDRESS.STICKYVAULT_ROUTER,
    abi: StickyVaultRouter,
    functionName: "removeLiquidity",
    args: [vaultAddr, config.burnAmount, 0n, 0n, address!],
    chainId: currentChain.id,
    query: {
      enabled: isWithdraw && isAllow
    }
  })
  const { data: burnHash, writeContract: burn, isPending: waitBurn } = useWriteContract()
  const handleBurn = () => {
    if (!burnConfig) return
    const min0 = bpsDown(burnConfig.result[0], config.slippageBps);
    const min1 = bpsDown(burnConfig.result[1], config.slippageBps);
    burn({
      ...burnConfig.request,
      args: [vaultAddr, config.burnAmount, min0, min1, address!]
    })
  }


  return {
    mode: config.mode,
    isDeposite,
    isWithdraw,
    isReady,
    isOneSide,
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
    t1Allowance: {
      isNeed: t1NeedApproval,
      current: t1Allowance,
      allow: handleApproveT1,
      isLoading: loadT1Allowance,
      isApprove: waitT1Approv,
      hash: approveT1Hash,
      refetch: checkT1Allowance
    },
    osAllowance: {
      isNeed: osNeedApproval,
      current: osAllowance,
      allow: osHandleApprove,
      isLoading: osLoadAllowance,
      isApprove: osWaitApprov,
      hash: osApproveHash,
      refetch: osCheckAllowance
    },
    burnAllowance: {
      isNeed: burnNeedApproval,
      current: burnAllowance,
      allow: handleApproveBurn,
      isLoading: loadBurnAllowance,
      isApprove: waitBurnApprov,
      hash: approveBurnHash,
      refetch: checkBurnAllowance
    },
    isAllow,
    depositeTwoSide: {
      depose: handleDepositeTwo,
      isPending: waitDepositeTwo,
      hash: depositeTwoHash
    },
    depositeOneSide: {
      depose: handleDepositeOne,
      isPending: waitDepositeOne,
      hash: depositeOneHash
    },
    withdraw: {
      burn: handleBurn,
      isPending: waitBurn,
      hash: burnHash
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
