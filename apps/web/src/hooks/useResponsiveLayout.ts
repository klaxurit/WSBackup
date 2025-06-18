import { useState, useEffect } from 'react';
import { LayoutUtils } from '../utils/layoutUtils';

interface ResponsiveLayout {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  chartHeight: number;
  containerGap: string;
}

export const useResponsiveLayout = (): ResponsiveLayout => {
  const [layout, setLayout] = useState<ResponsiveLayout>(() => ({
    isMobile: LayoutUtils.isMobile(),
    isTablet: LayoutUtils.isTablet(),
    isDesktop: !LayoutUtils.isMobile() && !LayoutUtils.isTablet(),
    chartHeight: LayoutUtils.getChartHeight(),
    containerGap: LayoutUtils.isMobile() ? '1rem' : LayoutUtils.isTablet() ? '1.5rem' : '2rem'
  }));

  useEffect(() => {
    const handleResize = () => {
      const isMobile = LayoutUtils.isMobile();
      const isTablet = LayoutUtils.isTablet();

      setLayout({
        isMobile,
        isTablet,
        isDesktop: !isMobile && !isTablet,
        chartHeight: LayoutUtils.getChartHeight(),
        containerGap: isMobile ? '1rem' : isTablet ? '1.5rem' : '2rem'
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return layout;
};