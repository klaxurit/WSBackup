import { useReadContract } from "wagmi"
import { StickyVaultWithRouter } from "../../config/abis/StickyVaultWithRouter"
import type { Address } from "viem"

export const useVaultRatio = (vaultAddress: Address | undefined) => {
  const { data: balances, isLoading, isError } = useReadContract({
    address: vaultAddress,
    abi: StickyVaultWithRouter,
    functionName: "getUnderlyingBalances",
    query: {
      enabled: !!vaultAddress,
      staleTime: 30_000, // Cache for 30 seconds
      refetchInterval: 30_000, // Refresh every 30 seconds
    }
  })

  return {
    amount0Current: balances?.[0],
    amount1Current: balances?.[1],
    isLoading,
    isError,
    hasRatio: !!balances && balances[0] > 0n && balances[1] > 0n
  }
}
