import React from 'react';
import stickyVaultIcon from '../../assets/sticky_vault.png';

interface StickyIconProps {
  height?: number;
  width?: number;
  className?: string;
}

export const StickyIcon: React.FC<StickyIconProps> = ({
  height = 16,
  width = 16,
  className = ''
}) => {
  return (
    <img
      src={stickyVaultIcon}
      alt="STICKY"
      width={width}
      height={height}
      className={`StickyIcon ${className}`}
      style={{
        display: 'inline-block',
        verticalAlign: 'middle'
      }}
    />
  );
};

export default StickyIcon;
