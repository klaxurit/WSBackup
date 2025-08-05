import type { Address } from 'viem'

export const BERA_NATIVE: Address = '0x0000000000000000000000000000000000000000'
export const WBERA_ADDRESS: Address = '0x6969696969696969696969696969696969696969'

export interface TokenDisplayConfig {
  displaySymbol: string
  displayName: string
  statsTokenAddress: Address
  isNative: boolean
  logoUri: string
}

export const TOKEN_CONFIG: Record<Address, TokenDisplayConfig> = {
  [BERA_NATIVE]: {
    displaySymbol: 'BERA',
    displayName: 'Bera',
    statsTokenAddress: WBERA_ADDRESS,
    isNative: true,
    logoUri: 'https://res.cloudinary.com/duv0g402y/raw/upload/v1717773645/src/assets/bera.png'
  },
  [WBERA_ADDRESS]: {
    displaySymbol: 'WBERA',
    displayName: 'Wrapped Bera',
    statsTokenAddress: WBERA_ADDRESS,
    isNative: false,
    logoUri: 'https://res.cloudinary.com/duv0g402y/raw/upload/v1717773645/src/assets/wbera.png'
  }
} as const

export function getStatsAddress(displayAddress: Address): Address {
  const config = TOKEN_CONFIG[displayAddress]
  return config?.statsTokenAddress || displayAddress
}

export function getTokenDisplayInfo(address: Address): TokenDisplayConfig | null {
  return TOKEN_CONFIG[address] || null
}

/**
 * Transforme un token pour l'affichage dans les pools
 * WBERA → BERA dans l'affichage des pools
 */
export function getPoolDisplayToken(tokenAddress: Address) {
  if (tokenAddress.toLowerCase() === WBERA_ADDRESS.toLowerCase()) {
    return {
      address: BERA_NATIVE,
      originalAddress: tokenAddress,
      symbol: 'BERA',
      name: 'Bera',
      logoUri: 'https://res.cloudinary.com/duv0g402y/raw/upload/v1717773645/src/assets/bera.png'
    }
  }

  return {
    address: tokenAddress,
    originalAddress: tokenAddress,
    symbol: null,
    name: null,
    logoUri: null
  }
}