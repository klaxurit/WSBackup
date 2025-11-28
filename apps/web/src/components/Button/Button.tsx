import React from 'react';
import { Loader } from '../Loader/Loader';

export type ButtonSize = 'tiny' | 'small' | 'large';
export type ButtonVariant = 'main' | 'accent' | 'shade' | 'disabled';

interface ButtonProps {
  children: React.ReactNode;
  size?: ButtonSize;
  variant?: ButtonVariant;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  dominantColor?: string;
  secondaryColor?: string;
  customClassName?: string;
  style?: React.CSSProperties;
  'aria-label'?: string;
  title?: string;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  size = 'large',
  variant = 'main',
  onClick,
  disabled = false,
  loading = false,
  type = 'button',
  className = '',
  dominantColor,
  secondaryColor,
  customClassName = '',
  style: userStyle,
  'aria-label': ariaLabel,
  title,
}) => {
  const isDisabled = disabled || loading;

  const buttonClassName = `btn btn--${size} btn__${variant} ${customClassName} ${className}`.trim();

  const style: React.CSSProperties = { ...userStyle };
  if (dominantColor) style.color = dominantColor;
  if (secondaryColor) style.backgroundColor = secondaryColor;

  const getLoaderClassName = (): string => {
    switch (variant) {
      case 'main':
        return 'btn__main-loader';
      case 'accent':
        return 'btn__accent-loader';
      case 'shade':
        return 'btn__shade-loader';
      case 'disabled':
        return 'btn__disabled-loader';
      default:
        return '';
    }
  };

  return (
    <button
      type={type}
      className={buttonClassName}
      onClick={onClick}
      disabled={isDisabled}
      style={style}
      aria-label={ariaLabel}
      title={title}
    >
      {loading ? <Loader size="small" className={getLoaderClassName()} /> : children}
    </button>
  );
};

export default Button;
