import { useEffect, useMemo } from "react"
import { erc20Abi, formatUnits, maxUint128, type Address } from "viem"
import { Pool, Position } from "@uniswap/v3-sdk"
import { berachainBepolia } from "wagmi/chains"
import { Token } from "@uniswap/sdk-core"
import type { PositionData } from "./usePositions"
import { useAccount, useReadContract, useSimulateContract, useWaitForTransactionReceipt, useWriteContract } from "wagmi"
import { CONTRACTS_ADDRESS } from "../config/contractsAddress"
import { POSITION_MANAGER_ABI } from "../config/abis/positionManagerABI"

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
  const pool = positionData?.pool || null
  const position = positionData?.position || null

  /**
   * Datas calculate
   */
  const inRange = useMemo(() => {
    if (!pool || !position) return false
    return pool.tick >= position.tickLower && pool.tick < position.tickUpper
  }, [pool, position])

  const sdkPool = useMemo(() => {
    if (!pool) return null

    try {
      return new Pool(
        new Token(berachainBepolia.id, pool.token0.address, pool.token0.decimals, pool.token0.symbol, pool.token0.name),
        new Token(berachainBepolia.id, pool.token1.address, pool.token1.decimals, pool.token1.symbol, pool.token1.name),
        pool.fee,
        pool.sqrtPriceX96 || "0",
        pool.liquidity || "0",
        pool.tick
      )
    } catch (error) {
      console.error('Error when formating pool:', error)
      return null
    }
  }, [pool])

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

  const positionDetails = useMemo(() => {
    if (!sdkPosition) return null

    try {
      return {
        token0Amount: sdkPosition.amount0.toExact(),
        token1Amount: sdkPosition.amount1.toExact(),
        totalTokens: +sdkPosition.amount0.toFixed(6) + +sdkPosition.amount1.toFixed(6),
        currentPrice: sdkPosition.pool.token0Price.toSignificant(6),
        liquidityShare: pool?.liquidity && position?.liquidity ?
          ((Number(position.liquidity?.toString() || '0') / Number(pool.liquidity.toString())) * 100).toFixed(2) + '%' : '0%'
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

    return {
      token0Amount: parseFloat(formatUnits(BigInt(position.tokenOwed0), pool.token0.decimals)).toFixed(6),
      token1Amount: parseFloat(formatUnits(BigInt(position.tokenOwed1), pool.token1.decimals)).toFixed(6),
      hasUnclaimed: BigInt(position.tokenOwed0) > 0n || BigInt(position.tokenOwed1) > 0n
    }
  }, [pool, position])

  /**
   * allowance
   */
  const { data: token0Allowance = 0n, isLoading: isCheckingToken0Allowance, refetch: refetchT0Allowance } = useReadContract({
    address: (pool?.token0.address as Address),
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

  const { data: token1Allowance = 0n, isLoading: isCheckingToken1Allowance, refetch: refetchT1Allowance } = useReadContract({
    address: (pool?.token1?.address as Address),
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
    address: (pool?.token0?.address as Address),
    abi: erc20Abi,
    functionName: 'approve',
    args: [CONTRACTS_ADDRESS.positionManager, (datas?.addLiquidity?.t0Amount || 0n) * 105n / 100n],
    query: {
      enabled: !!pool && !!datas?.addLiquidity
    }
  })
  const { data: approveToken1Config } = useSimulateContract({
    address: (pool?.token1?.address as Address),
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
    console.log("apprive Receipt", approveToken0Receipt, approveToken1Receipt)
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
  const { data: addLiquidityTxHash, writeContract: addLiquidity, isPending: waitAddLiquidity } = useWriteContract()
  const { data: addLiquidityConfig } = useSimulateContract({
    address: CONTRACTS_ADDRESS.positionManager,
    abi: POSITION_MANAGER_ABI,
    functionName: "increaseLiquidity",
    args: (() => {
      if (!datas?.addLiquidity || !positionData) return undefined

      return [{
        tokenId: BigInt(positionData.nftTokenId),
        amount0Desired: datas.addLiquidity.t0Amount,
        amount1Desired: datas.addLiquidity.t1Amount,
        amount0Min: 0n,
        amount1Min: 0n,
        deadline: BigInt(Math.floor(Date.now() / 1000) + 1200) // 20m
      }]
    })(),
    query: {
      enabled: !!address && !!datas?.addLiquidity
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
  const { data: withdrawTxHash, writeContract: withdraw, isPending: waitWithdraw } = useWriteContract()
  const { data: withdrawConfig } = useSimulateContract({
    address: CONTRACTS_ADDRESS.positionManager,
    abi: POSITION_MANAGER_ABI,
    functionName: "decreaseLiquidity",
    args: (() => {
      if (!datas?.withdraw || !positionData) return undefined

      return [{
        tokenId: BigInt(positionData.nftTokenId),
        liquidity: datas.withdraw.liquidity || 0n,
        amount0Min: 0n,
        amount1Min: 0n,
        deadline: BigInt(Math.floor(Date.now() / 1000) + 1200) // 20m
      }]
    })(),
    query: {
      enabled: !!address && !!datas?.withdraw
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
  const { data: claimTxHash, writeContract: claim, isPending: waitClaim } = useWriteContract()
  const { data: claimConfig } = useSimulateContract({
    address: CONTRACTS_ADDRESS.positionManager,
    abi: POSITION_MANAGER_ABI,
    functionName: "collect",
    args: [{
      tokenId: BigInt(positionData?.nftTokenId || "0"),
      recipient: address || "0x00",
      amount0Max: maxUint128,
      amount1Max: maxUint128,
    }],
    query: {
      enabled: !!address && !!datas?.withdraw
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

    addLiquidityReceipt,
    withdrawReceipt,
    claimReceipt
  }
}
