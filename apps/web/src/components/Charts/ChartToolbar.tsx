import React, { useState, useRef, useEffect } from 'react';
import type { ChartType, ChartInterval, ChartMetric } from '../../types/chart';
import lilBear from '../../assets/lil_bear.png';

interface ChartToolbarProps {
  chartType: ChartType;
  interval: ChartInterval;
  metric: ChartMetric;
  onChartTypeChange: (type: ChartType) => void;
  onIntervalChange: (interval: ChartInterval) => void;
  onMetricChange: (metric: ChartMetric) => void;
  availableIntervals?: ChartInterval[];
  availableMetrics?: ChartMetric[];
  isLoading?: boolean;
  hideMetricsDropdown?: boolean;
}



// Icônes SVG pour les types de charts
const AreaChartIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
    <path d="M0 16V4l4-2 4 3 4-1 4-2v14H0z" opacity="0.6" />
    <path d="M0 4l4-2 4 3 4-1 4-2" stroke="currentColor" strokeWidth="2" fill="none" />
  </svg>
);

const LineChartIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor">
    <path d="M0 12l4-6 4 2 4-4 4-2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CandlestickIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
    <rect x="2" y="4" width="2" height="8" />
    <rect x="7" y="2" width="2" height="12" />
    <rect x="12" y="6" width="2" height="6" />
    <line x1="3" y1="2" x2="3" y2="4" stroke="currentColor" strokeWidth="1" />
    <line x1="3" y1="12" x2="3" y2="14" stroke="currentColor" strokeWidth="1" />
    <line x1="8" y1="1" x2="8" y2="2" stroke="currentColor" strokeWidth="1" />
    <line x1="8" y1="14" x2="8" y2="15" stroke="currentColor" strokeWidth="1" />
    <line x1="13" y1="4" x2="13" y2="6" stroke="currentColor" strokeWidth="1" />
    <line x1="13" y1="12" x2="13" y2="14" stroke="currentColor" strokeWidth="1" />
  </svg>
);

const chartTypeIcons: Record<ChartType, React.ComponentType> = {
  area: AreaChartIcon,
  line: LineChartIcon,
  candlestick: CandlestickIcon,
};

const chartTypeLabels: Record<ChartType, string> = {
  area: 'Area',
  line: 'Line',
  candlestick: 'Candles',
};

// Configuration des métriques
const metricLabels: Record<ChartMetric, string> = {
  price: 'Price',
  tvl: 'TVL',
  volume: 'Volume',
  fees: 'Fees',
};

export const ChartToolbar: React.FC<ChartToolbarProps> = ({
  chartType,
  interval,
  metric,
  onChartTypeChange,
  onIntervalChange,
  onMetricChange,
  availableIntervals = ['1H', '4H', '1D', '1W', '1M'],
  availableMetrics,
  isLoading = false,
  hideMetricsDropdown = false,
}) => {
  const [hoveredInterval, setHoveredInterval] = React.useState<ChartInterval | null>(null);
  const [previousInterval, setPreviousInterval] = React.useState<ChartInterval | null>(null);
  const [isFromHover, setIsFromHover] = React.useState(false);

  // États pour les dropdowns desktop
  const [isDesktopMetricDropdownOpen, setIsDesktopMetricDropdownOpen] = useState(false);

  // États pour les dropdowns mobile
  const [isChartTypeDropdownOpen, setIsChartTypeDropdownOpen] = useState(false);
  const [isIntervalDropdownOpen, setIsIntervalDropdownOpen] = useState(false);
  const [isMobileMetricDropdownOpen, setIsMobileMetricDropdownOpen] = useState(false);
  const chartTypeDropdownRef = useRef<HTMLDivElement>(null);
  const intervalDropdownRef = useRef<HTMLDivElement>(null);
  const metricDropdownRef = useRef<HTMLDivElement>(null);
  const metricMobileDropdownRef = useRef<HTMLDivElement>(null);

  // Gérer le changement d'intervalle
  const handleIntervalChange = (newInterval: ChartInterval) => {
    if (newInterval !== interval) {
      setPreviousInterval(interval);
      // Vérifier si l'ourson vient du hover
      setIsFromHover(hoveredInterval === newInterval);
      onIntervalChange(newInterval);
      // Réinitialiser le hover
      setHoveredInterval(null);
    }
  };

  // Gérer le hover
  const handleMouseEnter = (int: ChartInterval) => {
    if (int !== interval && !isLoading) {
      setHoveredInterval(int);
    }
  };

  const handleMouseLeave = () => {
    setHoveredInterval(null);
  };

  // Réinitialiser isFromHover après l'animation
  React.useEffect(() => {
    if (isFromHover) {
      const timer = setTimeout(() => setIsFromHover(false), 200);
      return () => clearTimeout(timer);
    }
  }, [isFromHover]);

  // Fermer les dropdowns quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (chartTypeDropdownRef.current && !chartTypeDropdownRef.current.contains(event.target as Node)) {
        setIsChartTypeDropdownOpen(false);
      }
      if (metricDropdownRef.current && !metricDropdownRef.current.contains(event.target as Node)) {
        setIsDesktopMetricDropdownOpen(false);
      }
      if (metricMobileDropdownRef.current && !metricMobileDropdownRef.current.contains(event.target as Node)) {
        setIsMobileMetricDropdownOpen(false);
      }
      if (intervalDropdownRef.current && !intervalDropdownRef.current.contains(event.target as Node)) {
        setIsIntervalDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Gérer la sélection de métrique
  const handleMetricSelect = (newMetric: ChartMetric) => {
    onMetricChange(newMetric);
    setIsDesktopMetricDropdownOpen(false);
    setIsMobileMetricDropdownOpen(false);
  };

  // Gérer la sélection de type de chart
  const handleChartTypeSelect = (newChartType: ChartType) => {
    onChartTypeChange(newChartType);
    setIsChartTypeDropdownOpen(false);
  };

  // Gérer la sélection d'intervalle
  const handleIntervalSelect = (newInterval: ChartInterval) => {
    handleIntervalChange(newInterval);
    setIsIntervalDropdownOpen(false);
  };

  return (
    <div className="chart-toolbar">
      {/* Version Desktop */}
      <div className="chart-toolbar__desktop">
        <div className="chart-toolbar__section chart-toolbar__section--left">
          {/* Types de charts */}
          <div className="chart-toolbar__chart-types">
            {(['area', 'line', 'candlestick'] as ChartType[]).map((type) => {
              const Icon = chartTypeIcons[type];
              const isActive = chartType === type;
              const isDisabled = type === 'candlestick' && metric !== 'price';

              return (
                <button
                  key={type}
                  className={`btn btn--tiny ${isActive ? 'btn__main' : 'btn__shade'} ${isDisabled ? 'btn__disabled' : ''}`}
                  onClick={() => !isDisabled && onChartTypeChange(type)}
                  title={isDisabled ? 'Candlestick only available for Price metric' : chartTypeLabels[type]}
                  disabled={isLoading || isDisabled}
                >
                  <Icon />
                </button>
              );
            })}
          </div>

          {/* Séparateur - seulement si le dropdown des métriques est visible */}
          {!hideMetricsDropdown && <div className="chart-toolbar__separator" />}

          {/* Dropdown des métriques */}
          {!hideMetricsDropdown && (
            <div className="chart-toolbar__metrics-dropdown" ref={metricDropdownRef}>
              <button
                className={`btn btn--tiny btn__accent ${isDesktopMetricDropdownOpen ? 'btn__main' : ''} ${isLoading ? 'btn__disabled' : ''}`}
                onClick={() => !isLoading && setIsDesktopMetricDropdownOpen(!isDesktopMetricDropdownOpen)}
                disabled={isLoading}
              >
                <span className="chart-toolbar__metrics-trigger-label">
                  {metricLabels[metric]}
                </span>
                <svg
                  className={`chart-toolbar__metrics-trigger-arrow ${isDesktopMetricDropdownOpen ? 'chart-toolbar__metrics-trigger-arrow--open' : ''}`}
                  width="8"
                  height="8"
                  viewBox="0 0 12 8"
                  fill="none"
                >
                  <path
                    d="M1 1.5L6 6.5L11 1.5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>

              {isDesktopMetricDropdownOpen && (
                <>
                  <div
                    className="chart-toolbar__mobile-overlay"
                    onClick={() => setIsDesktopMetricDropdownOpen(false)}
                  />
                  <div className="chart-toolbar__metrics-menu">
                    {(availableMetrics || (Object.keys(metricLabels) as ChartMetric[])).map((metricOption) => {
                      const isActive = metric === metricOption;
                      const isDisabled = metricOption !== 'price' && chartType === 'candlestick';

                      return (
                        <button
                          key={metricOption}
                          className={`btn btn--tiny ${isActive ? 'btn__main' : 'btn__shade'} ${isDisabled ? 'btn__disabled' : ''}`}
                          onClick={() => !isDisabled && handleMetricSelect(metricOption)}
                          disabled={isDisabled}
                          title={isDisabled ? 'Candlestick only available for Price metric' : metricLabels[metricOption]}
                        >
                          <span className="chart-toolbar__metrics-option-label">
                            {metricLabels[metricOption]}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Séparateur */}
          <div className="chart-toolbar__separator" />

          {/* Intervalles avec design original */}
          <div className="chart-toolbar__intervals-original">
            {availableIntervals.map((int) => (
              <div key={int}>
                {/* Ourson actif */}
                {interval === int && (
                  <img
                    src={lilBear}
                    alt="Active"
                    className={`bear bear--active ${isFromHover ? 'from-hover' : ''}`}
                  />
                )}

                {/* Ourson au hover (derrière le bouton) */}
                {hoveredInterval === int && interval !== int && (
                  <img
                    src={lilBear}
                    alt="Hover"
                    className="bear bear--hover"
                  />
                )}

                {/* Ourson qui disparaît (ancien intervalle) */}
                {previousInterval === int && interval !== int && (
                  <img
                    src={lilBear}
                    alt="Disappearing"
                    className="bear bear--disappearing"
                  />
                )}

                <button
                  className={`btn btn--tiny ${interval === int ? 'btn__main btn__tab-active' : 'btn__shade'} ${isLoading ? 'btn__disabled' : ''}`}
                  onClick={() => handleIntervalChange(int)}
                  onMouseEnter={() => handleMouseEnter(int)}
                  onMouseLeave={handleMouseLeave}
                  disabled={isLoading}
                >
                  {int}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Version Mobile */}
      <div className="chart-toolbar__mobile">
        <div className="chart-toolbar__mobile-row">
          {/* Dropdown Type de Chart */}
          <div className="chart-toolbar__mobile-dropdown" ref={chartTypeDropdownRef}>
            <button
              className={`btn btn--small btn__accent ${isChartTypeDropdownOpen ? 'btn__main' : ''} ${isLoading ? 'btn__disabled' : ''}`}
              onClick={() => !isLoading && setIsChartTypeDropdownOpen(!isChartTypeDropdownOpen)}
              disabled={isLoading}
            >
              <span className="chart-toolbar__mobile-trigger-icon">
                {React.createElement(chartTypeIcons[chartType])}
              </span>
              <svg
                className={`chart-toolbar__mobile-trigger-arrow ${isChartTypeDropdownOpen ? 'chart-toolbar__mobile-trigger-arrow--open' : ''}`}
                width="12"
                height="8"
                viewBox="0 0 12 8"
                fill="none"
              >
                <path
                  d="M1 1.5L6 6.5L11 1.5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            {isChartTypeDropdownOpen && (
              <>
                <div
                  className="chart-toolbar__mobile-overlay"
                  onClick={() => setIsChartTypeDropdownOpen(false)}
                />
                <div className={`chart-toolbar__mobile-menu chart-toolbar__mobile-menu--open`}>
                  {(['area', 'line', 'candlestick'] as ChartType[]).map((type) => {
                    const Icon = chartTypeIcons[type];
                    const isActive = chartType === type;
                    const isDisabled = type === 'candlestick' && metric !== 'price';

                    return (
                      <button
                        key={type}
                        className={`btn btn--small ${isActive ? 'btn__main' : 'btn__shade'} ${isDisabled ? 'btn__disabled' : ''}`}
                        onClick={() => !isDisabled && handleChartTypeSelect(type)}
                        disabled={isDisabled}
                      >
                        <span className="chart-toolbar__mobile-option-icon">
                          <Icon />
                        </span>
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* Dropdown Métriques */}
          <div className="chart-toolbar__mobile-dropdown" ref={metricMobileDropdownRef}>
            <button
              className={`btn btn--small btn__accent ${isMobileMetricDropdownOpen ? 'btn__main' : ''} ${isLoading ? 'btn__disabled' : ''}`}
              onClick={() => !isLoading && setIsMobileMetricDropdownOpen(!isMobileMetricDropdownOpen)}
              disabled={isLoading}
            >
              <span className="chart-toolbar__mobile-trigger-label">
                {metricLabels[metric]}
              </span>
              <svg
                className={`chart-toolbar__mobile-trigger-arrow ${isMobileMetricDropdownOpen ? 'chart-toolbar__mobile-trigger-arrow--open' : ''}`}
                width="12"
                height="8"
                viewBox="0 0 12 8"
                fill="none"
              >
                <path
                  d="M1 1.5L6 6.5L11 1.5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            {isMobileMetricDropdownOpen && (
              <>
                <div
                  className="chart-toolbar__mobile-overlay"
                  onClick={() => setIsMobileMetricDropdownOpen(false)}
                />
                <div className={`chart-toolbar__mobile-menu chart-toolbar__mobile-menu--open`}>
                  {(availableMetrics || (Object.keys(metricLabels) as ChartMetric[])).map((metricOption) => {
                    const isActive = metric === metricOption;
                    const isDisabled = metricOption !== 'price' && chartType === 'candlestick';

                    return (
                      <button
                        key={metricOption}
                        className={`btn btn--small ${isActive ? 'btn__main' : 'btn__shade'} ${isDisabled ? 'btn__disabled' : ''}`}
                        onClick={() => !isDisabled && handleMetricSelect(metricOption)}
                        disabled={isDisabled}
                      >
                        <span className="chart-toolbar__mobile-option-label">
                          {metricLabels[metricOption]}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* Dropdown Intervalle */}
          <div className="chart-toolbar__mobile-dropdown" ref={intervalDropdownRef}>
            <button
              className={`btn btn--small btn__accent ${isIntervalDropdownOpen ? 'btn__main' : ''} ${isLoading ? 'btn__disabled' : ''}`}
              onClick={() => !isLoading && setIsIntervalDropdownOpen(!isIntervalDropdownOpen)}
              disabled={isLoading}
            >
              <span className="chart-toolbar__mobile-trigger-label">
                {interval}
              </span>
              <svg
                className={`chart-toolbar__mobile-trigger-arrow ${isIntervalDropdownOpen ? 'chart-toolbar__mobile-trigger-arrow--open' : ''}`}
                width="12"
                height="8"
                viewBox="0 0 12 8"
                fill="none"
              >
                <path
                  d="M1 1.5L6 6.5L11 1.5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            {isIntervalDropdownOpen && (
              <>
                <div
                  className="chart-toolbar__mobile-overlay"
                  onClick={() => setIsIntervalDropdownOpen(false)}
                />
                <div className={`chart-toolbar__mobile-menu chart-toolbar__mobile-menu--open`}>
                  {availableIntervals.map((int) => (
                    <button
                      key={int}
                      className={`btn btn--small ${interval === int ? 'btn__main' : 'btn__shade'}`}
                      onClick={() => handleIntervalSelect(int)}
                    >
                      <span className="chart-toolbar__mobile-option-label">
                        {int}
                      </span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

    </div>
  );
};

export default ChartToolbar;