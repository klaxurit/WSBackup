import React from 'react';
import { BackgroundSVG } from '../SVGs/BackgroundSVG';
import winnieHii from '../../assets/winnie_hii.png';

interface SwapBannerProps {
  title?: string;
  className?: string;
  subtitle?: string;
}

export const SwapBanner: React.FC<SwapBannerProps> = ({
  title = "Swap",
  className = "",
  subtitle = "Trade your tokens easily"
}) => {
  return (
    <div className={`swap-banner swap-banner--modern ${className}`}>
      <div className="swap-banner__content">
        <div className="swap-banner__text">
          <h1 className="swap-banner__title">{title}</h1>
          {subtitle && <h5 className="swap-banner__subtitle">{subtitle}</h5>}
        </div>
      </div>
      <div className="swap-banner__bg-svg">
        <BackgroundSVG />
      </div>
      <div className="swap-banner__winnie">
        <img src={winnieHii} alt="Winnie dit bonjour" />
      </div>
    </div>
  );
};