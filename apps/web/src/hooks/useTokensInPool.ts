import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAccount } from 'wagmi';
import { useEffect } from 'react';
import type { BerachainToken } from './useBerachainTokenList';

interface TokenWithBalance {
  symbol: string;
  address: string;
  name: string;
  decimals: number;
  logoUri?: string;
  status: string;
  balance: string;
  priceUSD: number;
  balanceUSD: number;
}

interface TokensWithBalancesResponse {
  success: boolean;
  message: string;
  data: {
    hasWallet: boolean;
    walletAddress?: string;
    totalBalanceUSD: number;
    tokenCount: number;
    tokens: TokenWithBalance[];
  };
}

/**
 * Hook pour récupérer les tokens IN_POOL avec leurs balances et prix USD
 * Utilise le backend optimisé au lieu des appels GraphQL individuels
 */
export const useTokensInPool = () => {
  const { address, isConnected } = useAccount();
  const queryClient = useQueryClient();

  // Invalider le cache quand l'utilisateur se connecte/déconnecte
  useEffect(() => {
    // Invalider toutes les requêtes liées aux tokens quand la connexion change
    queryClient.invalidateQueries({
      queryKey: ['tokens-in-pool'],
    });
  }, [isConnected, queryClient]);

  return useQuery({
    queryKey: ['tokens-in-pool', address],
    queryFn: async (): Promise<TokensWithBalancesResponse> => {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const response = await fetch(`${apiUrl}/token/list-with-balances`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress: address || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response.json();
    },
    enabled: true, // Toujours activé, même sans wallet
    staleTime: 30 * 1000, // 30 secondes
    refetchInterval: 60 * 1000, // Refetch toutes les minutes
    retry: 3,
    // Forcer le refetch quand l'utilisateur se connecte/déconnecte
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
};

/**
 * Hook pour récupérer seulement les tokens IN_POOL (sans balances)
 * Utile pour les utilisateurs non connectés
 */
export const useTokensInPoolOnly = () => {
  return useQuery({
    queryKey: ['tokens-in-pool-only'],
    queryFn: async (): Promise<TokensWithBalancesResponse> => {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const response = await fetch(`${apiUrl}/token/list-with-balances`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          // Pas de walletAddress = seulement les tokens IN_POOL
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes pour les tokens sans balances
    refetchInterval: 10 * 60 * 1000, // Refetch toutes les 10 minutes
    retry: 3,
  });
};

/**
 * Convertit les tokens du backend en format BerachainToken pour compatibilité
 */
export const convertToBerachainTokens = (tokens: TokenWithBalance[]): BerachainToken[] => {
  return tokens.map(token => ({
    address: token.address,
    symbol: token.symbol,
    name: token.name,
    decimals: token.decimals,
    logoUri: token.logoUri || null,
    status: token.status as any,
    // Propriétés requises par BerachainToken
    totalSupply: "0", // Pas disponible dans notre backend actuel
    lastPrice: token.priceUSD || 0,
    // Ajouter les données de balance et prix pour compatibilité
    balance: token.balance,
    priceUSD: token.priceUSD,
    balanceUSD: token.balanceUSD,
  }));
};
