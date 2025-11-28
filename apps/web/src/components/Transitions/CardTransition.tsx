import React from 'react';
import { motion } from 'framer-motion';

interface CardTransitionProps {
  children: React.ReactNode;
  index?: number;
  delay?: number;
  className?: string;
  hover?: boolean;
}

const cardVariants = {
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
  hover: {
    y: -4,
    scale: 1.02,
  },
};

export const CardTransition: React.FC<CardTransitionProps> = ({
  children,
  index = 0,
  delay = 0,
  className = '',
  hover = true,
}) => {
  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={hover ? "hover" : undefined}
      transition={{
        delay: delay + (index * 0.1),
        duration: 0.4,
        ease: "easeOut",
      }}
      className={`card-transition ${className}`}
    >
      {children}
    </motion.div>
  );
};
