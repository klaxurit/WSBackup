import React from "react";
import { FallbackImg } from "../utils/FallbackImg";
import { getPoolDisplayToken } from "../../utils/tokenMapping";
import type { Address } from "viem";

interface Token {
  id: Address
  address: Address;
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
    const address: Address = !token.address && token.id.startsWith("0x") ? token.id : token.address
    const displayInfo = getPoolDisplayToken(address);
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
    verticalAlign: 'middle',
    flexShrink: 0 // Empêche le composant de se rétrécir dans les conteneurs flex
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
    objectFit: 'contain',
    imageRendering: 'auto'
  };

  const leftImageStyle: React.CSSProperties = {
    ...imageStyle,
    paddingRight: '5%',
    transform: 'scale(1.05)'
  };

  const rightImageStyle: React.CSSProperties = {
    ...imageStyle,
    paddingLeft: '5%',
    transform: 'scale(1.05)'
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
          <img src={displayToken0.logoUri} style={leftImageStyle} alt={displayToken0.symbol} />
        ) : (
          <FallbackImg content={displayToken0.symbol} style={leftImageStyle} />
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
          <img src={displayToken1.logoUri} style={rightImageStyle} alt={displayToken1.symbol} />
        ) : (
          <FallbackImg content={displayToken1.symbol} style={rightImageStyle} />
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