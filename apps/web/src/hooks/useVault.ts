import { useMemo, useEffect } from 'react';
import { useAccount, useReadContract, useSimulateContract, useWaitForTransactionReceipt, useWriteContract } from 'wagmi';
import { CONTRACTS_ADDRESS } from '../config/contractsAddress';
import { StickyVaultRouter } from '../config/abis/StickyVaultRouter';
import { currentChain } from '../config/wagmi';
import { encodeFunctionData, erc20Abi, type Address, type Hex } from 'viem';
import { StickyVaultWithRouter } from '../config/abis/StickyVaultWithRouter';
import { useSwap } from './swap/useSwap';

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
    error: any
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

  console.log("---------------------------------")
  console.log("Etape 1 - Config")
  console.log("Token in", oneSideTokenIn)
  console.log("Token out", oneSideTokenOut)
  console.log("TotalAmount in", config.amountOneSide)
  console.log("moitié pour swap", config.amountOneSide / 2n)
  // Deposite One side
  const swap = useSwap({
    tokenIn: oneSideTokenIn,
    tokenOut: oneSideTokenOut,
    amountIn: config.amountOneSide / 2n,
  })
  console.log("---------------------------------")
  console.log("Etape 2 - swap quote")
  console.log("amountOut", swap?.quote?.amountOut)
  console.log("amountOut Min", swap?.quote?.amountOutMinimum)
  const swapData = useMemo(() => {
    if (swap.status !== "ready" || !swap?.quote?.amountOut || !swap.optimizedRoute?.transactionData?.args) return null

    const functionName = swap.optimizedRoute?.transactionData?.functionName
    const to = swap.optimizedRoute?.transactionData?.to
    if (!functionName || !to) return null

    const abi = swap.optimizedRoute?.transactionData?.abi.filter((a: any) => a.name === functionName)
    if (!abi[0].inputs) return null
    console.log("args routeData", swap.optimizedRoute.transactionData.args)
    const routeDataCalldata = encodeFunctionData({
      abi: abi,
      functionName: functionName,
      args: swap.optimizedRoute.transactionData.args
    })

    return {
      router: to,
      amountIn: config.amountOneSide / 2n,
      // minAmountOut: swap.quote.amountOutMinimum,
      minAmountOut: bpsDown(swap.quote.amountOutMinimum, 100),
      zeroForOne: config.tokenOneSide === "token0",
      routeData: routeDataCalldata
    }
  }, [swap])

  const { data: osQuote } = useReadContract({
    address: vaultAddr,
    abi: StickyVaultWithRouter,
    functionName: "getMintAmounts",
    args: [config.amountOneSide / 2n, swap.quote?.amountOut ?? 0n],
    query: {
      enabled: isReady && isOneSide && isAllow && !!swap.quote
    }
  })
  console.log("---------------------------------")
  console.log("Etape 3 - Get Mint amount")
  console.log("swapData", swapData)
  console.log("shares", osQuote?.[2])
  console.log("quote", osQuote)
  console.log("Args de la simulation (tx)", [
    vaultAddr,
    config.amountOneSide,
    bpsDown(osQuote?.[2] ?? 0n, config.slippageBps),
    BigInt(config.slippageBps),
    swapData!,
    address!
  ])
  const { data: depositeOneSideConfig, error: osSimErr } = useSimulateContract({
    address: CONTRACTS_ADDRESS.STICKYVAULT_ROUTER,
    abi: StickyVaultRouter,
    functionName: "addLiquiditySingle",
    args: [
      vaultAddr,
      config.amountOneSide,
      bpsDown(osQuote?.[2] ?? 0n, config.slippageBps),
      BigInt(config.slippageBps),
      swapData!,
      address!
    ],
    query: {
      enabled: isOneSide && isReady && !!swapData && !!osQuote && isAllow
    }
  })
  console.log("Etape 4 - Simulate")
  console.log("Sim config", depositeOneSideConfig)
  console.log("Sim error", osSimErr)
  const { data: depositeOneHash, writeContract: depositeone, isPending: waitDepositeOne, error: osWriteErr } = useWriteContract()
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
      hash: depositeOneHash,
      error: osSimErr || osWriteErr
    },
    withdraw: {
      burn: handleBurn,
      isPending: waitBurn,
      hash: burnHash
    }
  }
};
