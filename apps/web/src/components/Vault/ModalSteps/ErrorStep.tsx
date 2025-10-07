import React from 'react';

interface ErrorStepProps {
  title?: string;
  error: string;
  errorCode?: string;
  onRetry: () => void;
  onClose: () => void;
}

/**
 * Étape d'erreur en cas de problème
 */
export const ErrorStep: React.FC<ErrorStepProps> = ({
  title = 'Transaction Failed',
  error,
  errorCode,
  onRetry,
  onClose
}) => {
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
      <h3 className="VaultDepositModal__ErrorTitle">{title}</h3>

      {/* Error Message */}
      <div className="VaultDepositModal__ErrorMessage">
        <p>{error}</p>
        {errorCode && <code className="error-code">{errorCode}</code>}
      </div>

      {/* Action Buttons */}
      <div className="VaultDepositModal__ErrorActions">
        <button
          className="btn btn--large btn__main"
          onClick={onRetry}
        >
          Try Again
        </button>
        <button
          className="btn btn--large btn__shade"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
};

