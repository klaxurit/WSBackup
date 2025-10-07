import { type Address, type Hex } from "viem"
import { useAccount, useSimulateContract, useWaitForTransactionReceipt, useWriteContract } from "wagmi"
import { useMemo } from "react"
import { CONTRACTS_ADDRESS } from "../../config/contractsAddress"
import { currentChain } from "../../config/wagmi"
import { StickyVaultRouter } from "../../config/abis/StickyVaultRouter"
import { useTokenAllowance } from "./useTokenAllowance"
import { useVaultQuote } from "./useVaultQuote"
import { useSlippage } from "./useSlippage"

interface UseDoubleDepositParams {
  vault: Address
  token0: Address
  token1: Address
  amount0: bigint
  amount1: bigint
  slippageBps: number
}

interface UseDoubleDepositReturn {
  // Quote data
  quote: {
    amount0Max: bigint | null
    amount0Min: bigint | null
    amount1Max: bigint | null
    amount1Min: bigint | null
    minShares: bigint | null
  }
  isQuoted: boolean

  // Allowances
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
  }
  isAllow: boolean

  // Deposit action
  deposite: {
    depose: () => void
    isPending: boolean
    isLoading: boolean
    isSuccess: boolean
    hash?: Hex
  }
}

export const useDoubleDeposit = ({
  vault,
  token0,
  token1,
  amount0,
  amount1,
  slippageBps
}: UseDoubleDepositParams): UseDoubleDepositReturn => {
  const { address } = useAccount()
  const { calculateMinAmount } = useSlippage(slippageBps)

  const isReady = !!address && !!vault && !!token0 && !!token1 && amount0 > 0n && amount1 > 0n

  // Get vault quote
  const { quote } = useVaultQuote({
    vaultAddress: vault,
    amount0,
    amount1,
    enabled: isReady
  })

  // Calculate minimum amounts with slippage
  const [amount0Min, amount1Min, minShares] = useMemo(() => {
    if (!quote) return [null, null, null]
    return [
      calculateMinAmount(quote.amount0, slippageBps),
      calculateMinAmount(quote.amount1, slippageBps),
      calculateMinAmount(quote.shares, slippageBps)
    ]
  }, [quote, calculateMinAmount, slippageBps])

  const isQuoted = !!amount0Min && !!amount1Min && !!minShares

  // Token0 allowance management
  const t0Allowance = useTokenAllowance({
    tokenAddress: token0,
    spenderAddress: CONTRACTS_ADDRESS.STICKYVAULT_ROUTER,
    amount: amount0,
    enabled: isQuoted
  })

  // Token1 allowance management
  const t1Allowance = useTokenAllowance({
    tokenAddress: token1,
    spenderAddress: CONTRACTS_ADDRESS.STICKYVAULT_ROUTER,
    amount: amount1,
    enabled: isQuoted
  })

  const isAllow = !t0Allowance.isNeedApproval && !t1Allowance.isNeedApproval

  // Simulate and execute deposit transaction
  const { data: depositConfig } = useSimulateContract({
    address: CONTRACTS_ADDRESS.STICKYVAULT_ROUTER,
    abi: StickyVaultRouter,
    functionName: "addLiquidity",
    args: [vault, amount0, amount1, amount0Min!, amount1Min!, minShares!, address!],
    chainId: currentChain.id,
    query: {
      enabled: isQuoted && isAllow && !!address
    }
  })

  const { data: depositHash, writeContract: writeDeposit, isPending: isDepositing } = useWriteContract()

  // Wait for transaction receipt
  const {
    isLoading: isDepositLoading,
    isSuccess: isDepositSuccess
  } = useWaitForTransactionReceipt({
    hash: depositHash,
    query: {
      enabled: !!depositHash
    }
  })

  const handleDeposit = () => {
    if (!depositConfig?.request) return
    writeDeposit(depositConfig.request)
  }

  return {
    quote: {
      amount0Max: amount0,
      amount0Min,
      amount1Max: amount1,
      amount1Min,
      minShares
    },
    isQuoted,
    t0Allowance: {
      isNeed: t0Allowance.isNeedApproval,
      current: t0Allowance.allowance,
      allow: t0Allowance.approve,
      isLoading: t0Allowance.isLoading,
      isApprove: t0Allowance.isApproving,
      hash: t0Allowance.approveHash,
      refetch: t0Allowance.refetch
    },
    t1Allowance: {
      isNeed: t1Allowance.isNeedApproval,
      current: t1Allowance.allowance,
      allow: t1Allowance.approve,
      isLoading: t1Allowance.isLoading,
      isApprove: t1Allowance.isApproving,
      hash: t1Allowance.approveHash,
      refetch: t1Allowance.refetch
    },
    isAllow,
    deposite: {
      depose: handleDeposit,
      isPending: isDepositing,
      isLoading: isDepositLoading,
      isSuccess: isDepositSuccess,
      hash: depositHash
    }
  }
}