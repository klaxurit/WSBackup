import React from 'react';
import { motion } from 'framer-motion';

interface BannerTransitionProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

const bannerVariants = {
  hidden: {
    opacity: 0,
    y: -20,
    scale: 0.98,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
  },
};

export const BannerTransition: React.FC<BannerTransitionProps> = ({
  children,
  delay = 0,
  className = '',
}) => {
  return (
    <motion.div
      variants={bannerVariants}
      initial="hidden"
      animate="visible"
      transition={{
        delay,
        duration: 0.5,
        ease: "easeOut",
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};