import React from 'react';
import { motion } from 'framer-motion';

interface ContentTransitionProps {
  children: React.ReactNode;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  className?: string;
}

const directionVariants = {
  up: { initial: { y: 20, opacity: 0 }, animate: { y: 0, opacity: 1 } },
  down: { initial: { y: -20, opacity: 0 }, animate: { y: 0, opacity: 1 } },
  left: { initial: { x: 20, opacity: 0 }, animate: { x: 0, opacity: 1 } },
  right: { initial: { x: -20, opacity: 0 }, animate: { x: 0, opacity: 1 } },
};

export const ContentTransition: React.FC<ContentTransitionProps> = ({
  children,
  delay = 0,
  direction = 'up',
  className = '',
}) => {
  const variants = directionVariants[direction];

  return (
    <motion.div
      initial={variants.initial}
      animate={variants.animate}
      transition={{
        duration: 0.4,
        delay,
        ease: 'easeOut',
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};
