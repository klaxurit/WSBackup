import { useEffect } from "react"
import { erc20Abi, type Address, type Hex } from "viem"
import { useAccount, useReadContract, useSimulateContract, useWaitForTransactionReceipt, useWriteContract } from "wagmi"
import { currentChain } from "../../config/wagmi"

interface UseTokenAllowanceParams {
  tokenAddress: Address | undefined
  spenderAddress: Address
  amount: bigint
  enabled?: boolean
}

interface UseTokenAllowanceReturn {
  allowance: bigint | undefined
  isNeedApproval: boolean
  isLoading: boolean
  isApproving: boolean
  approveHash: Hex | undefined
  approve: () => void
  refetch: () => void
}

/**
 * Hook générique pour gérer l'allowance d'un token ERC20
 * Vérifie si une approbation est nécessaire et fournit une fonction pour approuver
 */
export const useTokenAllowance = ({
  tokenAddress,
  spenderAddress,
  amount,
  enabled = true
}: UseTokenAllowanceParams): UseTokenAllowanceReturn => {
  const { address } = useAccount()

  // Read current allowance
  const {
    data: allowance,
    isLoading,
    refetch
  } = useReadContract({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: "allowance",
    args: address && tokenAddress ? [address, spenderAddress] : undefined,
    query: {
      enabled: enabled && !!address && !!tokenAddress
    }
  })

  // Check if approval is needed
  const isNeedApproval = (allowance || 0n) < amount

  // Simulate approval transaction
  const { data: approveConfig } = useSimulateContract({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: 'approve',
    args: tokenAddress ? [spenderAddress, amount] : undefined,
    chainId: currentChain.id,
    query: {
      enabled: enabled && isNeedApproval && !!tokenAddress
    }
  })

  // Write approval transaction
  const {
    data: approveHash,
    writeContract: writeApprove,
    isPending: isApproving
  } = useWriteContract()

  // Wait for approval transaction
  const { status: approveStatus } = useWaitForTransactionReceipt({
    hash: approveHash,
    query: {
      enabled: !!approveHash
    }
  })

  // Refetch allowance after approval succeeds
  useEffect(() => {
    if (approveStatus === "success") {
      refetch()
    }
  }, [approveStatus, refetch])

  // Approve function
  const approve = () => {
    if (!approveConfig?.request) return
    writeApprove(approveConfig.request)
  }

  return {
    allowance,
    isNeedApproval,
    isLoading,
    isApproving,
    approveHash,
    approve,
    refetch
  }
}