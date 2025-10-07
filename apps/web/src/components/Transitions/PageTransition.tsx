import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { Loader } from '../Loader/Loader';

interface PageTransitionProps {
  children: React.ReactNode;
  isLoading?: boolean;
  loadingText?: string;
}

// Transition variants for different page types
const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
    scale: 1,
  },
  in: {
    opacity: 1,
    y: 0,
    scale: 1,
  },
  out: {
    opacity: 0,
    y: -20,
    scale: 1,
  },
};

// Variants for loading transitions
const loadingVariants = {
  initial: {
    opacity: 0,
    scale: 1,
  },
  in: {
    opacity: 1,
    scale: 1,
  },
  out: {
    opacity: 0,
    scale: 1,
  },
};

// Transition configuration by page type
const getTransitionConfig = (pathname: string) => {
  // Faster transitions for main pages
  if (pathname === '/' || pathname.startsWith('/explore') || pathname.startsWith('/vaults')) {
    return {
      type: 'tween' as const,
      duration: 0.25,
    };
  }

  // Smoother transitions for detail pages
  if (pathname.includes('/pool') || pathname.includes('/token') || pathname.includes('/vault/')) {
    return {
      type: 'spring' as const,
      stiffness: 300,
      damping: 30,
    };
  }

  // Default transition
  return {
    type: 'tween' as const,
    duration: 0.3,
  };
};

export const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  isLoading = false,
  loadingText = 'Chargement...',
}) => {
  const location = useLocation();
  const transitionConfig = getTransitionConfig(location.pathname);

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants}
        transition={{
          ...transitionConfig,
          // Add delay for entry animation
          delay: 0,
        }}
        style={{
          width: '100%',
          minHeight: '100%',
        }}
      >
        {isLoading ? (
          <motion.div
            className="page-loading-container"
            variants={loadingVariants}
            initial="initial"
            animate="in"
            exit="out"
            transition={{ duration: 0.2 }}
          >
            <div className="loading-content">
              <Loader size="desktop" />
              <p className="loading-text">{loadingText}</p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
          >
            {children}
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};
