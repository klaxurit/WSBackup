import { type Address } from "viem"
import { useReadContract } from "wagmi"
import { StickyVaultWithRouter } from "../../config/abis/StickyVaultWithRouter"

interface UseVaultQuoteParams {
  vaultAddress: Address | undefined
  amount0: bigint
  amount1: bigint
  enabled?: boolean
}

interface VaultQuote {
  amount0: bigint
  amount1: bigint
  shares: bigint
}

interface UseVaultQuoteReturn {
  quote: VaultQuote | undefined
  isLoading: boolean
  isError: boolean
  refetch: () => void
}

/**
 * Hook pour obtenir une quote de mint amounts depuis un vault
 * Retourne les montants qui seront réellement utilisés et les shares qui seront mintées
 */
export const useVaultQuote = ({
  vaultAddress,
  amount0,
  amount1,
  enabled = true
}: UseVaultQuoteParams): UseVaultQuoteReturn => {

  const shouldFetch = enabled &&
    !!vaultAddress &&
    amount0 > 0n &&
    amount1 > 0n

  const {
    data: rawQuote,
    isLoading,
    isError,
    refetch
  } = useReadContract({
    address: vaultAddress,
    abi: StickyVaultWithRouter,
    functionName: "getMintAmounts",
    args: [amount0, amount1],
    query: {
      enabled: shouldFetch
    }
  })

  const quote = rawQuote ? {
    amount0: rawQuote[0],
    amount1: rawQuote[1],
    shares: rawQuote[2]
  } : undefined

  return {
    quote,
    isLoading,
    isError,
    refetch
  }
}