import React, { useEffect, useMemo } from 'react';
import { VaultWithdrawModal } from './VaultWithdrawModal';
import { ApprovalStep, ConfirmWithdrawStep, WaitingStep, SuccessStep } from './ModalSteps';
import { useVaultWithdrawModalState } from '../../hooks/vault/useVaultModalState';
import { VaultModalStep } from '../../types/vaultModal';
import type { UseVaultWithdrawReturn } from '../../hooks/vault/useVaultWithdraw';
import type { VaultToken } from '../../pages/VaultDetailPage/page';
import { getPoolDisplayToken } from '../../utils/tokenMapping';
import stickyVaultIcon from '../../assets/sticky_vault.png';

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  withdrawHook: UseVaultWithdrawReturn;
  token0: VaultToken;
  token1: VaultToken;
  withdrawAmount: bigint;
  pooledAmount0?: bigint;
  pooledAmount1?: bigint;
  vaultAddress: string;
  onSuccess?: () => void;
}

/**
 * Modal de retrait qui s'intègre avec le hook useVaultWithdraw existant
 */
export const WithdrawModal: React.FC<WithdrawModalProps> = ({
  isOpen,
  onClose,
  withdrawHook,
  token0,
  token1,
  withdrawAmount,
  pooledAmount0,
  pooledAmount1,
  vaultAddress,
  onSuccess
}) => {
  const modalState = useVaultWithdrawModalState({
    withdrawHook: {
      allowance: {
        isNeed: withdrawHook.allowance.isNeed,
        isLoading: withdrawHook.allowance.isLoading,
        hash: withdrawHook.allowance.hash
      },
      withdraw: {
        isPending: withdrawHook.withdraw.isPending,
        isLoading: withdrawHook.withdraw.isLoading,
        isSuccess: withdrawHook.withdraw.isSuccess,
        hash: withdrawHook.withdraw.hash
      }
    },
    vaultAddress
  });

  // Sync modal state with external isOpen - but don't close automatically on SUCCESS step
  useEffect(() => {
    if (isOpen && !modalState.isOpen) {
      modalState.openModal();
    } else if (!isOpen && modalState.isOpen && modalState.currentStep !== VaultModalStep.SUCCESS) {
      console.log('WithdrawModal: External isOpen=false, closing modal (not on SUCCESS step)');
      modalState.closeModal();
    } else if (!isOpen && modalState.isOpen && modalState.currentStep === VaultModalStep.SUCCESS) {
      console.log('WithdrawModal: External isOpen=false but on SUCCESS step, keeping modal open');
    }
  }, [isOpen, modalState.isOpen, modalState.currentStep]);

  // Handle success - don't call onSuccess automatically, let user see success step
  useEffect(() => {
    if (withdrawHook.withdraw.isSuccess && modalState.currentStep === VaultModalStep.SUCCESS) {
      console.log('WithdrawModal: Success detected, staying on SUCCESS step');
      // Don't call onSuccess automatically - let the user see the success step
    }
  }, [withdrawHook.withdraw.isSuccess, modalState.currentStep]);

  const { current, total } = modalState.getStepNumbers();

  // Récupérer les vrais logos
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
      case VaultModalStep.APPROVE_WITHDRAW:
        return (
          <ApprovalStep
            tokenSymbol={`${token0Display.symbol}-${token1Display.symbol}`}
            tokenLogoUri={stickyVaultIcon}
            amount={withdrawAmount}
            decimals={18}
            currentAllowance={withdrawHook.allowance.current}
            isApproving={withdrawHook.allowance.isApprove}
            onApprove={withdrawHook.allowance.allow}
          />
        );

      case VaultModalStep.CONFIRM_WITHDRAW:
        return (
          <ConfirmWithdrawStep
            vaultToken={{
              symbol: `${token0Display.symbol}-${token1Display.symbol}`,
              logoUri: stickyVaultIcon
            }}
            token0={token0Display}
            token1={token1Display}
            withdrawAmount={withdrawAmount}
            pooledAmount0={pooledAmount0}
            pooledAmount1={pooledAmount1}
            estimatedAmount0={withdrawHook.estimatedAmounts?.amount0 || 0n}
            estimatedAmount1={withdrawHook.estimatedAmounts?.amount1 || 0n}
            isPending={withdrawHook.withdraw.isPending}
            onConfirm={withdrawHook.withdraw.execute}
          />
        );

      case VaultModalStep.WAITING_WITHDRAW:
        return (
          <WaitingStep
            title="Waiting For Confirmation"
            description={`Withdraw from Sticky Vault ${token0.symbol}-${token1.symbol}`}
            message="Confirm this transaction in your wallet"
          />
        );

      case VaultModalStep.SUCCESS:
        return (
          <SuccessStep
            title="Withdrawal Successful!"
            message="Your liquidity has been successfully withdrawn from the vault!"
            txHash={withdrawHook.withdraw.hash}
            explorerUrl="https://beratrail.io"
            bearType="withdraw"
            onClose={() => {
              console.log('WithdrawModal: Success step closed, resetting all states');
              withdrawHook.withdraw.reset(); // Reset withdraw hook state (clears isSuccess)
              modalState.resetModal(); // Reset modal state and clear localStorage
              onSuccess?.(); // Call onSuccess to refresh parent component
              onClose(); // Close the modal
            }}
            autoCloseDelay={3000} // Auto-close after 3 seconds
          />
        );

      default:
        return null;
    }
  };

  return (
    <VaultWithdrawModal
      isOpen={modalState.isOpen}
      onClose={onClose}
      currentStep={modalState.currentStep}
      stepNumber={current}
      totalSteps={total}
    >
      {renderStepContent()}
    </VaultWithdrawModal>
  );
};

