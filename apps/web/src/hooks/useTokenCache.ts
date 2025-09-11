import { useState, useEffect, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAccount } from 'wagmi';
import { useTokens, type BerachainToken } from './useBerachainTokenList';
import { useTokenBalancesOptimized } from './useTokenBalancesOptimized';
import { useTokenDataGraphQL, getTokenDataByAddress, getTokenPrice, getTokenMarketCap, getTokenTVL } from './useTokenDataGraphQL';
import { ensureArray } from '../utils/dataValidation';
import { zeroAddress } from 'viem';

// Cache global pour les tokens triés
const tokenCache = new Map<string, {
  tokens: BerachainToken[];
  popularTokens: BerachainToken[];
  timestamp: number;
  isConnected: boolean;
}>();

const CACHE_DURATION = 5 * 60 * 1000;
export const clearTokenCache = () => {
  tokenCache.clear();
};

interface UseTokenCacheOptions {
  onlyPoolToken?: boolean;
  searchValue?: string;
}

export const useTokenCache = ({ onlyPoolToken = false, searchValue = "" }: UseTokenCacheOptions = {}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);

  const { data: tokens, isLoading: tokensLoading, error: tokensError } = useTokens();
  const { isConnected } = useAccount();

  // Chargement des données des tokens via GraphQL (plus rapide)
  const { data: tokensData, error: tokensDataError } = useTokenDataGraphQL();

  // Chargement des statistiques des tokens (ancienne méthode - garder comme fallback)
  const { data: tokensStats, isLoading: tokensStatsLoading } = useQuery({
    queryKey: ["tokensStatsForList"],
    queryFn: async () => {
      const resp = await fetch(`${import.meta.env.VITE_API_URL}/token/list`);
      if (!resp.ok) return { data: [] as any[] };
      return resp.json();
    },
    staleTime: 60_000,
    enabled: true
  });

  const tokensArray = ensureArray<BerachainToken>(tokens);

  // Filtrage des tokens optimisé avec tri GraphQL
  const filteredTokens = useMemo(() => {
    if (!tokens || tokensLoading) {
      return [];
    }

    const tokensArray = ensureArray(tokens) as BerachainToken[];

    const onlyPoolOrAllTokens = onlyPoolToken
      ? tokensArray.filter(t => t.status === 'IN_POOL' || t.address === zeroAddress)
      : tokensArray;

    const tokensWithoutBGT = onlyPoolOrAllTokens.filter(t => t.symbol !== 'BGT');

    // Déduplication des tokens par adresse pour éviter les doublons
    const uniqueTokens = tokensWithoutBGT.reduce((acc, token) => {
      const key = token.address.toLowerCase();
      if (!acc.has(key)) {
        acc.set(key, token);
      }
      return acc;
    }, new Map<string, BerachainToken>());

    let deduplicatedTokens = Array.from(uniqueTokens.values());

    // Si on a des données GraphQL, utiliser l'ordre pré-trié
    if (tokensData?.tokens?.items) {
      const graphqlTokens = tokensData.tokens.items;
      const tokenMap = new Map(graphqlTokens.map(t => [t.id.toLowerCase(), t]));

      // Réorganiser les tokens selon l'ordre GraphQL (déjà trié par TVL)
      deduplicatedTokens = deduplicatedTokens.sort((a, b) => {
        const aData = tokenMap.get(a.address.toLowerCase());
        const bData = tokenMap.get(b.address.toLowerCase());

        if (!aData && !bData) return 0;
        if (!aData) return 1;
        if (!bData) return -1;

        // Utiliser la TVL pour le tri (déjà trié par GraphQL)
        return getTokenTVL(bData) - getTokenTVL(aData);
      });
    }

    if (searchValue === "") {
      return deduplicatedTokens;
    }

    return deduplicatedTokens.filter((token) =>
      token.name.toLowerCase().includes(searchValue.toLowerCase()) ||
      token.symbol.toLowerCase().includes(searchValue.toLowerCase())
    );
  }, [searchValue, tokens, tokensLoading, onlyPoolToken, tokensData]);

  // Calcul de la market cap par adresse (priorité GraphQL, fallback API)
  const marketCapByAddress = useMemo(() => {
    const map = new Map<string, number>();

    // Essayer d'abord GraphQL
    const tokensArray = tokensData?.tokens?.items || [];
    for (const token of tokensArray) {
      const marketCap = getTokenMarketCap(token);
      if (marketCap > 0) {
        map.set(token.id.toLowerCase(), marketCap);
      }
    }

    // Fallback sur l'ancienne méthode si GraphQL ne fonctionne pas
    if (map.size === 0 && tokensStats) {
      const statsArray: any[] = tokensStats || [];
      for (const t of statsArray) {
        const addr: string = t.address;
        const mc: number = t?.TokenDailyStats?.[0]?.marketCap || 0;
        if (addr) map.set(String(addr).toLowerCase(), Number(mc) || 0);
      }
    }

    return map;
  }, [tokensData, tokensStats]);

  // Utilisation du hook optimisé pour les balances
  const { balances, loading: balancesLoading } = useTokenBalancesOptimized({
    tokens: filteredTokens,
    maxTokens: 25 // Augmenter la limite pour inclure plus de tokens
  });

  // Fonction de tri des tokens (mémorisée pour éviter les re-renders)
  const sortTokens = useCallback((tokensToSort: BerachainToken[]): BerachainToken[] => {
    if (!tokensToSort.length) return tokensToSort;

    const getBalanceUsd = (token: BerachainToken): number => {
      const balanceStr = (balances as Record<string, string | undefined>)[token.symbol];
      if (!balanceStr) return 0;

      const amount = parseFloat(balanceStr);
      if (!amount || !isFinite(amount) || amount <= 0) return 0;

      let price = 0;

      // Essayer d'abord GraphQL
      const tokenData = getTokenDataByAddress(tokensData?.tokens?.items, token.address);
      price = getTokenPrice(tokenData);

      // Fallback pour BERA natif (utiliser wBERA)
      if (price === 0 && token.address === zeroAddress) {
        const wBeraData = getTokenDataByAddress(tokensData?.tokens?.items, '0x6969696969696969696969696969696969696969');
        price = getTokenPrice(wBeraData);
      }

      // Fallback sur l'ancienne logique si GraphQL ne fonctionne pas
      if (price === 0) {
        let tokenStats = tokensStats?.find((t: any) =>
          t.address?.toLowerCase() === token.address?.toLowerCase()
        );

        price = tokenStats?.TokenDailyStats?.[0]?.price || 0;

        if (price === 0 && token.address === zeroAddress) {
          const wBeraStats = tokensStats?.find((t: any) =>
            t.symbol === 'wBERA' || t.address?.toLowerCase() === '0x6969696969696969696969696969696969696969'
          );
          price = wBeraStats?.TokenDailyStats?.[0]?.price || 0;
        }

        // Dernier fallback sur lastPrice
        if (price === 0) {
          price = token.lastPrice || 0;
        }
      }

      const usdValue = amount * price;

      return usdValue;
    };

    const getMarketCap = (token: BerachainToken): number => {
      if (!token.address) return 0;

      // Priorité aux données GraphQL
      const tokenData = getTokenDataByAddress(tokensData?.tokens?.items, token.address);
      if (tokenData) {
        return getTokenMarketCap(tokenData);
      }

      // Fallback sur le cache
      return marketCapByAddress.get(token.address.toLowerCase()) || 0;
    };

    if (isConnected) {
      const withBalance: BerachainToken[] = [];
      const withoutBalance: BerachainToken[] = [];

      for (const t of tokensToSort) {
        const usd = getBalanceUsd(t);
        if (usd > 0) {
          withBalance.push(t);
        } else {
          withoutBalance.push(t);
        }
      }



      withBalance.sort((a, b) => getBalanceUsd(b) - getBalanceUsd(a));
      withoutBalance.sort((a, b) => getMarketCap(b) - getMarketCap(a));

      const result = [...withBalance, ...withoutBalance];

      return result;
    }

    const result = [...tokensToSort].sort((a, b) => getMarketCap(b) - getMarketCap(a));

    return result;
  }, [balances, tokensData, tokensStats, isConnected, marketCapByAddress]);

  // Tokens pour les tokens populaires
  const availableTokensForPopular = useMemo(() => {
    if (!tokens || tokensLoading) return [];

    const tokensArray = ensureArray(tokens) as BerachainToken[];

    const baseTokens = onlyPoolToken
      ? tokensArray.filter(t => t.status === 'IN_POOL' || t.address === zeroAddress)
      : tokensArray;

    return baseTokens;
  }, [tokens, tokensLoading, onlyPoolToken]);

  // Gestion du cache
  useEffect(() => {
    const cacheKey = `${onlyPoolToken}-${isConnected}`;
    const cached = tokenCache.get(cacheKey);
    const now = Date.now();

    // Vérifier si le cache est valide
    if (cached && (now - cached.timestamp) < CACHE_DURATION && cached.isConnected === isConnected) {
      setIsReady(true);
      setIsLoading(false);
      return;
    }

    // Si tout est chargé, trier et mettre en cache
    if (!tokensLoading && !tokensStatsLoading && !balancesLoading && tokensArray.length > 0) {
      setIsLoading(true);

      // Petit délai pour s'assurer que tout est prêt
      const timer = setTimeout(() => {
        const sortedTokens = sortTokens(filteredTokens);

        // Mettre en cache
        tokenCache.set(cacheKey, {
          tokens: sortedTokens,
          popularTokens: availableTokensForPopular,
          timestamp: now,
          isConnected
        });

        setIsReady(true);
        setIsLoading(false);
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [tokensLoading, tokensStatsLoading, balancesLoading, tokensArray.length, onlyPoolToken, isConnected]);

  // Récupérer les tokens du cache ou calculer
  const getTokens = () => {
    const cacheKey = `${onlyPoolToken}-${isConnected}`;
    const cached = tokenCache.get(cacheKey);

    if (cached && isReady) {
      return {
        tokens: cached.tokens,
        popularTokens: cached.popularTokens
      };
    }

    // Si pas de cache, retourner les tokens triés en temps réel
    const realTimeTokens = sortTokens(filteredTokens);

    return {
      tokens: realTimeTokens,
      popularTokens: availableTokensForPopular
    };
  };

  const { tokens: finalTokens, popularTokens } = getTokens();

  // Fonction pour obtenir les informations d'un token (mémorisée)
  const getTokenInfo = useCallback((tokenAddress: string) => {
    return tokensArray.find(token =>
      token.address.toLowerCase() === tokenAddress.toLowerCase()
    );
  }, [tokensArray]);

  return {
    tokens: finalTokens,
    popularTokens,
    isLoading: isLoading || !isReady,
    hasError: !!tokensError || !!tokensDataError,
    hasTokens: tokensArray.length > 0,
    isReady,
    getTokenInfo
  };
};