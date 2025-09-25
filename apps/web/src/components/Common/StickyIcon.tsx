import React from 'react';
import stickyVaultIcon from '../../assets/sticky_vault.png';

interface StickyIconProps {
  size?: number;
  className?: string;
}

export const StickyIcon: React.FC<StickyIconProps> = ({
  size = 16,
  className = ''
}) => {
  return (
    <img
      src={stickyVaultIcon}
      alt="STICKY"
      width={size}
      height={size}
      className={`StickyIcon ${className}`}
      style={{
        display: 'inline-block',
        verticalAlign: 'middle',
        marginRight: '4px'
      }}
    />
  );
};

export default StickyIcon;
