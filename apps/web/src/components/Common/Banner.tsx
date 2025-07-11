import React from 'react';
import { BannerBG } from '../SVGs/BannerBG';

export interface BannerProps {
  title?: string;
  className?: string;
  subtitle?: string;
  image?: string;
  imageAlt?: string;
}

export const Banner: React.FC<BannerProps> = ({
  title = '',
  className = '',
  subtitle = '',
  image,
  imageAlt = 'Banner image',
}) => {
  function truncate(str: string, max: number) {
    return str.length > max ? str.slice(0, max) + '…' : str;
  }
  return (
    <div style={{ position: 'relative', width: '100%' }}>
      {/* Mascotte/image qui dépasse au-dessus de la bannière */}
      {image && (
        <div
          className="swap-banner__winnie"
          style={{
            position: 'absolute',
            right: 10,
            top: -40, // dépasse de 40px vers le haut
            zIndex: 2,
            display: 'flex',
            alignItems: 'flex-end',
            height: 'calc(100% + 40px)',
            pointerEvents: 'none',
          }}
        >
          <img src={image} alt={imageAlt} style={{ height: '100%', width: 'auto', maxWidth: 320, minWidth: 120, objectFit: 'contain', display: 'block', userSelect: 'none' }} />
        </div>
      )}
      <div className={`swap-banner swap-banner--modern ${className}`} style={{ position: 'relative', overflow: 'hidden' }}>
        {/* SVG de fond couvrant toute la bannière */}
        <div style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none' }}>
          <BannerBG />
        </div>
        {/* Contenu texte */}
        <div className="swap-banner__content">
          <div className="swap-banner__text">
            {title && <h1 className="swap-banner__title" title={title}>{truncate(title, 17)}</h1>}
            {subtitle && <h5 className="swap-banner__subtitle">{subtitle}</h5>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Banner; 