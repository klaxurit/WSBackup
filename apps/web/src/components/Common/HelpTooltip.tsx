import React, { useState } from 'react';

interface HelpTooltipProps {
  text: string;
  className?: string;
  size?: 'small' | 'medium' | 'large';
}

export const HelpTooltip: React.FC<HelpTooltipProps> = ({ text, className, size = 'medium' }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div
      className={`HelpTooltip ${className || ''}`}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      <svg
        width={size === 'small' ? '14' : size === 'medium' ? '16' : '20'}
        height={size === 'small' ? '14' : size === 'medium' ? '16' : '20'}
        viewBox="0 0 16 16"
        fill="none"
        className="HelpTooltip__Icon"
      >
        <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" opacity="0.5"/>
        <path
          d="M6.5 6C6.5 5.17157 7.17157 4.5 8 4.5C8.82843 4.5 9.5 5.17157 9.5 6C9.5 6.82843 8.82843 7.5 8 7.5V8.5M8 11.5H8.01"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.7"
        />
      </svg>
      {isVisible && (
        <div className="HelpTooltip__Content">
          {text}
        </div>
      )}
    </div>
  );
};