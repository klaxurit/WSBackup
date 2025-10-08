import { useMemo } from 'react'
import { type Address } from 'viem'
import { useReadContract } from 'wagmi'
import { AutowinABI } from '../../config/abis/Autowin'

interface UseAutoWinQuoteParams {
  autoWinVault: Address | undefined
  stickyShares: bigint | undefined
  slippageBps: number
}

interface UseAutoWinQuoteReturn {
  minShares: bigint | undefined
  isLoading: boolean
}

export function useAutoWinQuote({
  autoWinVault,
  stickyShares,
  slippageBps
}: UseAutoWinQuoteParams): UseAutoWinQuoteReturn {
  // Get the preview of deposit from the AutoWin vault
  const { data: expectedShares, isLoading } = useReadContract({
    address: autoWinVault,
    abi: AutowinABI,
    functionName: 'previewDeposit',
    args: stickyShares ? [stickyShares] : undefined,
    query: {
      enabled: !!autoWinVault && !!stickyShares && stickyShares > 0n
    }
  })

  // Calculate minimum shares with slippage protection
  const minShares = useMemo(() => {
    if (!expectedShares || expectedShares === 0n) return undefined

    // Apply slippage (e.g., 100 bps = 1%)
    const slippageMultiplier = BigInt(10000 - slippageBps)
    const minSharesWithSlippage = (expectedShares * slippageMultiplier) / 10000n

    return minSharesWithSlippage
  }, [expectedShares, slippageBps])

  return {
    minShares,
    isLoading
  }
}