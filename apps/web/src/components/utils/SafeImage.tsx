import React, { useState, useEffect } from 'react';
import { FallbackImg } from './FallbackImg';
import { sanitizeImageUrl, isCloudinaryUrl } from '../../utils/imageValidation';

interface SafeImageProps {
  src?: string;
  alt: string;
  fallbackContent: string;
  width?: number;
  height?: number;
  style?: React.CSSProperties;
  className?: string;
  onClick?: () => void;
}

export const SafeImage: React.FC<SafeImageProps> = ({
  src,
  alt,
  fallbackContent,
  width = 24,
  height = 24,
  style,
  className,
  onClick
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [sanitizedSrc, setSanitizedSrc] = useState<string>('');

  useEffect(() => {
    if (src) {
      const cleanUrl = sanitizeImageUrl(src);
      setSanitizedSrc(cleanUrl);
      setHasError(false);
      setIsLoading(true);
    } else {
      setSanitizedSrc('');
      setHasError(true);
      setIsLoading(false);
    }
  }, [src]);

  // Si pas de src valide ou erreur, afficher le fallback
  if (!sanitizedSrc || hasError) {
    return (
      <FallbackImg
        content={fallbackContent}
        width={width}
        height={height}
        style={style}
        className={className}
        onClick={onClick}
      />
    );
  }

  const imageStyle = {
    ...style,
    opacity: isLoading ? 0 : 1,
    transition: 'opacity 0.2s ease-in-out'
  };

  const handleError = () => {
    console.warn(`Image failed to load: ${sanitizedSrc}`);
    if (isCloudinaryUrl(sanitizedSrc)) {
      console.warn('This appears to be a Cloudinary URL that returned 404');
    }
    setHasError(true);
    setIsLoading(false);
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  return (
    <img
      src={sanitizedSrc}
      alt={alt}
      width={width}
      height={height}
      style={imageStyle}
      className={className}
      onClick={onClick}
      onLoad={handleLoad}
      onError={handleError}
      // Ajouter des attributs pour améliorer l'accessibilité
      loading="lazy"
      decoding="async"
    />
  );
};