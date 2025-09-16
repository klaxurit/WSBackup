import React from 'react';
import { useAccount, useDisconnect } from 'wagmi';
import { appKit } from '../../config/wagmi';

interface AppKitConnectButtonProps {
  size?: 'small' | 'medium' | 'large';
  dominantColor?: string;
  secondaryColor?: string;
  customClassName?: string;
  onClick?: () => void;
}

export const AppKitConnectButton: React.FC<AppKitConnectButtonProps> = ({
  size = 'large',
  dominantColor,
  secondaryColor,
  customClassName = '',
  onClick,
}) => {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  const handleConnect = () => {
    appKit.open();
    if (onClick) onClick();
  };

  const handleDisconnect = () => {
    disconnect();
    if (onClick) onClick();
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const className = `btn btn--${size} btn__shade ${customClassName}`.trim();

  if (isConnected && address) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button
          className={`${className} btn--connected`}
          style={{
            backgroundColor: dominantColor || '#00BB7F',
            color: secondaryColor || '#FFFFFF',
            border: 'none',
            borderRadius: '8px',
            padding: size === 'large' ? '12px 24px' : size === 'medium' ? '10px 20px' : '8px 16px',
            fontSize: size === 'large' ? '16px' : size === 'medium' ? '14px' : '12px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          onClick={handleDisconnect}
        >
          {formatAddress(address)}
        </button>
      </div>
    );
  }

  return (
    <button
      className={className}
      style={{
        backgroundColor: dominantColor || '#00BB7F',
        color: secondaryColor || '#FFFFFF',
        border: 'none',
        borderRadius: '8px',
        padding: size === 'large' ? '12px 24px' : size === 'medium' ? '10px 20px' : '8px 16px',
        fontSize: size === 'large' ? '16px' : size === 'medium' ? '14px' : '12px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      }}
      onClick={handleConnect}
    >
      Connect Wallet
    </button>
  );
};