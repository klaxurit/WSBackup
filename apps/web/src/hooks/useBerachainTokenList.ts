import { useEffect, useMemo, useState } from 'react';
import { BERACHAIN_TOKENS } from '../config/berachainTokens';
import { useWatchContractEvent } from 'wagmi';
import { v3CoreFactoryContract } from '../config/abis/v3CoreFactoryContractABI';
import { berachainBepolia } from 'viem/chains';

export interface BerachainToken {
  name: string;
  symbol: string;
  address: string; // toujours string, '' pour natif
  logoURI: string;
  decimals: number;
  logoSymbol?: string;
}

const getImageName = (token: { symbol: string; logoSymbol?: string }) => {
  if (token.logoSymbol) return token.logoSymbol;
  return token.symbol.toLowerCase();
};

const getLogoUrl = (token: { symbol: string; logoSymbol?: string }) => {
  const imageName = getImageName(token);
  return `https://static.kodiak.finance/tokens/${imageName}.png`;
};

export function useBerachainTokenList(): BerachainToken[] {
  const [tokenList, setTokenList] = useState<BerachainToken[]>([])

  useWatchContractEvent({
    address: '0x76fD9D07d5e4D889CAbED96884F15f7ebdcd6B63',
    abi: v3CoreFactoryContract,
    chainId: berachainBepolia.id,
    eventName: 'PoolCreated',
    onLogs: (logs) => {
      console.log("PoolCreated Event:", logs)
    }
  })

  useEffect(() => {
    if (tokenList.length === 0) {
      const l = BERACHAIN_TOKENS.map((token) => {
        return {
          ...token,
          logoURI: getLogoUrl(token),
        };
      })

      setTokenList(l)
    }
  }, [])



  return tokenList
  return useMemo(
    () =>
      []
  );
} 
