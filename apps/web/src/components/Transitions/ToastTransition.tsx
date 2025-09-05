import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ToastTransitionProps {
  children: React.ReactNode;
  isVisible: boolean;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
  className?: string;
}

const positionClasses = {
  'top-right': 'toast-top-right',
  'top-left': 'toast-top-left',
  'bottom-right': 'toast-bottom-right',
  'bottom-left': 'toast-bottom-left',
  'top-center': 'toast-top-center',
  'bottom-center': 'toast-bottom-center',
};

const toastVariants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
    y: -50,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    y: -50,
  },
};

export const ToastTransition: React.FC<ToastTransitionProps> = ({
  children,
  isVisible,
  position = 'top-right',
  className = '',
}) => {
  const positionClass = positionClasses[position];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={`toast-container ${positionClass} ${className}`}
          variants={toastVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
