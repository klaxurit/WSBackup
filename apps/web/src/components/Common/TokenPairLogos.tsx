import React from "react";
import { FallbackImg } from "../utils/FallbackImg";
import { getPoolDisplayToken } from "../../utils/tokenMapping";

interface Token {
  address: string;
  logoUri?: string | null;
  symbol: string;
}

interface TokenPairLogosProps {
  token0: Token;
  token1: Token;
  size?: number;
}

export const TokenPairLogos: React.FC<TokenPairLogosProps> = ({
  token0,
  token1,
  size = 32,
}) => {

  const getTokenDisplay = (token: Token) => {
    const displayInfo = getPoolDisplayToken(token.address as any);
    return {
      logoUri: displayInfo?.logoUri || token.logoUri,
      symbol: displayInfo?.symbol || token.symbol
    };
  };

  const displayToken0 = getTokenDisplay(token0);
  const displayToken1 = getTokenDisplay(token1);

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      position: 'relative',
      width: 36,
      height: 28,
      marginRight: 12
    }}>
      {displayToken0.logoUri ? (
        <img
          src={displayToken0.logoUri}
          style={{
            width: size,
            height: size,
            borderRadius: '50%',
            border: '2px solid #232323',
            background: '#fff',
            position: 'absolute',
            left: 0,
            zIndex: 2
          }}
          alt={displayToken0.symbol}
        />
      ) : (
        <FallbackImg
          content={displayToken0.symbol}
          style={{
            width: size,
            height: size,
            borderRadius: '50%',
            border: '2px solid #232323',
            background: '#fff',
            position: 'absolute',
            left: 0,
            zIndex: 2
          }}
        />
      )}
      {displayToken1.logoUri ? (
        <img
          src={displayToken1.logoUri}
          style={{
            width: size,
            height: size,
            borderRadius: '50%',
            border: '2px solid #232323',
            background: '#fff',
            position: 'absolute',
            left: 20,
            zIndex: 1
          }}
          alt={displayToken1.symbol}
        />
      ) : (
        <FallbackImg
          content={displayToken1.symbol}
          style={{
            width: size,
            height: size,
            borderRadius: '50%',
            border: '2px solid #232323',
            background: '#fff',
            position: 'absolute',
            left: 20,
            zIndex: 1
          }}
        />
      )}
    </span>
  );
};