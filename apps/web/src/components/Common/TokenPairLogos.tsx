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
  size = 40,
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

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    width: `${size}px`,
    height: `${size}px`,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: '1000px',
    border: '3px solid #FFC164',
    background: '#FFC164',
    overflow: 'hidden',
    gap: '6px'
  };

  const tokenStyle: React.CSSProperties = {
    display: 'flex',
    height: `45px`,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    width: `40px`,
    flexShrink: 0,
    aspectRatio: '1/1'
  };

  const imageStyle: React.CSSProperties = {
    width: '90%',
    height: '80%',
    objectFit: 'cover'
  };

  return (
    <div style={containerStyle}>
      {/* Token Left - Moitié gauche */}
      <div style={{
        ...tokenStyle,
        clipPath: 'polygon(0 0, 49% 0, 49% 100%, 0% 100%)',
        marginRight: '-65%'
      }}>
        {displayToken0.logoUri ? (
          <img
            src={displayToken0.logoUri}
            style={imageStyle}
            alt={displayToken0.symbol}
          />
        ) : (
          <FallbackImg
            content={displayToken0.symbol}
            style={imageStyle}
          />
        )}
      </div>

      {/* Token Right - Moitié droite */}
      <div style={{
        ...tokenStyle,
        clipPath: 'polygon(51% 0, 100% 0, 100% 100%, 51% 100%)',
        marginLeft: '-65%'
      }}>
        {displayToken1.logoUri ? (
          <img
            src={displayToken1.logoUri}
            style={imageStyle}
            alt={displayToken1.symbol}
          />
        ) : (
          <FallbackImg
            content={displayToken1.symbol}
            style={imageStyle}
          />
        )}
      </div>
    </div>
  );
};