export const LAYOUT_CONFIG = {
  // Proportions du layout desktop
  CHART_WIDTH_PERCENTAGE: 70,
  SWAP_FORM_WIDTH_PERCENTAGE: 30,

  // Breakpoints
  MOBILE_BREAKPOINT: 768,
  TABLET_BREAKPOINT: 1024,

  // Hauteurs
  BANNER_HEIGHT: {
    DESKTOP: 200,
    MOBILE: 150
  },

  CHART_HEIGHT: {
    DESKTOP: 500,
    TABLET: 400,
    MOBILE: 350
  },

  // Gaps et espacements
  CONTAINER_GAP: {
    DESKTOP: '2rem',
    TABLET: '1.5rem',
    MOBILE: '1rem'
  },

  // Images de bannière par défaut
  DEFAULT_BANNER_IMAGES: [
    '/images/banner-1.jpg',
    '/images/banner-2.jpg',
    '/images/banner-3.jpg'
  ],

  // Configuration TradingView
  TRADINGVIEW_CONFIG: {
    DEFAULT_SYMBOL: 'BERACHAIN:BERAHONEY',
    DEFAULT_INTERVAL: '1H',
    THEME: 'dark' as const,
    TIMEZONE: 'Etc/UTC',
    LOCALE: 'en'
  }
} as const;
