import { useMemo, useCallback, useEffect } from "react"
import { formatUnits, erc20Abi, encodeFunctionData, maxUint128, type Address } from "viem"
import { Pool as PoolV3, Position as PositionV3 } from "@uniswap/v3-sdk"
import { currentChain } from "../../config/wagmi"
import { Token } from "@uniswap/sdk-core"
import { useAccount, useReadContract, useReadContracts, useSimulateContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi"
import { CONTRACTS_ADDRESS } from "../../config/contractsAddress"
import { POSITION_MANAGER_ABI } from "../../config/abis/positionManagerABI"
import type { Pool } from "../../pages/PoolPage/page"

export interface Position {
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
}

export interface UsePositionManagerDatas {
  addLiquidity?: {
    t0Amount: bigint;
    t1Amount: bigint;
  };
  withdraw?: {
    liquidity: bigint;
  };
}

const emptyPosition = {
  isReady: false,
  inRange: false,
  positionDetails: null,
  unclaimedFees: null
}

export const usePositionDatas = (position: Position, pool: Pool) => {
  if (!position || !pool) return emptyPosition

  // Récupération des balances pour validation
  // query: { enabled: !!address && !!pool?.token0Ref.id }
  // const { data: balances } = useReadContracts({
  //   contracts: [
  //     // {
  //     //   address: zeroAddress,
  //     //   abi: erc20Abi,
  //     //   functionName: "balanceOf",
  //     //   args: address ? [address] : undefined
  //     // },
  //     {
  //       address: pool?.token0Ref.id as Address || zeroAddress,
  //       abi: erc20Abi,
  //       functionName: "balanceOf",
  //       args: address ? [address] : undefined,
  //     },
  //     {
  //       address: pool?.token1Ref.id as Address || zeroAddress,
  //       abi: erc20Abi,
  //       functionName: "balanceOf",
  //       args: address ? [address] : undefined
  //     }
  //   ],
  //   query: { enabled: !!address }
  // })
  // const ethBalance = 0n
  // const token0Balance = balances?.[0].status === "success" ? balances?.[0].result : 0n
  // const token1Balance = balances?.[1].status === "success" ? balances?.[1].result : 0n

  // Fonction de validation avant transaction
  // const validateTransaction = useMemo(() => {
  //   return (type: 'add' | 'withdraw' | 'claim') => {
  //     const errors: string[] = [];

  //     if (type === 'add' && datas?.addLiquidity) {
  //       // Vérifier que les montants sont saisis
  //       if (!datas.addLiquidity.t0Amount || datas.addLiquidity.t0Amount === 0n) {
  //         errors.push(`Enter ${pool?.token0Ref?.symbol || 'token0'} amount`);
  //       }
  //       if (!datas.addLiquidity.t1Amount || datas.addLiquidity.t1Amount === 0n) {
  //         errors.push(`Enter ${pool?.token1Ref?.symbol || 'token1'} amount`);
  //       }

  //       // Vérifier les balances de tokens
  //       if (token0Balance && datas.addLiquidity.t0Amount > token0Balance) {
  //         errors.push(`Insufficient ${pool?.token0Ref?.symbol || 'token0'} balance`);
  //       }
  //       if (token1Balance && datas.addLiquidity.t1Amount > token1Balance) {
  //         errors.push(`Insufficient ${pool?.token1Ref?.symbol || 'token1'} balance`);
  //       }
  //     }

  //     if (type === 'withdraw' && datas?.withdraw) {
  //       // Vérifier que la quantité de liquidité est saisie
  //       if (!datas.withdraw.liquidity || datas.withdraw.liquidity === 0n) {
  //         errors.push('Enter liquidity amount to remove');
  //       }

  //       // Vérifier que la position a assez de liquidité
  //       if (position && datas.withdraw.liquidity > BigInt(position.liquidity)) {
  //         errors.push('Amount exceeds position liquidity');
  //       }
  //     }

  //     // Vérifier le balance ETH pour le gas (estimation approximative)
  //     if (ethBalance && ethBalance.value < parseUnits("0.001", 18)) {
  //       errors.push('Insufficient ETH for gas fees');
  //     }

  //     return {
  //       isValid: errors.length === 0,
  //       errors
  //     };
  //   };
  // }, [token0Balance, token1Balance, ethBalance, datas, pool, position]);

  // // Fonctions pour déterminer si les boutons doivent être activés
  // const canAttemptAddLiquidity = useMemo(() => {
  //   return !!address &&
  //     !!datas?.addLiquidity &&
  //     !!datas.addLiquidity.t0Amount &&
  //     !!datas.addLiquidity.t1Amount &&
  //     datas.addLiquidity.t0Amount > 0n &&
  //     datas.addLiquidity.t1Amount > 0n;
  // }, [address, datas]);

  // const canAttemptWithdraw = useMemo(() => {
  //   return !!address &&
  //     !!datas?.withdraw &&
  //     !!datas.withdraw.liquidity &&
  //     datas.withdraw.liquidity > 0n;
  // }, [address, datas]);

  /**
   * Datas calculate
   */
  const inRange = useMemo(() => {
    if (!pool.tick || !position) return false
    return pool.tick >= position.tickLower && pool.tick < position.tickUpper
  }, [pool, position])

  const sdkPool = useMemo(() => {
    try {
      return new PoolV3(
        new Token(currentChain.id, pool.token0Ref.id, pool.token0Ref.decimals, pool.token0Ref.symbol, pool.token0Ref.name),
        new Token(currentChain.id, pool.token1Ref.id, pool.token1Ref.decimals, pool.token1Ref.symbol, pool.token1Ref.name),
        pool.feeTier,
        pool.sqrtPrice,
        pool.liquidity,
        pool.tick || 0
      )
    } catch (error) {
      console.error('Error when formating pool:', error)
      return null
    }
  }, [pool])

  const sdkPosition = useMemo(() => {
    if (!sdkPool) return null

    try {
      return new PositionV3({
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
    args: [BigInt(position.tokenId)]
  })

  const formatTokenAmount = useMemo(() => {
    return (amount: string): string => {
      const num = parseFloat(amount);
      if (num === 0) return "0";

      // Si très petit nombre, afficher plus de décimales
      if (num < 0.01) return num.toFixed(6);
      if (num < 1) return num.toFixed(4);
      if (num < 100) return num.toFixed(2);
      return num.toLocaleString('en-US', { maximumFractionDigits: 2 });
    };
  }, []);

  const formatLiquidity = useMemo(() => {
    return (liquidity: string): string => {
      try {
        return BigInt(liquidity).toLocaleString('en-US');
      } catch (error) {
        return "0";
      }
    };
  }, []);

  const positionDetails = useMemo(() => {
    if (!sdkPosition) return null

    const t0Price = parseFloat(pool.token0Ref.tokenDayData?.items?.[0]?.priceUSD || "0")
    const t0Usd = parseFloat(sdkPosition.amount0.toExact()) * t0Price
    const t1Price = parseFloat(pool.token1Ref.tokenDayData?.items?.[0]?.priceUSD || "0")
    const t1Usd = parseFloat(sdkPosition.amount1.toExact()) * t1Price
    const posValueUSD = t0Usd + t1Usd

    try {
      return {
        token0Amount: formatTokenAmount(sdkPosition.amount0.toExact()),
        token1Amount: formatTokenAmount(sdkPosition.amount1.toExact()),
        token0USD: t0Usd,
        token1USD: t1Usd,
        positionValueUSD: posValueUSD,  // Valeur totale de la position en USD
        liquidityAmount: formatLiquidity(position?.liquidity || "0"),  // Quantité de liquidité formatée
        liquidityShare: ((posValueUSD / parseFloat(pool.totalValueLockedUSD)) * 100).toFixed(2)
      }
    } catch (error) {
      console.error("Error when calculate position's datas:", error)
      return null
    }
  }, [position, pool, sdkPosition])


  const unclaimedFees = useMemo(() => {
    if (!position || !pool) {
      return {
        token0Amount: "0",
        token1Amount: "0",
        hasUnclaimed: false
      }
    }

    if (onChainPosition) {
      const tokensOwed0 = onChainPosition[10]; // tokensOwed0 from positions() call
      const tokensOwed1 = onChainPosition[11]; // tokensOwed1 from positions() call

      const token0 = pool.token0Ref || (pool as any).token0
      const token1 = pool.token1Ref || (pool as any).token1

      return {
        token0Amount: formatTokenAmount(formatUnits(tokensOwed0, token0.decimals)),
        token1Amount: formatTokenAmount(formatUnits(tokensOwed1, token1.decimals)),
        hasUnclaimed: tokensOwed0 > 0n || tokensOwed1 > 0n
      }
    }

    if (pool.feeGrowthGlobal0X128 && position.feeGrowthInside0LastX128) {
      const feeGrowthGlobal0 = BigInt(pool.feeGrowthGlobal0X128);
      const feeGrowthGlobal1 = BigInt(pool.feeGrowthGlobal1X128);
      const feeGrowthInside0Last = BigInt(position.feeGrowthInside0LastX128);
      const feeGrowthInside1Last = BigInt(position.feeGrowthInside1LastX128);

      const feeGrowth0 = feeGrowthGlobal0 >= feeGrowthInside0Last
        ? feeGrowthGlobal0 - feeGrowthInside0Last
        : 0n;
      const feeGrowth1 = feeGrowthGlobal1 >= feeGrowthInside1Last
        ? feeGrowthGlobal1 - feeGrowthInside1Last
        : 0n;

      const liquidity = BigInt(position.liquidity);
      const fees0 = (liquidity * feeGrowth0) >> 128n;
      const fees1 = (liquidity * feeGrowth1) >> 128n;

      const token0 = pool.token0Ref || (pool as any).token0
      const token1 = pool.token1Ref || (pool as any).token1

      return {
        token0Amount: formatTokenAmount(formatUnits(fees0, token0.decimals)),
        token1Amount: formatTokenAmount(formatUnits(fees1, token1.decimals)),
        hasUnclaimed: fees0 > 0n || fees1 > 0n
      }
    }

    return {
      token0Amount: "0",
      token1Amount: "0",
      hasUnclaimed: false
    }
  }, [pool, position, onChainPosition, formatTokenAmount])

  /**
   * allowance
   */
  // const token0Address = ((pool as PoolData)?.token0Ref?.id || (pool as any)?.token0?.address) as Address
  // const { data: token0Allowance = 0n, isLoading: isCheckingToken0Allowance, refetch: refetchT0Allowance } = useReadContract({
  //   address: token0Address,
  //   abi: erc20Abi,
  //   functionName: "allowance",
  //   args: address ? [address, CONTRACTS_ADDRESS.positionManager] : undefined,
  //   query: {
  //     enabled: !!address && !!pool
  //   }
  // })
  // const token0NeedApproval = useMemo(() => {
  //   if (!datas?.addLiquidity) return false
  //   return token0Allowance < datas?.addLiquidity.t0Amount * 105n / 100n
  // }, [token0Allowance, datas])

  // const token1Address = ((pool as PoolData)?.token1Ref?.id || (pool as any)?.token1?.address) as Address
  // const { data: token1Allowance = 0n, isLoading: isCheckingToken1Allowance, refetch: refetchT1Allowance } = useReadContract({
  //   address: token1Address,
  //   abi: erc20Abi,
  //   functionName: "allowance",
  //   args: address ? [address, CONTRACTS_ADDRESS.positionManager] : undefined,
  //   query: {
  //     enabled: !!address && !!pool
  //   }
  // })
  // const token1NeedApproval = useMemo(() => {
  //   if (!datas?.addLiquidity?.t1Amount) return false
  //   return token1Allowance < datas?.addLiquidity.t1Amount * 105n / 100n
  // }, [token1Allowance, datas])

  /*
   * approval functions
   */
  // const { data: approveToken0Config } = useSimulateContract({
  //   address: token0Address,
  //   abi: erc20Abi,
  //   functionName: 'approve',
  //   args: [CONTRACTS_ADDRESS.positionManager, (datas?.addLiquidity?.t0Amount || 0n) * 105n / 100n],
  //   query: {
  //     enabled: !!pool && !!datas?.addLiquidity
  //   }
  // })
  // const { data: approveToken1Config } = useSimulateContract({
  //   address: token1Address,
  //   abi: erc20Abi,
  //   functionName: 'approve',
  //   args: [CONTRACTS_ADDRESS.positionManager, (datas?.addLiquidity?.t1Amount || 0n) * 105n / 100n],
  //   query: {
  //     enabled: !!pool && !!datas?.addLiquidity
  //   }
  // })

  // const { data: approveToken0txHash, writeContract: approveToken0, isPending: isApprovingToken0, error: approveToken0Error, isError: hasApproveToken0Error } = useWriteContract()
  // const { data: approveToken1TxHash, writeContract: approveToken1, isPending: isApprovingToken1, error: approveToken1Error, isError: hasApproveToken1Error } = useWriteContract()

  // const handleApproveToken0 = () => {
  //   if (!approveToken0Config?.request) return
  //   approveToken0(approveToken0Config.request)
  // }
  // const handleApproveToken1 = () => {
  //   if (!approveToken1Config?.request) return
  //   approveToken1(approveToken1Config.request)
  // }
  // const { data: approveToken0Receipt, isLoading: waitingT0ApproveReceipt } = useWaitForTransactionReceipt({
  //   hash: approveToken0txHash
  // })
  // const { data: approveToken1Receipt, isLoading: waitingT1ApproveReceipt } = useWaitForTransactionReceipt({
  //   hash: approveToken1TxHash
  // })

  // useEffect(() => {
  //   if (approveToken0Receipt) {
  //     refetchT0Allowance()
  //   }
  //   if (approveToken1Receipt) {
  //     refetchT1Allowance()
  //   }
  // }, [approveToken0Receipt, approveToken1Receipt, refetchT0Allowance, refetchT1Allowance])

  /**
   * Main functions
   */

  // Deposite
  // const { data: addLiquidityTxHash, writeContract: addLiquidity, isPending: waitAddLiquidity, reset: addLiquidityReset, error: addLiquidityError, isError: hasAddLiquidityError } = useWriteContract()
  // const { data: addLiquidityConfig, isLoading: isSimulatingAddLiquidity, error: simulateAddLiquidityError } = useSimulateContract({
  //   address: CONTRACTS_ADDRESS.positionManager,
  //   abi: POSITION_MANAGER_ABI,
  //   functionName: "increaseLiquidity",
  //   args: (() => {
  //     if (!datas?.addLiquidity || !position) return undefined

  //     // Vérifier que les montants sont valides avant de simuler
  //     if (!datas.addLiquidity.t0Amount || !datas.addLiquidity.t1Amount) return undefined

  //     // ⚠️ TEMPORARY SOLUTION - DANGEROUS IN PRODUCTION ⚠️
  //     // Setting amount0Min and amount1Min to 0 bypasses slippage protection entirely.
  //     // This is only a temporary fix to make transactions work while we implement
  //     // the correct calculation based on Uniswap V3's getLiquidityForAmounts logic.
  //     // TODO: Implement proper slippage calculation that:
  //     // 1. Uses getLiquidityForAmounts to determine actual amounts that will be used
  //     // 2. Applies slippage tolerance to those calculated amounts, not desired amounts
  //     // 3. Handles in-range vs out-of-range positions correctly
  //     const amount0Min = 0n
  //     const amount1Min = 0n

  //     console.log('Add Liquidity Simulation Args:', {
  //       tokenId: position.tokenId,
  //       amount0Desired: datas.addLiquidity.t0Amount.toString(),
  //       amount1Desired: datas.addLiquidity.t1Amount.toString(),
  //       amount0Min: amount0Min.toString(),
  //       amount1Min: amount1Min.toString(),
  //       deadline: Math.floor(Date.now() / 1000) + 1200
  //     })

  //     return [{
  //       tokenId: BigInt(position.tokenId),
  //       amount0Desired: datas.addLiquidity.t0Amount,
  //       amount1Desired: datas.addLiquidity.t1Amount,
  //       amount0Min,
  //       amount1Min,
  //       deadline: BigInt(Math.floor(Date.now() / 1000) + 1200) // 20m
  //     }]
  //   })(),
  //   query: {
  //     enabled: !!address &&
  //       !!datas?.addLiquidity &&
  //       !!position &&
  //       !!datas.addLiquidity.t0Amount &&
  //       !!datas.addLiquidity.t1Amount &&
  //       datas.addLiquidity.t0Amount > 0n &&
  //       datas.addLiquidity.t1Amount > 0n &&
  //       position.owner?.toLowerCase() === address?.toLowerCase()
  //   }
  // })
  // const handleAddLiquidity = async () => {
  //   if (!addLiquidityConfig?.request) return

  //   // Validation avant transaction
  //   const validation = validateTransaction('add');
  //   if (!validation.isValid) {
  //     console.error('Transaction validation failed:', validation.errors);
  //     return;
  //   }

  //   addLiquidity(addLiquidityConfig.request)
  // }
  // const { data: addLiquidityReceipt, isLoading: waitingAddLiquidityReceipt } = useWaitForTransactionReceipt({
  //   hash: addLiquidityTxHash
  // })
  // console.log("deposite config", addLiquidityConfig, simulateAddLiquidityError)

  // // Withdraw (Bug 3 fix: Use multicall to combine decreaseLiquidity + collect)
  // const { data: withdrawTxHash, writeContract: withdraw, isPending: waitWithdraw, reset: withdrawReset, error: withdrawError, isError: hasWithdrawError } = useWriteContract()
  // const { data: withdrawConfig, isLoading: isSimulatingWithdraw, error: simulateWithdrawError } = useSimulateContract({
  //   address: CONTRACTS_ADDRESS.positionManager,
  //   abi: POSITION_MANAGER_ABI,
  //   functionName: "multicall",
  //   args: (() => {
  //     if (!datas?.withdraw || !position || !address) return undefined

  //     // Vérifier que la quantité de liquidité est valide
  //     if (!datas.withdraw.liquidity || datas.withdraw.liquidity === 0n) return undefined

  //     console.log('Withdraw+Collect Multicall Simulation Args:', {
  //       tokenId: position.tokenId,
  //       liquidity: datas.withdraw.liquidity.toString(),
  //       amount0Min: 0n.toString(),
  //       amount1Min: 0n.toString(),
  //       deadline: Math.floor(Date.now() / 1000) + 1200
  //     })

  //     // ⚠️ TEMPORARY SOLUTION - DANGEROUS IN PRODUCTION ⚠️
  //     // Setting amount0Min and amount1Min to 0 bypasses slippage protection entirely.
  //     // TODO: Implement proper slippage calculation for decreaseLiquidity that:
  //     // 1. Uses getAmountsForLiquidity to determine actual amounts that will be returned
  //     // 2. Applies slippage tolerance to those calculated amounts
  //     // 3. Accounts for current pool price and position state
  //     const amount0Min = 0n
  //     const amount1Min = 0n

  //     // Encode decreaseLiquidity call
  //     const decreaseLiquidityCall = encodeFunctionData({
  //       abi: POSITION_MANAGER_ABI,
  //       functionName: "decreaseLiquidity",
  //       args: [{
  //         tokenId: BigInt(position.tokenId),
  //         liquidity: datas.withdraw.liquidity,
  //         amount0Min,
  //         amount1Min,
  //         deadline: BigInt(Math.floor(Date.now() / 1000) + 1200) // 20m
  //       }]
  //     })

  //     // Encode collect call to automatically collect the withdrawn tokens
  //     const collectCall = encodeFunctionData({
  //       abi: POSITION_MANAGER_ABI,
  //       functionName: "collect",
  //       args: [{
  //         tokenId: BigInt(position.tokenId),
  //         recipient: address,
  //         amount0Max: maxUint128,
  //         amount1Max: maxUint128,
  //       }]
  //     })

  //     return [[decreaseLiquidityCall, collectCall]]
  //   })(),
  //   query: {
  //     enabled: !!address &&
  //       !!datas?.withdraw &&
  //       !!position &&
  //       !!datas.withdraw.liquidity &&
  //       datas.withdraw.liquidity > 0n &&
  //       position.owner?.toLowerCase() === address?.toLowerCase()
  //   }
  // })
  // const handleWithdraw = async () => {
  //   if (!withdrawConfig?.request) return
  //   withdraw(withdrawConfig.request)
  // }
  // const { data: withdrawReceipt, isLoading: waitWithdrawReceipt } = useWaitForTransactionReceipt({
  //   hash: withdrawTxHash
  // })

  // // Claim
  // const { data: claimTxHash, writeContract: claim, isPending: waitClaim, reset: claimReset, error: claimError, isError: hasClaimError } = useWriteContract()
  // const { data: claimConfig } = useSimulateContract({
  //   address: CONTRACTS_ADDRESS.positionManager,
  //   abi: POSITION_MANAGER_ABI,
  //   functionName: "collect",
  //   args: [{
  //     tokenId: BigInt(position?.tokenId || "0"),
  //     recipient: address || "0x00",
  //     amount0Max: maxUint128,
  //     amount1Max: maxUint128,
  //   }],
  //   query: {
  //     enabled: !!address
  //   }
  // })
  // const handleClaim = async () => {
  //   if (!claimConfig?.request) return
  //   claim(claimConfig.request)
  // }
  // const { data: claimReceipt, isLoading: waitClaimReceipt } = useWaitForTransactionReceipt({
  //   hash: claimTxHash
  // })

  /**
   * State Management
   */
  // const status = useMemo(() => {
  //   if (isCheckingToken0Allowance || isCheckingToken1Allowance) return "fetchAllowance"
  //   if (isApprovingToken0 || isApprovingToken1) return "waitUserApprovement"
  //   if (waitingT0ApproveReceipt || waitingT1ApproveReceipt) return "waitApprovementReceipt"
  //   if (waitAddLiquidity || waitWithdraw || waitClaim) return "waitMainUserSign"
  //   if (waitingAddLiquidityReceipt || waitWithdrawReceipt || waitClaimReceipt) return "waitMainReceipt"

  //   if (token0NeedApproval) return "needT0Approve"
  //   if (token1NeedApproval) return "needT1Approve"

  //   return "idle"
  // }, [
  //   isCheckingToken0Allowance,
  //   isCheckingToken1Allowance,
  //   isApprovingToken0,
  //   isApprovingToken1,
  //   waitingT0ApproveReceipt,
  //   waitingT1ApproveReceipt,
  //   token0NeedApproval,
  //   token1NeedApproval,
  //   waitAddLiquidity,
  //   waitingAddLiquidityReceipt,
  //   waitWithdraw,
  //   waitWithdrawReceipt,
  //   waitClaim,
  //   waitClaimReceipt
  // ])

  return {
    isReady: (!!positionDetails && !!unclaimedFees),
    inRange,
    positionDetails,
    unclaimedFees,
  }
}

export const usePositionManager = (
  position: Position,
  pool: Pool,
  datas?: UsePositionManagerDatas
) => {
  const { address } = useAccount()




  // Get allowances
  const { data: allowances, refetch: refetchAllowances } = useReadContracts({
    contracts: [
      {
        address: pool?.token0Ref.id as Address || "0x00",
        abi: erc20Abi,
        functionName: "allowance",
        args: address ? [address, CONTRACTS_ADDRESS.positionManager] : undefined,
      },
      {
        address: pool?.token1Ref.id as Address || "0x00",
        abi: erc20Abi,
        functionName: "allowance",
        args: address ? [address, CONTRACTS_ADDRESS.positionManager] : undefined
      }
    ],
    query: { enabled: !!address && !!pool }
  })

  const token0Allowance = allowances?.[0].status === "success" ? allowances[0].result : 0n
  const token1Allowance = allowances?.[1].status === "success" ? allowances[1].result : 0n

  // Check if approvals are needed
  const token0NeedApproval = useMemo(() => {
    if (!datas?.addLiquidity) return false
    return token0Allowance < datas?.addLiquidity.t0Amount * 105n / 100n
  }, [token0Allowance, datas])

  const token1NeedApproval = useMemo(() => {
    if (!datas?.addLiquidity?.t1Amount) return false
    return token1Allowance < datas?.addLiquidity.t1Amount * 105n / 100n
  }, [token1Allowance, datas])

  // Approval functions
  const { data: approveToken0txHash, writeContract: approveToken0, isPending: isApprovingToken0, error: approveToken0Error, isError: hasApproveToken0Error } = useWriteContract()
  const { data: approveToken1TxHash, writeContract: approveToken1, isPending: isApprovingToken1, error: approveToken1Error, isError: hasApproveToken1Error } = useWriteContract()

  const handleApproveToken0 = useCallback(() => {
    if (!datas?.addLiquidity || !pool) return
    approveToken0({
      address: pool.token0Ref.id as Address,
      abi: erc20Abi,
      functionName: 'approve',
      args: [CONTRACTS_ADDRESS.positionManager, datas.addLiquidity.t0Amount * 105n / 100n]
    })
  }, [datas, pool, approveToken0])

  const handleApproveToken1 = useCallback(() => {
    if (!datas?.addLiquidity || !pool) return
    approveToken1({
      address: pool.token1Ref.id as Address,
      abi: erc20Abi,
      functionName: 'approve',
      args: [CONTRACTS_ADDRESS.positionManager, datas.addLiquidity.t1Amount * 105n / 100n]
    })
  }, [datas, pool, approveToken1])

  const { data: approveToken0Receipt, isLoading: waitingT0ApproveReceipt } = useWaitForTransactionReceipt({
    hash: approveToken0txHash
  })
  const { data: approveToken1Receipt, isLoading: waitingT1ApproveReceipt } = useWaitForTransactionReceipt({
    hash: approveToken1TxHash
  })

  useEffect(() => {
    if (approveToken0Receipt || approveToken1Receipt) {
      refetchAllowances()
    }
  }, [approveToken0Receipt, approveToken1Receipt, refetchAllowances])

  // Add Liquidity
  const { data: addLiquidityConfig, isLoading: isSimulatingAddLiquidity, error: simulateAddLiquidityError } = useSimulateContract({
    address: CONTRACTS_ADDRESS.positionManager,
    abi: POSITION_MANAGER_ABI,
    functionName: "increaseLiquidity",
    args: (() => {
      if (!datas?.addLiquidity || !position || !address) return undefined

      if (!datas.addLiquidity.t0Amount || !datas.addLiquidity.t1Amount) return undefined

      const amount0Min = 0n
      const amount1Min = 0n

      return [{
        tokenId: BigInt(position.tokenId),
        amount0Desired: datas.addLiquidity.t0Amount,
        amount1Desired: datas.addLiquidity.t1Amount,
        amount0Min,
        amount1Min,
        deadline: BigInt(Math.floor(Date.now() / 1000) + 1200) // 20m
      }]
    })(),
    query: {
      enabled: !!address &&
        !!datas?.addLiquidity &&
        !!position &&
        !!datas.addLiquidity.t0Amount &&
        !!datas.addLiquidity.t1Amount &&
        datas.addLiquidity.t0Amount > 0n &&
        datas.addLiquidity.t1Amount > 0n &&
        position.owner?.toLowerCase() === address?.toLowerCase() &&
        !token0NeedApproval &&
        !token1NeedApproval
    }
  })

  const { data: addLiquidityTxHash, writeContract: addLiquidity, isPending: waitAddLiquidity, reset: addLiquidityReset, error: addLiquidityError, isError: hasAddLiquidityError } = useWriteContract()

  const handleAddLiquidity = useCallback(() => {
    if (!addLiquidityConfig?.request) return
    addLiquidity(addLiquidityConfig.request)
  }, [addLiquidityConfig, addLiquidity])

  const { data: addLiquidityReceipt, isLoading: waitingAddLiquidityReceipt } = useWaitForTransactionReceipt({
    hash: addLiquidityTxHash
  })

  // Withdraw (decrease liquidity + collect)
  const { data: withdrawConfig, isLoading: isSimulatingWithdraw, error: simulateWithdrawError } = useSimulateContract({
    address: CONTRACTS_ADDRESS.positionManager,
    abi: POSITION_MANAGER_ABI,
    functionName: "multicall",
    args: (() => {
      if (!datas?.withdraw || !position || !address) return undefined

      if (!datas.withdraw.liquidity || datas.withdraw.liquidity === 0n) return undefined

      const amount0Min = 0n
      const amount1Min = 0n

      // Encode decreaseLiquidity call
      const decreaseLiquidityCall = encodeFunctionData({
        abi: POSITION_MANAGER_ABI,
        functionName: "decreaseLiquidity",
        args: [{
          tokenId: BigInt(position.tokenId),
          liquidity: datas.withdraw.liquidity,
          amount0Min,
          amount1Min,
          deadline: BigInt(Math.floor(Date.now() / 1000) + 1200) // 20m
        }]
      })

      // Encode collect call to automatically collect the withdrawn tokens
      const collectCall = encodeFunctionData({
        abi: POSITION_MANAGER_ABI,
        functionName: "collect",
        args: [{
          tokenId: BigInt(position.tokenId),
          recipient: address,
          amount0Max: maxUint128,
          amount1Max: maxUint128,
        }]
      })

      return [[decreaseLiquidityCall, collectCall]]
    })(),
    query: {
      enabled: !!address &&
        !!datas?.withdraw &&
        !!position &&
        !!datas.withdraw.liquidity &&
        datas.withdraw.liquidity > 0n &&
        position.owner?.toLowerCase() === address?.toLowerCase()
    }
  })

  const { data: withdrawTxHash, writeContract: withdraw, isPending: waitWithdraw, reset: withdrawReset, error: withdrawError, isError: hasWithdrawError } = useWriteContract()

  const handleWithdraw = useCallback(() => {
    if (!withdrawConfig?.request) return
    withdraw(withdrawConfig.request)
  }, [withdrawConfig, withdraw])

  const { data: withdrawReceipt, isLoading: waitWithdrawReceipt } = useWaitForTransactionReceipt({
    hash: withdrawTxHash
  })

  // Claim fees
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
      enabled: !!address && !!position
    }
  })

  const { data: claimTxHash, writeContract: claim, isPending: waitClaim, reset: claimReset, error: claimError, isError: hasClaimError } = useWriteContract()

  const handleClaim = useCallback(() => {
    if (!claimConfig?.request) return
    claim(claimConfig.request)
  }, [claimConfig, claim])

  const { data: claimReceipt, isLoading: waitClaimReceipt } = useWaitForTransactionReceipt({
    hash: claimTxHash
  })

  // Get unclaimed fees for claim capability
  const { unclaimedFees } = usePositionDatas(position, pool)

  // Status management
  const status = useMemo(() => {
    if (isApprovingToken0 || isApprovingToken1) return "waitUserApprovement"
    if (waitingT0ApproveReceipt || waitingT1ApproveReceipt) return "waitApprovementReceipt"
    if (waitAddLiquidity || waitWithdraw || waitClaim) return "waitMainUserSign"
    if (waitingAddLiquidityReceipt || waitWithdrawReceipt || waitClaimReceipt) return "waitMainReceipt"

    if (token0NeedApproval) return "needT0Approve"
    if (token1NeedApproval) return "needT1Approve"

    return "idle"
  }, [
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

  // Capabilities
  const canAttemptAddLiquidity = useMemo(() => {
    return !!address &&
      !!datas?.addLiquidity &&
      !!datas.addLiquidity.t0Amount &&
      !!datas.addLiquidity.t1Amount &&
      datas.addLiquidity.t0Amount > 0n &&
      datas.addLiquidity.t1Amount > 0n;
  }, [address, datas])

  const canAttemptWithdraw = useMemo(() => {
    return !!address &&
      !!datas?.withdraw &&
      !!datas.withdraw.liquidity &&
      datas.withdraw.liquidity > 0n;
  }, [address, datas])

  const reset = useCallback(() => {
    addLiquidityReset()
    withdrawReset()
    claimReset()
  }, [addLiquidityReset, withdrawReset, claimReset])

  return {
    // Status
    status,

    // Approval needs
    token0NeedApproval,
    token1NeedApproval,

    // Actions
    approveToken0: handleApproveToken0,
    approveToken1: handleApproveToken1,
    addLiquidity: handleAddLiquidity,
    withdraw: handleWithdraw,
    claim: handleClaim,
    reset,

    // Capabilities
    canAddLiquidity: !!addLiquidityConfig?.request,
    canWithdraw: !!withdrawConfig?.request,
    canClaim: !!claimConfig?.request,
    canAttemptAddLiquidity,
    canAttemptWithdraw,

    // Transaction data
    addLiquidityTxHash,
    withdrawTxHash,
    claimTxHash,
    addLiquidityReceipt,
    withdrawReceipt,
    claimReceipt,

    // Unclaimed fees data for display
    unclaimedFees,

    // Simulation states
    isSimulatingAddLiquidity,
    isSimulatingWithdraw,

    // Errors
    errors: {
      addLiquidity: addLiquidityError,
      withdraw: withdrawError,
      claim: claimError,
      approveToken0: approveToken0Error,
      approveToken1: approveToken1Error,
      simulateAddLiquidity: simulateAddLiquidityError,
      simulateWithdraw: simulateWithdrawError,
    },
    hasError: hasAddLiquidityError || hasWithdrawError || hasClaimError || hasApproveToken0Error || hasApproveToken1Error,
  }
}
