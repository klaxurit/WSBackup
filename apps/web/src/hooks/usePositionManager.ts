import { useEffect, useMemo, useState } from "react"
import { type Address, encodeFunctionData, erc20Abi, parseEther, zeroAddress } from "viem"
import { useAccount, useReadContract, useReadContracts, useSimulateContract, useWriteContract } from "wagmi"
import { v3CoreFactoryContract } from "../config/abis/v3CoreFactoryContractABI";
import { POSITION_MANAGER_ABI } from "../config/abis/positionManagerABI";
import { CONTRACTS_ADDRESS } from "../config/contractsAddress";
import { PoolABI } from "../config/abis/poolABI";
import { usePrice } from "./usePrice";
import type { BerachainToken } from "./useBerachainTokenList";

import { computePoolAddress, encodeSqrtRatioX96, FeeAmount, nearestUsableTick, Pool, Position, TICK_SPACINGS, TickMath } from "@uniswap/v3-sdk"
import { Token } from "@uniswap/sdk-core"
import { berachainBepolia } from "viem/chains";
import JSBI from "jsbi";
import { getInitialSqrtPriceX96, priceToTick } from "../utils/positionManager";
import { MultiCall2ABI } from "../config/abis/Multicall2ABI";

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
  return new Token(berachainBepolia.id, bt.address, bt.decimals, bt.symbol, bt.name)
}

export const usePositionManager = ({
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
  const [poolExists, setPoolExists] = useState<boolean>(false)

  const token0 = useMemo(() => (parseToken(btoken0)), [btoken0])
  const token1 = useMemo(() => (parseToken(btoken1)), [btoken1])

  const { data: currentPrice = 0 } = usePrice(btoken0)

  /*
   * CHECK IF POOL EXISTS
   * Yes -> mint
   * No => Create pool and mint
   */
  const { data: existingPoolAddress, isLoading: isCheckingPool } = useReadContract({
    address: CONTRACTS_ADDRESS.v3CoreFactory,
    abi: v3CoreFactoryContract,
    functionName: 'getPool',
    args: token0 && token1 && fee ? [token0.address, token1.address, fee] : undefined,
    query: {
      enabled: !!(token0 && token1 && fee)
    }
  })

  const { data: poolData, isLoading: isGettingPoolData } = useReadContracts({
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
      enabled: !!existingPoolAddress
    }
  })

  useEffect(() => {
    if (!isCheckingPool && !isGettingPoolData) {
      setPoolExists(!!existingPoolAddress && existingPoolAddress !== zeroAddress)
    }
  }, [isCheckingPool, isGettingPoolData])

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
      if (poolData && poolExists) {
        const sqrtPriceX96: bigint = (poolData as any)[0].result[0]
        const tick = (poolData as any)[0].result[1]
        const liquidity: bigint = (poolData as any)[1].result

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

  }, [token0, token1, fee, initialPrice, poolExists])

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
  }, [pool, token0, token1, tickLower, tickUpper, inputAmount, inputToken])

  /*
   * CHECK ALLOWANCE
   */
  const { data: token0Allowance = 0n, isLoading: isCheckingToken0Allowance } = useReadContract({
    address: btoken0?.address,
    abi: erc20Abi,
    functionName: "allowance",
    args: address ? [address, CONTRACTS_ADDRESS.positionManager] : undefined,
    query: {
      enabled: !!address && !!btoken0
    }
  })
  const token0NeedApproval = useMemo(() => {
    return token0Allowance < prices.amount0 * 105n / 100n
  }, [token0Allowance, prices])

  const { data: token1Allowance = 0n, isLoading: isCheckingToken1Allowance } = useReadContract({
    address: btoken1?.address,
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

  const isCheckingAllowance = useMemo(() => {
    return isCheckingToken0Allowance && isCheckingToken1Allowance
  }, [isCheckingToken0Allowance, isCheckingToken1Allowance])

  /*
   * APPROVAL FUNCTIONS
   */
  const { writeContract: approveToken0, isPending: isApprovingToken0 } = useWriteContract()
  const { writeContract: approveToken1, isPending: isApprovingToken1 } = useWriteContract()

  const handleApproveToken0 = () => {
    if (!btoken0) return
    approveToken0({
      address: btoken0.address,
      abi: erc20Abi,
      functionName: 'approve',
      args: [CONTRACTS_ADDRESS.positionManager, prices.amount0 * 105n / 100n]
    })
  }
  const handleApproveToken1 = () => {
    if (!btoken1) return
    approveToken1({
      address: btoken1.address,
      abi: erc20Abi,
      functionName: 'approve',
      args: [CONTRACTS_ADDRESS.positionManager, prices.amount1 * 105n / 100n]
    })
  }

  /*
   * MAIN FUNCTIONS
   */
  const { writeContract: executeMultiCall, isPending: isExecutingMultiCall } = useWriteContract()
  const { writeContract: mintPosition, isPending: isMintingPosition } = useWriteContract()

  const { data: createpoolConfig, status, error } = useSimulateContract({
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
      // if (prices?.amount0 && prices?.amount1) {
      //   const deadline = BigInt(Math.floor(Date.now() / 1000) + 1200) // 20m
      //   // Mint position
      //   console.log(tickLower, tickUpper, prices)
      //   calls.push({
      //     target: (CONTRACTS_ADDRESS.positionManager as Address),
      //     gasLimit: 1000000n,
      //     callData: encodeFunctionData({
      //       abi: PositionManagerABI,
      //       functionName: 'mint',
      //       args: [{
      //         token0: (token0!.address as Address),
      //         token1: (token1!.address as Address),
      //         fee,
      //         tickLower: tickLower,
      //         tickUpper: tickUpper,
      //         amount0Desired: prices.amount0,
      //         amount1Desired: prices.amount1,
      //         amount0Min: prices.amount0 * 95n / 100n,
      //         amount1Min: prices.amount1 * 95n / 100n,
      //         recipient: (address as Address),
      //         deadline
      //       }]
      //     })
      //   })
      // }

      return [calls]
    })(),
    query: {
      enabled: !!pool
    }
  })

  console.log(createpoolConfig, status, error)

  const handleCreatePool = async () => {
    if (!createpoolConfig?.request) return

    executeMultiCall(createpoolConfig.request)
  }

  const handleMintPosition = async (params?: {
    tickLower?: number,
    tickUpper?: number;
    amount0Desired?: bigint,
    amount1Desired?: bigint,
    amount0Min?: bigint,
    amount1Min?: bigint,
    deadline?: bigint
  }) => {
    if (!pool || !tickUpper || !tickLower || !prices || !address) return undefined

    const deadline = params?.deadline || BigInt(Math.floor(Date.now() / 1000) + 1200) // 20m

    mintPosition(
      {
        address: CONTRACTS_ADDRESS.positionManager,
        abi: POSITION_MANAGER_ABI,
        functionName: 'mint',
        args: [{
          token0: (pool.token0.address as Address),
          token1: (pool.token1.address as Address),
          fee,
          tickLower: params?.tickLower || tickLower,
          tickUpper: params?.tickUpper || tickUpper,
          amount0Desired: params?.amount0Desired || prices.amount0,
          amount1Desired: params?.amount1Desired || prices.amount1,
          amount0Min: params?.amount0Min || 0n,
          amount1Min: params?.amount1Min || 0n,
          recipient: address,
          deadline
        }]
      }, {
      onError: (e) => {
        console.error("Error when mint the position", e)
      }
    })
  }

  const handleCreatePoolAndMint = async () => {
    await handleCreatePool()
  }
  const handleCreatePoolOnly = () => {
    handleCreatePool()
  }

  return {
    // PoolState
    poolExists,
    pool,

    // Price calculation
    ...prices,
    currentPrice,

    // Allowances
    token0NeedApproval,
    token1NeedApproval,
    token0Allowance,
    token1Allowance,
    isCheckingAllowance,

    // Approvals
    approveToken0: handleApproveToken0,
    approveToken1: handleApproveToken1,
    isApprovingToken0,
    isApprovingToken1,

    // Main action
    createPool: handleCreatePool,
    mintPosition: handleMintPosition,
    createPoolAndMint: handleCreatePoolAndMint,
    createPoolOnly: handleCreatePoolOnly,

    // Loading state
    isExecutingMultiCall,
    isMintingPosition,
    isLoading: isCheckingPool || isExecutingMultiCall || isMintingPosition || isCheckingAllowance,
  }
}
