import { useCallback } from 'react';
import { useWallet } from '../../hooks/useWallet';

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
  const { connect } = useWallet();

  const handleConnect = useCallback(async () => {
    try {
      await connect('injected');
    } catch (err) {
      console.error('Connection error:', err);
    }
  }, [connect]);

  const className = `btn btn--${size} btn__shade ${customClassName}`.trim();

  const style: React.CSSProperties = {};
  if (dominantColor) style.color = dominantColor;
  if (secondaryColor) style.backgroundColor = secondaryColor;

  return (
    <button
      className={className}
      onClick={handleConnect}
      disabled={false}
      style={style}
    >
      Connect Wallet
    </button>
  );
};
