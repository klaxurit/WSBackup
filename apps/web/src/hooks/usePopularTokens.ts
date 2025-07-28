import { useMemo } from 'react';
import type { BerachainToken } from './useBerachainTokenList';

export interface PopularTokenConfig {
  symbol: string;
  priority: number;
  enabled: boolean;
}

const DEFAULT_POPULAR_TOKENS: PopularTokenConfig[] = [
  { symbol: 'BERA', priority: 1, enabled: true },
  { symbol: 'WBERA', priority: 2, enabled: true },
  { symbol: 'HONEY', priority: 3, enabled: true },
  { symbol: 'iBERA', priority: 4, enabled: true },
  { symbol: 'BGT', priority: 5, enabled: true },
];

/**
 * Hook pour gérer les tokens populaires
 * @param allTokens - Liste de tous les tokens disponibles
 * @param customConfig - Configuration personnalisée (optionnelle)
 * @param maxTokens - Nombre maximum de tokens à afficher (défaut: 6)
 */
export const usePopularTokens = (
  allTokens: BerachainToken[],
  customConfig?: PopularTokenConfig[],
  maxTokens: number = 6
) => {
  return useMemo(() => {
    const config = customConfig ?? DEFAULT_POPULAR_TOKENS;
    const tokensMap = new Map(allTokens.map(token => [token.symbol, token]));

    return config
      .filter(configItem => configItem.enabled)
      .sort((a, b) => a.priority - b.priority)
      .map(configItem => tokensMap.get(configItem.symbol))
      .filter((token): token is BerachainToken => !!token)
      .slice(0, maxTokens);
  }, [allTokens, customConfig, maxTokens]);
};