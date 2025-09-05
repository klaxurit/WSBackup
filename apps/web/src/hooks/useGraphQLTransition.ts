import { useState, useEffect } from 'react';

interface UseGraphQLTransitionOptions {
  loadingDelay?: number;
  successDelay?: number;
  errorDelay?: number;
  minimumLoadingTime?: number;
}

export const useGraphQLTransition = (options: UseGraphQLTransitionOptions = {}) => {
  const {
    loadingDelay = 0,
    successDelay = 100,
    errorDelay = 0,
    minimumLoadingTime = 300
  } = options;

  const [transitionState, setTransitionState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [isVisible, setIsVisible] = useState(false);
  const [loadingStartTime, setLoadingStartTime] = useState<number | null>(null);

  const startLoading = () => {
    setTransitionState('loading');
    setLoadingStartTime(Date.now());
    setTimeout(() => setIsVisible(true), loadingDelay);
  };

  const setSuccess = () => {
    const now = Date.now();
    const elapsed = loadingStartTime ? now - loadingStartTime : 0;
    const remainingTime = Math.max(0, minimumLoadingTime - elapsed);

    setTimeout(() => {
      setTransitionState('success');
      setTimeout(() => setIsVisible(true), successDelay);
    }, remainingTime);
  };

  const setError = () => {
    const now = Date.now();
    const elapsed = loadingStartTime ? now - loadingStartTime : 0;
    const remainingTime = Math.max(0, minimumLoadingTime - elapsed);

    setTimeout(() => {
      setTransitionState('error');
      setTimeout(() => setIsVisible(true), errorDelay);
    }, remainingTime);
  };

  const reset = () => {
    setTransitionState('idle');
    setIsVisible(false);
    setLoadingStartTime(null);
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
