/**
 * Utility functions for formatting token display names and symbols
 */

/**
 * Cleans up Sticky Vault token names by removing the "Sticky Vault" or "StickyVault" prefix
 * @param name The original token name
 * @returns The cleaned token name
 */
export function cleanTokenName(name: string): string {
  if (!name) return name;

  // Remove "Sticky Vault " (with space) or "StickyVault " (without space) from the beginning
  // Case-insensitive matching
  const cleanedName = name
    .replace(/^Sticky\s*Vault\s*/i, '')
    .trim();

  return cleanedName || name; // Return original if cleaning results in empty string
}

/**
 * Cleans up Sticky Vault token symbols by removing "Sticky" prefix
 * @param symbol The original token symbol
 * @returns The cleaned token symbol
 */
export function cleanTokenSymbol(symbol: string): string {
  if (!symbol) return symbol;

  // Remove "Sticky" from the beginning of the symbol
  // Case-insensitive matching
  const cleanedSymbol = symbol
    .replace(/^Sticky/i, '')
    .trim();

  // If the symbol starts with a hyphen after removal, keep it
  // If it starts with "Vault", keep it as is
  // Otherwise return the cleaned symbol
  return cleanedSymbol || symbol; // Return original if cleaning results in empty string
}

/**
 * Checks if a token is a Sticky Vault token based on its name
 * @param name The token name to check
 * @returns true if it's a Sticky Vault token
 */
export function isStickyVaultToken(name: string): boolean {
  if (!name) return false;

  // Check if the name contains "Sticky Vault" or "StickyVault" (case-insensitive)
  return /sticky\s*vault/i.test(name);
}

/**
 * Formats a token for display, applying Sticky Vault cleaning if needed
 * @param token The token object with name and symbol
 * @returns An object with cleaned name and symbol
 */
export function formatTokenForDisplay(token: { name: string; symbol: string }): { name: string; symbol: string } {
  if (!token) return token;

  const isSticky = isStickyVaultToken(token.name);

  return {
    name: isSticky ? cleanTokenName(token.name) : token.name,
    symbol: isSticky ? cleanTokenSymbol(token.symbol) : token.symbol
  };
}