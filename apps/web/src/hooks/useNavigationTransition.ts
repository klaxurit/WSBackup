import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface UseNavigationTransitionOptions {
  transitionDelay?: number;
  enablePageTransitions?: boolean;
}

export const useNavigationTransition = (options: UseNavigationTransitionOptions = {}) => {
  const { transitionDelay = 0, enablePageTransitions = true } = options;
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [previousPath, setPreviousPath] = useState<string | null>(null);
  const location = useLocation();

  useEffect(() => {
    if (!enablePageTransitions) return;

    const startTransition = () => {
      setIsTransitioning(true);
      setPreviousPath(location.pathname);
    };

    const endTransition = () => {
      setTimeout(() => {
        setIsTransitioning(false);
      }, transitionDelay);
    };

      // Start transition
  startTransition();
  
  // End transition after delay
  const timer = setTimeout(endTransition, transitionDelay + 300);

    return () => clearTimeout(timer);
  }, [location.pathname, transitionDelay, enablePageTransitions]);

  const getTransitionDirection = () => {
    if (!previousPath) return 'none';

    const currentDepth = location.pathname.split('/').length;
    const previousDepth = previousPath.split('/').length;

    if (currentDepth > previousDepth) return 'forward';
    if (currentDepth < previousDepth) return 'backward';
    return 'lateral';
  };

  const getTransitionType = () => {
    const path = location.pathname;

    if (path === '/') return 'home';
    if (path.startsWith('/explore')) return 'explore';
    if (path.startsWith('/vaults')) return 'vaults';
    if (path.startsWith('/pools')) return 'pools';
    if (path.startsWith('/token')) return 'token';

    return 'default';
  };

  return {
    isTransitioning,
    previousPath,
    transitionDirection: getTransitionDirection(),
    transitionType: getTransitionType(),
  };
};
