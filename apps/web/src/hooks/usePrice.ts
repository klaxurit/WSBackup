import { useQuery } from "@tanstack/react-query";
import type { BerachainToken } from "./useBerachainTokenList";

type CoingeckoResponse = Record<string, { usd: number }>

const fetchPrice = async (coingeckoId: string): Promise<CoingeckoResponse> => {
  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${coingeckoId}&vs_currencies=usd`

  const resp = await fetch(url);
  if (!resp.ok) throw Error(resp.statusText);
  const res = resp;
  return await res.json();
}

export const usePrice = (token?: BerachainToken | null) => {
  const hasValidToken = !!token?.coingeckoId

  return useQuery({
    queryKey: hasValidToken ? ['prices', token.coingeckoId] : ['prices', 'no-token'],
    queryFn: hasValidToken ? () => fetchPrice(token.coingeckoId!) : () => Promise.resolve({}),
    select: (data: CoingeckoResponse) => {
      if (!hasValidToken) return 0
      return data[token.coingeckoId!]?.usd || 0
    },
    staleTime: Infinity,
    enabled: hasValidToken
  })
}
