import React from 'react';
import { motion } from 'framer-motion';

interface GridTransitionProps {
  children: React.ReactNode;
  columns?: number;
  gap?: number;
  staggerDelay?: number;
  className?: string;
}

const gridVariants = {
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

export const GridTransition: React.FC<GridTransitionProps> = ({
  children,
  columns = 3,
  gap = 1,
  staggerDelay = 0.1,
  className = '',
}) => {
  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: `repeat(${columns}, 1fr)`,
    gap: `${gap}rem`,
  };

  return (
    <motion.div
      variants={gridVariants}
      initial="hidden"
      animate="visible"
      className={className}
      style={gridStyle}
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
