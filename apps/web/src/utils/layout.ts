import React from 'react';
import { LAYOUT_CONFIG } from '../config/layoutConfig';

export class LayoutUtils {
  /**
   * Détermine si on est sur mobile basé sur la largeur de l'écran
   */
  static isMobile(): boolean {
    return window.innerWidth <= LAYOUT_CONFIG.MOBILE_BREAKPOINT;
  }

  /**
   * Détermine si on est sur tablette
   */
  static isTablet(): boolean {
    return window.innerWidth <= LAYOUT_CONFIG.TABLET_BREAKPOINT &&
      window.innerWidth > LAYOUT_CONFIG.MOBILE_BREAKPOINT;
  }

  /**
   * Retourne la hauteur appropriée pour le chart selon l'écran
   */
  static getChartHeight(): number {
    if (this.isMobile()) {
      return LAYOUT_CONFIG.CHART_HEIGHT.MOBILE;
    }
    if (this.isTablet()) {
      return LAYOUT_CONFIG.CHART_HEIGHT.TABLET;
    }
    return LAYOUT_CONFIG.CHART_HEIGHT.DESKTOP;
  }

  /**
   * Retourne une image de bannière aléatoire
   */
  static getRandomBannerImage(): string {
    const images = LAYOUT_CONFIG.DEFAULT_BANNER_IMAGES;
    return images[Math.floor(Math.random() * images.length)];
  }

  /**
   * Formate un symbole de trading pour TradingView
   */
  static formatTradingViewSymbol(tokenA: string, tokenB: string, exchange = 'BERACHAIN'): string {
    return `${exchange}:${tokenA}${tokenB}`;
  }

  /**
   * Gère le redimensionnement de fenêtre pour les composants
   */
  static useResponsiveLayout() {
    const [dimensions, setDimensions] = React.useState({
      isMobile: this.isMobile(),
      isTablet: this.isTablet(),
      chartHeight: this.getChartHeight()
    });

    React.useEffect(() => {
      const handleResize = () => {
        setDimensions({
          isMobile: this.isMobile(),
          isTablet: this.isTablet(),
          chartHeight: this.getChartHeight()
        });
      };

      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }, []);

    return dimensions;
  }
}