import { useCallback, useEffect, useState } from 'react';
import { getAddress, createPublicClient, http } from 'viem';
import { berachain } from 'viem/chains';

// Configuration du client viem pour Berachain mainnet
const publicClient = createPublicClient({
  chain: berachain,
  transport: http('https://api.henlo-winnie.dev/v1/mainnet/29d1c692-5145-4ae5-8bef-42f00f5f4671')
});

export const useBeraname = (address?: string) => {
  const [beraname, setBeraname] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const resolveBeraname = useCallback(async (addr: string) => {
    if (!addr) return;

    setIsLoading(true);
    setError(null);

    try {
      const checksumAddress = getAddress(addr);
      const name = await publicClient.getEnsName({
        address: checksumAddress
      });

      setBeraname(name ? name.replace('.bera', '.🐻⛓️') : null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erreur inconnue'));
      setBeraname(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (address) {
      resolveBeraname(address);
    } else {
      setBeraname(null);
    }
  }, [address, resolveBeraname]);

  return beraname;
};