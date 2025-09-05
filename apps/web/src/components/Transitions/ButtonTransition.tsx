import React from 'react';
import { motion } from 'framer-motion';

interface ButtonTransitionProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

const buttonVariants = {
  rest: { scale: 1 },
  hover: {
    scale: 1.05,
    transition: { duration: 0.2 }
  },
  tap: {
    scale: 0.95,
    transition: { duration: 0.1 }
  },
};

export const ButtonTransition: React.FC<ButtonTransitionProps> = ({
  children,
  onClick,
  disabled = false,
  variant = 'primary',
  size = 'medium',
  className = '',
  type = 'button',
}) => {
  const baseClasses = 'button-transition';
  const variantClasses = {
    primary: 'button-primary',
    secondary: 'button-secondary',
    ghost: 'button-ghost',
  };
  const sizeClasses = {
    small: 'button-small',
    medium: 'button-medium',
    large: 'button-large',
  };

  const combinedClassName = [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    disabled ? 'button-disabled' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <motion.button
      type={type}
      className={combinedClassName}
      onClick={onClick}
      disabled={disabled}
      variants={buttonVariants}
      initial="rest"
      whileHover={disabled ? "rest" : "hover"}
      whileTap={disabled ? "rest" : "tap"}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.button>
  );
};
