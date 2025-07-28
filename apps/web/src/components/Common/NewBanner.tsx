import React from 'react';

export interface BannerProps {
  title?: string;
  className?: string;
  subtitle?: string;
  image?: string;
  imageAlt?: string;
}

export const NewBanner: React.FC<BannerProps> = ({
  title = '',
  className = '',
  subtitle = '',
  image,
  imageAlt = 'Banner image',
}) => {
  return (
      <div className={`swap-banner ${className}`}>
        {/* Contenu texte */}
        <div className="swap-banner__content">
          <div className="swap-banner__text">
            {title && <h1 className="swap-banner__title" title={title}>{title}</h1>}
            {subtitle && <h5 className="swap-banner__subtitle">{subtitle}</h5>}
          </div>
          <img className='swap-banner__img' src={image} alt={imageAlt} />
        </div>
      </div>
  );
};

export default NewBanner; 