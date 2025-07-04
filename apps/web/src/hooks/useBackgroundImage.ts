import { useState, useCallback, useEffect } from 'react';
import { fetchNFTBackgrounds, getRandomBackground } from '../services/openseaService';

interface BackgroundImage {
  url: string;
  name: string;
}

export const useBackgroundImage = () => {
  const [currentBackground, setCurrentBackground] = useState<BackgroundImage | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [availableBackgrounds, setAvailableBackgrounds] = useState<BackgroundImage[]>([]);
  const [preloadCount, setPreloadCount] = useState(0);

  // Charger les backgrounds au montage du composant
  useEffect(() => {
    const loadBackgrounds = async () => {
      setIsLoading(true);
      try {
        const backgrounds = await fetchNFTBackgrounds();
        setAvailableBackgrounds(backgrounds);
      } catch (error) {
        console.error('Error loading backgrounds:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadBackgrounds();
  }, []);

  const resetBackground = useCallback(() => {
    document.body.style.backgroundImage = 'none';
    document.body.classList.remove('has-background');

    // Supprimer l'overlay
    const overlay = document.querySelector('.background-overlay');
    if (overlay) {
      overlay.remove();
    }

    setCurrentBackground(null);
  }, []);

  const changeBackground = useCallback((newBackground: BackgroundImage) => {
    if (preloadCount >= 4) {
      console.warn('Limite de préchargement atteinte');
      return;
    }
    setIsLoading(true);
    try {
      // Précharger l'image avant de l'appliquer
      const img = new window.Image();
      img.src = newBackground.url;
      img.onload = () => {
        // Créer l'overlay seulement après le chargement de l'image
        let overlay = document.querySelector('.background-overlay');
        if (!overlay) {
          overlay = document.createElement('div');
          overlay.className = 'background-overlay';
          document.body.appendChild(overlay);
        }

        document.body.style.backgroundImage = `url(${newBackground.url})`;
        document.body.style.backgroundSize = 'cover';
        document.body.style.backgroundPosition = 'center';
        document.body.style.backgroundRepeat = 'no-repeat';
        document.body.style.transition = 'background-image 0.5s ease-in-out';
        document.body.classList.add('has-background');
        setCurrentBackground(newBackground);
        setIsLoading(false);
        setPreloadCount(count => count + 1);
      };
      img.onerror = (error) => {
        console.error('Error loading background image:', error);
        setIsLoading(false);
      };
    } catch (error) {
      console.error('Error changing background:', error);
      setIsLoading(false);
    }
  }, [preloadCount, resetBackground]);

  const toggleBackground = useCallback(() => {
    if (currentBackground) {
      resetBackground();
    } else {
      const randomBackground = getRandomBackground();
      if (randomBackground) {
        changeBackground(randomBackground);
      }
    }
  }, [currentBackground, changeBackground, resetBackground]);

  // Nettoyage lors du démontage du composant
  useEffect(() => {
    return () => {
      resetBackground();
    };
  }, [resetBackground]);

  return {
    currentBackground,
    isLoading,
    changeBackground,
    resetBackground,
    toggleBackground,
    availableBackgrounds
  };
}; 