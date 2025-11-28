import React from 'react';
import { motion } from 'framer-motion';

interface FormTransitionProps {
  children: React.ReactNode;
  className?: string;
}

const formVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
  },
};

const fieldVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
  },
};

export const FormTransition: React.FC<FormTransitionProps> = ({
  children,
  className = '',
}) => {
  return (
    <motion.form
      variants={formVariants}
      initial="hidden"
      animate="visible"
      className={className}
    >
      {React.Children.map(children, (child, index) => (
        <motion.div
          key={index}
          variants={fieldVariants}
          style={{
            animationDelay: `${index * 0.1}s`,
          }}
        >
          {child}
        </motion.div>
      ))}
    </motion.form>
  );
};
