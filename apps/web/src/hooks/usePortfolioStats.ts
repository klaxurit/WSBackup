import { useMemo } from 'react';
import { useAccount } from 'wagmi';
import { useQuery } from '@tanstack/react-query';
import { Pool, Position, TickMath } from '@uniswap/v3-sdk';
import { Token } from '@uniswap/sdk-core';
import { currentChain } from '../config/wagmi';
import JSBI from 'jsbi';
import { useLeaderboardWallet } from './useLeaderboard';

const GET_USER_POSITIONS = `
query GetTransactions($owner: String) {
  positions(where: {owner: $owner}) {
    items {
      id
      pool
      poolRef {
        id
        sqrtPrice
        tick
        liquidity
        token0Ref {
          logoUri
          id
          name
          symbol
          decimals
          tokenDayData(limit: 1, orderBy: "date", orderDirection: "desc") {
            items {
              priceUSD
            }
          }
        }
        token1Ref {
          id
          logoUri
          name
          symbol
          decimals
          tokenDayData(limit: 1, orderBy: "date", orderDirection: "desc") {
            items {
              priceUSD
            }
          }
        }
        feeTier
        poolDayData(limit: 1, orderBy: "date", orderDirection: "desc") {
          items {
            apr
          }
        }
      }
      tokenId
      tickLower
      tickUpper
      withdrawnToken1
      withdrawnToken0
      depositedToken0
      depositedToken1
      liquidity
    }
  }
}
`;

const GET_USER_VAULT_POSITIONS = `
query GetUserVaultPositions($user: String) {
  stickyVaults {
    items {
      id
      name
      totalValueLockedUSD
      vaultDayData(orderBy: "date", orderDirection: "desc", limit: 1) {
        items {
          apr
          maxPotentialAPR
        }
      }
      poolRef {
        feeTier
        token0Ref {
          id
          name
          symbol
          logoUri
          decimals
        }
        token1Ref {
          id
          name
          symbol
          logoUri
          decimals
        }
      }
      positions(where: {user: $user}) {
        items {
          id
          user
          shares
          depositedToken0
          depositedToken1
          currentValueToken0
          currentValueToken1
          currentValueUSD
          feesEarnedUSD
          realizedPnLUSD
          initialValueUSD
          totalPnLUSD
        }
      }
    }
  }
}
`;

export interface PortfolioStats {
  totalValueUSD: number;
  poolValueUSD: number;
  vaultValueUSD: number;
  totalFeesEarned: number;
  poolFeesEarned: number;
  vaultFeesEarned: number;
  activePositions: number;
  poolPositions: number;
  vaultPositions: number;
  // Données du leaderboard depuis le backend
  rank: number;
  points: number;
  volumePoints: number;
  liquidityPoints: number;
  totalVolumeUSD: number;
  currentLiquidityUSD: number;
  rankChange?: number;
  // Mock data pour l'UI (sera remplacé par le backend plus tard)
  referrals: number;
  multiplier: number;
}

/**
 * Hook pour calculer les statistiques du portfolio utilisateur
 * - Balance totale (pools + vaults)
 * - Fees gagnés
 * - Nombre de positions
 * - Rank, Points, Referrals, Multiplier (mock pour l'instant)
 */
export function usePortfolioStats(): {
  stats: PortfolioStats | null;
  isLoading: boolean;
  isWalletInLeaderboard: boolean; // Indique si le wallet est dans le leaderboard
} {
  const { address } = useAccount();
  
  // Récupérer les données du leaderboard depuis le backend
  // null signifie que le wallet n'est pas dans le leaderboard (pas une erreur)
  const { data: leaderboardData, isLoading: leaderboardLoading } = useLeaderboardWallet(address);
  
  // Le wallet est dans le leaderboard si on a des données (même avec rank 0)
  const isWalletInLeaderboard = leaderboardData !== null && leaderboardData !== undefined;

  const { data: positions, isLoading: positionsLoading } = useQuery({
    queryKey: ['portfolio-positions', address],
    queryFn: async () => {
      if (!address) return null;

      const response = await fetch(`${import.meta.env.VITE_GRAPHQL_URL}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: GET_USER_POSITIONS, variables: { owner: address } }),
      });

      if (!response.ok) return null;
      const data = await response.json();
      return data.data.positions.items;
    },
    enabled: !!address,
  });

  const { data: vaultPositionsData, isLoading: vaultPositionsLoading } = useQuery({
    queryKey: ['portfolio-vault-positions', address],
    queryFn: async () => {
      if (!address) return null;

      const response = await fetch(`${import.meta.env.VITE_GRAPHQL_URL}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: GET_USER_VAULT_POSITIONS, variables: { user: address.toLowerCase() } }),
      });

      if (!response.ok) return null;
      const data = await response.json();
      return data.data.stickyVaults.items;
    },
    enabled: !!address,
  });

  const stats = useMemo(() => {
    if (!address) return null;

    let totalValueUSD = 0;
    let poolValueUSD = 0;
    let vaultValueUSD = 0;
    let totalFeesEarned = 0;
    let poolFeesEarned = 0;
    let vaultFeesEarned = 0;
    let activePositions = 0;
    let poolPositions = 0;
    let vaultPositions = 0;

    // Calculer les valeurs des positions pools
    if (positions) {
      positions.forEach((pos: any) => {
        try {
          const pool = pos.poolRef;
          const position = pos;

          if (position.liquidity === "0" || !pool.sqrtPrice) {
            return; // Position fermée
          }

          // Calculer le tick actuel
          const currentTick = pool.tick ? Number(pool.tick) : TickMath.getTickAtSqrtRatio(JSBI.BigInt(pool.sqrtPrice));

          // Créer le SDK pool
          const sdkPool = new Pool(
            new Token(currentChain.id, pool.token0Ref.id, pool.token0Ref.decimals || 18, pool.token0Ref.symbol, pool.token0Ref.name),
            new Token(currentChain.id, pool.token1Ref.id, pool.token1Ref.decimals || 18, pool.token1Ref.symbol, pool.token1Ref.name),
            pool.feeTier,
            pool.sqrtPrice,
            pool.liquidity,
            currentTick
          );

          // Créer la SDK position
          const sdkPosition = new Position({
            pool: sdkPool,
            tickLower: position.tickLower,
            tickUpper: position.tickUpper,
            liquidity: position.liquidity
          });

          // Obtenir les montants
          const amount0 = parseFloat(sdkPosition.amount0.toExact());
          const amount1 = parseFloat(sdkPosition.amount1.toExact());

          // Calculer la valeur USD
          const token0Price = pool.token0Ref?.tokenDayData?.items?.[0]?.priceUSD || 0;
          const token1Price = pool.token1Ref?.tokenDayData?.items?.[0]?.priceUSD || 0;

          const value0USD = amount0 * parseFloat(token0Price);
          const value1USD = amount1 * parseFloat(token1Price);
          const positionValue = value0USD + value1USD;

          if (positionValue >= 0.5) {
            poolValueUSD += positionValue;
            totalValueUSD += positionValue;
            activePositions++;
            poolPositions++;
          }
        } catch (error) {
          console.error('Error calculating pool position value:', error);
        }
      });
    }

    // Calculer les valeurs des positions vaults
    if (vaultPositionsData) {
      vaultPositionsData.forEach((vault: any) => {
        vault.positions.items.forEach((pos: any) => {
          const positionValue = parseFloat(pos.currentValueUSD || '0');
          const feesEarned = parseFloat(pos.feesEarnedUSD || '0');

          if (positionValue >= 0.5) {
            vaultValueUSD += positionValue;
            totalValueUSD += positionValue;
            vaultFeesEarned += feesEarned;
            totalFeesEarned += feesEarned;
            activePositions++;
            vaultPositions++;
          }
        });
      });
    }

    // Utiliser les données du leaderboard si disponibles, sinon utiliser les valeurs calculées
    const rank = leaderboardData?.rank ?? 0;
    const totalPoints = leaderboardData?.totalPoints ?? 0;
    const volumePoints = leaderboardData?.volumePoints ?? 0;
    const liquidityPoints = leaderboardData?.liquidityPoints ?? 0;
    const totalVolumeUSDFromLeaderboard = leaderboardData?.totalVolumeUSD ?? 0;
    const currentLiquidityUSDFromLeaderboard = leaderboardData?.currentLiquidityUSD ?? 0;
    const rankChange = leaderboardData?.rankChange;

    // Si on a des données du leaderboard, utiliser la liquidité du leaderboard (plus précise)
    // Sinon utiliser la valeur calculée depuis les positions
    const finalTotalValueUSD = currentLiquidityUSDFromLeaderboard > 0 
      ? currentLiquidityUSDFromLeaderboard 
      : totalValueUSD;

    // Mock data pour Referrals et Multiplier (pas encore disponibles dans le backend)
    // TODO: Remplacer par les vraies données du backend quand disponibles
    const mockReferrals = Math.floor(Math.random() * 50);
    const mockMultiplier = 1 + (mockReferrals * 0.01); // Multiplier basé sur les referrals

    return {
      totalValueUSD: finalTotalValueUSD,
      poolValueUSD,
      vaultValueUSD,
      totalFeesEarned,
      poolFeesEarned,
      vaultFeesEarned,
      activePositions,
      poolPositions,
      vaultPositions,
      rank,
      points: totalPoints,
      volumePoints,
      liquidityPoints,
      totalVolumeUSD: totalVolumeUSDFromLeaderboard || 0,
      currentLiquidityUSD: currentLiquidityUSDFromLeaderboard || totalValueUSD,
      rankChange,
      referrals: mockReferrals,
      multiplier: mockMultiplier,
    };
  }, [address, positions, vaultPositionsData, leaderboardData]);

  // Si le wallet n'est pas dans le leaderboard, on retourne quand même les stats calculées
  // mais avec rank = 0 et points = 0
  const isLoading = positionsLoading || vaultPositionsLoading || leaderboardLoading;

  return {
    stats,
    isLoading,
    isWalletInLeaderboard,
  };
}

