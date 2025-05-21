import { useCallback } from 'react';
import { useAppSelector } from '../../store/hooks';
import { useWallet } from '../../hooks/useWallet';
import '../../styles/buttons.scss';

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
  onClick,
  dominantColor,
  secondaryColor,
  tokenSelected = false,
  amountEntered = false,
  customClassName = '',
}) => {
  const { isConnected } = useAppSelector((state) => state.wallet);
  const { connect } = useWallet();

  const handleConnect = useCallback(async () => {
    try {
      await connect('injected');
      if (onClick) onClick();
    } catch (err) {
      console.error('Erreur de connexion:', err);
    }
  }, [connect, onClick]);

  const getButtonState = () => {
    if (!isConnected) {
      return {
        text: 'Connect Wallet',
        type: 'shade',
        disabled: false,
        onClick: handleConnect
      };
    } else if (!tokenSelected) {
      return {
        text: 'Select token',
        type: 'disabled',
        disabled: true,
        onClick: undefined
      };
    } else if (!amountEntered) {
      return {
        text: 'Enter Amount',
        type: 'disabled',
        disabled: true,
        onClick: undefined
      };
    } else {
      return {
        text: 'Swap',
        type: 'main',
        disabled: false,
        onClick: onClick
      };
    }
  };

  const { text: buttonText, type: buttonType, disabled, onClick: buttonClick } = getButtonState();

  const className = `btn btn--${size} btn__${buttonType} ${customClassName}`.trim();

  const style: React.CSSProperties = {};
  if (dominantColor) style.color = dominantColor;
  if (secondaryColor) style.backgroundColor = secondaryColor;

  return (
    <button
      className={className}
      onClick={buttonClick}
      disabled={disabled}
      style={style}
    >
      {buttonText}
    </button>
  );
};