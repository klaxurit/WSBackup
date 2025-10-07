import React, { useEffect } from 'react';
import { ExplorerIcon } from '../../SVGs';

interface SuccessStepProps {
  title?: string;
  message: string;
  txHash?: string;
  explorerUrl?: string;
  onClose: () => void;
  autoCloseDelay?: number; // Délai en millisecondes avant fermeture automatique
  bearType?: 'increase' | 'withdraw'; // Type d'ourson à afficher
}

/**
 * Étape de succès après une transaction
 */
export const SuccessStep: React.FC<SuccessStepProps> = ({
  title = 'Transaction Successful!',
  message,
  txHash,
  explorerUrl,
  onClose,
  autoCloseDelay = 5000, // 5 secondes par défaut
  bearType = 'increase' // Par défaut increase
}) => {
  console.log('SuccessStep: Component rendered with autoCloseDelay:', autoCloseDelay);

  // Fermeture automatique après le délai
  useEffect(() => {
    if (autoCloseDelay > 0) {
      console.log('SuccessStep: Setting auto-close timer for', autoCloseDelay, 'ms');
      const timer = setTimeout(() => {
        console.log('SuccessStep: Auto-close timer triggered');
        onClose();
      }, autoCloseDelay);

      return () => {
        console.log('SuccessStep: Clearing auto-close timer');
        clearTimeout(timer);
      };
    }
  }, [onClose, autoCloseDelay]);
  return (
    <div className="VaultDepositModal__StepContent VaultDepositModal__SuccessStep">
      {/* Title */}
      <h3 className="VaultDepositModal__SuccessTitle">{title}</h3>

      {/* Message */}
      <p className="VaultDepositModal__SuccessMessage">{message}</p>

      {/* Transaction Link */}
      {txHash && explorerUrl && (
        <a
          href={`${explorerUrl}/tx/${txHash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="VaultDepositModal__TxLink"
        >
          <span>View on Explorer</span>
          <ExplorerIcon />
        </a>
      )}

      {/* Close Button with animated bear above */}
      <button
        className="btn btn--large btn__main VaultDepositModal__SuccessButton"
        onClick={() => {
          console.log('SuccessStep: Close button clicked');
          onClose();
        }}
      >
        <div className={bearType === 'withdraw' ? 'withdraw-bear' : 'increase-bear'} />
        Close
      </button>
    </div>
  );
};

