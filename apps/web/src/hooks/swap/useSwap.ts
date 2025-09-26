import { useCallback, useEffect, useMemo } from "react"
import { useAccount } from "wagmi"
import { useQueryClient } from "@tanstack/react-query"
import type { Address, Hex } from "viem"
import { calculateSlippageAmount } from "../../utils/swap"
import { isNativeToken } from "../../utils/swap/tokenHelpers"

// Import de nos hooks modulaires
import { useTokenPairManager } from "./useTokenPairManager"
import { useSwapRouter } from "./useSwapRouter"
import { useSwapQuoter } from "./useSwapQuoter"
import { useSwapOptimizer } from "./useSwapOptimizer"
import { useSwapValidation } from "./useSwapValidation"
import { useTokenApproval } from "./useTokenApproval"
import { useWrapUnwrap } from "./useWrapUnwrap"
import { useSwapExecution } from "./useSwapExecution"

// Types from original hook (maintained exactly)
export interface SwapParams {
  tokenIn: Address
  tokenOut: Address
  amountIn: bigint
  slippageTolerance?: number // Percent (0.05 = 5%)
  deadline?: number // Minutes
  recipient?: Address
  enableDebounce?: boolean // Enable debounce on amountIn (default: true)
  enableRouteCache?: boolean // Enable intelligent route caching (default: true)
  cacheOptions?: {
    staleTime?: number // TTL en millisecondes (défaut: 30s)
    enablePersistentCache?: boolean // Cache localStorage (défaut: true)
    backgroundRefetch?: boolean // Refetch en arrière-plan (défaut: true)
  }
}

export interface TokenInfo {
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

// Interface exacte de l'ancien hook (pour compatibilité SwapForm)
export interface UseSwapReturn {
  // État principal
  status: 'idle' | 'loading-routes' | 'quoting' | 'optimizing' | 'ready' | 'approving' | 'swapping' | 'wrapping' | 'unwrapping' | 'success' | 'error'
  error?: {
    message: string
    originalError?: unknown
    code?: string
    context?: string
  }
  routes: SingleRoute[]
  optimizedRoute: OptimizedRoute | null
  txhash?: Hex
  slippageTolerance: number

  // État des transactions
  needsApproval: boolean
  isLoading: boolean
  isReady: boolean

  // Types de transaction
  isWrap: boolean
  isUnWrap: boolean
  needsWrapBefore: boolean
  needsUnwrapAfter: boolean

  // Informations de quote (même format que l'original)
  quote: {
    amountOut: bigint
    amountOutFormatted: string
    amountOutMinimum: bigint
    priceImpact: number
    gasEstimate: bigint
    routeType: 'single' | 'split'
    routeDetails: string
    potentialSavings: bigint
  } | null

  // Actions principales (mêmes signatures)
  swap: () => Promise<void>
  approve: () => Promise<void>
  wrap: () => Promise<void>
  unwrap: () => Promise<void>
  refresh: () => void
  reset: () => void

  // Cache (simplifié pour l'instant - interface maintenue)
  cache: {
    isEnabled: boolean
    isFromCache: boolean
    isDataFresh?: boolean
    isStale?: boolean
    timestamp?: number
    cacheKey?: string | null
    invalidateCache?: () => void
    invalidateCacheForAmount?: (amount: bigint) => void
    prefetchPopularRoutes?: () => Promise<void>
    metrics?: {
      dataUpdatedAt: number
      errorUpdatedAt: number
      failureCount: number
      isFetching: boolean
    }
  }
}

export const useSwap = (params: SwapParams): UseSwapReturn => {
  const { address } = useAccount()
  const queryClient = useQueryClient()

  // Destructure params with defaults (même logique que l'original)
  const {
    tokenIn,
    tokenOut,
    amountIn,
    slippageTolerance = 0.05,
    deadline = 20,
    recipient,
  } = params

  // Phase 1: Token Management (marche sans wallet)
  const tokenPair = useTokenPairManager({
    tokenIn,
    tokenOut
  })

  // Phase 2: Route Discovery (marche sans wallet)
  const router = useSwapRouter({
    tokenIn: tokenPair.normalizedTokenIn,
    tokenOut: tokenPair.normalizedTokenOut,
    enabled: !!tokenPair.normalizedTokenIn && !!tokenPair.normalizedTokenOut
  })

  // DEBUG: Log router state
  // console.log('[useSwap] 1 - Router state:', {
  //   tokensNormalized: { in: tokenPair.normalizedTokenIn, out: tokenPair.normalizedTokenOut },
  //   routesFound: router.routes.length,
  //   routerLoading: router.isLoading,
  //   routerError: router.error?.message
  // })

  const quoter = useSwapQuoter({
    routes: router.routes,
    amountIn: amountIn,
    enabled: router.routes.length > 0  // Retirer la condition amountIn > 0n
  })

  // DEBUG: Log quoter state
  // console.log('[useSwap] 2 - Quoter state:', {
  //   routesCount: router.routes.length,
  //   amountIn: amountIn.toString(),
  //   quotedRoutesCount: quoter.quotedRoutes.length,
  //   quoterLoading: quoter.isLoading,
  //   quoterError: quoter.error?.message,
  //   quoter
  // })

  const optimizer = useSwapOptimizer({
    routes: quoter.quotedRoutes,
    amountIn: amountIn,
    enabled: quoter.quotedRoutes.length > 0
  })

  // DEBUG: Log optimizer state
  // console.log('[useSwap] 3 - Optimizer state:', {
  //   quotedRoutesCount: quoter.quotedRoutes.length,
  //   hasOptimizedRoute: !!optimizer.optimizedRoute,
  //   optimizerLoading: optimizer.isLoading,
  //   optimizerError: optimizer.error?.message,
  //   transactionData: !!optimizer.optimizedRoute?.transactionData
  // })

  // Phase 3: Validation
  const validation = useSwapValidation({
    tokenIn: tokenPair.normalizedTokenIn,
    tokenOut: tokenPair.normalizedTokenOut,
    amountIn: amountIn,
    optimizedRoute: optimizer.optimizedRoute,
    isConnected: !!address
  })

  // Phase 4: Transactions (nécessitent wallet connecté)
  // D'abord créer execution
  const execution = useSwapExecution({
    optimizedRoute: optimizer.optimizedRoute,
    amountIn: amountIn,
    slippageTolerance: slippageTolerance,
    deadline: deadline,
    recipient: recipient,
    enabled: !!optimizer.optimizedRoute, // Enabled même sans wallet pour générer transactionData
    // Pass original tokens for transaction value calculation
    originalTokenIn: tokenPair.originalTokenIn,
    originalTokenOut: tokenPair.originalTokenOut
  })

  // Puis approval qui dépend de execution
  const approval = useTokenApproval({
    tokenAddress: tokenPair.normalizedTokenIn,
    spenderAddress: execution.transactionData?.to,
    amountNeeded: amountIn,
    // Don't approve native BERA tokens - they don't need approval
    enabled: !!address && !!execution.transactionData && !isNativeToken(tokenPair.originalTokenIn)
  })

  const wrapUnwrap = useWrapUnwrap({
    amount: amountIn,
    enabled: !!address
  })

  // DEBUG: Log approval state
  // console.log('[useSwap] 4 - Approval state:', {
  //   isConnected: !!address,
  //   hasOptimizedRoute: !!optimizer.optimizedRoute,
  //   hasTransactionData: !!execution.transactionData,
  //   spenderAddress: execution.transactionData?.to,
  //   needsApproval: approval.needsApproval,
  //   approvalError: approval.approveError?.message
  // })

  // DÉRIVATION DU STATUS (même logique que l'original)
  const status = useMemo(() => {
    // Transaction states (priorité haute)
    if (approval.isApproving) return 'approving'
    if (execution.isExecuting) return 'swapping'
    if (wrapUnwrap.isWrapping) return 'wrapping'
    if (wrapUnwrap.isUnwrapping) return 'unwrapping'

    // Success states
    if (execution.isExecuteSuccess || wrapUnwrap.isWrapSuccess || wrapUnwrap.isUnwrapSuccess) {
      return 'success'
    }

    // Error states (consolidate all errors)
    if (
      router.error ||
      quoter.error ||
      optimizer.error ||
      approval.approveError ||
      execution.executeError ||
      wrapUnwrap.wrapError ||
      wrapUnwrap.unwrapError
    ) {
      return 'error'
    }

    // Simulation is in error if we need to allow token.
    if (!approval.needsApproval && execution.simulateError) return 'error'

    // Loading states
    if (router.isLoading) return 'loading-routes'
    if (quoter.isLoading) return 'quoting'
    if (optimizer.isLoading) return 'optimizing'

    // Ready state
    if (optimizer.optimizedRoute && validation.canExecute) {
      return 'ready'
    }

    return 'idle'
  }, [
    approval.isApproving, execution.isExecuting, wrapUnwrap.isWrapping, wrapUnwrap.isUnwrapping,
    execution.isExecuteSuccess, wrapUnwrap.isWrapSuccess, wrapUnwrap.isUnwrapSuccess,
    router.error, quoter.error, optimizer.error, approval.approveError, execution.executeError, execution.simulateError, wrapUnwrap.wrapError, wrapUnwrap.unwrapError,
    router.isLoading, quoter.isLoading, optimizer.isLoading,
    optimizer.optimizedRoute, validation.canExecute
  ])

  // CONSOLIDATION D'ERREURS (prendre la première erreur non null)
  const consolidatedError = useMemo(() => {
    return (
      router.error ||
      quoter.error ||
      optimizer.error ||
      approval.approveError ||
      execution.simulateError ||
      execution.executeError ||
      wrapUnwrap.wrapError ||
      wrapUnwrap.unwrapError
    )
  }, [
    router.error, quoter.error, optimizer.error, approval.approveError,
    execution.executeError, execution.simulateError, wrapUnwrap.wrapError, wrapUnwrap.unwrapError
  ])

  // DEBUG: Log status changes
  // console.log('[useSwap] 5 - Status and consolidated state:', {
  //   status,
  //   hasConsolidatedError: !!consolidatedError,
  //   consolidatedErrorMessage: consolidatedError?.message,
  //   isLoading: ['loading-routes', 'quoting', 'optimizing', 'approving', 'swapping', 'wrapping', 'unwrapping'].includes(status),
  //   isReady: status === "ready" && !!execution.transactionData
  // })

  // TX HASH consolidé
  const txHash: Hex | undefined = useMemo(() => {
    return execution.executeTxHash || wrapUnwrap.wrapTxHash || wrapUnwrap.unwrapTxHash
  }, [execution.executeTxHash, wrapUnwrap.wrapTxHash, wrapUnwrap.unwrapTxHash])

  // ACTIONS COMPOSÉES
  const swap = useCallback(async () => {
    if (tokenPair.wrapInfo.isWrap) {
      await wrapUnwrap.wrap()
    } else if (tokenPair.wrapInfo.isUnwrap) {
      await wrapUnwrap.unwrap()
    } else {
      // Swap normal avec approval si nécessaire
      if (approval.needsApproval) {
        await approval.approve()
        return // L'approval sera attendu, puis executeSwap se déclenchera
      }
      await execution.executeSwap()
    }
  }, [tokenPair.wrapInfo.isWrap, tokenPair.wrapInfo.isUnwrap, approval.needsApproval, approval.approve, wrapUnwrap.wrap, wrapUnwrap.unwrap, execution.executeSwap])

  // FORMATAGE DE QUOTE (même format que l'original)
  const quote = useMemo(() => {
    if (!optimizer.optimizedRoute) return null

    return {
      amountOut: optimizer.optimizedRoute.totalQuote,
      amountOutFormatted: optimizer.optimizedRoute.quoteFormatted,
      amountOutMinimum: calculateSlippageAmount(optimizer.optimizedRoute.totalQuote, slippageTolerance),
      priceImpact: optimizer.optimizedRoute.priceImpact,
      gasEstimate: optimizer.optimizedRoute.totalGasEstimate,
      routeType: optimizer.optimizedRoute.type,
      routeDetails: optimizer.optimizedRoute.type === 'split'
        ? `Split: ${optimizer.optimizedRoute.routes.map(r => `${r.percentage}%`).join(' + ')}`
        : `Single: ${optimizer.optimizedRoute.routes[0].route.path.map(t => t.symbol).join(' → ')}`,
      potentialSavings: quoter.quotedRoutes.length > 0 && optimizer.optimizedRoute.type === 'split'
        ? optimizer.optimizedRoute.totalQuote - quoter.quotedRoutes[0].quote
        : 0n
    }
  }, [optimizer.optimizedRoute, slippageTolerance, quoter.quotedRoutes])

  // REFRESH function
  const refresh = useCallback(() => {
    // Pour l'instant, simple refresh par re-trigger
    // TODO: implémenter des méthodes refetch dans les hooks modulaires si nécessaire

    // Invalider cache balance après success
    if (status === 'success') {
      queryClient.invalidateQueries({ queryKey: ["balance"] })
    }
  }, [status, queryClient])

  // RESET function
  const reset = useCallback(() => {
    // Reset toutes les transactions des hooks modulaires
    approval.reset()
    execution.reset()
    wrapUnwrap.reset()

    // Invalider les caches de balances après reset
    queryClient.invalidateQueries({ queryKey: ["balance"] })
  }, [approval.reset, execution.reset, wrapUnwrap.reset, queryClient])

  // Auto-invalidate balance cache on success
  useEffect(() => {
    if (status === 'success') {
      queryClient.invalidateQueries({ queryKey: ["balance"] })
    }
  }, [status, queryClient])

  // RETOUR DE L'INTERFACE EXACTE DE L'ANCIEN HOOK
  return {
    // État principal
    status,
    error: consolidatedError ? {
      message: consolidatedError.message || 'Unknown error',
      originalError: consolidatedError,
      code: (consolidatedError as any).code,
      context: (consolidatedError as any).context
    } : undefined,
    routes: quoter.quotedRoutes,
    optimizedRoute: optimizer.optimizedRoute,
    txhash: txHash,
    slippageTolerance: slippageTolerance,

    // État des transactions
    needsApproval: approval.needsApproval,
    isLoading: ['loading-routes', 'quoting', 'optimizing', 'approving', 'swapping', 'wrapping', 'unwrapping'].includes(status),
    isReady: status === "ready" && !!execution.transactionData,

    // Types de transaction
    isWrap: tokenPair.wrapInfo.isWrap,
    isUnWrap: tokenPair.wrapInfo.isUnwrap,
    needsWrapBefore: tokenPair.wrapInfo.needsWrapBefore,
    needsUnwrapAfter: tokenPair.wrapInfo.needsUnwrapAfter,

    // Informations de quote
    quote,

    // Actions principales
    swap,
    approve: approval.approve,
    wrap: wrapUnwrap.wrap,
    unwrap: wrapUnwrap.unwrap,
    refresh,
    reset,

    // Cache (désactivé pour l'instant - interface maintenue pour compatibilité)
    cache: {
      isEnabled: false,
      isFromCache: false,
      isDataFresh: true,
      isStale: false,
      timestamp: 0,
      cacheKey: null,
      invalidateCache: () => { },
      invalidateCacheForAmount: () => { },
      prefetchPopularRoutes: async () => { },
      metrics: {
        dataUpdatedAt: 0,
        errorUpdatedAt: 0,
        failureCount: 0,
        isFetching: false
      }
    }
  }
}