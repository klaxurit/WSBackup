import { type Address, type Hex } from "viem"
import { useAccount, useSimulateContract, useWaitForTransactionReceipt, useWriteContract } from "wagmi"
import { CONTRACTS_ADDRESS } from "../../config/contractsAddress"
import { currentChain } from "../../config/wagmi"
import { autowinABI } from "../../config/abis/AutowinRouter"
import { useTokenAllowance } from "./useTokenAllowance"
import { useSlippage } from "./useSlippage"
import { useReadContract } from "wagmi"
import { AutowinABI } from "../../config/abis/Autowin"

interface UseAutoWinWithdrawParams {
  autoWinVault: Address | undefined
  burnAmount: bigint
  slippageBps: number
  enabled?: boolean
}

export interface UseAutoWinWithdrawReturn {
  // Estimated amount of staking tokens to receive
  estimatedAmount: bigint | undefined

  // AutoWin vault token allowance
  allowance: {
    isNeed: boolean
    current?: bigint
    allow: () => void
    isLoading: boolean
    isApprove: boolean
    hash?: Hex
    refetch: () => void
  }
  isAllow: boolean

  // Withdraw action
  withdraw: {
    execute: () => void
    isPending: boolean
    isLoading: boolean
    isSuccess: boolean
    hash?: Hex
    reset: () => void
  }
}

/**
 * Hook for withdrawing (redeeming) from an AutoWin vault
 * Handles AutoWin vault share approval and redemption execution
 */
export const useAutoWinWithdraw = ({
  autoWinVault,
  burnAmount,
  slippageBps,
  enabled = true
}: UseAutoWinWithdrawParams): UseAutoWinWithdrawReturn => {
  const { address } = useAccount()
  const { calculateMinAmount } = useSlippage(slippageBps)

  const isReady = enabled &&
    !!address &&
    !!autoWinVault &&
    burnAmount > 0n

  // AutoWin vault share allowance management
  const vaultAllowance = useTokenAllowance({
    tokenAddress: autoWinVault,
    spenderAddress: CONTRACTS_ADDRESS.AUTOWIN_ROUTER,
    amount: burnAmount,
    enabled: isReady
  })

  const isAllow = !vaultAllowance.isNeedApproval

  // Preview redemption to get expected assets using AutoWin vault's previewRedeem
  const { data: expectedAssets } = useReadContract({
    address: autoWinVault,
    abi: AutowinABI,
    functionName: "previewRedeem",
    args: [burnAmount],
    query: {
      enabled: isReady && isAllow
    }
  })

  // Simulate withdrawal to validate transaction
  const { data: withdrawConfig } = useSimulateContract({
    address: CONTRACTS_ADDRESS.AUTOWIN_ROUTER,
    abi: autowinABI,
    functionName: "redeemFromAutoWin",
    args: [autoWinVault!, burnAmount, 0n, address!],
    chainId: currentChain.id,
    query: {
      enabled: isReady && isAllow && !!expectedAssets
    }
  })

  // Write withdrawal transaction
  const {
    data: withdrawHash,
    writeContract: writeWithdraw,
    isPending: isWithdrawing,
    reset: resetWithdraw
  } = useWriteContract()

  // Wait for transaction receipt
  const {
    isLoading: isWithdrawLoading,
    isSuccess: isWithdrawSuccess
  } = useWaitForTransactionReceipt({
    hash: withdrawHash,
    query: {
      enabled: !!withdrawHash
    }
  })

  const handleWithdraw = () => {
    if (!withdrawConfig?.request || !expectedAssets) return

    // Calculate minimum assets with slippage protection
    // Account for 0.1% exit fee + slippage (total ~1.1% for 1% slippage)
    const minAssets = calculateMinAmount(expectedAssets, slippageBps)

    // Execute withdrawal with slippage protection
    writeWithdraw({
      ...withdrawConfig.request,
      args: [autoWinVault!, burnAmount, minAssets, address!]
    })
  }

  const handleReset = () => {
    resetWithdraw()
  }

  return {
    estimatedAmount: expectedAssets,
    allowance: {
      isNeed: vaultAllowance.isNeedApproval,
      current: vaultAllowance.allowance,
      allow: vaultAllowance.approve,
      isLoading: vaultAllowance.isLoading,
      isApprove: vaultAllowance.isApproving,
      hash: vaultAllowance.approveHash,
      refetch: vaultAllowance.refetch
    },
    isAllow,
    withdraw: {
      execute: handleWithdraw,
      isPending: isWithdrawing,
      isLoading: isWithdrawLoading,
      isSuccess: isWithdrawSuccess,
      hash: withdrawHash,
      reset: handleReset
    }
  }
}
