import React from 'react';
import { motion } from 'framer-motion';

interface ListTransitionProps {
  children: React.ReactNode;
  staggerDelay?: number;
  className?: string;
}

const listVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: {
    opacity: 0,
    x: -20,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
  },
};

export const ListTransition: React.FC<ListTransitionProps> = ({
  children,
  staggerDelay = 0.05,
  className = '',
}) => {
  return (
    <motion.ul
      variants={listVariants}
      initial="hidden"
      animate="visible"
      className={className}
    >
      {React.Children.map(children, (child, index) => (
        <motion.li
          key={index}
          variants={itemVariants}
          style={{
            animationDelay: `${index * staggerDelay}s`,
          }}
        >
          {child}
        </motion.li>
      ))}
    </motion.ul>
  );
};
