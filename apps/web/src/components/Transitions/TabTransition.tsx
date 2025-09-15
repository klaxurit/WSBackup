import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TabTransitionProps {
  children: React.ReactNode;
  activeTab: string;
  className?: string;
}

const tabContentVariants = {
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
  exit: {
    opacity: 0,
    y: -20,
    scale: 0.95,
  },
};

export const TabTransition: React.FC<TabTransitionProps> = ({
  children,
  activeTab,
  className = '',
}) => {
  return (
    <div className={className}>
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          variants={tabContentVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
