import React from 'react';

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
    className={`${'tooltip'} ${className}`}
    onMouseEnter={onMouseEnter}
    onMouseLeave={onMouseLeave}
  >
    {content}
  </div>
);
