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
  isLoading?: boolean;
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

const metricIcons: Record<ChartMetric, string> = {
  price: '💰',
  tvl: '🏦',
  volume: '📊',
  fees: '💸',
};

export const ChartToolbar: React.FC<ChartToolbarProps> = ({
  chartType,
  interval,
  metric,
  onChartTypeChange,
  onIntervalChange,
  onMetricChange,
  availableIntervals = ['1H', '4H', '1D', '1W', '1M'],
  isLoading = false,
}) => {
  const [hoveredInterval, setHoveredInterval] = React.useState<ChartInterval | null>(null);
  const [previousInterval, setPreviousInterval] = React.useState<ChartInterval | null>(null);
  const [isFromHover, setIsFromHover] = React.useState(false);

  // États pour le dropdown des métriques
  const [isMetricDropdownOpen, setIsMetricDropdownOpen] = useState(false);
  const metricDropdownRef = useRef<HTMLDivElement>(null);

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

  // Fermer le dropdown des métriques quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (metricDropdownRef.current && !metricDropdownRef.current.contains(event.target as Node)) {
        setIsMetricDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Gérer la sélection de métrique
  const handleMetricSelect = (newMetric: ChartMetric) => {
    onMetricChange(newMetric);
    setIsMetricDropdownOpen(false);
  };

  return (
    <div className="chart-toolbar">
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
                className={`chart-toolbar__button chart-toolbar__chart-type ${isActive ? 'chart-toolbar__button--active' : ''
                  } ${isDisabled ? 'chart-toolbar__button--disabled' : ''}`}
                onClick={() => !isDisabled && onChartTypeChange(type)}
                title={isDisabled ? 'Candlestick only available for Price metric' : chartTypeLabels[type]}
                disabled={isLoading || isDisabled}
              >
                <Icon />
                <span className="chart-toolbar__button-label">
                  {chartTypeLabels[type]}
                </span>
              </button>
            );
          })}
        </div>

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
                className={interval === int ? 'active' : ''}
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

      <div className="chart-toolbar__section chart-toolbar__section--right">
        {/* Dropdown des métriques */}
        <div className="chart-toolbar__metrics-dropdown" ref={metricDropdownRef}>
          <button
            className={`chart-toolbar__metrics-trigger ${isMetricDropdownOpen ? 'chart-toolbar__metrics-trigger--open' : ''} ${isLoading ? 'chart-toolbar__metrics-trigger--disabled' : ''}`}
            onClick={() => !isLoading && setIsMetricDropdownOpen(!isMetricDropdownOpen)}
            disabled={isLoading}
          >
            <span className="chart-toolbar__metrics-trigger-icon">
              {metricIcons[metric]}
            </span>
            <span className="chart-toolbar__metrics-trigger-label">
              {metricLabels[metric]}
            </span>
            <svg
              className={`chart-toolbar__metrics-trigger-arrow ${isMetricDropdownOpen ? 'chart-toolbar__metrics-trigger-arrow--open' : ''}`}
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

          {isMetricDropdownOpen && (
            <div className="chart-toolbar__metrics-menu">
              {(Object.keys(metricLabels) as ChartMetric[]).map((metricOption) => (
                <button
                  key={metricOption}
                  className={`chart-toolbar__metrics-option ${metric === metricOption ? 'chart-toolbar__metrics-option--active' : ''
                    }`}
                  onClick={() => handleMetricSelect(metricOption)}
                >
                  <span className="chart-toolbar__metrics-option-icon">
                    {metricIcons[metricOption]}
                  </span>
                  <span className="chart-toolbar__metrics-option-label">
                    {metricLabels[metricOption]}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChartToolbar;