import React from 'react';
import { motion } from 'framer-motion';

interface StaggerTransitionProps {
  children: React.ReactNode;
  staggerDelay?: number;
  className?: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
  },
};

export const StaggerTransition: React.FC<StaggerTransitionProps> = ({
  children,
  staggerDelay = 0.1,
  className = '',
}) => {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={className}
      style={{
        '--stagger-delay': `${staggerDelay}s`,
      } as React.CSSProperties}
    >
      {React.Children.map(children, (child, index) => (
        <motion.div
          key={index}
          variants={itemVariants}
          style={{
            animationDelay: `${index * staggerDelay}s`,
          }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
};
