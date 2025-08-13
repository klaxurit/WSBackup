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
  gap?: number;
  borderWidth?: number;
  separatorWidth?: number;
}

export const TokenPairLogos: React.FC<TokenPairLogosProps> = ({
  token0,
  token1,
  size = 40,
  gap = 6,
  borderWidth,
  separatorWidth,
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

  const computedBorderWidth =
    typeof borderWidth === 'number' ? borderWidth : Math.max(2, Math.round(size * 0.075));

  const sepWidth =
    typeof separatorWidth === 'number' ? separatorWidth : (typeof gap === 'number' ? gap : 0);

  const containerStyle: React.CSSProperties = {
    position: 'relative',
    display: 'inline-block',
    width: `${size}px`,
    height: `${size}px`,
    borderRadius: '1000px',
    border: `${computedBorderWidth}px solid #FFC164`,
    background: '#FFC164',
    overflow: 'hidden',
    verticalAlign: 'middle'
  };

  const baseHalfStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };

  const imageStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  };

  return (
    <div style={containerStyle}>
      {/* Moitié gauche */}
      <div
        style={{
          ...baseHalfStyle,
          clipPath: 'polygon(0 0, 50% 0, 50% 100%, 0% 100%)'
        }}
      >
        {displayToken0.logoUri ? (
          <img src={displayToken0.logoUri} style={imageStyle} alt={displayToken0.symbol} />
        ) : (
          <FallbackImg content={displayToken0.symbol} style={imageStyle} />
        )}
      </div>

      {/* Moitié droite */}
      <div
        style={{
          ...baseHalfStyle,
          clipPath: 'polygon(50% 0, 100% 0, 100% 100%, 50% 100%)'
        }}
      >
        {displayToken1.logoUri ? (
          <img src={displayToken1.logoUri} style={imageStyle} alt={displayToken1.symbol} />
        ) : (
          <FallbackImg content={displayToken1.symbol} style={imageStyle} />
        )}
      </div>

      {/* Séparateur central contrôlé par gap */}
      {sepWidth > 0 && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: `calc(50% - ${sepWidth / 2}px)`,
            width: `${sepWidth}px`,
            background: '#FFC164'
          }}
        />
      )}
    </div>
  );
};