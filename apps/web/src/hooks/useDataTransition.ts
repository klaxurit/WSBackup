import { useState, useEffect } from 'react';

interface UseDataTransitionOptions {
  loadingDelay?: number;
  successDelay?: number;
  errorDelay?: number;
}

export const useDataTransition = (options: UseDataTransitionOptions = {}) => {
  const { loadingDelay = 0, successDelay = 100, errorDelay = 0 } = options;
  const [transitionState, setTransitionState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [isVisible, setIsVisible] = useState(false);

  const startLoading = () => {
    setTransitionState('loading');
    setTimeout(() => setIsVisible(true), loadingDelay);
  };

  const setSuccess = () => {
    setTransitionState('success');
    setTimeout(() => setIsVisible(true), successDelay);
  };

  const setError = () => {
    setTransitionState('error');
    setTimeout(() => setIsVisible(true), errorDelay);
  };

  const reset = () => {
    setTransitionState('idle');
    setIsVisible(false);
  };

  // Auto-reset after delay for success/error states
  useEffect(() => {
    if (transitionState === 'success' || transitionState === 'error') {
      const timer = setTimeout(() => {
        reset();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [transitionState]);

  return {
    transitionState,
    isVisible,
    startLoading,
    setSuccess,
    setError,
    reset,
    isLoading: transitionState === 'loading',
    isSuccess: transitionState === 'success',
    isError: transitionState === 'error',
  };
};
