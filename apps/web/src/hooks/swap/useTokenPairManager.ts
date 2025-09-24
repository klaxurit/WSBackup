import { useMemo } from 'react'
import { type Address } from 'viem'
import {
  analyzeTokenWrap,
  normalizeTokenAddress,
  areTokensEquivalent,
  isValidTokenAddress,
  isNativeToken
} from '../../utils/swap/tokenHelpers'

/**
 * Parameters for useTokenPairManager hook
 */
interface UseTokenPairManagerParams {
  tokenIn: Address
  tokenOut: Address
}

/**
 * Wrap operation information
 */
interface WrapInfo {
  isWrap: boolean          // BERA -> WBERA direct
  isUnwrap: boolean        // WBERA -> BERA direct
  needsWrapBefore: boolean // BERA input -> needs wrap before swap
  needsUnwrapAfter: boolean // output BERA -> needs unwrap after swap
}

/**
 * Return type for useTokenPairManager hook
 */
interface UseTokenPairManagerReturn {
  // Normalized tokens for routing (BERA -> WBERA)
  normalizedTokenIn: Address
  normalizedTokenOut: Address

  // Special operations detection
  wrapInfo: WrapInfo

  // Display helpers (tokens as shown to user)
  displayTokenIn: Address
  displayTokenOut: Address

  // Pair validation
  isValidPair: boolean
  pairError?: string
}

/**
 * Hook for managing token pair logic with automatic BERA/WBERA handling
 * and wrap/unwrap operation detection.
 *
 * This hook works without wallet connection and provides:
 * - Token normalization for routing
 * - Wrap/unwrap operation detection
 * - Pair validation
 * - Display helpers for UI
 */
export const useTokenPairManager = (params: UseTokenPairManagerParams): UseTokenPairManagerReturn => {
  const { tokenIn, tokenOut } = params

  return useMemo(() => {
    // Analyze wrap/unwrap operations
    const wrapAnalysis = analyzeTokenWrap(tokenIn, tokenOut)

    // Normalize addresses for routing (BERA -> WBERA)
    const normalizedTokenIn = normalizeTokenAddress(tokenIn)
    const normalizedTokenOut = normalizeTokenAddress(tokenOut)

    // Detect wrap info
    const wrapInfo: WrapInfo = {
      isWrap: wrapAnalysis.isWrap,
      isUnwrap: wrapAnalysis.isUnwrap,
      // Needs wrap before swap when tokenIn is BERA but we're not doing direct wrap
      needsWrapBefore: isNativeToken(tokenIn) && !wrapAnalysis.isWrap,
      // Needs unwrap after swap when tokenOut is BERA but we're not doing direct unwrap
      needsUnwrapAfter: isNativeToken(tokenOut) && !wrapAnalysis.isUnwrap
    }

    // Validate pair
    let isValidPair = true
    let pairError: string | undefined

    // Check if tokens are valid addresses
    if (!isValidTokenAddress(tokenIn)) {
      isValidPair = false
      pairError = 'Invalid input token address'
    } else if (!isValidTokenAddress(tokenOut)) {
      isValidPair = false
      pairError = 'Invalid output token address'
    }
    // Check if tokens are the same (after normalization)
    else if (areTokensEquivalent(tokenIn, tokenOut)) {
      isValidPair = false
      pairError = 'Input and output tokens cannot be the same'
    }

    return {
      // Normalized for routing
      normalizedTokenIn,
      normalizedTokenOut,

      // Wrap detection
      wrapInfo,

      // Display tokens (keep original for UI)
      displayTokenIn: tokenIn,
      displayTokenOut: tokenOut,

      // Validation
      isValidPair,
      pairError
    }
  }, [tokenIn, tokenOut])
}