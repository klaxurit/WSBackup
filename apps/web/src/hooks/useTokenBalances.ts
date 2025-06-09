import { useEffect, useState } from 'react';
import { createPublicClient, http, formatUnits, formatEther } from 'viem';
import { berachain } from 'viem/chains';

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
];

interface Token {
  address?: string;
  symbol: string;
  decimals?: number;
}

export function useTokenBalances(tokens: Token[], address: `0x${string}`) {
  const [balances, setBalances] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!address || !tokens || tokens.length === 0) {
      setBalances({});
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    const berachainApiUrl = import.meta.env.VITE_BERACHAIN_API_URL;
    const client = createPublicClient({ chain: berachain, transport: http(berachainApiUrl) });

    async function fetchBalances() {
      const results = await Promise.all(tokens.map(async (token) => {
        // console.log('Token reçu pour balance:', token);
        try {
          if (!token.address) {
            // BERA natif
            const balance = await client.getBalance({ address: address as `0x${string}` });
            return { symbol: token.symbol, balance: formatEther(balance), loading: false };
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
            return { symbol: token.symbol, balance: formatUnits(rawBalance as bigint, decimals as number), loading: false };
          }
        } catch (e) {
          return { symbol: token.symbol, balance: '0', loading: false };
        }
      }));
      if (!cancelled) {
        const balancesObj: { [symbol: string]: string } = {};
        results.forEach(({ symbol, balance }) => {
          balancesObj[symbol] = balance;
        });
        setBalances(balancesObj);
        setLoading(false);
      }
    }
    fetchBalances();
    return () => { cancelled = true; };
  }, [tokens, address]);

  return { balances, loading };
} 
