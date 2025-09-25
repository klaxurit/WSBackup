import { zeroAddress, type Address } from "viem"
import { WBERA_ADDRESS } from "../../hooks/swap/constants"
import type { TokenWrapInfo } from "../../hooks/swap/types"

/**
 * Checks if an address is the native token (BERA)
 * @param address Token address to check
 * @returns true if address is native token
 */
export const isNativeToken = (address: Address): boolean => {
  return address === zeroAddress
}

/**
 * Checks if an address is the wrapped native token (WBERA)
 * @param address Token address to check
 * @returns true if address is wrapped native token
 */
export const isWrappedNativeToken = (address: Address): boolean => {
  return address === WBERA_ADDRESS
}

/**
 * Gets the wrapped version address for a given token
 * @param address Token address
 * @returns Wrapped token address (WBERA for BERA, same address for others)
 */
export const getWrappedAddress = (address: Address): Address => {
  return isNativeToken(address) ? WBERA_ADDRESS : address
}

/**
 * Gets the native version address for a given token
 * @param address Token address
 * @returns Native token address (BERA for WBERA, same address for others)
 */
export const getNativeAddress = (address: Address): Address => {
  return isWrappedNativeToken(address) ? zeroAddress : address
}

/**
 * Normalizes a token address for routing (converts BERA to WBERA for internal routing)
 * @param address Token address to normalize
 * @returns Normalized address for routing
 */
export const normalizeTokenAddress = (address: Address): Address => {
  return getWrappedAddress(address)
}

/**
 * Determines if the token pair requires wrapping/unwrapping and normalizes addresses
 * @param tokenIn Input token address
 * @param tokenOut Output token address
 * @returns Wrap information and normalized addresses
 */
export const analyzeTokenWrap = (tokenIn: Address, tokenOut: Address): TokenWrapInfo => {
  const isWrap = isNativeToken(tokenIn) && isWrappedNativeToken(tokenOut)
  const isUnwrap = isWrappedNativeToken(tokenIn) && isNativeToken(tokenOut)

  return {
    isWrap,
    isUnwrap,
    normalizedTokenIn: isNativeToken(tokenIn) && !isWrap ? WBERA_ADDRESS : tokenIn,
    normalizedTokenOut: isNativeToken(tokenOut) && !isUnwrap ? WBERA_ADDRESS : tokenOut
  }
}

/**
 * Checks if two tokens are equivalent (considering BERA/WBERA equivalence)
 * @param tokenA First token address
 * @param tokenB Second token address
 * @returns true if tokens are equivalent
 */
export const areTokensEquivalent = (tokenA: Address, tokenB: Address): boolean => {
  if (tokenA === tokenB) return true

  // Check BERA/WBERA equivalence
  const normalizedA = normalizeTokenAddress(tokenA)
  const normalizedB = normalizeTokenAddress(tokenB)

  return normalizedA === normalizedB
}

/**
 * Validates if a token address is valid (not zero for ERC20 operations)
 * @param address Token address to validate
 * @param allowNative Whether to allow native token address
 * @returns true if address is valid
 */
export const isValidTokenAddress = (address: Address, allowNative = true): boolean => {
  if (!address) return false
  if (isNativeToken(address)) return allowNative
  return true
}

/**
 * Gets the display address for UI (shows BERA instead of 0x0)
 * @param address Token address
 * @param showBera Whether to show 'BERA' for native token
 * @returns Display address
 */
export const getDisplayAddress = (address: Address, showBera = true): string => {
  if (isNativeToken(address) && showBera) return 'BERA'
  return address
}

/**
 * Determines the optimal token order for pool operations (token0 < token1)
 * @param tokenA First token address
 * @param tokenB Second token address
 * @returns Ordered token addresses [token0, token1]
 */
export const getOrderedTokens = (tokenA: Address, tokenB: Address): [Address, Address] => {
  const normalizedA = normalizeTokenAddress(tokenA)
  const normalizedB = normalizeTokenAddress(tokenB)

  return normalizedA.toLowerCase() < normalizedB.toLowerCase()
    ? [normalizedA, normalizedB]
    : [normalizedB, normalizedA]
}

/**
 * Creates a unique pair identifier for caching
 * @param tokenA First token address
 * @param tokenB Second token address
 * @returns Unique pair identifier
 */
export const createPairId = (tokenA: Address, tokenB: Address): string => {
  const [token0, token1] = getOrderedTokens(tokenA, tokenB)
  return `${token0.toLowerCase()}-${token1.toLowerCase()}`
}

/**
 * Checks if a swap involves the native token
 * @param tokenIn Input token address
 * @param tokenOut Output token address
 * @returns true if either token is native
 */
export const involvesNativeToken = (tokenIn: Address, tokenOut: Address): boolean => {
  return isNativeToken(tokenIn) || isNativeToken(tokenOut)
}

/**
 * Determines if ETH value should be sent with transaction
 * @param tokenIn Input token address
 * @param amount Amount being swapped
 * @returns ETH value to send (0 for ERC20 tokens)
 */
export const getTransactionValue = (tokenIn: Address, amount: bigint): bigint => {
  return isNativeToken(tokenIn) ? amount : 0n
}

/**
 * Gets the appropriate approval target for a token
 * @param tokenIn Input token address
 * @param defaultTarget Default approval target
 * @returns Approval target (undefined for native tokens)
 */
export const getApprovalTarget = (tokenIn: Address, defaultTarget: Address): Address | undefined => {
  return isNativeToken(tokenIn) ? undefined : defaultTarget
}

/**
 * Formats token pair for display
 * @param tokenA First token
 * @param tokenB Second token
 * @param symbolA Symbol of first token
 * @param symbolB Symbol of second token
 * @returns Formatted pair string
 */
export const formatTokenPair = (
  tokenA: Address,
  tokenB: Address,
  symbolA?: string,
  symbolB?: string
): string => {
  const displayA = symbolA || getDisplayAddress(tokenA)
  const displayB = symbolB || getDisplayAddress(tokenB)
  return `${displayA}/${displayB}`
}

/**
 * Checks if a token is a common base token for routing
 * @param address Token address to check
 * @param bases Array of base token addresses
 * @returns true if token is a base token
 */
export const isBaseToken = (address: Address, bases: Address[]): boolean => {
  const normalized = normalizeTokenAddress(address)
  return bases.some(base => normalizeTokenAddress(base) === normalized)
}