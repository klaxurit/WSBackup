import { useMemo } from 'react';
import { usePoolByTokens } from './usePonderChartData';
import type { BerachainToken } from './useBerachainTokenList';
import { isPoolBlacklisted } from '../config/poolBlacklist';

interface PoolSelectionResult {
  poolAddress: string | null;
  isLoading: boolean;
  error: string | null;
  poolInfo: {
    token0Symbol: string;
    token1Symbol: string;
    feeTier: number;
    tvlUSD: string;
    volumeUSD: string;
    feesUSD: string;
  } | null;
}

/**
 * Hook pour gérer la sélection de pool basée sur les tokens sélectionnés
 */
export function usePoolSelection(
  fromToken: BerachainToken | null,
  toToken: BerachainToken | null
): PoolSelectionResult {
  // Recherche de la pool pour les tokens sélectionnés
  const { data: poolData, isLoading, error } = usePoolByTokens(
    fromToken?.address || null,
    toToken?.address || null
  );

  const result = useMemo((): PoolSelectionResult => {
    if (!fromToken || !toToken) {
      return {
        poolAddress: null,
        isLoading: false,
        error: null,
        poolInfo: null,
      };
    }

    if (isLoading) {
      return {
        poolAddress: null,
        isLoading: true,
        error: null,
        poolInfo: null,
      };
    }

    if (error) {
      return {
        poolAddress: null,
        isLoading: false,
        error: error.message || 'Erreur lors de la recherche de la pool',
        poolInfo: null,
      };
    }

    if (!poolData) {
      return {
        poolAddress: null,
        isLoading: false,
        error: `Aucune pool trouvée pour ${fromToken.symbol}/${toToken.symbol}`,
        poolInfo: null,
      };
    }

    // Check if the pool is blacklisted
    if (isPoolBlacklisted(poolData.id)) {
      return {
        poolAddress: null,
        isLoading: false,
        error: `La pool ${fromToken.symbol}/${toToken.symbol} n'est pas disponible`,
        poolInfo: null,
      };
    }

    return {
      poolAddress: poolData.id,
      isLoading: false,
      error: null,
      poolInfo: {
        token0Symbol: poolData.token0Ref?.symbol || 'Unknown',
        token1Symbol: poolData.token1Ref?.symbol || 'Unknown',
        feeTier: poolData.feeTier,
        tvlUSD: poolData.totalValueLockedUSD,
        volumeUSD: poolData.volumeUSD,
        feesUSD: poolData.feesUSD,
      },
    };
  }, [fromToken, toToken, poolData, isLoading, error]);

  return result;
}

/**
 * Hook pour gérer la sélection de pool avec fallback vers WBERA/HONEY
 */
export function usePoolSelectionWithFallback(
  fromToken: BerachainToken | null,
  toToken: BerachainToken | null
): PoolSelectionResult & {
  isUsingFallback: boolean;
  fallbackPoolAddress: string | null;
} {
  const poolSelection = usePoolSelection(fromToken, toToken);

  // Adresses par défaut pour WBERA/HONEY
  const DEFAULT_WBERA_ADDRESS = '0x6969696969696969696969696969696969696969';
  const DEFAULT_HONEY_ADDRESS = '0xFCBD14DC51f0A4d49d5E53C2E0950e0bC26d0Dce';

  // Recherche de la pool par défaut WBERA/HONEY
  const { data: fallbackPoolData } = usePoolByTokens(
    DEFAULT_WBERA_ADDRESS,
    DEFAULT_HONEY_ADDRESS
  );

  const isUsingFallback = useMemo(() => {
    // Check if fallback pool exists and is not blacklisted
    return !poolSelection.poolAddress &&
           !poolSelection.isLoading &&
           fallbackPoolData &&
           !isPoolBlacklisted(fallbackPoolData.id);
  }, [poolSelection.poolAddress, poolSelection.isLoading, fallbackPoolData]);

  return {
    ...poolSelection,
    isUsingFallback,
    fallbackPoolAddress: (fallbackPoolData?.id && !isPoolBlacklisted(fallbackPoolData.id))
                         ? fallbackPoolData.id
                         : null,
  };
}
