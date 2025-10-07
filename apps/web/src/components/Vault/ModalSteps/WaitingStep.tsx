import React from 'react';
import { Loader } from '../../Loader/Loader';

interface WaitingStepProps {
  title: string;
  description: string;
  message?: string;
}

/**
 * Étape d'attente pendant une transaction
 * Affiche un loader et des informations sur ce qui se passe
 */
export const WaitingStep: React.FC<WaitingStepProps> = ({
  title,
  description,
  message = 'Confirm this transaction in your wallet'
}) => {
  return (
    <div className="VaultDepositModal__StepContent VaultDepositModal__WaitingStep">
      {/* Loader */}
      <div className="VaultDepositModal__LoaderContainer">
        <Loader size="desktop" color="#FFD056" className="btn__main-loader" />
      </div>

      {/* Title */}
      <h3 className="VaultDepositModal__WaitingTitle">{title}</h3>

      {/* Description */}
      <p className="VaultDepositModal__WaitingDescription">{description}</p>

      {/* Message */}
      <p className="VaultDepositModal__WaitingMessage">{message}</p>
    </div>
  );
};

