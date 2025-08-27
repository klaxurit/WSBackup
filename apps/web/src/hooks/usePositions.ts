import { useQuery } from "@tanstack/react-query"
import { useAccount } from "wagmi"

export interface TokenPrice {
  confidence: number
  createdAt: string
  price: number
  priceSource: string
  tokenAddress: string
  volumeUSD: number
}

export interface Token {
  TokenPrice: TokenPrice[]
  address: string
  coingeckoId: string
  createdAt: string
  decimals: number
  description: string
  discoveredAt: string
  isStableCoin: boolean
  isVerifiedManually: boolean
  lastActivityAt: string
  lastEnrichmentAt: string
  logoUri: string
  metadata: any
  name: string
  status: string
  symbol: string
  totalSupply: string
  twitter: string
  updatedAt: string
  website: string
}

export interface Position {
  amount0: string
  amount1: string
  createdAt: string
  liquidity: string
  owner: string
  poolAddress: string
  tickLower: number
  tickUpper: number
  tokenId: string
  updatedAt: string
}

export interface Pool {
  address: string
  apr: number;
  createdAt: string // BigInt timestamp
  createdAtBlock: string // BigInt Timestamp
  dayVolume: number
  fee: number
  isValid: boolean
  monthVolumeUSD: number
  sqrtPriceX96: string
  tickSpacing: number
  token0: Token
  token0Address: string
  token0LogoUri: string
  token0Symbol: string
  token1: Token
  token1Address: string
  token1LogoUri: string
  token1Symbol: string
  tvlUSD: number
  liquidity: string
}

export interface PositionData {
  position: Position
  pool: Pool
}

export const usePositions = () => {
  const { address } = useAccount()

  const { data: positions = [], refetch, isLoading } = useQuery({
    queryKey: ['positions', address],
    queryFn: async (): Promise<PositionData[]> => {
      const r = await fetch(`${import.meta.env.VITE_API_URL}/positions/${address}`)
      if (!r.ok) return []

      return await r.json()
    },
    enabled: !!address
  })

  const getPosition = (tokenId: string) => {
    if (!positions || positions.length === 0) return
    return positions.find(p => p.position.tokenId === tokenId)
  }

  return { positions, refetch, isLoading, getPosition }
}
