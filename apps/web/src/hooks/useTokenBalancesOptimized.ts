import { useEffect, useState, useMemo } from 'react';
import { createPublicClient, http, formatUnits, formatEther } from 'viem';
import { berachain } from 'viem/chains';
import { useAccount } from 'wagmi';
import type { BerachainToken } from './useBerachainTokenList';

const ERC20_ABI = [
  {
    constant: true,
    inputs: [
      {
        name: 'owner',
        type: 'address',
      },
    ],
    name: 'balanceOf',
    outputs: [
      {
        name: 'balance',
        type: 'uint256',
      },
    ],
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'decimals',
    outputs: [
      {
        name: '',
        type: 'uint8',
      },
    ],
    type: 'function',
  },
] as const;


interface UseTokenBalancesOptimizedOptions {
  tokens: BerachainToken[];
  maxTokens?: number; // Limiter le nombre de tokens pour optimiser
}

/**
 * Hook optimisé pour récupérer les balances des tokens
 * Utilise la parallélisation et limite le nombre de tokens traités
 */
export const useTokenBalancesOptimized = ({
  tokens,
  maxTokens = 10
}: UseTokenBalancesOptimizedOptions) => {
  const [balances, setBalances] = useState<Record<string, string>>({});
  const [balancesUSD, setBalancesUSD] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const { address, isConnected } = useAccount();

  // Limiter le nombre de tokens pour optimiser les performances
  const limitedTokens = useMemo(() => {
    if (!tokens || tokens.length === 0) return [];

    // Prioriser les tokens essentiels et autres tokens importants
    const essentialTokens = tokens.filter(t =>
      t.symbol === 'BERA' ||
      t.symbol === 'wBERA' ||
      t.symbol === 'WBERA' ||
      t.symbol === 'HONEY' ||
      t.symbol === 'iBERA' ||
      t.symbol === 'POLLEN' ||
      t.symbol === 'WBTC' ||
      t.symbol === 'DOLO' ||
      t.symbol === 'USD₮0' ||
      t.symbol === 'USDC' ||
      t.symbol === 'USDT' ||
      t.symbol === 'WETH' ||
      t.symbol === 'NECT'
    );

    // Limiter aux tokens essentiels
    return essentialTokens.slice(0, maxTokens);
  }, [tokens, maxTokens]);

  // Préparer les tokens pour les appels blockchain
  const balanceInputTokens = useMemo(() => {
    return limitedTokens.map(token => ({
      address: token.address === '0x0000000000000000000000000000000000000000'
        ? undefined
        : token.address,
      symbol: token.symbol,
      decimals: token.decimals
    }));
  }, [limitedTokens]);

  useEffect(() => {
    if (!address || !isConnected || !balanceInputTokens.length) {
      setBalances({});
      setBalancesUSD({});
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    const berachainApiUrl = import.meta.env.VITE_BERACHAIN_API_URL;
    const client = createPublicClient({
      chain: berachain,
      transport: http(berachainApiUrl)
    });

    async function fetchBalances() {
      try {
        const results = await Promise.all(
          balanceInputTokens.map(async (token) => {
            try {
              let balance: string;

              if (!token.address) {
                // BERA natif
                const nativeBalance = await client.getBalance({
                  address: address as `0x${string}`
                });
                balance = formatEther(nativeBalance);
              } else {
                // ERC20
                let decimals = token.decimals;
                if (decimals === undefined || decimals === null) {
                  try {
                    decimals = Number(await client.readContract({
                      address: token.address as `0x${string}`,
                      abi: ERC20_ABI,
                      functionName: 'decimals',
                    }));
                  } catch {
                    decimals = 18; // fallback
                  }
                }

                const rawBalance = await client.readContract({
                  address: token.address as `0x${string}`,
                  abi: ERC20_ABI,
                  functionName: 'balanceOf',
                  args: [address],
                });

                balance = formatUnits(rawBalance as bigint, decimals);
              }

              return {
                symbol: token.symbol,
                balance,
                address: token.address || '0x0000000000000000000000000000000000000000'
              };
            } catch (error) {
              console.warn(`Failed to fetch balance for ${token.symbol}:`, error);
              return {
                symbol: token.symbol,
                balance: '0',
                address: token.address || '0x0000000000000000000000000000000000000000'
              };
            }
          })
        );

        if (!cancelled) {
          const balancesObj: Record<string, string> = {};
          results.forEach(({ symbol, balance }) => {
            balancesObj[symbol] = balance;
          });

          setBalances(balancesObj);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error fetching token balances:', error);
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchBalances();
    return () => { cancelled = true; };
  }, [address, isConnected, balanceInputTokens]);

  return {
    balances,
    balancesUSD,
    loading,
    limitedTokens // Retourner les tokens limités pour le tri
  };
};
