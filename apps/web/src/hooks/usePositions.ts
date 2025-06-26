import { useQuery } from "@tanstack/react-query"
import { useAccount } from "wagmi"

export interface Statistic {
  id: string
  tokenId: string
  price: number
  oneHourEvolution: number
  oneDayEvolution: number
  volume: number
  createdAt: string // ISO date string
}

export interface Token {
  id: string
  address: string
  symbol: string
  name: string
  decimals: number
  logoUri: string | null
  coingeckoId: string | null
  tags: string[]
  Statistic: Statistic[]
}

export interface Position {
  fee: number
  tickLower: number
  tickUpper: number
  liquidity: string // BigInt as string
  tokenOwed0: string
  tokenOwed1: string
}

export interface Pool {
  id: string
  address: string
  token0Id: string
  token1Id: string
  fee: number
  liquidity: string | null
  tick: number
  sqrtPriceX96: string | null
  createdAt: string // ISO date string
  updatedAt: string // ISO date string
  PoolStatistic: any[]
  token0: Token
  token1: Token
}

export interface PositionData {
  nftTokenId: string
  position: Position
  pool: Pool
}

export const usePositions = () => {
  const { address } = useAccount()

  const { data: positions = [], refetch, isLoading } = useQuery({
    queryKey: ['positions', address],
    queryFn: async (): Promise<PositionData[]> => {
      const r = await fetch(`${import.meta.env.VITE_API_URL}/stats/positions/${address}`)
      if (!r.ok) return []

      return await r.json()
    },
    enabled: !!address
  })

  const getPosition = (tokenId: string) => {
    if (!positions || positions.length === 0) return
    return positions.find(p => p.nftTokenId === tokenId)
  }

  return { positions, refetch, isLoading, getPosition }
}
