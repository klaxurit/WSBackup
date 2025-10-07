import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface UsePageTransitionOptions {
  loadingDelay?: number;
  minimumLoadingTime?: number;
}

export const usePageTransition = (options: UsePageTransitionOptions = {}) => {
  const { loadingDelay = 0, minimumLoadingTime = 200 } = options;
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();

  // Detect route changes
  useEffect(() => {
    const startLoading = () => {
      setIsLoading(true);
    };

    const stopLoading = () => {
      // Ensure loading stops after a reasonable time
      setTimeout(() => {
        setIsLoading(false);
      }, minimumLoadingTime);
    };

    // Start loading with optional delay
    const timeoutId = setTimeout(startLoading, loadingDelay);

    // Stop loading after minimum delay
    const stopTimeoutId = setTimeout(stopLoading, minimumLoadingTime);

    return () => {
      clearTimeout(timeoutId);
      clearTimeout(stopTimeoutId);
    };
  }, [location.pathname, loadingDelay, minimumLoadingTime]);

  // Function to force loading (useful for GraphQL requests)
  const setLoading = (loading: boolean) => {
    setIsLoading(loading);
  };

  return {
    isLoading,
    setLoading,
  };
};
