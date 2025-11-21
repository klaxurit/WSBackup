import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAccount } from 'wagmi';

export interface ReferralData {
  wallet: string;
  referralCode: string;
}

export interface UseReferralResponse {
  wallet: string;
  referredBy: string;
}

/**
 * Hook pour récupérer le referral code d'un wallet
 * Le backend créera automatiquement un code si l'utilisateur n'en a pas
 */
export function useReferral(wallet: string | undefined) {
  return useQuery<ReferralData>({
    queryKey: ['referral', wallet],
    queryFn: async () => {
      if (!wallet) throw new Error('Wallet address is required');

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const normalizedWallet = wallet.toLowerCase();
      
      const response = await fetch(`${apiUrl}/referral/${normalizedWallet}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to fetch referral code: ${response.status}`);
      }

      return response.json();
    },
    enabled: !!wallet,
    staleTime: 60000, // 1 minute
    gcTime: 300000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook pour mettre à jour le referral code d'un wallet
 * Nécessite une signature du message (le nouveau code)
 */
export function useUpdateReferral() {
  const queryClient = useQueryClient();
  const { address } = useAccount();

  return useMutation<ReferralData, Error, { referralCode: string; signature: string }>({
    mutationFn: async ({ referralCode, signature }) => {
      if (!address) throw new Error('Wallet address is required');

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const normalizedWallet = address.toLowerCase();
      
      const response = await fetch(`${apiUrl}/referral/${normalizedWallet}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          referralCode,
          signature,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to update referral code: ${response.status}`);
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalider et refetch le referral code après mise à jour
      queryClient.invalidateQueries({ queryKey: ['referral', address] });
    },
  });
}

/**
 * Hook pour utiliser/appliquer un referral code d'un autre utilisateur
 * Nécessite une signature du message (le code à utiliser)
 */
export function useApplyReferralCode() {
  const queryClient = useQueryClient();
  const { address } = useAccount();

  return useMutation<UseReferralResponse, Error, { referralCode: string; signature: string }>({
    mutationFn: async ({ referralCode, signature }) => {
      if (!address) throw new Error('Wallet address is required');

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const normalizedWallet = address.toLowerCase();
      
      const response = await fetch(`${apiUrl}/referral/${normalizedWallet}/use`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          referralCode,
          signature,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to apply referral code: ${response.status}`);
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalider les données du leaderboard car le referral peut affecter les points
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
      queryClient.invalidateQueries({ queryKey: ['portfolio-stats'] });
    },
  });
}

