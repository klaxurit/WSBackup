import { useQuery } from "@tanstack/react-query";
import type { BerachainToken } from "./useBerachainTokenList";
import type { Token } from "./usePositions";

type CoingeckoResponse = Record<string, { usd: number }>

const fetchPrice = async (coingeckoId: string): Promise<CoingeckoResponse> => {
  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${coingeckoId}&vs_currencies=usd`

  const resp = await fetch(url);
  if (!resp.ok) throw Error(resp.statusText);
  const res = resp;
  return await res.json();
}

export const usePrice = (token?: BerachainToken | Token | null) => {
  // Vérifier si le token a une propriété coingeckoId (Token) ou utiliser une autre approche pour BerachainToken
  const hasValidToken = !!token && ('coingeckoId' in token ? !!token.coingeckoId : !!token.address)

  return useQuery({
    queryKey: hasValidToken ? ['prices', 'coingeckoId' in token ? token.coingeckoId : token.address] : ['prices', 'no-token'],
    queryFn: hasValidToken ? () => {
      if ('coingeckoId' in token && token.coingeckoId) {
        return fetchPrice(token.coingeckoId)
      }
      // Pour BerachainToken, on pourrait utiliser une autre API ou retourner 0
      return Promise.resolve({})
    } : () => Promise.resolve({}),
    select: (data: CoingeckoResponse) => {
      if (!hasValidToken) return 0
      if ('coingeckoId' in token && token.coingeckoId) {
        return data[token.coingeckoId]?.usd || 0
      }
      // Pour BerachainToken, retourner 0 ou une valeur par défaut
      return 0
    },
    staleTime: Infinity,
    enabled: hasValidToken
  })
}
