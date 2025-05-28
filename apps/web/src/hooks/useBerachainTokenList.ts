import { useMemo } from 'react';
import { BERACHAIN_TOKENS } from '../config/berachainTokens';

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
  return useMemo(
    () =>
      BERACHAIN_TOKENS.map((token) => {
        return {
          ...token,
          logoURI: getLogoUrl(token),
        };
      }),
    []
  );
} 