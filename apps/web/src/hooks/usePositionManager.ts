import { useEffect, useMemo } from "react"
import { erc20Abi, formatUnits, maxUint128, type Address } from "viem"
import { Pool, Position, TickMath } from "@uniswap/v3-sdk"
import { currentChain } from "../config/wagmi"
import { Token } from "@uniswap/sdk-core"
import { useAccount, useReadContract, useReadContracts, useSimulateContract, useWaitForTransactionReceipt, useWriteContract } from "wagmi"
import { CONTRACTS_ADDRESS } from "../config/contractsAddress"
import { POSITION_MANAGER_ABI } from "../config/abis/positionManagerABI"
import JSBI from "jsbi"

interface PoolToken {
  id: string;
  name: string;
  symbol: string;
  decimals: number;
  logoUri?: string;
  tokenDayData?: {
    items: { priceUSD: string }[];
  };
}

interface PoolData {
  id: string;
  feeTier: number;
  liquidity: string;
  sqrtPrice: string;
  tick?: number;
  token0Price: string;
  token1Price: string;
  totalValueLockedUSD: string;
  feeGrowthGlobal0X128: string;
  feeGrowthGlobal1X128: string;
  token0Ref: PoolToken;
  token1Ref: PoolToken;
  poolDayData?: {
    items: { apr: string }[];
  };
}

export interface PositionData {
  id: string;
  tokenId: string;
  owner: string;
  liquidity: string;
  tickLower: number;
  tickUpper: number;
  depositedToken0: string;
  depositedToken1: string;
  withdrawnToken0: string;
  withdrawnToken1: string;
  collectedFeesToken0: string;
  collectedFeesToken1: string;
  feeGrowthInside0LastX128: string;
  feeGrowthInside1LastX128: string;
  poolRef: PoolData;
}



export interface UsePositionManagerDatas {
  addLiquidity?: {
    t0Amount: bigint,
    t1Amount: bigint
  },
  withdraw?: {
    liquidity: bigint
  }
}

export const usePositionManager = (positionData?: PositionData, datas?: UsePositionManagerDatas) => {
  const { address } = useAccount()
  const pool = (positionData as PositionData)?.poolRef || null
  const position = (positionData as PositionData)?.id ? (positionData as PositionData) : null
  console.log("use", pool, position)

  const poolTick = useMemo(() => {
    if (!pool) return null
    return TickMath.getTickAtSqrtRatio(JSBI.BigInt(pool.sqrtPrice))
  }, [pool])
  /**
   * Datas calculate
   */
  const inRange = useMemo(() => {
    if (!poolTick || !position) return false
    return poolTick >= position.tickLower && poolTick < position.tickUpper
  }, [poolTick, position])

  const sdkPool = useMemo(() => {
    if (!pool || !poolTick) return null

    try {
      const poolData = pool as PoolData
      const token0 = poolData.token0Ref || (pool as any).token0
      const token1 = poolData.token1Ref || (pool as any).token1
      const feeTier = poolData.feeTier || (pool as any).fee
      const sqrtPrice = poolData.sqrtPrice || (pool as any).sqrtPriceX96
      const liquidity = poolData.liquidity || (pool as any).liquidity

      return new Pool(
        new Token(currentChain.id, token0.id || (token0 as any).address, token0.decimals, token0.symbol, token0.name),
        new Token(currentChain.id, token1.id || (token1 as any).address, token1.decimals, token1.symbol, token1.name),
        feeTier,
        sqrtPrice || "0",
        liquidity || "0",
        poolTick
      )
    } catch (error) {
      console.error('Error when formating pool:', error)
      return null
    }
  }, [pool, poolTick])

  const sdkPosition = useMemo(() => {
    if (!sdkPool || !position) return null

    try {
      return new Position({
        pool: sdkPool,
        tickLower: position.tickLower,
        tickUpper: position.tickUpper,
        liquidity: position.liquidity
      })
    } catch (error) {
      console.error('Error when formating position:', error)
      return null
    }
  }, [sdkPool, position])

  const { data: onChainPosition } = useReadContract({
    address: CONTRACTS_ADDRESS.positionManager,
    abi: POSITION_MANAGER_ABI,
    functionName: "positions",
    args: [BigInt(position?.tokenId || "0")],
    query: {
      enabled: !!position && !!position?.tokenId
    }
  })
  console.log(onChainPosition)

  const positionDetails = useMemo(() => {
    if (!sdkPosition) return null

    const t0Price = parseFloat(pool.token0Ref.tokenDayData?.items?.[0]?.priceUSD || "0")
    const t0Usd = parseFloat(sdkPosition.amount0.toExact()) * t0Price
    const t1Price = parseFloat(pool.token1Ref.tokenDayData?.items?.[0]?.priceUSD || "0")
    const t1Usd = parseFloat(sdkPosition.amount1.toExact()) * t1Price
    const posValueUSD = t0Usd + t1Usd

    try {
      return {
        token0Amount: sdkPosition.amount0.toExact(),
        token1Amount: sdkPosition.amount1.toExact(),
        token0USD: t0Usd,
        token1USD: t1Usd,
        totalTokens: +sdkPosition.amount0.toFixed(6) + +sdkPosition.amount1.toFixed(6),
        currentPrice: posValueUSD.toFixed(2),
        liquidityShare: ((posValueUSD / parseFloat(pool.totalValueLockedUSD)) * 100).toFixed(2)
        // liquidityShare: pool?.liquidity && position?.liquidity ?
        //   ((Number(position.liquidity?.toString() || '0') / Number(pool.liquidity.toString())) * 100).toFixed(2) + '%' : '0%'
      }
    } catch (error) {
      console.error("Error when calculate position's datas:", error)
      return null
    }
  }, [position, pool, sdkPosition])

  const unclaimedFees = useMemo(() => {
    if (!position || !pool) {
      return {
        token0Amount: 0,
        token1Amount: 0,
        hasUnclaimed: false
      }
    }

    // For new data structure, calculate fees if we have the data
    const poolData = pool as PoolData
    const positionData = onChainPosition
      ? {
        ...position,
        liquidity: onChainPosition[7],
        tickLower: onChainPosition[5],
        tickUpper: onChainPosition[6],
        feeGrowthInside0LastX128: onChainPosition[8],
        feeGrowthInside1LastX128: onChainPosition[9],
      }
      : position as PositionData

    if (poolData.feeGrowthGlobal0X128 && positionData.feeGrowthInside0LastX128) {
      const feeGrowthGlobal0 = BigInt(poolData.feeGrowthGlobal0X128);
      const feeGrowthGlobal1 = BigInt(poolData.feeGrowthGlobal1X128);
      const feeGrowthInside0Last = BigInt(positionData.feeGrowthInside0LastX128);
      const feeGrowthInside1Last = BigInt(positionData.feeGrowthInside1LastX128);

      const feeGrowth0 = feeGrowthGlobal0 - feeGrowthInside0Last;
      const feeGrowth1 = feeGrowthGlobal1 - feeGrowthInside1Last;

      const liquidity = BigInt(position.liquidity);
      const fees0 = (liquidity * feeGrowth0) >> 128n;
      const fees1 = (liquidity * feeGrowth1) >> 128n;

      const token0 = poolData.token0Ref || (pool as any).token0
      const token1 = poolData.token1Ref || (pool as any).token1

      return {
        token0Amount: parseFloat(formatUnits(fees0, token0.decimals)).toFixed(6),
        token1Amount: parseFloat(formatUnits(fees1, token1.decimals)).toFixed(6),
        hasUnclaimed: fees0 > 0n || fees1 > 0n
      }
    }

    // Fallback for old data structure or if fee calculation data is not available
    const oldPosition = position as any
    if (oldPosition.amount0 && oldPosition.amount1) {
      const token0 = (pool as any).token0
      const token1 = (pool as any).token1
      return {
        token0Amount: parseFloat(formatUnits(BigInt(oldPosition.amount0), token0.decimals)).toFixed(6),
        token1Amount: parseFloat(formatUnits(BigInt(oldPosition.amount1), token1.decimals)).toFixed(6),
        hasUnclaimed: BigInt(oldPosition.amount0) > 0n || BigInt(oldPosition.amount1) > 0n
      }
    }

    return {
      token0Amount: "0",
      token1Amount: "0",
      hasUnclaimed: false
    }
  }, [pool, position])

  /**
   * allowance
   */
  const token0Address = ((pool as PoolData)?.token0Ref?.id || (pool as any)?.token0?.address) as Address
  const { data: token0Allowance = 0n, isLoading: isCheckingToken0Allowance, refetch: refetchT0Allowance } = useReadContract({
    address: token0Address,
    abi: erc20Abi,
    functionName: "allowance",
    args: address ? [address, CONTRACTS_ADDRESS.positionManager] : undefined,
    query: {
      enabled: !!address && !!pool
    }
  })
  const token0NeedApproval = useMemo(() => {
    if (!datas?.addLiquidity) return false
    return token0Allowance < datas?.addLiquidity.t0Amount * 105n / 100n
  }, [token0Allowance, datas])

  const token1Address = ((pool as PoolData)?.token1Ref?.id || (pool as any)?.token1?.address) as Address
  const { data: token1Allowance = 0n, isLoading: isCheckingToken1Allowance, refetch: refetchT1Allowance } = useReadContract({
    address: token1Address,
    abi: erc20Abi,
    functionName: "allowance",
    args: address ? [address, CONTRACTS_ADDRESS.positionManager] : undefined,
    query: {
      enabled: !!address && !!pool
    }
  })
  const token1NeedApproval = useMemo(() => {
    if (!datas?.addLiquidity?.t1Amount) return false
    return token1Allowance < datas?.addLiquidity.t1Amount * 105n / 100n
  }, [token1Allowance, datas])

  /*
   * approval functions
   */
  const { data: approveToken0Config } = useSimulateContract({
    address: token0Address,
    abi: erc20Abi,
    functionName: 'approve',
    args: [CONTRACTS_ADDRESS.positionManager, (datas?.addLiquidity?.t0Amount || 0n) * 105n / 100n],
    query: {
      enabled: !!pool && !!datas?.addLiquidity
    }
  })
  const { data: approveToken1Config } = useSimulateContract({
    address: token1Address,
    abi: erc20Abi,
    functionName: 'approve',
    args: [CONTRACTS_ADDRESS.positionManager, (datas?.addLiquidity?.t1Amount || 0n) * 105n / 100n],
    query: {
      enabled: !!pool && !!datas?.addLiquidity
    }
  })

  const { data: approveToken0txHash, writeContract: approveToken0, isPending: isApprovingToken0 } = useWriteContract()
  const { data: approveToken1TxHash, writeContract: approveToken1, isPending: isApprovingToken1 } = useWriteContract()

  const handleApproveToken0 = () => {
    if (!approveToken0Config?.request) return
    approveToken0(approveToken0Config.request)
  }
  const handleApproveToken1 = () => {
    if (!approveToken1Config?.request) return
    approveToken1(approveToken1Config.request)
  }
  const { data: approveToken0Receipt, isLoading: waitingT0ApproveReceipt } = useWaitForTransactionReceipt({
    hash: approveToken0txHash
  })
  const { data: approveToken1Receipt, isLoading: waitingT1ApproveReceipt } = useWaitForTransactionReceipt({
    hash: approveToken1TxHash
  })

  useEffect(() => {
    if (approveToken0Receipt) {
      refetchT0Allowance()
    }
    if (approveToken1Receipt) {
      refetchT1Allowance()
    }
  }, [approveToken0Receipt, approveToken1Receipt, refetchT0Allowance, refetchT1Allowance])

  /**
   * Main functions
   */

  // Deposite
  const { data: addLiquidityTxHash, writeContract: addLiquidity, isPending: waitAddLiquidity, reset: addLiquidityReset } = useWriteContract()
  const { data: addLiquidityConfig } = useSimulateContract({
    address: CONTRACTS_ADDRESS.positionManager,
    abi: POSITION_MANAGER_ABI,
    functionName: "increaseLiquidity",
    args: (() => {
      if (!datas?.addLiquidity || !positionData) return undefined

      return [{
        tokenId: BigInt(position!.tokenId),
        amount0Desired: datas.addLiquidity.t0Amount,
        amount1Desired: datas.addLiquidity.t1Amount,
        amount0Min: 0n,
        amount1Min: 0n,
        deadline: BigInt(Math.floor(Date.now() / 1000) + 1200) // 20m
      }]
    })(),
    query: {
      enabled: !!address && !!datas?.addLiquidity && !!position
    }
  })
  const handleAddLiquidity = async () => {
    if (!addLiquidityConfig?.request) return
    addLiquidity(addLiquidityConfig.request)
  }
  const { data: addLiquidityReceipt, isLoading: waitingAddLiquidityReceipt } = useWaitForTransactionReceipt({
    hash: addLiquidityTxHash
  })

  // Withdraw
  const { data: withdrawTxHash, writeContract: withdraw, isPending: waitWithdraw, reset: withdrawReset } = useWriteContract()
  const { data: withdrawConfig } = useSimulateContract({
    address: CONTRACTS_ADDRESS.positionManager,
    abi: POSITION_MANAGER_ABI,
    functionName: "decreaseLiquidity",
    args: (() => {
      if (!datas?.withdraw || !positionData) return undefined

      return [{
        tokenId: BigInt(position!.tokenId),
        liquidity: datas.withdraw.liquidity || 0n,
        amount0Min: 0n,
        amount1Min: 0n,
        deadline: BigInt(Math.floor(Date.now() / 1000) + 1200) // 20m
      }]
    })(),
    query: {
      enabled: !!address && !!datas?.withdraw && !!position
    }
  })
  const handleWithdraw = async () => {
    if (!withdrawConfig?.request) return
    withdraw(withdrawConfig.request)
  }
  const { data: withdrawReceipt, isLoading: waitWithdrawReceipt } = useWaitForTransactionReceipt({
    hash: withdrawTxHash
  })

  // Claim
  const { data: claimTxHash, writeContract: claim, isPending: waitClaim, reset: claimReset } = useWriteContract()
  const { data: claimConfig } = useSimulateContract({
    address: CONTRACTS_ADDRESS.positionManager,
    abi: POSITION_MANAGER_ABI,
    functionName: "collect",
    args: [{
      tokenId: BigInt(position?.tokenId || "0"),
      recipient: address || "0x00",
      amount0Max: maxUint128,
      amount1Max: maxUint128,
    }],
    query: {
      enabled: !!address
    }
  })
  const handleClaim = async () => {
    if (!claimConfig?.request) return
    claim(claimConfig.request)
  }
  const { data: claimReceipt, isLoading: waitClaimReceipt } = useWaitForTransactionReceipt({
    hash: claimTxHash
  })

  /**
   * State Management
   */
  const status = useMemo(() => {
    if (isCheckingToken0Allowance || isCheckingToken1Allowance) return "fetchAllowance"
    if (isApprovingToken0 || isApprovingToken1) return "waitUserApprovement"
    if (waitingT0ApproveReceipt || waitingT1ApproveReceipt) return "waitApprovementReceipt"
    if (waitAddLiquidity || waitWithdraw || waitClaim) return "waitMainUserSign"
    if (waitingAddLiquidityReceipt || waitWithdrawReceipt || waitClaimReceipt) return "waitMainReceipt"

    if (token0NeedApproval) return "needT0Approve"
    if (token1NeedApproval) return "needT1Approve"

    return "idle"
  }, [
    isCheckingToken0Allowance,
    isCheckingToken1Allowance,
    isApprovingToken0,
    isApprovingToken1,
    waitingT0ApproveReceipt,
    waitingT1ApproveReceipt,
    token0NeedApproval,
    token1NeedApproval,
    waitAddLiquidity,
    waitingAddLiquidityReceipt,
    waitWithdraw,
    waitWithdrawReceipt,
    waitClaim,
    waitClaimReceipt
  ])

  return {
    status,
    token0NeedApproval,
    token1NeedApproval,

    inRange,
    positionDetails,
    unclaimedFees,

    approveToken0: handleApproveToken0,
    approveToken1: handleApproveToken1,
    addLiquidity: handleAddLiquidity,
    withdraw: handleWithdraw,
    claim: handleClaim,

    canAddLiquidity: !!addLiquidityConfig?.request,
    canWithdraw: !!withdrawConfig?.request,
    canClaim: !!claimConfig?.request,

    reset: () => {
      addLiquidityReset()
      claimReset()
      withdrawReset()
    },

    addLiquidityTxHash,
    claimTxHash,
    withdrawTxHash,

    addLiquidityReceipt,
    withdrawReceipt,
    claimReceipt
  }
}
