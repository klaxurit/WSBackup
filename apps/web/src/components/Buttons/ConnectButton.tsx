import { useCallback } from 'react';
import { useWallet } from '../../hooks/useWallet';
import { Button } from '../Button/Button';

interface ConnectButtonProps {
  size?: 'large' | 'small';
  onClick?: () => void;
  dominantColor?: string;
  secondaryColor?: string;
  tokenSelected?: boolean;
  amountEntered?: boolean;
  customClassName?: string;
}

export const ConnectButton: React.FC<ConnectButtonProps> = ({
  size = 'large',
  dominantColor,
  secondaryColor,
  customClassName = '',
}) => {
  const { connect, isConnecting } = useWallet();

  const handleConnect = useCallback(() => {
    // Utiliser Web3Modal pour tous les appareils
    connect();
  }, [connect]);

  return (
    <Button
      size={size}
      variant="shade"
      onClick={handleConnect}
      loading={isConnecting}
      dominantColor={dominantColor}
      secondaryColor={secondaryColor}
      customClassName={customClassName}
    >
      Connect Wallet
    </Button>
  );
};
