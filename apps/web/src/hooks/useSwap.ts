import { useCallback, useEffect, useMemo, useState } from "react"
import { encodePacked, erc20Abi, formatUnits, parseEther, zeroAddress, type Address, type Hex } from "viem"
import { useAccount, usePublicClient, useReadContract, useSimulateContract, useWaitForTransactionReceipt, useWriteContract } from "wagmi"
import { calculatePriceImpact, calculateSlippageAmount, encodePath } from "../utils/swap"
import { useQueryClient } from "@tanstack/react-query"

import { CONTRACTS_ADDRESS } from "../config/contractsAddress"

import { v3CoreFactoryContract } from "../config/abis/v3CoreFactoryContractABI"
import { UniversalRouteABI } from "../config/abis/UniversalRouteABI"
import { SwapRouteV2ABI } from "../config/abis/swapRouter"
import { PoolABI } from "../config/abis/poolABI"
import { QuoterV2ABI } from "../config/abis/QuoterV2"
import { wBeraABI } from "../config/abis/wBeraABI"

const COMMON_BASES: Address[] = [
  '0xFCBD14DC51f0A4d49d5E53C2E0950e0bC26d0Dce', // HONEY
  '0x0000000000000000000000000000000000000000', // BERA
  '0x6969696969696969696969696969696969696969', // wBera
]

const FEE_TIERS = [100, 500, 3000, 10000]

const ORDER_SPLIT_THRESHOLD = parseEther('100')

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

export interface PoolInfo {
  token0: Address;
  token1: Address;
  fee: number;
  liquidity: bigint;
  sqrtPriceX96: bigint;
}

export interface SingleRoute {
  path: TokenInfo[]
  fees: number[]
  pools: PoolInfo[]
  quote: bigint
  gasEstimate: bigint
}

interface TransactionData {
  to: Address
  functionName: string
  abi: any
  args: any[]
  value: bigint
}
export interface OptimizedRoute {
  type: 'single' | 'split'
  totalQuote: bigint
  totalGasEstimate: bigint
  quoteFormatted: string
  priceImpact: number
  routes: Array<{
    route: SingleRoute
    percentage: number
    amount: bigint
    quote: bigint
  }>
  transactionData: TransactionData | null
}

interface SwapState {
  status: 'idle' | 'loading-routes' | 'quoting' | 'optimizing' | 'ready' | 'approving' | 'swapping' | 'wrapping' | 'unwrapping' | 'success' | 'error'
  error?: string
  routes: SingleRoute[]
  optimizedRoute: OptimizedRoute | null
  txHash?: Hex
}

const WBERA: Address = "0x6969696969696969696969696969696969696969"

const parseParams = (params: SwapParams) => {
  const isWrap = params.tokenIn === zeroAddress && params.tokenOut === WBERA
  const isUnWrap = params.tokenIn === WBERA && params.tokenOut === zeroAddress

  return {
    ...params,
    tokenIn: params.tokenIn === zeroAddress && !isWrap
      ? WBERA
      : params.tokenIn,
    tokenOut: params.tokenOut === zeroAddress && !isUnWrap
      ? WBERA
      : params.tokenOut,
    isWrap,
    isUnWrap
  }
}

export const useSwap = (params: SwapParams) => {
  const queryClient = useQueryClient()
  const { tokenIn, tokenOut, amountIn, slippageTolerance = 0.05, deadline = 20, recipient, isWrap, isUnWrap } = parseParams(params)
  const { address } = useAccount()
  const publicClient = usePublicClient()

  const [state, setState] = useState<SwapState>({
    status: 'idle',
    routes: [],
    optimizedRoute: null
  })

  const [tokenCache, setTokenCache] = useState<Map<Address, TokenInfo>>(() => {
    const defaultTokens = new Map<Address, TokenInfo>()
    defaultTokens.set(
      "0x0000000000000000000000000000000000000000",
      {
        address: "0x0000000000000000000000000000000000000000",
        symbol: "BERA",
        decimals: 18,
        name: "Bera"
      })
    return defaultTokens
  })

  /**
   * Fetch datas onChain
   */
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
        address: CONTRACTS_ADDRESS.v3CoreFactory,
        abi: v3CoreFactoryContract,
        functionName: 'getPool',
        args: [tokenA, tokenB, fee]
      })

      return poolAddress === zeroAddress ? null : (poolAddress as Address)
    } catch {
      return null
    }
  }, [publicClient])

  const getPoolInfo = useCallback(async (poolAddress: Address, fee: number): Promise<PoolInfo | null> => {
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
        fee,
        liquidity: liquidity as bigint,
        sqrtPriceX96: (slot0Result as any)[0]
      }
    } catch {
      return null
    }
  }, [publicClient])

  /**
   * Swap path finder and optimization
   */
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
          address: CONTRACTS_ADDRESS.quoterV2,
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
          address: CONTRACTS_ADDRESS.quoterV2,
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

  const testOrderSplitting = useCallback(async (
    routes: SingleRoute[],
    amountIn: bigint
  ): Promise<OptimizedRoute[]> => {
    if (routes.length < 2 || amountIn < ORDER_SPLIT_THRESHOLD) {
      return []
    }

    const splitRoutes: OptimizedRoute[] = []
    const topRoutes = routes.slice(0, 3)

    const distributions = [
      [70, 30], [60, 40], [50, 50], [80, 20], [40, 60]
    ]

    for (const dist of distributions) {
      if (topRoutes.length < 2) break

      const amount1 = (amountIn * BigInt(dist[0])) / 100n
      const amount2 = (amountIn * BigInt(dist[1])) / 100n

      const [quote1, quote2] = await Promise.all([
        quoteRoute(
          topRoutes[0].path.map(t => t.address),
          topRoutes[0].fees,
          amount1
        ),
        quoteRoute(
          topRoutes[1].path.map(t => t.address),
          topRoutes[1].fees,
          amount2
        )
      ])

      if (quote1 && quote2) {
        const totalQuote = quote1.quote + quote2.quote
        const totalGas = quote1.gasEstimate + quote2.gasEstimate

        splitRoutes.push({
          type: "split",
          totalQuote,
          totalGasEstimate: totalGas,
          quoteFormatted: formatUnits(totalQuote, topRoutes[0].path[topRoutes[0].path.length - 1].decimals),
          priceImpact: calculatePriceImpact(
            amountIn,
            totalQuote,
            topRoutes[0].pools[0]?.sqrtPriceX96 || 1n,
            topRoutes[0].path[0].decimals,
            topRoutes[0].path[topRoutes[0].path.length - 1].decimals
          ),
          routes: [
            {
              route: topRoutes[0],
              percentage: dist[0],
              amount: amount1,
              quote: quote1.quote
            },
            {
              route: topRoutes[1],
              percentage: dist[1],
              amount: amount2,
              quote: quote2.quote
            }
          ],
          transactionData: null
        })
      }
    }

    return splitRoutes
  }, [quoteRoute])

  const generateTransactionData = useCallback(async (
    route: OptimizedRoute
  ): Promise<TransactionData> => {
    if (!address) throw new Error('No address')

    const deadlineTS = BigInt(Math.floor(Date.now() / 1000) + deadline * 60)

    if (route.type === "single") {
      // simple Tx with SwapRouter02
      const singleRoute = route.routes[0].route
      const amountOutMinimum = calculateSlippageAmount(route.totalQuote, slippageTolerance)

      if (singleRoute.path.length === 2) {
        // Single hop
        const params = {
          tokenIn: singleRoute.path[0].address,
          tokenOut: singleRoute.path[1].address,
          fee: singleRoute.fees[0],
          recipient: recipient || address,
          amountIn,
          amountOutMinimum,
          sqrtPriceLimitX96: 0n
        }

        return {
          to: CONTRACTS_ADDRESS.swapRouter02,
          abi: SwapRouteV2ABI,
          functionName: "exactInputSingle",
          args: [params],
          value: tokenIn === WBERA ? amountIn : 0n
        }
      } else {
        // Multi-hop
        const path = encodePath(
          singleRoute.path.map(t => t.address),
          singleRoute.fees
        )

        const params = {
          path,
          recipient: recipient || address,
          deadline: deadlineTS,
          amountIn,
          amountOutMinimum
        }

        return {
          to: CONTRACTS_ADDRESS.swapRouter02,
          abi: SwapRouteV2ABI,
          functionName: 'exactInput',
          args: [params],
          value: tokenIn === WBERA ? amountIn : 0n
        }
      }
    } else {
      // Complexe tx via UniversalRouter (multicall)
      const commands: Hex[] = []
      const inputs: Hex[] = []
      let totalValue = 0n

      for (const splitRoute of route.routes) {
        const amountOutMinimum = calculateSlippageAmount(splitRoute.quote, slippageTolerance)

        if (splitRoute.route.path.length === 2) {
          commands.push('0x00')

          const swapData = encodePacked(
            ['address', 'address', 'uint24', 'address'],
            [
              splitRoute.route.path[0].address,
              splitRoute.route.path[1].address,
              splitRoute.route.fees[0],
              recipient || address
            ]
          )

          inputs.push(
            encodePacked(
              ['address', 'uint256', 'uint256', 'bytes'],
              [recipient || address, splitRoute.amount, amountOutMinimum, swapData]
            )
          )
        } else {
          commands.push('0x00')
          const path = encodePath(
            splitRoute.route.path.map(t => t.address),
            splitRoute.route.fees
          )

          inputs.push(
            encodePacked(
              ['address', 'uint256', 'uint256', 'bytes'],
              [recipient || address, splitRoute.amount, amountOutMinimum, path]
            )
          )
        }

        if (tokenIn === WBERA) {
          totalValue += splitRoute.amount
        }
      }

      return {
        to: CONTRACTS_ADDRESS.universalRouter,
        abi: UniversalRouteABI,
        functionName: 'execute',
        args: [commands, inputs, deadlineTS],
        value: totalValue
      }
    }
  }, [address, deadline, slippageTolerance, recipient, tokenIn, amountIn])

  const optimizeRoutes = useCallback(async (routes: SingleRoute[]) => {
    if (routes.length === 0) return null

    setState(prev => ({ ...prev, status: 'optimizing' }))

    try {
      // 1. Create simple route (best classic route)
      const bestSingleRoute = routes[0]
      const tokenOutInfo = await getTokenInfo(bestSingleRoute.path[bestSingleRoute.path.length - 1].address)

      const singleOptimized: OptimizedRoute = {
        type: "single",
        totalQuote: bestSingleRoute.quote,
        totalGasEstimate: bestSingleRoute.gasEstimate,
        quoteFormatted: formatUnits(bestSingleRoute.quote, tokenOutInfo.decimals),
        priceImpact: calculatePriceImpact(
          amountIn,
          bestSingleRoute.quote,
          bestSingleRoute.pools[0]?.sqrtPriceX96 || 1n,
          bestSingleRoute.path[0].decimals,
          bestSingleRoute.path[bestSingleRoute.path.length - 1].decimals
        ),
        routes: [{
          route: bestSingleRoute,
          percentage: 100,
          amount: amountIn,
          quote: bestSingleRoute.quote
        }],
        transactionData: null
      }

      // 2. Test split routes
      const splitOptions = await testOrderSplitting(routes, amountIn)

      // 3. Compare all options
      const allOptions = [singleOptimized, ...splitOptions]

      const gasPrice = 1000000000n // 1gwei
      const bestOption = allOptions.reduce((best, current) => {
        const bestNet = best.totalQuote - (best.totalGasEstimate * gasPrice)
        const currentNet = current.totalQuote - (current.totalGasEstimate * gasPrice)
        return currentNet > bestNet ? current : best
      })

      // 4. Generate transactionData
      bestOption.transactionData = await generateTransactionData(bestOption)

      return bestOption
    } catch (error) {
      console.error('Route optimization failed', error)
      return null
    }
  }, [amountIn, testOrderSplitting, generateTransactionData, getTokenInfo])

  /**
   * Main function to fetch routes
   */
  const loadRoutes = useCallback(async () => {
    if (!tokenIn || !tokenOut || !amountIn || amountIn === 0n) return
    if (!["ready", "idle"].includes(state.status)) return

    setState(prev => ({ ...prev, status: 'loading-routes', error: undefined }))

    try {
      // 1. Find all possible routes
      const possibleRoutes = await findRoutes(tokenIn, tokenOut)
      if (possibleRoutes.length === 0) {
        throw new Error('No routes found')
      }

      setState(prev => ({ ...prev, status: 'quoting' }))

      // 2. Quote all routes in parallel
      const quotedRoutes = await Promise.all(
        possibleRoutes.map(async (route) => {
          const quoteResult = await quoteRoute(route.tokens, route.fees, amountIn)
          if (!quoteResult) return null

          // Get pool info for each hop
          const pools: PoolInfo[] = []
          for (let i = 0; i < route.fees.length; i++) {
            const poolAddress = await checkPoolExists(route.tokens[i], route.tokens[i + 1], route.fees[i])
            if (poolAddress) {
              const poolInfo = await getPoolInfo(poolAddress, route.fees[i])
              if (poolInfo) pools.push(poolInfo)
            }
          }

          // get token info for path
          const pathTokenInfo = await Promise.all(
            route.tokens.map(token => getTokenInfo(token))
          )

          return {
            path: pathTokenInfo,
            fees: route.fees,
            pools,
            quote: quoteResult.quote,
            gasEstimate: quoteResult.gasEstimate
          } as SingleRoute
        })
      )

      // Filter out failed quotes and sort by output amount
      const validRoutes = quotedRoutes
        .filter((route): route is SingleRoute => route !== null && route.quote > 0n)
        .sort((a, b) => {
          const aNet = a.quote - a.gasEstimate
          const bNet = b.quote - b.gasEstimate
          return aNet > bNet ? -1 : 1;
        })

      if (validRoutes.length === 0) {
        throw new Error('No valid quotes found')
      }

      // 3. Optimize routes
      const optimizedRoute = await optimizeRoutes(validRoutes)
      if (!optimizedRoute) {
        throw new Error('Route optimization failed')
      }

      setState({
        status: "ready",
        routes: validRoutes,
        optimizedRoute,
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
  }, [tokenIn, tokenOut, amountIn, findRoutes, quoteRoute, checkPoolExists, getPoolInfo, optimizeRoutes])

  /**
   * Token approval
   */
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: tokenIn,
    abi: erc20Abi,
    functionName: 'allowance',
    args: address && state?.optimizedRoute?.transactionData?.to ? [address, state.optimizedRoute.transactionData.to] : undefined,
    query: {
      enabled: !!address && !!tokenIn && ["error", "ready"].includes(state.status),
      refetchInterval: 2000
    }
  })
  const needsApproval = useMemo(() => {
    return !!state.optimizedRoute && allowance !== undefined && allowance < amountIn
  }, [state.optimizedRoute, allowance, amountIn])

  const {
    writeContract: executeApprove,
    data: approveTx,
    isPending: isApproving,
  } = useWriteContract()
  const { isLoading: isApprovingTxPending } = useWaitForTransactionReceipt({
    hash: approveTx
  })

  const approve = useCallback(async () => {
    if (!state.optimizedRoute || !address || !needsApproval) return

    const approvalTarget = state.optimizedRoute.transactionData?.to || CONTRACTS_ADDRESS.swapRouter02

    setState(prev => ({ ...prev, status: 'approving' }))

    try {
      executeApprove({
        address: tokenIn,
        abi: erc20Abi,
        functionName: "approve",
        args: [approvalTarget, 2n ** 256n - 1n], // Max approval
      }, {
        onSuccess: () => {
          refetchAllowance()
        },
        onError: (error) => {
          setState(prev => ({
            ...prev,
            status: "error",
            error: error instanceof Error ? error.message : 'Approve failed'
          }))
        }
      })
    } catch (error) {
      setState(prev => ({
        ...prev,
        status: "error",
        error: error instanceof Error ? error.message : 'Approve failed'
      }))
    }
  }, [tokenIn, state.optimizedRoute, address, needsApproval, executeApprove])

  /**
   * Wrap / UnWrap
   */
  const {
    writeContract: executeWrap,
    isPending: isWrapping,
    data: wrapTx
  } = useWriteContract()
  const { isLoading: isWrapTxPending, isSuccess: isWrapSuccess } = useWaitForTransactionReceipt({
    hash: wrapTx
  })
  const { data: wrapConfig } = useSimulateContract({
    address: WBERA,
    abi: wBeraABI,
    functionName: "deposit",
    value: amountIn,
    query: {
      enabled: isWrap && !!address
    }
  })
  const wrap = useCallback(() => {
    if (!wrapConfig?.request) return

    setState(prev => ({ ...prev, status: 'wrapping' }))

    try {
      executeWrap(wrapConfig.request, {
        onError: (error) => {
          setState(prev => ({
            ...prev,
            status: "error",
            error: error instanceof Error ? error.message : 'Wrap failed'
          }))
        }
      })
    } catch (error) {
      setState(prev => ({
        ...prev,
        status: "error",
        error: error instanceof Error ? error.message : 'Wrap failed'
      }))
    }
  }, [wrapConfig])

  const {
    writeContract: executeUnWrap,
    isPending: isUnWrapping,
    data: unWrapTx
  } = useWriteContract()
  const { isLoading: isUnWrapTxPending, isSuccess: isUnWrapSuccess } = useWaitForTransactionReceipt({
    hash: unWrapTx
  })
  const { data: unWrapConfig } = useSimulateContract({
    address: WBERA,
    abi: wBeraABI,
    functionName: "withdraw",
    args: [amountIn],
    query: {
      enabled: isUnWrap && !!address
    }
  })
  const unwrap = useCallback(() => {
    if (!unWrapConfig?.request) return

    setState(prev => ({ ...prev, status: 'unwrapping' }))

    try {
      executeUnWrap(unWrapConfig.request, {
        onError: (error) => {
          setState(prev => ({
            ...prev,
            status: "error",
            error: error instanceof Error ? error.message : 'Unwrap failed'
          }))
        }
      })
    } catch (error) {
      setState(prev => ({
        ...prev,
        status: "error",
        error: error instanceof Error ? error.message : 'Unwrap failed'
      }))
    }
  }, [unWrapConfig])

  /**
    * Swap
    */
  const {
    writeContract: executeSwap,
    data: swapTx,
    isPending: isSwapping
  } = useWriteContract()
  const { isLoading: isSwapTxPending, isSuccess: isSwapSuccess } = useWaitForTransactionReceipt({
    hash: swapTx
  })

  const { data: swapConfig } = useSimulateContract({
    address: state.optimizedRoute?.transactionData?.to,
    abi: state.optimizedRoute?.transactionData?.abi,
    functionName: state.optimizedRoute?.transactionData?.functionName,
    args: state.optimizedRoute?.transactionData?.args,
    query: {
      enabled: !!state.optimizedRoute?.transactionData && !!address && !needsApproval && ["error", "ready"].includes(state.status)
    },
    value: state.optimizedRoute?.transactionData?.value || 0n
  })

  const swap = useCallback(async () => {
    if (!swapConfig?.request || !address || needsApproval) return

    setState(prev => ({ ...prev, status: 'swapping' }))

    try {
      executeSwap(swapConfig.request, {
        onError: (error) => {
          setState(prev => ({
            ...prev,
            status: "error",
            error: error instanceof Error ? error.message : 'Swap failed'
          }))
        }
      })
    } catch (error) {
      setState(prev => ({
        ...prev,
        status: "error",
        error: error instanceof Error ? error.message : 'Swap failed'
      }))
    }
  }, [address, needsApproval, executeSwap, swapConfig])

  /**
   * Utils
   */
  const refresh = useCallback(() => {
    loadRoutes()
  }, [loadRoutes])
  const reset = () => {
    setState({
      status: "idle",
      routes: [],
      optimizedRoute: null
    })
  }
  // Load routes when inputes change
  useEffect(() => {
    loadRoutes()
  }, [loadRoutes])
  // Update swap state
  useEffect(() => {
    if (isApproving || isApprovingTxPending) {
      setState(prev => ({ ...prev, status: 'approving' }))
    } else if (isSwapping || isSwapTxPending) {
      setState(prev => ({ ...prev, status: 'swapping', tsHash: swapTx }))
    } else if (isWrapping || isWrapTxPending) {
      setState(prev => ({ ...prev, status: 'wrapping', tsHash: wrapTx }))
    } else if (isUnWrapping || isUnWrapTxPending) {
      setState(prev => ({ ...prev, status: 'unwrapping', tsHash: unWrapTx }))
    } else if (isSwapSuccess || isWrapSuccess || isUnWrapSuccess) {
      setState(prev => ({ ...prev, status: 'success', txHash: swapTx }))
      queryClient.invalidateQueries({ queryKey: ["balance"] })
    } else if (swapConfig?.request) {
      setState(prev => ({ ...prev, status: 'ready' }))
    } else {
      setState(prev => ({ ...prev, status: 'idle' }))
    }
  }, [isApproving, isApprovingTxPending, isSwapping, isSwapTxPending, isSwapSuccess, swapTx, queryClient, swapConfig, isWrapping, isUnWrapping, isWrapTxPending, isUnWrapTxPending, isWrapSuccess, isUnWrapSuccess])

  return {
    status: state.status,
    error: state.error,
    routes: state.routes,
    optimizedRoute: state.optimizedRoute,
    txhash: state.txHash,
    slippageTolerance: slippageTolerance,

    needsApproval,
    isLoading: ['loading-routes', 'quoting', 'optimizing', 'approving', 'swapping', 'wrapping', 'unwrapping'].includes(state.status),
    isReady: state.status === "ready" && !!state.optimizedRoute?.transactionData,

    isWrap,
    isUnWrap,

    quote: state.optimizedRoute ? {
      amountOut: state.optimizedRoute.totalQuote,
      amountOutFormatted: state.optimizedRoute.quoteFormatted,
      amountOutMinimum: calculateSlippageAmount(state.optimizedRoute.totalQuote, slippageTolerance),
      priceImpact: state.optimizedRoute.priceImpact,
      gasEstimate: state.optimizedRoute.totalGasEstimate,
      routeType: state.optimizedRoute.type,
      routeDetails: state.optimizedRoute.type === 'split'
        ? `Split: ${state.optimizedRoute.routes.map(r => `${r.percentage}%`).join(' + ')}`
        : `Single: ${state.optimizedRoute.routes[0].route.path.map(t => t.symbol).join(' → ')}`,
      potentialSavings: state.routes.length > 0 && state.optimizedRoute.type === 'split'
        ? state.optimizedRoute.totalQuote - state.routes[0].quote
        : 0n
    } : null,

    swap,
    approve,
    refresh,
    wrap,
    unwrap,
    reset
  }
}
