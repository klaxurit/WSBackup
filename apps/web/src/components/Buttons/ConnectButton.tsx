import { useCallback } from 'react';
import { useWallet } from '../../hooks/useWallet';
import { Loader } from '../Loader/Loader';

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

  const className = `btn btn--${size} btn__shade ${customClassName}`.trim();

  const style: React.CSSProperties = {};
  if (dominantColor) style.color = dominantColor;
  if (secondaryColor) style.backgroundColor = secondaryColor;

  return (
    <button
      className={className}
      onClick={handleConnect}
      disabled={isConnecting}
      style={style}
    >
      {isConnecting ? <Loader size="mini" /> : 'Connect Wallet'}
    </button>
  );
};
