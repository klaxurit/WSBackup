import React from 'react';
import { ErrorMessage } from './ErrorMessage';
import './TransactionStatus.scss';

interface TransactionStatusProps {
  status: 'idle' | 'pending' | 'success' | 'error';
  hash?: string;
  error?: Error | null;
  onClose?: () => void;
  onRetry?: () => void;
  title?: string;
  description?: string;
}

export const TransactionStatus: React.FC<TransactionStatusProps> = ({
  status,
  hash,
  error,
  onClose,
  onRetry,
  title,
  description
}) => {
  if (status === 'idle') return null;

  const getStatusConfig = () => {
    switch (status) {
      case 'pending':
        return {
          icon: '⏳',
          title: title || 'Transaction Pending',
          description: description || 'Please wait while your transaction is being processed...',
          className: 'transaction-status--pending'
        };
      case 'success':
        return {
          icon: '✅',
          title: title || 'Transaction Successful',
          description: description || 'Your transaction has been completed successfully.',
          className: 'transaction-status--success'
        };
      case 'error':
        return {
          icon: '❌',
          title: title || 'Transaction Failed',
          description: description || 'There was an error processing your transaction.',
          className: 'transaction-status--error'
        };
      default:
        return {
          icon: '🔄',
          title: 'Processing...',
          description: '',
          className: 'transaction-status--idle'
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div className={`transaction-status ${config.className}`}>
      <div className="transaction-status__content">
        <div className="transaction-status__header">
          <div className="transaction-status__icon">{config.icon}</div>
          <h3 className="transaction-status__title">{config.title}</h3>
        </div>

        {config.description && (
          <p className="transaction-status__description">{config.description}</p>
        )}

        {status === 'pending' && (
          <div className="transaction-status__spinner">
            <div className="spinner"></div>
          </div>
        )}

        {status === 'error' && error && (
          <ErrorMessage error={error} className="transaction-status__error" />
        )}

        {hash && (
          <div className="transaction-status__links">
            <a
              href={`https://berascan.com/tx/${hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="transaction-status__link"
            >
              View on Block Explorer 🔗
            </a>
          </div>
        )}
      </div>

      <div className="transaction-status__actions">
        {status === 'error' && onRetry && (
          <button
            onClick={onRetry}
            className="btn btn--small btn__accent transaction-status__retry"
          >
            Retry Transaction
          </button>
        )}

        {(status === 'success' || status === 'error') && onClose && (
          <button
            onClick={onClose}
            className="btn btn--small btn__secondary transaction-status__close"
          >
            Close
          </button>
        )}
      </div>
    </div>
  );
};

// Hook utilitaire pour gérer le statut de transaction
export const useTransactionStatus = (
  txHash?: string,
  receipt?: any,
  error?: Error | null,
  isPending?: boolean
) => {
  if (error) return 'error';
  if (receipt) return 'success';
  if (isPending || txHash) return 'pending';
  return 'idle';
};

export default TransactionStatus;