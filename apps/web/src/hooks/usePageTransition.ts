import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface UsePageTransitionOptions {
  loadingDelay?: number;
  minimumLoadingTime?: number;
}

export const usePageTransition = (options: UsePageTransitionOptions = {}) => {
  const { loadingDelay = 0, minimumLoadingTime = 200 } = options;
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('Loading...');
  const location = useLocation();

  // Detect route changes
  useEffect(() => {
    const startLoading = () => {
      setIsLoading(true);

      // Set loading text based on page
      const getLoadingText = (pathname: string) => {
        if (pathname === '/') return 'Loading swap...';
        if (pathname.startsWith('/explore')) return 'Loading explorer...';
        if (pathname.startsWith('/vaults')) return 'Loading vaults...';
        if (pathname.startsWith('/pools')) return 'Loading pools...';
        if (pathname.startsWith('/token')) return 'Loading token...';
        return 'Loading...';
      };

      setLoadingText(getLoadingText(location.pathname));
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
  const setLoading = (loading: boolean, text?: string) => {
    setIsLoading(loading);
    if (text) setLoadingText(text);
  };

  return {
    isLoading,
    loadingText,
    setLoading,
  };
};
