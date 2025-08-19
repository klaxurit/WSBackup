import { useQuery } from '@tanstack/react-query';

export const usePoolHistory = (poolAddress?: string | null) => {
  return useQuery({
    queryKey: ['pool-history', poolAddress],
    enabled: false, // Désactivé temporairement en attendant que l'endpoint backend soit disponible
    queryFn: async () => {
      // TODO: Réactiver quand l'endpoint backend sera disponible
      // const resp = await fetch(`${import.meta.env.VITE_API_URL}/stats/pools/${poolAddress}/history`);
      // if (!resp.ok) return [];
      // return resp.json();

      // Données mockées temporaires
      return [];
    },
    staleTime: 60 * 1000, // 1 min
  });
}; 