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

  // Charger les backgrounds au montage du composant
  useEffect(() => {
    const loadBackgrounds = async () => {
      setIsLoading(true);
      try {
        const backgrounds = await fetchNFTBackgrounds();
        setAvailableBackgrounds(backgrounds);
      } catch (error) {
        console.error('Erreur lors du chargement des backgrounds:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadBackgrounds();
  }, []);

  const changeBackground = useCallback((newBackground: BackgroundImage) => {
    setIsLoading(true);
    try {
      // Créer l'overlay s'il n'existe pas
      let overlay = document.querySelector('.background-overlay');
      if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'background-overlay';
        document.body.appendChild(overlay);
      }

      // Appliquer le nouveau background
      document.body.style.backgroundImage = `url(${newBackground.url})`;
      document.body.style.backgroundSize = 'cover';
      document.body.style.backgroundPosition = 'center';
      document.body.style.backgroundRepeat = 'no-repeat';
      document.body.style.transition = 'background-image 0.5s ease-in-out';
      document.body.classList.add('has-background');

      setCurrentBackground(newBackground);
    } catch (error) {
      console.error('Erreur lors du changement de background:', error);
    } finally {
      setIsLoading(false);
    }
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
    toggleBackground
  };
}; 