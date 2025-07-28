import { useCallback } from "react"
import { erc20Abi, type Address } from "viem"
import { usePublicClient } from "wagmi"

interface TokenInfo {
  address: Address
  symbol: string
  decimals: number
  name?: string
}

interface CachedToken {
  data: TokenInfo
  timestamp: number
}

// Cache global partagé entre toutes les instances
const globalTokenCache = new Map<Address, CachedToken>()
const CACHE_EXPIRY = 5 * 60 * 1000 // 5 minutes

// Tokens par défaut pour éviter les requêtes
const defaultTokens = new Map<Address, TokenInfo>([
  [
    "0x0000000000000000000000000000000000000000",
    {
      address: "0x0000000000000000000000000000000000000000",
      symbol: "BERA",
      decimals: 18,
      name: "Bera"
    }
  ],
  [
    "0x6969696969696969696969696969696969696969",
    {
      address: "0x6969696969696969696969696969696969696969",
      symbol: "wBERA",
      decimals: 18,
      name: "Wrapped Bera"
    }
  ],
  [
    "0xFCBD14DC51f0A4d49d5E53C2E0950e0bC26d0Dce",
    {
      address: "0xFCBD14DC51f0A4d49d5E53C2E0950e0bC26d0Dce",
      symbol: "HONEY",
      decimals: 18,
      name: "Honey"
    }
  ]
])

export const useTokenCache = () => {
  const publicClient = usePublicClient()

  const getTokenInfo = useCallback(async (tokenAddress: Address): Promise<TokenInfo> => {
    // Vérifier d'abord les tokens par défaut
    const defaultToken = defaultTokens.get(tokenAddress)
    if (defaultToken) {
      return defaultToken
    }

    // Vérifier le cache
    const cached = globalTokenCache.get(tokenAddress)
    if (cached && Date.now() - cached.timestamp < CACHE_EXPIRY) {
      return cached.data
    }

    // Récupérer depuis la blockchain
    try {
      const [decimals, symbol, name] = await Promise.all([
        publicClient.readContract({
          address: tokenAddress,
          abi: erc20Abi,
          functionName: "decimals"
        }),
        publicClient.readContract({
          address: tokenAddress,
          abi: erc20Abi,
          functionName: 'symbol'
        }),
        publicClient.readContract({
          address: tokenAddress,
          abi: erc20Abi,
          functionName: 'name'
        }).catch(() => undefined) // Name est optionnel
      ])

      const tokenInfo: TokenInfo = {
        address: tokenAddress,
        symbol,
        decimals,
        name
      }

      // Mettre en cache
      globalTokenCache.set(tokenAddress, {
        data: tokenInfo,
        timestamp: Date.now()
      })

      return tokenInfo
    } catch (error) {
      console.error('Failed to get token info for', tokenAddress, error)
      
      // Retourner un token par défaut en cas d'erreur
      const fallbackToken: TokenInfo = {
        address: tokenAddress,
        symbol: "UNKNOWN",
        decimals: 18
      }
      
      return fallbackToken
    }
  }, [publicClient])

  const clearCache = useCallback(() => {
    globalTokenCache.clear()
  }, [])

  const getCacheSize = useCallback(() => {
    return globalTokenCache.size
  }, [])

  return {
    getTokenInfo,
    clearCache,
    getCacheSize
  }
}