import React, { useMemo } from 'react';
import { processTransactionError, type ErrorAction } from '../../../utils/errorMapping';

interface ErrorStepProps {
  title?: string;
  error: string | Error | unknown;
  errorCode?: string;
  onRetry?: () => void;
  onClose: () => void;
  onAdjustSettings?: () => void;
  onApprove?: () => void;
}

/**
 * Enhanced error step with user-friendly error mapping
 * Automatically processes errors to show clear, actionable messages
 */
export const ErrorStep: React.FC<ErrorStepProps> = ({
  title,
  error,
  errorCode,
  onRetry,
  onClose,
  onAdjustSettings,
  onApprove
}) => {
  // Process error to get user-friendly message and actions
  const errorInfo = useMemo(() => {
    // If error is a string and we have a custom title, use them directly
    if (typeof error === 'string' && title) {
      return {
        title,
        description: error,
        actions: [
          ...(onRetry ? [{
            label: 'Try Again',
            type: 'primary' as const,
            action: onRetry
          }] : []),
          {
            label: 'Close',
            type: 'secondary' as const,
            action: onClose
          }
        ] as ErrorAction[]
      };
    }

    // Otherwise, use the error mapping utility
    return processTransactionError(error, {
      onRetry,
      onAdjustSettings,
      onClose,
      onApprove
    });
  }, [error, title, onRetry, onClose, onAdjustSettings, onApprove]);

  return (
    <div className="VaultDepositModal__StepContent VaultDepositModal__ErrorStep">
      {/* Error Icon */}
      <div className="VaultDepositModal__ErrorIcon">
        <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
          <circle cx="32" cy="32" r="32" fill="rgba(244, 67, 54, 0.2)" />
          <path
            d="M24 24L40 40M40 24L24 40"
            stroke="#F44336"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Title */}
      <h3 className="VaultDepositModal__ErrorTitle">{errorInfo.title}</h3>

      {/* Error Message */}
      <div className="VaultDepositModal__ErrorMessage">
        <p>{errorInfo.description}</p>
        {errorCode && <code className="error-code">{errorCode}</code>}
      </div>

      {/* Action Buttons */}
      <div className="VaultDepositModal__ErrorActions">
        {errorInfo.actions.map((action, index) => (
          <button
            key={index}
            className={`btn btn--large ${action.type === 'primary' ? 'btn__main' : 'btn__shade'}`}
            onClick={action.action}
          >
            {action.label}
          </button>
        ))}
      </div>
    </div>
  );
};

