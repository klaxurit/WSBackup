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
 */
const ERROR_PATTERNS: Record<ErrorType, string[]> = {
  INSUFFICIENT_BALANCE: [
    'insufficient balance',
    'balance too low',
    'not enough',
    'transfer amount exceeds balance',
    'insufficient funds'
  ],
  SLIPPAGE_EXCEEDED: [
    'slippage tolerance exceeded',
    'price slippage',
    'too much slippage',
    'slippage too high',
    'price moved too much'
  ],
  EXECUTION_REVERTED: [
    'execution reverted',
    'transaction reverted',
    'revert',
    'call exception',
    'failed to execute'
  ],
  USER_REJECTED: [
    'user rejected',
    'user denied',
    'cancelled by user',
    'transaction was cancelled',
    'rejected transaction'
  ],
  NETWORK_ERROR: [
    'network error',
    'connection failed',
    'timeout',
    'rpc error',
    'network timeout',
    'fetch failed'
  ],
  APPROVAL_NEEDED: [
    'approval needed',
    'allowance',
    'approve token',
    'insufficient allowance'
  ],
  INSUFFICIENT_LIQUIDITY: [
    'insufficient liquidity',
    'not enough liquidity',
    'liquidity too low',
    'no liquidity'
  ],
  DEADLINE_EXCEEDED: [
    'deadline exceeded',
    'transaction too old',
    'expired',
    'deadline passed'
  ],
  INVALID_AMOUNT: [
    'invalid amount',
    'amount too small',
    'amount too large',
    'zero amount'
  ],
  GAS_ESTIMATION_FAILED: [
    'gas estimation failed',
    'cannot estimate gas',
    'gas limit exceeded',
    'out of gas'
  ],
  UNKNOWN_ERROR: []
};

/**
 * Classify error based on error message
 */
export function classifyError(errorMessage: string): ErrorType {
  const message = errorMessage.toLowerCase();

  for (const [errorType, patterns] of Object.entries(ERROR_PATTERNS)) {
    if (patterns.some(pattern => message.includes(pattern))) {
      return errorType as ErrorType;
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
 * Main function to process any error and return mapped error info
 */
export function processSwapError(
  error: Error | string | unknown,
  params: ErrorMappingParams
): MappedError {
  let errorMessage = '';

  if (error instanceof Error) {
    errorMessage = error.message;
  } else if (typeof error === 'string') {
    errorMessage = error;
  } else if ((error as any)?.message) {
    errorMessage = (error as any).message
  } else {
    errorMessage = 'Unknown error occurred';
  }

  const errorType = classifyError(errorMessage);
  return mapErrorToUserMessage(errorType, params);
}