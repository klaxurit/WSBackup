import { useEffect, useState } from 'react';
import { useReadContract } from 'wagmi';
import { type Address } from 'viem';
import { v3CoreFactoryContract } from '../config/abis/v3CoreFactoryContractABI';

const FACTORY_ADDRESS = '0x76fD9D07d5e4D889CAbED96884F15f7ebdcd6B63' as const;

export const usePoolAddress = (tokenA?: Address, tokenB?: Address, fee: number = 3000) => {
  const [poolAddress, setPoolAddress] = useState<Address | null>(null);

  const { data: pool, isError } = useReadContract({
    address: FACTORY_ADDRESS,
    abi: v3CoreFactoryContract,
    functionName: 'getPool',
    args: tokenA && tokenB ? [tokenA, tokenB, fee] : undefined,
    query: {
      enabled: !!tokenA && !!tokenB
    }
  });

  useEffect(() => {
    if (pool && pool !== '0x0000000000000000000000000000000000000000') {
      console.log('[Pool Address Found]', {
        tokenA,
        tokenB,
        fee,
        poolAddress: pool
      });
      setPoolAddress(pool as Address);
    } else {
      setPoolAddress(null);
    }
  }, [pool, tokenA, tokenB, fee]);

  return {
    poolAddress,
    isError
  };
}; 