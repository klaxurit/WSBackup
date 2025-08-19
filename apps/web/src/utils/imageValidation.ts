/**
 * Utilitaires pour la validation et la gestion des images
 * Gère les erreurs Cloudinary et autres problèmes d'images
 */

/**
 * Vérifie si une URL d'image est valide et accessible
 * @param url - L'URL de l'image à vérifier
 * @returns Promise<boolean> - true si l'image est accessible
 */
export async function isImageAccessible(url: string): Promise<boolean> {
  if (!url || typeof url !== 'string') {
    return false;
  }

  try {
    // Vérifier si c'est une URL Cloudinary
    if (url.includes('cloudinary.com')) {
      // Pour Cloudinary, on peut essayer de précharger l'image
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = url;

        // Timeout après 5 secondes
        setTimeout(() => resolve(false), 5000);
      });
    }

    // Pour les autres URLs, faire une requête HEAD
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    console.warn(`Failed to validate image URL: ${url}`, error);
    return false;
  }
}

/**
 * Nettoie et valide une URL d'image
 * @param url - L'URL brute
 * @returns string - L'URL nettoyée ou une chaîne vide si invalide
 */
export function sanitizeImageUrl(url: string | null | undefined): string {
  if (!url || typeof url !== 'string') {
    return '';
  }

  // Supprimer les espaces et caractères invalides
  const cleaned = url.trim();

  // Vérifier que c'est une URL valide
  try {
    new URL(cleaned);
    return cleaned;
  } catch {
    console.warn(`Invalid image URL: ${url}`);
    return '';
  }
}

/**
 * Génère une URL de fallback pour les images Cloudinary manquantes
 * @param tokenSymbol - Le symbole du token
 * @returns string - Une URL de fallback ou une chaîne vide
 */
export function getFallbackImageUrl(tokenSymbol: string): string {
  if (!tokenSymbol) return '';

  // Vous pouvez personnaliser cette logique selon vos besoins
  // Par exemple, utiliser des icônes par défaut ou des placeholders
  return '';
}

/**
 * Vérifie si une URL est une URL Cloudinary
 * @param url - L'URL à vérifier
 * @returns boolean - true si c'est une URL Cloudinary
 */
export function isCloudinaryUrl(url: string): boolean {
  return url.includes('cloudinary.com');
}

/**
 * Extrait l'ID de l'image depuis une URL Cloudinary
 * @param url - L'URL Cloudinary
 * @returns string - L'ID de l'image ou une chaîne vide
 */
export function extractCloudinaryImageId(url: string): string {
  if (!isCloudinaryUrl(url)) return '';

  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');
    const imageId = pathParts[pathParts.length - 1];
    return imageId || '';
  } catch {
    return '';
  }
}

