import React from 'react';
import { SafeImage } from '../utils/SafeImage';
import { FallbackImg } from '../utils/FallbackImg';
import './TokenLogo.scss';

export type TokenLogoSize = 'small' | 'medium' | 'large' | 'xlarge';

interface TokenLogoProps {
  logoUri?: string | null;
  symbol: string;
  size?: TokenLogoSize | number;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  noBorder?: boolean;
}

// Mapping des tailles prédéfinies (px)
const SIZE_MAP: Record<TokenLogoSize, number> = {
  small: 20,
  medium: 24,
  large: 28,
  xlarge: 40,
};

// Mapping des bordures en fonction de la taille (px)
const BORDER_WIDTH_MAP: Record<TokenLogoSize, number> = {
  small: 1,
  medium: 1.5,
  large: 1.5,
  xlarge: 2,
};

/**
 * Composant pour afficher le logo d'un token avec bordure harmonisée
 * 
 * @param logoUri - URL du logo du token
 * @param symbol - Symbole du token (utilisé pour le fallback)
 * @param size - Taille: 'small' (20px), 'medium' (24px), 'large' (28px), 'xlarge' (40px), ou nombre personnalisé
 * @param className - Classes CSS supplémentaires
 * @param style - Styles inline personnalisés
 * @param onClick - Callback au clic
 * @param noBorder - Désactiver la bordure (défaut: false)
 */
export const TokenLogo: React.FC<TokenLogoProps> = ({
  logoUri,
  symbol,
  size = 'medium',
  className = '',
  style,
  onClick,
  noBorder = false
}) => {
  const sizeInPx = typeof size === 'number' ? size : SIZE_MAP[size];

  const borderWidth = typeof size === 'number'
    ? Math.round(sizeInPx / 16)
    : BORDER_WIDTH_MAP[size];

  const isStickyToken =
    symbol.toUpperCase().includes('STICKY') ||
    symbol.toUpperCase().startsWith('AW-') ||
    symbol.toUpperCase().includes('AW-STICKY') ||
    (logoUri && (
      logoUri.toLowerCase().includes('sticky') ||
      logoUri.toLowerCase().includes('vault')
    ));

  const shouldHaveBorder = !noBorder && !isStickyToken;

  const tokenLogoClass = `TokenLogo TokenLogo--${typeof size === 'string' ? size : 'custom'} ${isStickyToken ? 'TokenLogo--no-border' : ''} ${className}`.trim();

  const combinedStyle: React.CSSProperties = {
    width: sizeInPx,
    height: sizeInPx,
    borderRadius: '50%',
    ...(shouldHaveBorder && {
      border: `${borderWidth}px solid rgb(255, 193, 100)`,
      boxSizing: 'border-box',
    }),
    ...style,
  };

  if (!logoUri) {
    return (
      <FallbackImg
        content={symbol.charAt(0).toUpperCase()}
        width={sizeInPx}
        height={sizeInPx}
        className={tokenLogoClass}
        style={combinedStyle}
        onClick={onClick}
      />
    );
  }

  return (
    <SafeImage
      src={logoUri}
      alt={symbol}
      fallbackContent={symbol.charAt(0).toUpperCase()}
      width={sizeInPx}
      height={sizeInPx}
      className={tokenLogoClass}
      style={combinedStyle}
      onClick={onClick}
    />
  );
};

export default TokenLogo;

