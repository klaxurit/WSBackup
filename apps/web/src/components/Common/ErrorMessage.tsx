import React from 'react';
import './ErrorMessage.scss';

interface ErrorMessageProps {
  error: Error | null;
  className?: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ error, className = '' }) => {
  if (!error) return null;

  const getErrorMessage = (error: Error): string => {
    const message = error.message || error.toString();

    // Messages spécifiques pour les erreurs communes
    if (message.includes('User rejected') || message.includes('user rejected')) {
      return 'Transaction cancelled by user';
    }

    if (message.includes('insufficient funds') || message.includes('Insufficient funds')) {
      return 'Insufficient funds for transaction';
    }

    if (message.includes('gas required exceeds allowance') || message.includes('out of gas')) {
      return 'Insufficient ETH for gas fees';
    }

    if (message.includes('execution reverted')) {
      return 'Transaction failed - contract execution error';
    }

    if (message.includes('nonce too low')) {
      return 'Transaction nonce error - please refresh and try again';
    }

    if (message.includes('replacement transaction underpriced')) {
      return 'Transaction fee too low - increase gas price';
    }

    if (message.includes('slippage')) {
      return 'Price changed too much - try increasing slippage tolerance';
    }

    if (message.includes('deadline')) {
      return 'Transaction deadline exceeded - please try again';
    }

    if (message.includes('allowance')) {
      return 'Token approval required';
    }

    if (message.includes('STF')) {
      return 'Slippage tolerance exceeded - price moved unfavorably';
    }

    // Message générique pour les autres erreurs
    return (error as any).shortMessage || message || 'Transaction failed';
  };

  const getErrorType = (error: Error): 'warning' | 'error' => {
    const message = error.message || error.toString();

    if (message.includes('User rejected') || message.includes('user rejected')) {
      return 'warning';
    }

    return 'error';
  };

  const errorType = getErrorType(error);
  const errorMessage = getErrorMessage(error);

  return (
    <div className={`error-message error-message--${errorType} ${className}`}>
      <div className="error-message__icon">
        {errorType === 'warning' ? '⚠️' : '❌'}
      </div>
      <div className="error-message__content">
        <div className="error-message__text">{errorMessage}</div>
        {process.env.NODE_ENV === 'development' && (
          <details className="error-message__details">
            <summary>Technical details</summary>
            <pre>{error.message}</pre>
          </details>
        )}
      </div>
    </div>
  );
};

export default ErrorMessage;