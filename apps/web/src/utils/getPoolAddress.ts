import { useReadContract } from 'wagmi';
import { v3CoreFactoryContract } from '../config/abis/v3CoreFactoryContractABI';
import React from 'react';

// Adresse du factory Uniswap V3 sur Berachain (à adapter si besoin)
const FACTORY_ADDRESS = '0x76fD9D07d5e4D889CAbED96884F15f7ebdcd6B63';

/**
 * Hook pour récupérer dynamiquement l'adresse de la pool Uniswap V3 pour deux tokens et un fee donné.
 * @param tokenA Adresse du premier token
 * @param tokenB Adresse du second token
 * @param fee Fee tier (ex: 3000 pour 0.3%, 500 pour 0.05%)
 */
export function usePoolAddress(tokenA?: string, tokenB?: string, fee: number = 3000) {
  // Ordre lexicographique obligatoire pour Uniswap V3
  const [token0, token1] = React.useMemo(() => {
    if (!tokenA || !tokenB) return [undefined, undefined];
    return [tokenA, tokenB].sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
  }, [tokenA, tokenB]);

  const enabled = Boolean(token0 && token1);

  const { data: poolAddress, isLoading, error } = useReadContract({
    address: FACTORY_ADDRESS,
    abi: v3CoreFactoryContract,
    functionName: 'getPool',
    args: token0 && token1 ? [token0, token1, fee] : undefined,
    query: { enabled },
  });

  return { poolAddress, isLoading, error };
} 