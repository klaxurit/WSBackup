import React from 'react';
import { motion } from 'framer-motion';

interface ChartTransitionProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

const chartVariants = {
  hidden: {
    opacity: 0,
    scale: 0.9,
    y: 20,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
  },
};

export const ChartTransition: React.FC<ChartTransitionProps> = ({
  children,
  delay = 0,
  className = '',
}) => {
  return (
    <motion.div
      variants={chartVariants}
      initial="hidden"
      animate="visible"
      transition={{
        delay,
        duration: 0.6,
        ease: 'easeOut',
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};