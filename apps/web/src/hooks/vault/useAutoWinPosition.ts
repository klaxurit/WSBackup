import { useMemo, useEffect } from 'react'
import { type Address, formatUnits, parseUnits } from 'viem'
import { useReadContract } from 'wagmi'
import { AutowinABI } from '../../config/abis/Autowin'
import { StickyVaultWithRouter } from '../../config/abis/StickyVaultWithRouter'

interface UseAutoWinPositionParams {
  autoWinVault: Address | undefined
  userAddress: Address | undefined
  sharesFromIndexer: string | undefined
  stickyVaultAddress: Address | undefined
  vaultTVL_USD: string | undefined
  refreshKey?: number
}

interface UseAutoWinPositionReturn {
  shares: bigint
  valueInAssets: bigint | undefined
  valueInUSD: number
  isLoading: boolean
  error: Error | null
  refetch: () => void
}

export function useAutoWinPosition({
  autoWinVault,
  userAddress,
  sharesFromIndexer,
  stickyVaultAddress,
  vaultTVL_USD,
  refreshKey = 0,
}: UseAutoWinPositionParams): UseAutoWinPositionReturn {
  // Convert shares from indexer (decimal string) to bigint for contract call
  const sharesBigInt = useMemo(() => {
    if (!sharesFromIndexer) return undefined
    try {
      return parseUnits(sharesFromIndexer, 18)
    } catch {
      return undefined
    }
  }, [sharesFromIndexer])

  // Get balance of AutoWin shares for the user
  const {
    data: userBalance,
    isLoading: isLoadingBalance,
    refetch: refetchBalance
  } = useReadContract({
    address: autoWinVault,
    abi: AutowinABI,
    functionName: 'balanceOf',
    args: userAddress ? [userAddress] : undefined,
    query: {
      enabled: !!autoWinVault && !!userAddress
    }
  })

  // Convert shares to underlying StickyVault assets
  const {
    data: assetsValue,
    isLoading: isLoadingAssets,
    refetch: refetchAssets
  } = useReadContract({
    address: autoWinVault,
    abi: AutowinABI,
    functionName: 'convertToAssets',
    args: sharesBigInt ? [userBalance || sharesBigInt] : undefined,
    query: {
      enabled: !!autoWinVault && ((!!userBalance && userBalance > 0n) || (!!sharesBigInt && sharesBigInt > 0n))
    }
  })

  // Get total supply of the StickyVault to calculate proportion
  const {
    data: vaultTotalSupply,
    isLoading: isLoadingTotalSupply,
    refetch: refetchTotalSupply
  } = useReadContract({
    address: stickyVaultAddress,
    abi: StickyVaultWithRouter,
    functionName: 'totalSupply',
    query: {
      enabled: !!stickyVaultAddress
    }
  })

  // Refetch all data when refreshKey changes
  useEffect(() => {
    if (refreshKey > 0) {
      refetchBalance()
      refetchAssets()
      refetchTotalSupply()
    }
  }, [refreshKey, refetchBalance, refetchAssets, refetchTotalSupply])

  // Calculate USD value using correct formula:
  // valueUSD = (userStickyShares / vaultTotalSupply) * vaultTVL_USD
  const valueInUSD = useMemo(() => {
    if (!assetsValue || !vaultTotalSupply || !vaultTVL_USD) return 0
    if (vaultTotalSupply === 0n) return 0

    // Convert to decimals for calculation
    const assetsDecimal = parseFloat(formatUnits(assetsValue, 18))
    const totalSupplyDecimal = parseFloat(formatUnits(vaultTotalSupply, 18))
    const tvlUSD = parseFloat(vaultTVL_USD)

    // Calculate proportion of the vault owned by this user
    const proportion = assetsDecimal / totalSupplyDecimal

    // Calculate USD value based on proportion of total TVL
    return proportion * tvlUSD
  }, [assetsValue, vaultTotalSupply, vaultTVL_USD])

  // Function to refetch all balance data
  const refetch = () => {
    refetchBalance()
    refetchAssets()
    refetchTotalSupply()
  }

  return {
    shares: userBalance || sharesBigInt || 0n,
    valueInAssets: assetsValue,
    valueInUSD,
    isLoading: isLoadingBalance || isLoadingAssets || isLoadingTotalSupply,
    error: null,
    refetch
  }
}
