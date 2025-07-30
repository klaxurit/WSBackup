import React from 'react';
import type { ChartType, ChartInterval } from '../../types/chart';
import lilBear from '../../assets/lil_bear.png';

interface ChartToolbarProps {
  chartType: ChartType;
  interval: ChartInterval;
  onChartTypeChange: (type: ChartType) => void;
  onIntervalChange: (interval: ChartInterval) => void;
  availableIntervals?: ChartInterval[];
  isLoading?: boolean;
}

const BERYL_PURE = '#E39229';

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

export const ChartToolbar: React.FC<ChartToolbarProps> = ({
  chartType,
  interval,
  onChartTypeChange,
  onIntervalChange,
  availableIntervals = ['1H', '1D', '1W', '1M', '1Y', 'MAX'],
  isLoading = false,
}) => {
  return (
    <div className="chart-toolbar">
      <div className="chart-toolbar__section chart-toolbar__section--left">
        {/* Types de charts */}
        <div className="chart-toolbar__chart-types">
          {(['area', 'line', 'candlestick'] as ChartType[]).map((type) => {
            const Icon = chartTypeIcons[type];
            const isActive = chartType === type;

            return (
              <button
                key={type}
                className={`chart-toolbar__button chart-toolbar__chart-type ${isActive ? 'chart-toolbar__button--active' : ''
                  }`}
                onClick={() => onChartTypeChange(type)}
                title={chartTypeLabels[type]}
                disabled={isLoading}
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
            <div key={int} style={{ position: 'relative' }}>
              {interval === int && (
                <img
                  src={lilBear}
                  alt="Selected"
                  style={{
                    position: 'absolute',
                    top: '-23px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '45px',
                    zIndex: 10,
                    pointerEvents: 'none',
                  }}
                />
              )}
              <button
                onClick={() => onIntervalChange(int)}
                disabled={isLoading}
                style={{
                  padding: '10px 16px',
                  fontSize: '14px',
                  fontWeight: '600',
                  borderRadius: '20px',
                  border: interval === int
                    ? `1px solid ${BERYL_PURE}`
                    : '1px solid #4B5563',
                  background: interval === int
                    ? `${BERYL_PURE}1A` // 10% d'opacité
                    : 'transparent',
                  color: interval === int ? '#fff' : '#D1D5DB',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease-in-out',
                  boxShadow: interval === int
                    ? `0 4px 12px ${BERYL_PURE}33` // 20% d'opacité pour l'ombre
                    : 'none',
                  opacity: isLoading ? 0.5 : 1,
                }}
                onMouseEnter={(e) => {
                  if (interval !== int && !isLoading) {
                    e.currentTarget.style.borderColor = '#6B7280';
                    e.currentTarget.style.background = 'rgba(75, 85, 99, 0.3)';
                    e.currentTarget.style.color = '#fff';
                  }
                }}
                onMouseLeave={(e) => {
                  if (interval !== int && !isLoading) {
                    e.currentTarget.style.borderColor = '#4B5563';
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = '#D1D5DB';
                  }
                }}
              >
                {int}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Indicateur de chargement */}
      {isLoading && (
        <div className="chart-toolbar__loading">
          <div className="chart-toolbar__spinner" />
        </div>
      )}
    </div>
  );
};

export default ChartToolbar;