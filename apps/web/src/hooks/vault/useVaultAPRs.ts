import { useQuery } from '@tanstack/react-query';
import { type Address } from 'viem';

// ============ NEW INTERFACES FOR BACKEND RESPONSE ============

export interface APRBreakdownItem {
  value: number;
  source: string;
}

export interface APRBreakdown {
  fees: APRBreakdownItem;
  bgtInjection?: APRBreakdownItem;
  bgtStaking?: APRBreakdownItem;
}

export interface VaultStrategy {
  name: 'sticky' | 'autowin' | 'infrared' | 'berahub';
  available: true;
  baseAPR: number;
  poolAPR?: number; // Pure pool APR from underlying Uniswap V3 pool
  bgtAPR: number;
  totalAPR: number;
  realizedAPR?: number; // Actual gross APR from fees collected (for performance comparison)
  breakdown: APRBreakdown;
  description: string;
  // Strategy-specific fields
  autoWinVaultAddress?: string;
  stats?: {
    totalBgtClaimed: string;
    avgBgtPerClaim: string;
    claimCount: number;
  };
  slug?: string;
  rewardVaultAddress?: string;
  bgtEmissions?: {
    bgtPerBlock: number;
    totalBGTReceived: number;
  };
  externalLink?: string;
}

export interface BestStrategy {
  name: string;
  totalAPR: number;
  description: string;
}

export interface VaultAPRResponse {
  success: boolean;
  vaultAddress: string;
  vaultName: string;
  bgtPrice: number;
  strategies: VaultStrategy[];
  bestStrategy: BestStrategy;
}

// ============ HELPER TYPES FOR COMPONENT USE ============

export type StrategyType = 'sticky' | 'autowin' | 'infrared' | 'berahub';

export interface StrategyDisplay {
  name: StrategyType;
  label: string;
  totalAPR: number;
  baseAPR: number;
  bgtAPR: number;
  isBest: boolean;
  description: string;
  externalLink?: string;
  stats?: VaultStrategy['stats'];
  bgtEmissions?: VaultStrategy['bgtEmissions'];
}

interface UseVaultAPRsParams {
  vaultAddress: Address | undefined;
  enabled?: boolean;
}

export function useVaultAPRs({ vaultAddress, enabled = true }: UseVaultAPRsParams) {
  return useQuery<VaultAPRResponse>({
    queryKey: ['vaultAPRs', vaultAddress],
    queryFn: async () => {
      if (!vaultAddress) {
        throw new Error('Vault address is required');
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/vaults/${vaultAddress}/apr`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch vault APRs: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error('Failed to fetch vault APRs');
      }

      return data;
    },
    enabled: enabled && !!vaultAddress,
    staleTime: 60 * 1000, // Consider data stale after 1 minute
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}