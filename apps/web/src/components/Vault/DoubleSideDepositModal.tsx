import React, { useEffect, useMemo } from 'react';
import { VaultDepositModal } from './VaultDepositModal';
import { ApprovalStep, ConfirmDepositStep, WaitingStep, SuccessStep } from './ModalSteps';
import { useVaultDepositModalState } from '../../hooks/vault/useVaultModalState';
import { VaultModalStep } from '../../types/vaultModal';
import type { UseDoubleDepositReturn } from '../../hooks/vault/useDoubleDeposit';
import type { VaultToken } from '../../pages/VaultDetailPage/page';
import { getPoolDisplayToken } from '../../utils/tokenMapping';

interface DoubleSideDepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  depositHook: UseDoubleDepositReturn;
  token0: VaultToken;
  token1: VaultToken;
  amount0: bigint;
  amount1: bigint;
  initialAmount0: bigint;
  initialAmount1: bigint;
  vaultAddress: string;
  isAutoWinEnabled: boolean;
  onToggleAutoWin: (enabled: boolean) => void;
  autoWinVault?: string;
  onSuccess?: () => void;
}

/**
 * Modal de dépôt double-sided qui s'intègre avec le hook useDoubleDeposit existant
 */
export const DoubleSideDepositModal: React.FC<DoubleSideDepositModalProps> = ({
  isOpen,
  onClose,
  depositHook,
  token0,
  token1,
  amount0,
  amount1,
  initialAmount0,
  initialAmount1,
  vaultAddress,
  isAutoWinEnabled,
  onToggleAutoWin,
  autoWinVault, // Used to check if AutoWin vault exists before showing AutoCompound banner
  onSuccess
}) => {

  const modalState = useVaultDepositModalState({
    mode: 'deposit-only',
    depositHook: {
      t0Allowance: {
        isNeed: depositHook.t0Allowance.isNeed,
        isApprove: depositHook.t0Allowance.isApprove,
        hash: depositHook.t0Allowance.hash
      },
      t1Allowance: {
        isNeed: depositHook.t1Allowance.isNeed,
        isApprove: depositHook.t1Allowance.isApprove,
        hash: depositHook.t1Allowance.hash
      },
      deposite: {
        isPending: depositHook.deposite.isPending,
        isLoading: depositHook.deposite.isLoading,
        isSuccess: depositHook.deposite.isSuccess,
        hash: depositHook.deposite.hash
      }
    },
    vaultAddress
  });

  // Sync modal state with external isOpen - but don't close automatically on SUCCESS step
  useEffect(() => {
    if (isOpen && !modalState.isOpen) {
      modalState.openModal();
    } else if (!isOpen && modalState.isOpen && modalState.currentStep !== VaultModalStep.SUCCESS) {
      console.log('DoubleSideDepositModal: External isOpen=false, closing modal (not on SUCCESS step)');
      modalState.closeModal();
    } else if (!isOpen && modalState.isOpen && modalState.currentStep === VaultModalStep.SUCCESS) {
      console.log('DoubleSideDepositModal: External isOpen=false but on SUCCESS step, keeping modal open');
    }
  }, [isOpen, modalState.isOpen, modalState.currentStep]);

  // Debug: Log the current state (can be removed in production)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('DoubleSideDepositModal Debug:', {
        currentStep: modalState.currentStep,
        depositSuccess: depositHook.deposite.isSuccess,
        depositHash: depositHook.deposite.hash,
        depositPending: depositHook.deposite.isPending,
        depositLoading: depositHook.deposite.isLoading
      });
    }
  }, [modalState.currentStep, depositHook.deposite.isSuccess, depositHook.deposite.hash, depositHook.deposite.isPending, depositHook.deposite.isLoading]);

  // Handle success - don't call onSuccess automatically, let user see success step
  useEffect(() => {
    if (depositHook.deposite.isSuccess && modalState.currentStep === VaultModalStep.SUCCESS) {
      console.log('DoubleSideDepositModal: Success detected, staying on SUCCESS step');
      // Don't call onSuccess automatically - let the user see the success step
      // onSuccess will be called when the user closes the modal manually or after autoCloseDelay
    }
  }, [depositHook.deposite.isSuccess, modalState.currentStep]);

  const { current, total } = modalState.getStepNumbers();

  // Récupérer les vrais logos via getPoolDisplayToken
  const token0Display = useMemo(() => {
    const displayInfo = getPoolDisplayToken(token0.address);
    return {
      symbol: displayInfo?.symbol || token0.symbol,
      logoUri: displayInfo?.logoUri || token0.logoUri || '',
      decimals: token0.decimals
    };
  }, [token0]);

  const token1Display = useMemo(() => {
    const displayInfo = getPoolDisplayToken(token1.address);
    return {
      symbol: displayInfo?.symbol || token1.symbol,
      logoUri: displayInfo?.logoUri || token1.logoUri || '',
      decimals: token1.decimals
    };
  }, [token1]);

  // Render step content based on current step
  const renderStepContent = () => {
    switch (modalState.currentStep) {
      case VaultModalStep.APPROVE_TOKEN0:
        return (
          <ApprovalStep
            tokenSymbol={token0.symbol}
            tokenLogoUri={token0.logoUri || ''}
            amount={amount0}
            decimals={token0.decimals}
            currentAllowance={depositHook.t0Allowance.current}
            isApproving={depositHook.t0Allowance.isApprove}
            onApprove={depositHook.t0Allowance.allow}
          />
        );

      case VaultModalStep.APPROVE_TOKEN1:
        return (
          <ApprovalStep
            tokenSymbol={token1.symbol}
            tokenLogoUri={token1.logoUri || ''}
            amount={amount1}
            decimals={token1.decimals}
            currentAllowance={depositHook.t1Allowance.current}
            isApproving={depositHook.t1Allowance.isApprove}
            onApprove={depositHook.t1Allowance.allow}
          />
        );

      case VaultModalStep.WAITING_APPROVE_TOKEN0:
        return (
          <WaitingStep
            title="Waiting For Confirmation"
            description={`Approving ${token0Display.symbol}`}
            message="Confirm this transaction in your wallet"
          />
        );

      case VaultModalStep.WAITING_APPROVE_TOKEN1:
        return (
          <WaitingStep
            title="Waiting For Confirmation"
            description={`Approving ${token1Display.symbol}`}
            message="Confirm this transaction in your wallet"
          />
        );

      case VaultModalStep.CONFIRM_DEPOSIT:
        return (
          <ConfirmDepositStep
            token0={token0Display}
            token1={token1Display}
            amount0={depositHook.quote.amount0Max || amount0}
            amount1={depositHook.quote.amount1Max || amount1}
            initialAmount0={initialAmount0}
            initialAmount1={initialAmount1}
            expectedShares={depositHook.quote.minShares || 0n}
            minShares={depositHook.quote.minShares || 0n}
            hasAutoWinVault={!!autoWinVault}
            isAutoWinEnabled={isAutoWinEnabled}
            onToggleAutoWin={onToggleAutoWin}
            isPending={depositHook.deposite.isPending}
            onConfirm={depositHook.deposite.depose}
          />
        );

      case VaultModalStep.WAITING_DEPOSIT:
        return (
          <WaitingStep
            title="Waiting For Confirmation"
            description={`Supplying ${token0.symbol} and ${token1.symbol}`}
            message="Confirm this transaction in your wallet"
          />
        );

      case VaultModalStep.SUCCESS:
        const vaultName = `${token0Display.symbol}-${token1Display.symbol}`;

        return (
          <SuccessStep
            message="Your liquidity has been successfully deposited to the vault!"
            txHash={depositHook.deposite.hash}
            explorerUrl="https://berascan.com"
            onClose={() => {
              console.log('DoubleSideDepositModal: Success step closed, resetting all states');
              depositHook.deposite.reset(); // Reset deposit hook state (clears isSuccess)
              modalState.resetModal(); // Reset modal state and clear localStorage
              onSuccess?.(); // Call onSuccess to refresh parent component
              onClose(); // Close the modal
            }}
            autoCloseDelay={isAutoWinEnabled ? 3000 : 0} // Auto-close only if AutoWin is ON
            showStakingOptions={!isAutoWinEnabled} // Show staking buttons if AutoWin is OFF
            vaultAddress={vaultAddress}
            vaultName={vaultName}
          />
        );

      default:
        return null;
    }
  };

  // Callback de fermeture qui gère le reset complet
  const handleClose = () => {
    console.log('DoubleSideDepositModal: handleClose called');

    // Si on est sur SUCCESS step, faire le reset complet
    if (modalState.currentStep === VaultModalStep.SUCCESS) {
      console.log('DoubleSideDepositModal: On SUCCESS step, doing full reset');
      depositHook.deposite.reset();
      modalState.resetModal();
      onSuccess?.();
    }

    // Fermer la modal
    onClose();
  };

  return (
    <VaultDepositModal
      isOpen={modalState.isOpen}
      onClose={handleClose}
      currentStep={modalState.currentStep}
      stepNumber={current}
      totalSteps={total}
    >
      {renderStepContent()}
    </VaultDepositModal>
  );
};

