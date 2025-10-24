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
  showStakingOptions?: boolean; // Show external staking options (Infrared, Berahub)
  vaultAddress?: string; // Adresse du vault pour BeraHub
  vaultName?: string; // Nom du vault pour Infrared (ex: "NECT-HONEY")
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
  bearType = 'increase', // Par défaut increase
  showStakingOptions = false, // Par défaut pas de boutons staking
  vaultAddress,
  vaultName
}) => {
  console.log('SuccessStep: Component rendered with autoCloseDelay:', autoCloseDelay);

  // Générer les URLs dynamiquement
  const infraredUrl = vaultName
    ? `https://infrared.finance/pol-vaults/winnieswap-${vaultName.toLowerCase().replace(/\s+/g, '-')}`
    : null;

  const berahubUrl = vaultAddress
    ? `https://hub.berachain.com/earn/${vaultAddress}/`
    : null;

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

      {/* Staking Options (if AutoWin is OFF) */}
      {showStakingOptions && (infraredUrl || berahubUrl) && (
        <div className="VaultDepositModal__StakingOptions">
          <p className="staking-prompt">Want to earn more? Stake your sticky tokens to:</p>
          <div className="staking-buttons">
            {infraredUrl && (
              <a
                href={infraredUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn--large btn__main staking-btn infrared-btn"
              >
                <img
                  src="/src/assets/infrared-wordmark-black.png"
                  alt="Stake on Infrared"
                  className="infrared-logo"
                />
              </a>
            )}
            {berahubUrl && (
              <a
                href={berahubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn--large btn__main staking-btn"
              >
                Stake on BeraHub
              </a>
            )}
          </div>
        </div>
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

