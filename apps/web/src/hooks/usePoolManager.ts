import { useEffect, useMemo } from "react"
import { type Address, encodeFunctionData, erc20Abi, parseEther, zeroAddress } from "viem"
import { useAccount, useReadContract, useReadContracts, useSimulateContract, useWaitForTransactionReceipt, useWriteContract } from "wagmi"
import { v3CoreFactoryContract } from "../config/abis/v3CoreFactoryContractABI";
import { POSITION_MANAGER_ABI } from "../config/abis/positionManagerABI";
import { CONTRACTS_ADDRESS } from "../config/contractsAddress";
import { PoolABI } from "../config/abis/poolABI";
import { usePrice } from "./usePrice";
import type { BerachainToken } from "./useBerachainTokenList";

import { computePoolAddress, encodeSqrtRatioX96, FeeAmount, nearestUsableTick, Pool, Position, TICK_SPACINGS, TickMath } from "@uniswap/v3-sdk"
import { Token } from "@uniswap/sdk-core"
import JSBI from "jsbi";
import { getInitialSqrtPriceX96, priceToTick } from "../utils/positionManager";
import { MultiCall2ABI } from "../config/abis/Multicall2ABI";
import { currentChain } from "../config/wagmi";

interface usePositionManagerParams {
  btoken0: BerachainToken | null
  btoken1: BerachainToken | null
  fee: number
  inputAmount: bigint
  inputToken: "token0" | "token1"
  minPrice: string
  maxPrice: string
  initialPrice: bigint
}

const parseToken = (bt: BerachainToken | null): Token | null => {
  if (!bt) return null
  // use wBera instead Bera
  const addr = (bt.address === zeroAddress) ? "0x6969696969696969696969696969696969696969" : bt.address
  return new Token(currentChain.id, addr, bt.decimals, bt.symbol, bt.name)
}

export const usePoolManager = ({
  btoken0,
  btoken1,
  fee,
  inputAmount,
  inputToken,
  minPrice,
  maxPrice,
  initialPrice
}: usePositionManagerParams) => {
  const { address } = useAccount()

  const token0 = useMemo(() => (parseToken(btoken0)), [btoken0])
  const token1 = useMemo(() => (parseToken(btoken1)), [btoken1])

  const isToken0Bera = useMemo(() => btoken0?.address === zeroAddress, [btoken0])
  const isToken1Bera = useMemo(() => btoken1?.address === zeroAddress, [btoken1])
  const needsWrapping = useMemo(() => isToken0Bera || isToken1Bera, [isToken0Bera, isToken1Bera])

  const { data: currentPrice = 0 } = usePrice(btoken0)

  /*
   * CHECK IF POOL EXISTS
   * Yes -> mint
   * No => Create pool and mint
   */
  const { data: existingPoolAddress, isLoading: isCheckingPool, isFetched: existingPoolFetched, refetch: refetchPoolAddr } = useReadContract({
    address: CONTRACTS_ADDRESS.v3CoreFactory,
    abi: v3CoreFactoryContract,
    functionName: 'getPool',
    args: token0 && token1 && fee ? [token0.address, token1.address, fee] : undefined,
    query: {
      enabled: !!(token0 && token1 && fee)
    }
  })

  const { data: poolData, isLoading: isGettingPoolData, refetch: refetchPoolData } = useReadContracts({
    contracts: [
      {
        address: (existingPoolAddress as Address),
        abi: PoolABI,
        functionName: 'slot0',
      },
      {
        address: (existingPoolAddress as Address),
        abi: PoolABI,
        functionName: 'liquidity',
      },
    ],
    query: {
      enabled: !!existingPoolAddress && existingPoolFetched
    }
  })

  const poolAlreadyExist = useMemo(() => {
    return existingPoolFetched && !!existingPoolAddress && existingPoolAddress !== zeroAddress
  }, [existingPoolFetched, existingPoolAddress])

  /*
   * If no Pool already exist computed the address of the new one
   */
  const computedPoolAddress = useMemo(() => {
    if (!token0 || !token1 || !fee) return null
    return computePoolAddress({
      factoryAddress: CONTRACTS_ADDRESS.v3CoreFactory,
      tokenA: token0,
      tokenB: token1,
      fee,
      // initCodeHashManualOverride: "0xdf9055262fd50386924a77703badac798970d2c313e4b4c49eee77cd97ff8e3a"
    })
  }, [token0, token1, fee])

  /*
   * Create Uniswap SDK Pool
   */
  const pool = useMemo(() => {
    try {
      if (poolAlreadyExist && poolData) {

        if (poolData[0]?.status !== "success" || poolData[1]?.status !== "success") return null

        const sqrtPriceX96 = poolData[0]?.result?.[0]
        const tick = poolData[0]?.result?.[1]
        const liquidity = poolData[1]?.result

        return new Pool(
          token0!,
          token1!,
          fee,
          sqrtPriceX96.toString(),
          liquidity.toString(),
          tick
        )
      } else {
        if (!token0 || !token1 || initialPrice === 0n) return null

        const sqrtPriceX96 = getInitialSqrtPriceX96(token0, token1, initialPrice)
        if (!sqrtPriceX96) return null
        const tick = priceToTick(token0, token1, initialPrice)

        return new Pool(
          token0,
          token1,
          fee,
          sqrtPriceX96.toString(),
          "0",
          tick
        )
      }
    } catch (err) {
      console.error("Error when creating pool", err)
      return null
    }
  }, [token0, token1, fee, initialPrice, poolAlreadyExist, poolData])

  /*
   * PRICE CALCULATION
   */
  const tickLower = useMemo(() => {
    if (!token0 || !token1 || minPrice === "0") return nearestUsableTick(TickMath.MIN_TICK, FeeAmount.MEDIUM)
    const tickSpacing = TICK_SPACINGS[fee as keyof typeof TICK_SPACINGS]
    const sqrtRatioX96 = encodeSqrtRatioX96(
      JSBI.BigInt(Math.floor(parseFloat(minPrice) * 10 ** token1.decimals)).toString(),
      JSBI.BigInt(10 ** token0.decimals).toString()
    )
    const rawTick = TickMath.getTickAtSqrtRatio(sqrtRatioX96)

    return nearestUsableTick(rawTick, tickSpacing);
  }, [minPrice, fee, token0, token1]);

  const tickUpper = useMemo(() => {
    if (!token0 || !token1 || maxPrice === "∞") return nearestUsableTick(TickMath.MAX_TICK, FeeAmount.MEDIUM)
    const tickSpacing = TICK_SPACINGS[fee as keyof typeof TICK_SPACINGS]

    const sqrtRatioX96 = encodeSqrtRatioX96(
      JSBI.BigInt(Math.floor(parseFloat(maxPrice) * 10 ** token1.decimals)).toString(),
      JSBI.BigInt(10 ** token0.decimals).toString()
    )

    const rawTick = TickMath.getTickAtSqrtRatio(sqrtRatioX96)
    return nearestUsableTick(rawTick, tickSpacing);
  }, [maxPrice, fee, token0, token1]);

  const prices = useMemo(() => {
    try {
      if (!pool || !tickLower || !tickUpper || !inputAmount || inputAmount === 0n) {
        return {
          amount0: 0n,
          amount1: 0n,
          position: null
        }
      }

      if (tickLower >= tickUpper) {
        throw new Error('tickLower must be lower thant tickUpper')
      }

      let position: Position
      if (inputToken === 'token0') {
        position = Position.fromAmount0({
          pool,
          tickLower,
          tickUpper,
          amount0: inputAmount.toString(),
          useFullPrecision: false
        })
      } else {
        position = Position.fromAmount1({
          pool,
          tickLower,
          tickUpper,
          amount1: inputAmount.toString(),
        })
      }

      return {
        amount0: parseEther(position.amount0.toFixed(6)),
        amount1: parseEther(position.amount1.toFixed(6)),
        position
      }
    } catch (err) {
      console.error('Error when calculate price', err)
      return {
        amount0: 0n,
        amount1: 0n,
        position: null
      }
    }
  }, [pool, tickLower, tickUpper, inputAmount, inputToken])

  const beraAmountToWrap = useMemo(() => {
    if (isToken0Bera) return prices.amount0
    if (isToken1Bera) return prices.amount1
    return 0n
  }, [isToken0Bera, isToken1Bera, prices])

  /*
   * CHECK ALLOWANCE
   */
  const { data: token0Allowance = 0n, isLoading: isCheckingToken0Allowance, refetch: refetchT0Allowance } = useReadContract({
    address: (token0?.address as Address),
    abi: erc20Abi,
    functionName: "allowance",
    args: address ? [address, CONTRACTS_ADDRESS.positionManager] : undefined,
    query: {
      enabled: !!address && !!token0
    }
  })
  const token0NeedApproval = useMemo(() => {
    return token0Allowance < prices.amount0 * 105n / 100n
  }, [token0Allowance, prices])

  const { data: token1Allowance = 0n, isLoading: isCheckingToken1Allowance, refetch: refetchT1Allowance } = useReadContract({
    address: (token1?.address as Address),
    abi: erc20Abi,
    functionName: "allowance",
    args: address ? [address, CONTRACTS_ADDRESS.positionManager] : undefined,
    query: {
      enabled: !!address && !!token1
    }
  })
  const token1NeedApproval = useMemo(() => {
    return token1Allowance < prices.amount1 * 105n / 100n
  }, [token1Allowance, prices])

  /*
   * APPROVAL FUNCTIONS
   */
  const { data: approveToken0Config } = useSimulateContract({
    address: (token0?.address as Address),
    abi: erc20Abi,
    functionName: 'approve',
    args: [CONTRACTS_ADDRESS.positionManager, prices.amount0 * 105n / 100n],
    chainId: currentChain.id,
    query: {
      enabled: !!token0 && token0NeedApproval
    }
  })
  const { data: approveToken1Config } = useSimulateContract({
    address: (token1?.address as Address),
    abi: erc20Abi,
    functionName: 'approve',
    args: [CONTRACTS_ADDRESS.positionManager, prices.amount1 * 105n / 100n],
    chainId: currentChain.id,
    query: {
      enabled: !!token1 && token1NeedApproval
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

  /*
   * CHECK WBERA BALANCE (pour savoir si l'utilisateur a déjà wrappé)
   */
  const { data: wberaBalance = 0n, refetch: refetchWberaBalance } = useReadContract({
    address: "0x6969696969696969696969696969696969696969",
    abi: erc20Abi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && needsWrapping
    }
  })
  const needsWBERAWrapping = useMemo(() => {
    if (!needsWrapping) return false
    return wberaBalance < beraAmountToWrap
  }, [needsWrapping, wberaBalance, beraAmountToWrap])

  /*
   * MAIN FUNCTIONS
   */
  const { data: createPoolTxHash, writeContract: createPool, isPending: waitCreatePool, reset: resetCreatePool } = useWriteContract()
  const { data: mintPositionTxHash, writeContract: mintPosition, isPending: waitMintPosition, reset: resetMint } = useWriteContract()
  const { data: wrapTxHash, writeContract: wrap, isPending: waitWrap, reset: resetWrap } = useWriteContract()

  const { data: createpoolConfig } = useSimulateContract({
    address: CONTRACTS_ADDRESS.multicall2,
    abi: MultiCall2ABI,
    functionName: 'multicall',
    args: (() => {

      if (!token0 || !token1 || !fee || !pool) return undefined
      const sqrtPrice = BigInt(pool.sqrtRatioX96.toString())
      const calls = [
        // create pool
        {
          target: (CONTRACTS_ADDRESS.v3CoreFactory as Address),
          gasLimit: 6000000n,
          callData: encodeFunctionData({
            abi: v3CoreFactoryContract,
            functionName: 'createPool',
            args: [token0!.address, token1!.address, fee]
          })
        },
        // init price
        {
          target: (computedPoolAddress as Address),
          gasLimit: 100000n,
          callData: encodeFunctionData({
            abi: PoolABI,
            functionName: 'initialize',
            args: [sqrtPrice]
          })
        }
      ]

      return [calls]
    })(),
    chainId: currentChain.id,
    query: {
      enabled: !!pool
    }
  })
  const { data: mintPositionConfig } = useSimulateContract({
    address: CONTRACTS_ADDRESS.positionManager,
    abi: POSITION_MANAGER_ABI,
    functionName: 'mint',
    args: (() => {
      if (!pool || !tickUpper || !tickLower || !prices || !address) return undefined

      const deadline = BigInt(Math.floor(Date.now() / 1000) + 1200) // 20m

      return [{
        token0: (pool.token0.address as Address),
        token1: (pool.token1.address as Address),
        fee,
        tickLower: tickLower,
        tickUpper: tickUpper,
        amount0Desired: prices.amount0,
        amount1Desired: prices.amount1,
        amount0Min: 0n,
        amount1Min: 0n,
        recipient: address,
        deadline
      }]
    })(),
    chainId: currentChain.id,
    query: {
      enabled: !!pool && !!prices?.position && !!address && !needsWBERAWrapping
    }
  })
  const { data: wrapWBeraConfig } = useSimulateContract({
    address: "0x6969696969696969696969696969696969696969",
    abi: [{
      name: 'deposit',
      type: 'function',
      inputs: [],
      outputs: [],
      stateMutability: 'payable'
    }],
    functionName: 'deposit',
    value: beraAmountToWrap,
    chainId: currentChain.id,
    query: {
      enabled: needsWBERAWrapping && beraAmountToWrap > 0n
    }
  })

  const handleCreatePool = async () => {
    if (!createpoolConfig?.request) return
    createPool(createpoolConfig.request)
  }
  const handleMintPosition = async () => {
    if (!mintPositionConfig?.request) return
    mintPosition(mintPositionConfig.request)
  }
  const handleWrap = () => {
    if (!wrapWBeraConfig?.request) return
    wrap(wrapWBeraConfig.request, {
      onSettled: () => {
        refetchWberaBalance()
      }
    })
  }

  const { data: createPoolReceipt, isLoading: waitingCreatePoolReceipt } = useWaitForTransactionReceipt({
    hash: createPoolTxHash
  })
  const { data: mintPositionReceipt, isLoading: waitingMintPositionReceipt } = useWaitForTransactionReceipt({
    hash: mintPositionTxHash
  })
  const { data: wrapReceipt, isLoading: waitingWrapReceipt } = useWaitForTransactionReceipt({
    hash: wrapTxHash
  })

  const status = useMemo(() => {
    if (!token0 || !token1) return 'idle'

    if (isCheckingPool || isGettingPoolData) return 'fetchPool'
    if (isCheckingToken0Allowance || isCheckingToken1Allowance) return "fetchAllowance"

    if (isApprovingToken0 || isApprovingToken1) return "waitUserApprovement"
    if (waitingT0ApproveReceipt || waitingT1ApproveReceipt) return "waitApprovementReceipt"
    if (waitCreatePool || waitMintPosition || waitWrap) return "waitMainUserSign"
    if (waitingCreatePoolReceipt || waitingMintPositionReceipt || waitingWrapReceipt) return "waitMainReceipt"

    if (!poolAlreadyExist && initialPrice === 0n) {
      return 'waitInitialAmount'
    }

    if (!prices.position) {
      return 'waitAmount'
    }

    if (token0NeedApproval) return "needT0Approve"
    if (token1NeedApproval) return "needT1Approve"
    if (needsWBERAWrapping) return "needWrap"

    return poolAlreadyExist ? 'readyMintPosition' : 'readyCreatePosition'
  }, [
    token0,
    token1,
    isCheckingPool,
    isGettingPoolData,
    isCheckingToken1Allowance,
    isCheckingToken0Allowance,
    poolAlreadyExist,
    prices,
    initialPrice,
    token0NeedApproval,
    token1NeedApproval,
    isApprovingToken0,
    isApprovingToken1,
    waitingT0ApproveReceipt,
    waitingT1ApproveReceipt,
    waitCreatePool,
    waitMintPosition,
    waitWrap,
    waitingCreatePoolReceipt,
    waitingMintPositionReceipt,
    waitingWrapReceipt,
    needsWBERAWrapping
  ])

  const reset = () => {
    refetchPoolAddr()
    refetchPoolData()
    resetCreatePool()
    resetMint()
    resetWrap()
  }

  return {
    // PoolState
    status,
    poolAlreadyExist,
    pool,

    // Price calculation
    ...prices,
    currentPrice,

    approveToken0: handleApproveToken0,
    approveToken1: handleApproveToken1,

    createPool: handleCreatePool,
    mintPosition: handleMintPosition,
    wrap: handleWrap,
    reset,

    createPoolTxHash,
    mintPositionTxHash,
    createPoolReceipt,
    mintPositionReceipt,
    wrapReceipt
  }
}
