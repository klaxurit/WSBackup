/**
 * Utilitaires pour valider et sécuriser l'accès aux données des API
 * Depuis que le schéma des données a changé au niveau du backend,
 * ces fonctions garantissent que les données sont des tableaux avant utilisation
 */

/**
 * Vérifie si une valeur est un tableau et retourne un tableau sécurisé
 * @param data - Les données à valider
 * @param fallback - Tableau de fallback si data n'est pas valide
 * @returns Un tableau valide
 */
export function ensureArray<T>(data: any, fallback: T[] = []): T[] {
  if (Array.isArray(data)) {
    return data;
  }
  console.warn('Data is not an array, using fallback:', data);
  return fallback;
}

/**
 * Vérifie si une valeur est un objet et retourne un objet sécurisé
 * @param data - Les données à valider
 * @param fallback - Objet de fallback si data n'est pas valide
 * @returns Un objet valide
 */
export function ensureObject<T>(data: any, fallback: T = {} as T): T {
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    return data;
  }
  console.warn('Data is not an object, using fallback:', data);
  return fallback;
}

/**
 * Vérifie si une valeur est une chaîne et retourne une chaîne sécurisée
 * @param data - Les données à valider
 * @param fallback - Chaîne de fallback si data n'est pas valide
 * @returns Une chaîne valide
 */
export function ensureString(data: any, fallback: string = ''): string {
  if (typeof data === 'string') {
    return data;
  }
  console.warn('Data is not a string, using fallback:', data);
  return fallback;
}

/**
 * Vérifie si une valeur est un nombre et retourne un nombre sécurisé
 * @param data - Les données à valider
 * @param fallback - Nombre de fallback si data n'est pas valide
 * @returns Un nombre valide
 */
export function ensureNumber(data: any, fallback: number = 0): number {
  if (typeof data === 'number' && !isNaN(data)) {
    return data;
  }
  console.warn('Data is not a valid number, using fallback:', data);
  return fallback;
}

/**
 * Vérifie si une valeur est un booléen et retourne un booléen sécurisé
 * @param data - Les données à valider
 * @param fallback - Booléen de fallback si data n'est pas valide
 * @returns Un booléen valide
 */
export function ensureBoolean(data: any, fallback: boolean = false): boolean {
  if (typeof data === 'boolean') {
    return data;
  }
  console.warn('Data is not a boolean, using fallback:', data);
  return fallback;
}

