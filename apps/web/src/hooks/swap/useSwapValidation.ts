import { useMemo } from 'react'
import { type Address, zeroAddress } from 'viem'
import type { OptimizedRoute } from './types'
import { areTokensEquivalent, isValidTokenAddress } from '../../utils/swap/tokenHelpers'

/**
 * Validation error structure
 */
interface ValidationError {
  field: 'tokenIn' | 'tokenOut' | 'amount' | 'general'
  message: string
  code?: string
}

/**
 * Parameters for useSwapValidation hook
 */
interface UseSwapValidationParams {
  tokenIn: Address
  tokenOut: Address
  amountIn: bigint
  optimizedRoute: OptimizedRoute | null
  // Optional for advanced validations (require wallet)
  userBalance?: bigint
  isConnected?: boolean
}

/**
 * Return type for useSwapValidation hook
 */
interface UseSwapValidationReturn {
  isValid: boolean
  errors: ValidationError[]
  canEstimate: boolean  // True if can estimate (tokens + amount OK)
  canExecute: boolean   // True if can execute (estimate + wallet + balance OK)

  // UI helpers
  getFieldError: (field: string) => ValidationError | undefined
  hasError: (field?: string) => boolean
}

/**
 * Hook for comprehensive swap validation with structured error handling.
 *
 * Provides two validation levels:
 * - Basic validation (without wallet): tokens + amount validation
 * - Advanced validation (with wallet): includes balance and connection checks
 */
export const useSwapValidation = (params: UseSwapValidationParams): UseSwapValidationReturn => {
  const {
    tokenIn,
    tokenOut,
    amountIn,
    optimizedRoute,
    userBalance,
    isConnected = false
  } = params

  return useMemo(() => {
    const errors: ValidationError[] = []

    // === Basic Validations (work without wallet) ===

    // Validate tokenIn
    if (!tokenIn || tokenIn === zeroAddress) {
      errors.push({
        field: 'tokenIn',
        message: 'Please select an input token',
        code: 'MISSING_TOKEN_IN'
      })
    } else if (!isValidTokenAddress(tokenIn)) {
      errors.push({
        field: 'tokenIn',
        message: 'Invalid input token address',
        code: 'INVALID_TOKEN_IN'
      })
    }

    // Validate tokenOut
    if (!tokenOut || tokenOut === zeroAddress) {
      errors.push({
        field: 'tokenOut',
        message: 'Please select an output token',
        code: 'MISSING_TOKEN_OUT'
      })
    } else if (!isValidTokenAddress(tokenOut)) {
      errors.push({
        field: 'tokenOut',
        message: 'Invalid output token address',
        code: 'INVALID_TOKEN_OUT'
      })
    }

    // Validate tokens are different (after normalization handled by tokenPairManager)
    if (tokenIn && tokenOut && areTokensEquivalent(tokenIn, tokenOut)) {
      errors.push({
        field: 'general',
        message: 'Input and output tokens cannot be the same',
        code: 'SAME_TOKENS'
      })
    }

    // Validate amount
    if (amountIn <= 0n) {
      errors.push({
        field: 'amount',
        message: 'Please enter an amount to swap',
        code: 'INVALID_AMOUNT'
      })
    }

    // === Advanced Validations (require wallet connection) ===

    // Only validate wallet-related stuff if we have wallet info
    if (isConnected !== undefined && userBalance !== undefined) {
      // Validate wallet connection
      if (!isConnected) {
        errors.push({
          field: 'general',
          message: 'Please connect your wallet to continue',
          code: 'WALLET_NOT_CONNECTED'
        })
      }

      // Validate balance (only if connected and amount is valid)
      if (isConnected && amountIn > 0n && userBalance < amountIn) {
        errors.push({
          field: 'amount',
          message: 'Insufficient balance for this transaction',
          code: 'INSUFFICIENT_BALANCE'
        })
      }
    }

    // === Route Validation ===

    // Check if we have valid tokens and amount for estimation
    const hasValidBasicInputs = tokenIn &&
                               tokenOut &&
                               !areTokensEquivalent(tokenIn, tokenOut) &&
                               amountIn > 0n &&
                               isValidTokenAddress(tokenIn) &&
                               isValidTokenAddress(tokenOut)

    // If we should have a route but don't, it's an error
    if (hasValidBasicInputs && !optimizedRoute) {
      errors.push({
        field: 'general',
        message: 'No trading route found for this pair',
        code: 'NO_ROUTE_FOUND'
      })
    }

    // === Compute validation states ===

    const isValid = errors.length === 0

    // Can estimate if basic inputs are valid (regardless of route state)
    const canEstimate = Boolean(hasValidBasicInputs)

    // Can execute if:
    // - All validations pass
    // - We have a valid route
    // - If wallet info provided, wallet is connected and has sufficient balance
    const canExecute = isValid &&
                      optimizedRoute !== null &&
                      (isConnected === undefined || isConnected) &&
                      (userBalance === undefined || (amountIn > 0n && userBalance >= amountIn))

    // === Helper functions ===

    const getFieldError = (field: string): ValidationError | undefined => {
      return errors.find(error => error.field === field)
    }

    const hasError = (field?: string): boolean => {
      if (field) {
        return errors.some(error => error.field === field)
      }
      return errors.length > 0
    }

    return {
      isValid,
      errors,
      canEstimate,
      canExecute,
      getFieldError,
      hasError
    }
  }, [tokenIn, tokenOut, amountIn, optimizedRoute, userBalance, isConnected])
}