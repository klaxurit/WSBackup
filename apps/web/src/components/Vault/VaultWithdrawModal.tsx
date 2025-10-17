import React from 'react';
import { Modal } from '../Common/Modal';
import { VaultTimeline } from './VaultTimeline';
import { VaultModalStep } from '../../types/vaultModal';

interface VaultWithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStep: VaultModalStep;
  stepNumber: number;
  totalSteps: number;
  children: React.ReactNode;
}

/**
 * Modal principale pour le retrait d'un vault
 */
export const VaultWithdrawModal: React.FC<VaultWithdrawModalProps> = ({
  isOpen,
  onClose,
  currentStep,
  stepNumber,
  totalSteps,
  children
}) => {
  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      className="VaultDepositModal__Box"
      overlayClassName="VaultDepositModal__Overlay"
    >
      <div className="VaultDepositModal">
        {/* Header avec Title et Close Button */}
        <div className="VaultDepositModal__Header">
          <span className="VaultDepositModal__Title">
            {currentStep === VaultModalStep.SUCCESS
              ? 'Withdrawal Successful!'
              : 'Withdraw from Sticky Vault'
            }
          </span>
          <button className="VaultDepositModal__Close" onClick={onClose} aria-label="Close">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 6L14 14M14 6L6 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Timeline */}
        <VaultTimeline currentStep={stepNumber} totalSteps={totalSteps} />

        {/* Contenu dynamique selon l'étape */}
        <div className="VaultDepositModal__Content">
          {children}
        </div>
      </div>
    </Modal>
  );
};

