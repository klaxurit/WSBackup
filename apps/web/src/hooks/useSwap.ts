import { useCallback, useEffect, useMemo, useState } from "react"
import { erc20Abi, formatUnits, zeroAddress, type Address, type Hex } from "viem"
import { useAccount, usePublicClient, useReadContract, useSimulateContract, useWaitForTransactionReceipt, useWriteContract } from "wagmi"
import { v3CoreFactoryContract } from "../config/abis/v3CoreFactoryContractABI"
import { PoolABI } from "../config/abis/poolABI"
import { QuoterV2ABI } from "../config/abis/QuoterV2"
import { calculatePriceImpact, calculateSlippageAmount, encodePath } from "../utils/swap"
import { SwapRouteV2ABI } from "../config/abis/swapRouter"
import { useQueryClient } from "@tanstack/react-query"

const COMMON_BASES: Address[] = [
  '0xFCBD14DC51f0A4d49d5E53C2E0950e0bC26d0Dce', // HONEY
  '0x0000000000000000000000000000000000000000', // BERA
  '0x6969696969696969696969696969696969696969', // wBera
]
const CONTRACTS = {
  v3CoreFactory: '0x76fD9D07d5e4D889CAbED96884F15f7ebdcd6B63' as Address,
  quoterV2: '0x35E02133b7Ee5E4cDE7cb7FF278a19c35d4cd965' as Address,
  swapRouter02: '0x86e02f3D4Cb55974B7EE7E7c98c199e65F9023a4' as Address,
  multicall2: '0x2B35c459e86fABd62b9C37fb652091671C5aA3ad' as Address,
} as const;
const FEE_TIERS = [100, 500, 3000, 10000]; // 0.01%, 0.05%, 0.3%, 1%

interface SwapParams {
  tokenIn: Address
  tokenOut: Address
  amountIn: bigint
  slippageTolerance?: number // Percent (0.05 = 5%)
  deadline?: number // Minutes
  recipient?: Address
}

interface TokenInfo {
  address: Address;
  symbol: string;
  decimals: number;
  name?: string;
}

interface PoolInfo {
  token0: Address;
  token1: Address;
  fee: number;
  liquidity: bigint;
  sqrtPriceX96: bigint;
}

interface Route {
  path: TokenInfo[]
  fees: number[]
  pools: PoolInfo[]
  quote: bigint
  quoteFormatted: string
  priceImpact: number
  gasEstimate: bigint
}

interface SwapState {
  status: 'idle' | 'loading-routes' | 'quoting' | 'ready' | 'approving' | 'swapping' | 'success' | 'error'
  error?: string
  routes: Route[]
  selectedRoute: Route | null
  txHash?: Hex
}

interface Route {
  rawQuote: number
  estimatedGasCost: number
  priceImpact: number
  executionProbability: number
}

export const useSwap = (params: SwapParams) => {
  const queryClient = useQueryClient()
  const { tokenIn, tokenOut, amountIn, slippageTolerance = 0.05, deadline = 20, recipient } = params

  const { address } = useAccount()
  const publicClient = usePublicClient()

  const [state, setState] = useState<SwapState>({
    status: 'idle',
    routes: [],
    selectedRoute: null
  })
  const [tokenCache, setTokenCache] = useState<Map<Address, TokenInfo>>(new Map())

  const getTokenInfo = useCallback(async (tokenAddress: Address): Promise<TokenInfo> => {
    if (tokenCache.has(tokenAddress)) {
      return tokenCache.get(tokenAddress)!
    }

    try {
      const [decimals, symbol] = await Promise.all([
        publicClient.readContract({
          address: tokenAddress,
          abi: erc20Abi,
          functionName: "decimals"
        }),
        publicClient.readContract({
          address: tokenAddress,
          abi: erc20Abi,
          functionName: 'symbol'
        })
      ])

      const info: TokenInfo = {
        address: tokenAddress,
        symbol,
        decimals
      }

      setTokenCache(prev => new Map(prev).set(tokenAddress, info))
      return info
    } catch (error) {
      console.error('Failed to get token info', error)
      throw error
    }
  }, [publicClient, tokenCache])

  const checkPoolExists = useCallback(async (
    tokenA: Address,
    tokenB: Address,
    fee: number
  ): Promise<Address | null> => {
    try {
      const poolAddress = await publicClient.readContract({
        address: CONTRACTS.v3CoreFactory,
        abi: v3CoreFactoryContract,
        functionName: 'getPool',
        args: [tokenA, tokenB, fee]
      })

      return poolAddress === zeroAddress ? null : (poolAddress as Address)
    } catch {
      return null
    }
  }, [publicClient])

  const getPoolInfo = useCallback(async (poolAddress: Address): Promise<PoolInfo | null> => {
    try {
      const [slot0Result, liquidity, token0, token1] = await Promise.all([
        publicClient.readContract({
          address: poolAddress,
          abi: PoolABI,
          functionName: 'slot0'
        }),
        publicClient.readContract({
          address: poolAddress,
          abi: PoolABI,
          functionName: 'liquidity'
        }),
        publicClient.readContract({
          address: poolAddress,
          abi: PoolABI,
          functionName: 'token0'
        }),
        publicClient.readContract({
          address: poolAddress,
          abi: PoolABI,
          functionName: 'token1'
        }),
      ])

      return {
        token0: (token0 as Address),
        token1: (token1 as Address),
        fee: 3000,
        liquidity: liquidity as bigint,
        sqrtPriceX96: (slot0Result as any)[0]
      }
    } catch {
      return null
    }
  }, [publicClient])

  const findRoutes = useCallback(async (
    tokenA: Address,
    tokenB: Address,
    maxHops: number = 3
  ): Promise<Array<{ tokens: Address[], fees: number[] }>> => {
    const routes: Array<{ tokens: Address[], fees: number[] }> = []

    // Direct routes
    for (const fee of FEE_TIERS) {
      const poolAddress = await checkPoolExists(tokenA, tokenB, fee)
      if (poolAddress) {
        routes.push({
          tokens: [tokenA, tokenB],
          fees: [fee]
        })
      }
    }

    // Multi-hop routes throught common bases
    if (maxHops >= 2) {
      const bases = COMMON_BASES

      for (const base of bases) {
        if (base === tokenA || base === tokenB) continue

        for (const fee1 of FEE_TIERS) {
          const pool1 = await checkPoolExists(tokenA, base, fee1)
          if (!pool1) continue;

          for (const fee2 of FEE_TIERS) {
            const pool2 = await checkPoolExists(base, tokenB, fee2)
            if (pool2) {
              routes.push({
                tokens: [tokenA, base, tokenB],
                fees: [fee1, fee2]
              })
            }
          }
        }
      }
    }

    // 3-hop routes (if needed)
    if (maxHops >= 3 && routes.length === 0) {
      const bases = COMMON_BASES

      for (let i = 0; i < bases.length; i++) {
        for (let j = 0; j < bases.length; j++) {
          if (i === j) continue;
          const base1 = bases[i];
          const base2 = bases[j];

          if (base1 === tokenA || base1 === tokenB) continue
          if (base2 === tokenA || base2 === tokenB) continue

          const pool1 = await checkPoolExists(tokenA, base1, 3000)
          const pool2 = await checkPoolExists(base1, base2, 500)
          const pool3 = await checkPoolExists(base2, tokenB, 3000)

          if (pool1 && pool2 && pool3) {
            routes.push({
              tokens: [tokenA, base1, base2, tokenB],
              fees: [3000, 500, 3000]
            })
            break;
          }
        }
      }
    }

    return routes
  }, [checkPoolExists])

  const quoteRoute = useCallback(async (
    tokens: Address[],
    fees: number[],
    amountInWei: bigint
  ): Promise<{ quote: bigint, gasEstimate: bigint } | null> => {
    try {
      if (tokens.length === 2) {
        // Single Hop
        const result = await publicClient.readContract({
          address: CONTRACTS.quoterV2,
          abi: QuoterV2ABI,
          functionName: 'quoteExactInputSingle',
          args: [{
            tokenIn: tokens[0],
            tokenOut: tokens[1],
            amountIn: amountInWei,
            fee: fees[0],
            sqrtPriceLimitX96: 0n
          }]
        })

        return {
          quote: result[0],
          gasEstimate: result[3]
        }
      } else {
        // Multi-hop
        const path = encodePath(tokens, fees)
        const result = await publicClient.readContract({
          address: CONTRACTS.quoterV2,
          abi: QuoterV2ABI,
          functionName: "quoteExactInput",
          args: [path, amountInWei]
        })

        return {
          quote: result[0],
          gasEstimate: result[3]
        }
      }
    } catch (error) {
      console.error('Quote failed for route', { tokens, fees, error })
      return null
    }
  }, [publicClient])

  const loadRoutes = useCallback(async () => {
    if (!tokenIn || !tokenOut || !amountIn || amountIn === 0n) return
    if (!["ready", "idle"].includes(state.status)) return

    setState(prev => ({ ...prev, status: 'loading-routes', error: undefined }))

    try {
      // Get token decimals
      // const tokenInInfo = await getTokenInfo(tokenIn)
      const tokenOutInfo = await getTokenInfo(tokenOut)

      // Find all possible routes
      const possibleRoutes = await findRoutes(tokenIn, tokenOut)
      if (possibleRoutes.length === 0) {
        throw new Error('No routes found')
      }

      setState(prev => ({ ...prev, status: 'quoting' }))

      // Quote all routes in parallel
      const quotedRoutes = await Promise.all(
        possibleRoutes.map(async (route) => {
          const quoteResult = await quoteRoute(route.tokens, route.fees, amountIn)
          if (!quoteResult) return null

          // Get pool info for each hop
          const pools: PoolInfo[] = []
          for (let i = 0; i < route.fees.length; i++) {
            const poolAddress = await checkPoolExists(route.tokens[i], route.tokens[i + 1], route.fees[i])
            if (poolAddress) {
              const poolInfo = await getPoolInfo(poolAddress)
              if (poolInfo) pools.push(poolInfo)
            }
          }

          // get token info for path
          const pathTokenInfo = await Promise.all(
            route.tokens.map(token => getTokenInfo(token))
          )

          const spotPrice = pools[0]?.sqrtPriceX96 || 1n
          const priceImpact = calculatePriceImpact(amountIn, quoteResult.quote, spotPrice)

          return {
            path: pathTokenInfo,
            fees: route.fees,
            pools,
            quote: quoteResult.quote,
            quoteFormatted: formatUnits(quoteResult.quote, tokenOutInfo.decimals),
            priceImpact,
            gasEstimate: quoteResult.gasEstimate
          } as Route
        })
      )

      // Filter out failed quotes and sort by output amount
      const validRoutes = quotedRoutes
        .filter((route): route is Route => route !== null && route.quote > 0n)
        .sort((a, b) => {
          const aNet = a.quote - a.gasEstimate
          const bNet = b.quote - b.gasEstimate
          return aNet > bNet ? -1 : 1;
        })

      if (validRoutes.length === 0) {
        throw new Error('No valid quotes found')
      }

      setState({
        status: "ready",
        routes: validRoutes,
        selectedRoute: validRoutes[0],
        error: undefined
      })
    } catch (error) {
      console.error('Failed to load routes', error)
      setState(prev => ({
        ...prev,
        status: 'error',
        error: error instanceof Error ? error.message : 'Failed to find routes'
      }))
    }
  }, [tokenIn, tokenOut, amountIn, getTokenInfo, findRoutes, quoteRoute, checkPoolExists, getPoolInfo])

  // Load routes when inputes change
  useEffect(() => {
    loadRoutes()
  }, [loadRoutes])

  // Token approval
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: tokenIn,
    abi: erc20Abi,
    functionName: 'allowance',
    args: address ? [address, CONTRACTS.swapRouter02] : undefined,
    query: {
      enabled: !!address && !!tokenIn && state.status === "ready"
    }
  })
  const needsApproval = useMemo(() => {
    return !!state.selectedRoute && allowance !== undefined && allowance < amountIn
  }, [state.selectedRoute, allowance, amountIn])

  const {
    writeContract: executeApprove,
    data: approveTx,
    isPending: isApproving,
  } = useWriteContract()
  const { isLoading: isApprovingTxPending } = useWaitForTransactionReceipt({
    hash: approveTx
  })

  // Swap Simulation
  const { data: swapConfig } = useSimulateContract({
    address: CONTRACTS.swapRouter02,
    abi: SwapRouteV2ABI,
    functionName: state.selectedRoute?.path.length === 2 ? 'exactInputSingle' : 'exactInput',
    args: (() => {
      if (!state.selectedRoute || !address) return undefined

      const amountOutMinimum = calculateSlippageAmount(state.selectedRoute.quote, slippageTolerance)
      const deadlineTS = Math.floor(Date.now() / 1000) + deadline * 60;

      if (state.selectedRoute.path.length === 2) {
        return [{
          tokenIn: state.selectedRoute.path[0].address,
          tokenOut: state.selectedRoute.path[1].address,
          fee: state.selectedRoute.fees[0],
          recipient: recipient || address,
          amountIn,
          amountOutMinimum,
          sqrtPriceLimitX96: 0n
        }]
      } else {
        const path = encodePath(
          state.selectedRoute.path.map(t => t.address),
          state.selectedRoute.fees
        )
        return [{
          path,
          recipient: recipient || address,
          deadline: BigInt(deadlineTS),
          amountIn,
          amountOutMinimum
        }]
      }
    })(),
    query: {
      enabled: !!state.selectedRoute && !!address && !needsApproval && state.status === "ready"
    }
  })

  const {
    writeContract: executeSwap,
    data: swapTx,
    isPending: isSwapping
  } = useWriteContract()
  const { isLoading: isSwapTxPending, isSuccess: isSwapSuccess } = useWaitForTransactionReceipt({
    hash: swapTx
  })

  // uodate state based on transaction status
  useEffect(() => {
    if (isApproving || isApprovingTxPending) {
      setState(prev => ({ ...prev, status: 'approving' }))
    } else if (isSwapping || isSwapTxPending) {
      setState(prev => ({ ...prev, status: 'swapping', tsHash: swapTx }))
    } else if (isSwapSuccess) {
      setState(prev => ({ ...prev, status: 'success', txHash: swapTx }))
      queryClient.invalidateQueries({ queryKey: ["balance"] })
    }
  }, [isApproving, isApprovingTxPending, isSwapping, isSwapTxPending, isSwapSuccess, swapTx, queryClient])

  const approve = useCallback(async () => {
    if (!state.selectedRoute || !address || !needsApproval) return

    setState(prev => ({ ...prev, status: 'approving' }))

    try {
      executeApprove({
        address: tokenIn,
        abi: erc20Abi,
        functionName: "approve",
        args: [CONTRACTS.swapRouter02, 2n ** 256n - 1n], // Max approval
      }, {
        onSuccess: () => {
          refetchAllowance()
        }
      })
    } catch (error) {
      console.error('Approve failed', error)
      setState(prev => ({
        ...prev,
        status: "error",
        error: error instanceof Error ? error.message : 'Approve failed'
      }))
    }
  }, [tokenIn, state.selectedRoute, address, needsApproval, executeApprove])

  // Main Swap function
  const swap = useCallback(async () => {
    if (!state.selectedRoute || !address || needsApproval || !swapConfig) return

    try {
      setState(prev => ({ ...prev, status: 'swapping' }))
      executeSwap(swapConfig.request)
    } catch (error) {
      console.error('Swap failed', error)
      setState(prev => ({
        ...prev,
        status: "error",
        error: error instanceof Error ? error.message : 'Swap failed'
      }))
    }
  }, [state.selectedRoute, address, needsApproval, swapConfig, executeSwap])


  // select a different route
  const selectRoute = useCallback((route: Route) => {
    setState(prev => ({ ...prev, selectedRoute: route }))
  }, [])

  // Refresh quote
  const refresh = useCallback(() => {
    loadRoutes()
  }, [loadRoutes])

  const reset = () => {
    setState({
      status: "idle",
      routes: [],
      selectedRoute: null
    })
  }


  return {
    status: state.status,
    error: state.error,
    routes: state.routes,
    selectedRoute: state.selectedRoute,
    txhash: state.txHash,
    slippageTolerance: slippageTolerance,

    needsApproval,
    isLoading: ['loading-routes', 'quoting', 'approving', 'swapping'].includes(state.status),
    isReady: state.status === "ready" && !!swapConfig,

    quote: state.selectedRoute ? {
      amountOut: state.selectedRoute.quote,
      amountOutFormatted: state.selectedRoute.quoteFormatted,
      amountOutMinimum: state.selectedRoute ? calculateSlippageAmount(state.selectedRoute.quote, slippageTolerance) : 0n,
      amountOutMinimumFormatted: state.selectedRoute ?
        formatUnits(
          calculateSlippageAmount(state.selectedRoute.quote, slippageTolerance),
          state.selectedRoute.path[state.selectedRoute.path.length - 1].decimals
        ) : "0",
      priceImpact: state.selectedRoute.priceImpact,
      path: state.selectedRoute.path.map(t => `${t.symbol}`).join(' -> '),
      gasEstimate: state.selectedRoute.gasEstimate,
    } : null,

    swap,
    approve,
    selectRoute,
    refresh,
    reset
  }
}
