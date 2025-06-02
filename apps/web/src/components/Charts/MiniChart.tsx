import React from 'react';

export type MiniChartPoint = { x: number; y: number };

interface MiniChartProps {
  data: MiniChartPoint[];
  width?: number;
  height?: number;
  color?: string;
}

const MiniChart: React.FC<MiniChartProps> = ({
  data,
  width = 80,
  height = 24,
  color = '#16c784',
}) => {
  if (!data.length) return null;

  // Normalisation des points pour le SVG
  const minY = Math.min(...data.map(p => p.y));
  const maxY = Math.max(...data.map(p => p.y));
  const rangeY = maxY - minY || 1;

  const points = data.map((p, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((p.y - minY) / rangeY) * height;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={width} height={height} style={{ display: 'block' }}>
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        points={points}
      />
    </svg>
  );
};

export default MiniChart; 