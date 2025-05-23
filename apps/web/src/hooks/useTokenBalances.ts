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

export function useTokenBalances(tokens, address) {
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
    const client = createPublicClient({ chain: berachain, transport: http('https://api.henlo-winnie.dev/v1/mainnet/29d1c692-5145-4ae5-8bef-42f00f5f4671') });

    async function fetchBalances() {
      const results = await Promise.all(tokens.map(async (token) => {
        console.log('Token reçu pour balance:', token);
        try {
          if (!token.address) {
            // BERA natif
            const balance = await client.getBalance({ address });
            return { symbol: token.symbol, balance: formatEther(balance), loading: false };
          } else {
            // ERC20
            let decimals = token.decimals;
            if (decimals === undefined || decimals === null) {
              try {
                decimals = await client.readContract({
                  address: token.address,
                  abi: ERC20_ABI,
                  functionName: 'decimals',
                });
              } catch {
                decimals = 18; // fallback
              }
            }
            const rawBalance = await client.readContract({
              address: token.address,
              abi: ERC20_ABI,
              functionName: 'balanceOf',
              args: [address],
            });
            return { symbol: token.symbol, balance: formatUnits(rawBalance, decimals), loading: false };
          }
        } catch (e) {
          return { symbol: token.symbol, balance: '0', loading: false };
        }
      }));
      if (!cancelled) {
        const balancesObj = {};
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