import { useQuery } from "@tanstack/react-query";

const fetchCoingeckoTokenData = async (coingeckoId: string): Promise<{ description: string, circulating_supply: number | null, total_supply: number | null, market_data: any }> => {
  const url = `https://api.coingecko.com/api/v3/coins/${coingeckoId}`;
  const resp = await fetch(url);
  if (!resp.ok) throw Error(resp.statusText);
  const data = await resp.json();
  return {
    description: data?.description?.en || '',
    circulating_supply: data?.market_data?.circulating_supply ?? null,
    total_supply: data?.market_data?.total_supply ?? null,
    market_data: data?.market_data ?? {},
  };
};

export const useCoingeckoTokenData = (coingeckoId?: string | null) => {
  const hasValidId = !!coingeckoId;
  return useQuery({
    queryKey: hasValidId ? ['coingecko-token-data', coingeckoId] : ['coingecko-token-data', 'no-id'],
    queryFn: hasValidId ? () => fetchCoingeckoTokenData(coingeckoId!) : () => Promise.resolve({ description: '', circulating_supply: null, total_supply: null, market_data: {} }),
    enabled: hasValidId,
    staleTime: 1000 * 60 * 60 * 24, // 24h
    select: (data) => data,
  });
}; 