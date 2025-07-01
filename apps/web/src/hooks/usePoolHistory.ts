import { useQuery } from '@tanstack/react-query';

export const usePoolHistory = (poolAddress?: string | null) => {
  return useQuery({
    queryKey: ['pool-history', poolAddress],
    enabled: !!poolAddress,
    queryFn: async () => {
      const resp = await fetch(`${import.meta.env.VITE_API_URL}/stats/pools/${poolAddress}/history`);
      if (!resp.ok) return [];
      return resp.json();
    },
    staleTime: 60 * 1000, // 1 min
  });
}; 