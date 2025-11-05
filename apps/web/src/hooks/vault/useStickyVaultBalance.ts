import { useMemo } from 'react'
import { type Address, formatUnits } from 'viem'
import { useReadContract } from 'wagmi'
import { StickyVaultWithRouter } from '../../config/abis/StickyVaultWithRouter'

interface UseStickyVaultBalanceParams {
  vaultAddress: Address | undefined
  userAddress: Address | undefined
  vaultTVL_USD: string | undefined
}

interface UseStickyVaultBalanceReturn {
  shares: bigint
  valueInUSD: number
  pricePerShare: number
  isLoading: boolean
  refetch: () => void
}

/**
 * Hook to fetch the user's on-chain balance of StickyVault tokens
 * This represents tokens in the wallet (not staked elsewhere)
 */
export function useStickyVaultBalance({
  vaultAddress,
  userAddress,
  vaultTVL_USD,
}: UseStickyVaultBalanceParams): UseStickyVaultBalanceReturn {
  // Get user's StickyVault token balance (ERC20 balanceOf)
  const {
    data: userBalance,
    isLoading: isLoadingBalance,
    refetch: refetchBalance
  } = useReadContract({
    address: vaultAddress,
    abi: StickyVaultWithRouter,
    functionName: 'balanceOf',
    args: userAddress ? [userAddress] : undefined,
    query: {
      enabled: !!vaultAddress && !!userAddress
    }
  })

  // Get total supply of the StickyVault
  const {
    data: totalSupply,
    isLoading: isLoadingTotalSupply,
    refetch: refetchTotalSupply
  } = useReadContract({
    address: vaultAddress,
    abi: StickyVaultWithRouter,
    functionName: 'totalSupply',
    query: {
      enabled: !!vaultAddress
    }
  })

  // Calculate USD value: (userShares / totalSupply) * vaultTVL_USD
  const { valueInUSD, pricePerShare } = useMemo(() => {
    if (!userBalance || userBalance === 0n || !totalSupply || totalSupply === 0n || !vaultTVL_USD) {
      return { valueInUSD: 0, pricePerShare: 0 }
    }

    const sharesDecimal = parseFloat(formatUnits(userBalance, 18))
    const totalSupplyDecimal = parseFloat(formatUnits(totalSupply, 18))
    const tvlUSD = parseFloat(vaultTVL_USD)

    // Calculate proportion of the vault owned by this user
    const proportion = sharesDecimal / totalSupplyDecimal

    // Calculate USD value based on proportion of total TVL
    const valueInUSD = proportion * tvlUSD

    // Calculate price per share
    const pricePerShare = tvlUSD / totalSupplyDecimal

    return { valueInUSD, pricePerShare }
  }, [userBalance, totalSupply, vaultTVL_USD])

  // Function to refetch all balance data
  const refetch = () => {
    refetchBalance()
    refetchTotalSupply()
  }

  return {
    shares: userBalance || 0n,
    valueInUSD,
    pricePerShare,
    isLoading: isLoadingBalance || isLoadingTotalSupply,
    refetch
  }
}
