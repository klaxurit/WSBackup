import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface PageContentTransitionProps {
  children: React.ReactNode;
  className?: string;
}

export const PageContentTransition: React.FC<PageContentTransitionProps> = ({
  children,
  className = '',
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Small delay to ensure page animation is complete
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{
        opacity: isVisible ? 1 : 0,
        y: isVisible ? 0 : 10
      }}
      transition={{
        duration: 0.4,
        ease: 'easeOut',
        opacity: { duration: 0.3 },
        y: { duration: 0.4 }
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};
