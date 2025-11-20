import { useQuery } from '@tanstack/react-query';

/**
 * Interface correspondant au LeaderboardEntryDto du backend
 */
export interface LeaderboardEntry {
  wallet: string;
  swapVolumeUSD: number;
  liquidityDepositVolumeUSD: number;
  totalVolumeUSD: number;
  currentLiquidityUSD: number;
  positionsCount: number;
  v3PoolsLiquidityUSD: number;
  stickyVaultsLiquidityUSD: number;
  autoWinVaultsLiquidityUSD: number;
  volumePoints: number;
  liquidityPoints: number;
  totalPoints: number;
  rank: number;
  previousRank?: number;
  rankChange?: number; // Calculated: previousRank - rank (positive = moved up)
  lastUpdatedAt: string;
}

export interface LeaderboardSnapshot {
  timestamp: string;
  rank: number;
  totalPoints: number;
  totalVolumeUSD: number;
  currentLiquidityUSD: number;
  positionsCount: number;
}

export interface LeaderboardWalletDetail extends LeaderboardEntry {
  history: LeaderboardSnapshot[];
}

export interface LeaderboardResponse {
  entries: LeaderboardEntry[];
  total: number;
  page: number;
  limit: number;
  lastUpdatedAt?: string;
}

/**
 * Hook pour récupérer les détails d'un wallet depuis le leaderboard
 * Retourne null si le wallet n'est pas dans le leaderboard (404)
 */
export function useLeaderboardWallet(wallet: string | undefined) {
  return useQuery<LeaderboardWalletDetail | null>({
    queryKey: ['leaderboard-wallet', wallet],
    queryFn: async () => {
      if (!wallet) return null;

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const normalizedWallet = wallet.toLowerCase();
      
      try {
        const response = await fetch(`${apiUrl}/leaderboard/${normalizedWallet}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            // Wallet not found in leaderboard - ce n'est pas une erreur, juste pas de données
            console.log(`[useLeaderboardWallet] Wallet ${normalizedWallet} not found in leaderboard`);
            return null;
          }
          
          // Autre erreur serveur
          let errorMessage = `Failed to fetch leaderboard data: ${response.status} ${response.statusText}`;
          try {
            const errorData = await response.json();
            if (errorData.message) {
              errorMessage = errorData.message;
            }
          } catch {
            // Si on ne peut pas parser le JSON
          }
          throw new Error(errorMessage);
        }

        return response.json();
      } catch (error) {
        // Si c'est une erreur réseau ou autre, la propager
        if (error instanceof Error && error.message.includes('404')) {
          return null;
        }
        throw error;
      }
    },
    enabled: !!wallet,
    retry: (failureCount, error) => {
      // Ne pas retry si c'est un 404 (wallet non trouvé)
      if (error instanceof Error && error.message.includes('not found')) {
        return false;
      }
      return failureCount < 1; // Retry une seule fois pour les autres erreurs
    },
    staleTime: 60000, // 1 minute
  });
}

/**
 * Hook pour récupérer la liste paginée du leaderboard
 */
export function useLeaderboardList(page: number = 1, limit: number = 100) {
  return useQuery<LeaderboardResponse>({
    queryKey: ['leaderboard-list', page, limit],
    queryFn: async () => {
      // S'assurer que les valeurs sont valides
      const validPage = Math.max(1, Math.floor(page) || 1);
      const validLimit = Math.max(1, Math.min(500, Math.floor(limit) || 100)); // Max 500 selon le DTO backend
      
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      
      // S'assurer que l'URL ne se termine pas par un slash
      const baseUrl = apiUrl.replace(/\/$/, '');
      
      // Construire les paramètres de requête - toujours inclure page et limit
      const params = new URLSearchParams({
        page: validPage.toString(),
        limit: validLimit.toString(),
      });

      const url = `${baseUrl}/leaderboard?${params.toString()}`;
      
      console.log('[useLeaderboardList] Fetching leaderboard:', { url, page: validPage, limit: validLimit });
      
      try {
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          // Essayer de récupérer le message d'erreur détaillé
          let errorMessage = `Failed to fetch leaderboard: ${response.status} ${response.statusText}`;
          let errorDetails: any = null;
          
          try {
            const errorData = await response.json();
            errorDetails = errorData;
            if (errorData.message) {
              errorMessage = errorData.message;
            }
          } catch {
            // Si on ne peut pas parser le JSON, utiliser le message par défaut
            const text = await response.text();
            console.error('[useLeaderboardList] Error response text:', text);
          }
          
          console.error('[useLeaderboardList] Error details:', {
            status: response.status,
            statusText: response.statusText,
            errorDetails,
            url,
          });
          
          throw new Error(errorMessage);
        }

        const data = await response.json();
        console.log('[useLeaderboardList] Success:', { entriesCount: data.entries?.length, total: data.total });
        return data;
      } catch (error) {
        console.error('[useLeaderboardList] Error fetching leaderboard:', error);
        throw error;
      }
    },
    staleTime: 30000, // 30 secondes
    refetchOnWindowFocus: true,
    retry: 2, // Retry 2 fois en cas d'erreur
  });
}

