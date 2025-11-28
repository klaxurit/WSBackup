import React from 'react';
import { motion } from 'framer-motion';

interface NavigationTransitionProps {
  children: React.ReactNode;
  className?: string;
}

const navigationVariants = {
  hidden: {
    opacity: 0,
    y: -20,
  },
  visible: {
    opacity: 1,
    y: 0,
  },
};

export const NavigationTransition: React.FC<NavigationTransitionProps> = ({
  children,
  className = '',
}) => {
  return (
    <motion.nav
      variants={navigationVariants}
      initial="hidden"
      animate="visible"
      className={className}
    >
      {children}
    </motion.nav>
  );
};
