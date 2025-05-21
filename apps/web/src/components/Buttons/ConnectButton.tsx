import React from 'react';
import '../../styles/buttons.scss';

interface ConnectButtonProps {
  text?: string;
  size?: 'small' | 'large';
  type?: 'shade' | 'main' | 'accent' | 'disabled';
  onClick: () => void;
  dominantColor?: string;
  secondaryColor?: string;
  isConnected?: boolean;
  tokenSelected?: boolean;
  amountEntered?: boolean;
  customClassName?: string;
}

export const ConnectButton: React.FC<ConnectButtonProps> = ({
  text,
  size = 'large',
  type = 'shade',
  onClick,
  dominantColor,
  secondaryColor,
  isConnected = false,
  tokenSelected = false,
  amountEntered = false,
  customClassName = '',
}) => {
  const getButtonState = () => {
    if (!isConnected) {
      return {
        text: text || 'Connect Wallet',
        type: type,
        disabled: false
      };
    } else if (!tokenSelected) {
      return {
        text: 'Select Meme',
        type: 'disabled',
        disabled: true
      };
    } else if (!amountEntered) {
      return {
        text: 'Enter Amount',
        type: 'disabled',
        disabled: true
      };
    } else {
      return {
        text: 'Swap',
        type: 'main',
        disabled: false
      };
    }
  };

  const { text: buttonText, type: buttonType, disabled } = getButtonState();

  const className = `btn btn--${size} btn__${buttonType} ${customClassName}`.trim();

  const style: React.CSSProperties = {};
  if (dominantColor) style.color = dominantColor;
  if (secondaryColor) style.backgroundColor = secondaryColor;

  return (
    <button
      className={className}
      onClick={onClick}
      disabled={disabled}
      style={style}
    >
      {buttonText}
    </button>
  );
};