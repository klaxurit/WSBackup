import React from "react";
import { FallbackImg } from "../utils/FallbackImg";

interface Token {
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
}) => (
  <span style={{
    display: 'inline-flex',
    alignItems: 'center',
    position: 'relative',
    width: 36,
    height: 28,
    marginRight: 4
  }}>
    {token0.logoUri ? (
      <img
        src={token0.logoUri}
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
        alt={token0.symbol}
      />
    ) : (
      <FallbackImg
        content={token0.symbol}
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
    {token1.logoUri ? (
      <img
        src={token1.logoUri}
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
        alt={token1.symbol}
      />
    ) : (
      <FallbackImg
        content={token1.symbol}
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
