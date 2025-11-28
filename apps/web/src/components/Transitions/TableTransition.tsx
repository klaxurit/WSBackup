import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TableTransitionProps {
  children: React.ReactNode;
  isLoading?: boolean;
  empty?: boolean;
  className?: string;
}

const tableVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const rowVariants = {
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

export const TableTransition: React.FC<TableTransitionProps> = ({
  children,
  isLoading = false,
  empty = false,
  className = '',
}) => {
  if (isLoading) {
    return (
      <div className={`table-loading ${className}`}>
        <div className="loading-skeleton">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="skeleton-row" />
          ))}
        </div>
      </div>
    );
  }

  if (empty) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className={`table-empty ${className}`}
      >
        <div className="empty-state">
          <p>Aucune donnée disponible</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={tableVariants}
      initial="hidden"
      animate="visible"
      className={className}
    >
      <AnimatePresence>
        {React.Children.map(children, (child, index) => (
          <motion.div
            key={index}
            variants={rowVariants}
            layout
          >
            {child}
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
};
