/**
 * Error mapping utility for WinnieSwap
 * Maps common swap errors to user-friendly messages and suggested actions
 */
export interface ErrorAction {
  label: string;
  type: 'primary' | 'secondary';
  action: () => void;
}

export interface MappedError {
  title: string;
  description: string;
  actions: ErrorAction[];
}

export type ErrorType =
  | 'INSUFFICIENT_BALANCE'
  | 'SLIPPAGE_EXCEEDED'
  | 'EXECUTION_REVERTED'
  | 'USER_REJECTED'
  | 'NETWORK_ERROR'
  | 'APPROVAL_NEEDED'
  | 'INSUFFICIENT_LIQUIDITY'
  | 'DEADLINE_EXCEEDED'
  | 'INVALID_AMOUNT'
  | 'GAS_ESTIMATION_FAILED'
  | 'UNKNOWN_ERROR';

export interface ErrorMappingParams {
  onRetry?: () => void;
  onAdjustSettings?: () => void;
  onCheckWallet?: () => void;
  onClose: () => void;
  onApprove?: () => void;
}

/**
 * Common error patterns to match against error messages
 * Enhanced with Viem/Wagmi specific error patterns
 *
 * IMPORTANT: Pattern matching order is defined by ERROR_PRIORITY array below
 * to ensure most specific errors are detected first
 */
const ERROR_PATTERNS: Record<ErrorType, string[]> = {
  USER_REJECTED: [
    'user rejected',
    'user denied',
    'cancelled by user',
    'transaction was cancelled',
    'rejected transaction',
    // Wagmi/Viem specific patterns
    'user rejected the request',
    'userrejectedrequesterror',
    'user denied transaction signature',
    'user canceled',
    'action_rejected',
    'user cancelled',
    'rejected by user',
    'wallet_requestpermissions_rejected'
  ],
  INSUFFICIENT_BALANCE: [
    'insufficient balance',
    'balance too low',
    'not enough',
    'transfer amount exceeds balance',
    'insufficient funds',
    // Viem/Wagmi patterns
    'transferfrom failed',
    'erc20: transfer amount exceeds balance',
    'insufficient eth balance',
    'balance is insufficient'
  ],
  APPROVAL_NEEDED: [
    'approval needed',
    'allowance',
    'approve token',
    'insufficient allowance',
    // ERC20 specific patterns
    'erc20: insufficient allowance',
    'transfer amount exceeds allowance'
  ],
  SLIPPAGE_EXCEEDED: [
    'slippage tolerance exceeded',
    'price slippage check',
    'too much slippage',
    'slippage too high',
    'price moved too much',
    // Uniswap V3 specific patterns
    'too little received',
    'too much requested',
    'price impact too high',
    'spr', // Slippage Protection Required
    'amount0min',
    'amount1min'
  ],
  INSUFFICIENT_LIQUIDITY: [
    'insufficient liquidity',
    'not enough liquidity',
    'liquidity too low',
    'no liquidity',
    // Uniswap V3 specific patterns
    'liquidity underflow',
    'loc', // Lack of Liquidity
    'pool has insufficient liquidity'
  ],
  DEADLINE_EXCEEDED: [
    'deadline exceeded',
    'transaction too old',
    'expired',
    'deadline passed',
    // Uniswap specific patterns
    'transaction too old',
    'deadline has passed'
  ],
  INVALID_AMOUNT: [
    'invalid amount',
    'amount too small',
    'amount too large',
    'zero amount',
    // Contract specific patterns
    'amount cannot be zero',
    'invalid input amount',
    'amounts must be greater than 0'
  ],
  GAS_ESTIMATION_FAILED: [
    'gas estimation failed',
    'cannot estimate gas',
    'gas limit exceeded',
    'out of gas',
    // Viem specific patterns
    'transaction may fail',
    'gas required exceeds allowance',
    'intrinsic gas too low',
    'base fee exceeds gas limit'
  ],
  NETWORK_ERROR: [
    'network error',
    'connection failed',
    'timeout',
    'rpc error',
    'network timeout',
    'fetch failed',
    // Viem/Web3 specific patterns
    'rpc request failed',
    'could not detect network',
    'network changed',
    'provider error',
    'chain mismatch',
    'unsupported chain'
  ],
  EXECUTION_REVERTED: [
    'execution reverted',
    'transaction reverted',
    'revert',
    'call exception',
    'failed to execute',
    // Viem specific patterns
    'contractfunctionrevertederror',
    'contract function reverted',
    'transaction failed'
  ],
  UNKNOWN_ERROR: []
};

/**
 * Priority order for error pattern matching
 * Most specific errors are checked first to prevent false matches
 *
 * Priority rationale:
 * 1. USER_REJECTED - Most specific user action, should never be misclassified
 * 2. INSUFFICIENT_BALANCE - Clear wallet state issue
 * 3. APPROVAL_NEEDED - Specific token permission issue
 * 4. SLIPPAGE_EXCEEDED - Specific trade condition
 * 5. INSUFFICIENT_LIQUIDITY - Specific pool condition
 * 6. DEADLINE_EXCEEDED - Specific timing issue
 * 7. INVALID_AMOUNT - Specific input validation
 * 8. GAS_ESTIMATION_FAILED - Gas-related issues
 * 9. NETWORK_ERROR - Network connectivity issues
 * 10. EXECUTION_REVERTED - Generic contract revert (catch-all for contract errors)
 */
const ERROR_PRIORITY: ErrorType[] = [
  'USER_REJECTED',
  'INSUFFICIENT_BALANCE',
  'APPROVAL_NEEDED',
  'SLIPPAGE_EXCEEDED',
  'INSUFFICIENT_LIQUIDITY',
  'DEADLINE_EXCEEDED',
  'INVALID_AMOUNT',
  'GAS_ESTIMATION_FAILED',
  'NETWORK_ERROR',
  'EXECUTION_REVERTED'
];

/**
 * Classify error based on error message
 * Uses priority-based matching to ensure most specific errors are detected first
 */
export function classifyError(errorMessage: string): ErrorType {
  const message = errorMessage.toLowerCase();

  // Check errors in priority order to prevent false matches
  for (const errorType of ERROR_PRIORITY) {
    const patterns = ERROR_PATTERNS[errorType];
    if (patterns.some(pattern => message.includes(pattern))) {
      return errorType;
    }
  }

  return 'UNKNOWN_ERROR';
}

/**
 * Map error to user-friendly message and actions
 */
export function mapErrorToUserMessage(
  errorType: ErrorType,
  params: ErrorMappingParams
): MappedError {
  const { onRetry, onAdjustSettings, onCheckWallet, onClose, onApprove } = params;

  switch (errorType) {
    case 'INSUFFICIENT_BALANCE':
      return {
        title: 'Insufficient Balance',
        description: 'You don\'t have enough tokens to complete this swap. Please add more tokens to your wallet or reduce the swap amount.',
        actions: [
          {
            label: 'Check Wallet',
            type: 'primary',
            action: onCheckWallet || onClose
          },
          {
            label: 'Close',
            type: 'secondary',
            action: onClose
          }
        ]
      };

    case 'SLIPPAGE_EXCEEDED':
      return {
        title: 'Slippage Tolerance Exceeded',
        description: 'The price moved too much during the transaction. Try increasing your slippage tolerance or wait for better market conditions.',
        actions: [
          {
            label: 'Adjust Settings',
            type: 'primary',
            action: onAdjustSettings || onClose
          },
          {
            label: 'Try Again',
            type: 'secondary',
            action: onRetry || onClose
          }
        ]
      };

    case 'EXECUTION_REVERTED':
      return {
        title: 'Transaction Failed',
        description: 'The transaction was rejected by the blockchain. This might be due to insufficient gas, network congestion, or invalid parameters.',
        actions: [
          {
            label: 'Try Again',
            type: 'primary',
            action: onRetry || onClose
          },
          {
            label: 'Adjust Settings',
            type: 'secondary',
            action: onAdjustSettings || onClose
          }
        ]
      };

    case 'USER_REJECTED':
      return {
        title: 'Transaction Cancelled',
        description: 'You cancelled the transaction in your wallet. No funds were moved.',
        actions: [
          {
            label: 'Try Again',
            type: 'primary',
            action: onRetry || onClose
          },
          {
            label: 'Close',
            type: 'secondary',
            action: onClose
          }
        ]
      };

    case 'NETWORK_ERROR':
      return {
        title: 'Network Error',
        description: 'Unable to connect to the blockchain network. Please check your internet connection and try again.',
        actions: [
          {
            label: 'Try Again',
            type: 'primary',
            action: onRetry || onClose
          },
          {
            label: 'Close',
            type: 'secondary',
            action: onClose
          }
        ]
      };

    case 'APPROVAL_NEEDED':
      return {
        title: 'Token Approval Required',
        description: 'You need to approve this token for trading before you can swap. This is a one-time action per token.',
        actions: [
          {
            label: 'Approve Token',
            type: 'primary',
            action: onApprove || onClose
          },
          {
            label: 'Close',
            type: 'secondary',
            action: onClose
          }
        ]
      };

    case 'INSUFFICIENT_LIQUIDITY':
      return {
        title: 'Insufficient Liquidity',
        description: 'There isn\'t enough liquidity in the pool for this swap size. Try reducing the amount or use a different route.',
        actions: [
          {
            label: 'Try Again',
            type: 'primary',
            action: onRetry || onClose
          },
          {
            label: 'Close',
            type: 'secondary',
            action: onClose
          }
        ]
      };

    case 'DEADLINE_EXCEEDED':
      return {
        title: 'Transaction Expired',
        description: 'The transaction took too long to process and expired. Please try again with updated prices.',
        actions: [
          {
            label: 'Try Again',
            type: 'primary',
            action: onRetry || onClose
          },
          {
            label: 'Close',
            type: 'secondary',
            action: onClose
          }
        ]
      };

    case 'INVALID_AMOUNT':
      return {
        title: 'Invalid Amount',
        description: 'The swap amount is invalid. Please enter a valid amount greater than zero.',
        actions: [
          {
            label: 'Close',
            type: 'primary',
            action: onClose
          }
        ]
      };

    case 'GAS_ESTIMATION_FAILED':
      return {
        title: 'Gas Estimation Failed',
        description: 'Unable to estimate gas for this transaction. This might be due to network issues or invalid transaction parameters.',
        actions: [
          {
            label: 'Try Again',
            type: 'primary',
            action: onRetry || onClose
          },
          {
            label: 'Adjust Settings',
            type: 'secondary',
            action: onAdjustSettings || onClose
          }
        ]
      };

    case 'UNKNOWN_ERROR':
    default:
      return {
        title: 'Unexpected Error',
        description: 'An unexpected error occurred. Please try again or contact support if the problem persists.',
        actions: [
          {
            label: 'Try Again',
            type: 'primary',
            action: onRetry || onClose
          },
          {
            label: 'Close',
            type: 'secondary',
            action: onClose
          }
        ]
      };
  }
}

/**
 * Extract error message from various error types including Viem errors
 */
function extractErrorMessage(error: Error | string | unknown): string {
  // Direct string error
  if (typeof error === 'string') {
    return error;
  }

  // Standard Error object
  if (error instanceof Error) {
    let message = error.message;

    // Check for Viem-specific error properties
    const viemError = error as any;

    // Extract cause message if available (Viem often nests errors)
    if (viemError.cause?.message) {
      message += ' ' + viemError.cause.message;
    }

    // Extract shortMessage if available (Viem user-friendly message)
    if (viemError.shortMessage) {
      message += ' ' + viemError.shortMessage;
    }

    // Extract details if available
    if (viemError.details) {
      message += ' ' + viemError.details;
    }

    // Extract reason from contract revert
    if (viemError.reason) {
      message += ' ' + viemError.reason;
    }

    // Extract data.message if available (some wallets return this)
    if (viemError.data?.message) {
      message += ' ' + viemError.data.message;
    }

    return message;
  }

  // Object with message property
  if ((error as any)?.message) {
    let message = (error as any).message;

    // Check for nested error properties
    if ((error as any)?.cause?.message) {
      message += ' ' + (error as any).cause.message;
    }

    if ((error as any)?.shortMessage) {
      message += ' ' + (error as any).shortMessage;
    }

    return message;
  }

  // Fallback
  return 'Unknown error occurred';
}

/**
 * Main function to process any error and return mapped error info
 * Works with standard errors, Viem errors, and Wagmi errors
 */
export function processSwapError(
  error: Error | string | unknown,
  params: ErrorMappingParams
): MappedError {
  const errorMessage = extractErrorMessage(error);
  const errorType = classifyError(errorMessage);
  return mapErrorToUserMessage(errorType, params);
}

/**
 * Alias for processSwapError to use in other contexts (position, vault, etc.)
 * Same functionality but with a more generic name
 */
export function processTransactionError(
  error: Error | string | unknown,
  params: ErrorMappingParams
): MappedError {
  return processSwapError(error, params);
}