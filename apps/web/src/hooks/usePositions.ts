import { useQuery } from "@tanstack/react-query"
import { useAccount } from "wagmi"
import type { PositionData } from "../types/api"

// Re-export types for backward compatibility
export type { LegacyToken as Token, PositionData } from "../types/api"


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
