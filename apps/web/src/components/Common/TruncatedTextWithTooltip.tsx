import React, { useState } from 'react';

interface TruncatedTextWithTooltipProps {
  text: string;
  maxLength?: number;
  className?: string;
}

export const TruncatedTextWithTooltip: React.FC<TruncatedTextWithTooltipProps> = ({
  text,
  maxLength = 12,
  className = '',
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const shouldTruncate = text.length > maxLength;
  const truncatedText = shouldTruncate ? `${text.slice(0, maxLength)}...` : text;

  if (!shouldTruncate) {
    return <span className={className}>{text}</span>;
  }

  return (
    <span
      className={`TruncatedTextWithTooltip ${className}`}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      style={{ cursor: 'help' }}
    >
      {truncatedText}
      {isVisible && (
        <div className="TruncatedTextWithTooltip__Content">
          {text}
        </div>
      )}
    </span>
  );
};

