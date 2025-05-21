import React from 'react';
import styles from './tooltip.module.scss';

interface TooltipProps {
  content: React.ReactNode;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  className?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  className,
  onMouseEnter,
  onMouseLeave,
}) => (
  <div
    className={`${styles.tooltip} ${className}`}
    onMouseEnter={onMouseEnter}
    onMouseLeave={onMouseLeave}
  >
    {content}
  </div>
);
