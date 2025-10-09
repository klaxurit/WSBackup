import React from 'react';
import autoWinVaultIcon from '../../assets/auto-win-vault.png';

interface AutoWinIconProps {
  width?: number;
  height?: number;
  className?: string;
}

export const AutoWinIcon: React.FC<AutoWinIconProps> = ({
  width = 24,
  height = 24,
  className = ''
}) => {
  return (
    <img
      src={autoWinVaultIcon}
      alt="AutoWin Vault"
      width={width}
      height={height}
      className={`AutoWinIcon ${className}`}
    />
  );
};
