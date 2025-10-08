import React, { useEffect, useMemo, useState } from 'react';
import { VaultDepositModal } from './VaultDepositModal';
import { ApprovalStep, ConfirmDepositStep, WaitingStep, SuccessStep } from './ModalSteps';
import { useVaultDepositModalState } from '../../hooks/vault/useVaultModalState';
import { VaultModalStep } from '../../types/vaultModal';
import type { UseSingleDepositReturn } from '../../hooks/vault/useSingleDeposit';
import type { VaultToken } from '../../pages/VaultDetailPage/page';
import { getPoolDisplayToken } from '../../utils/tokenMapping';

interface SingleSideDepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  depositHook: UseSingleDepositReturn;
  tokenIn: VaultToken;
  tokenOut: VaultToken;
  amount: bigint;
  vaultAddress: string;
  enableAutoWin?: boolean;
  autoWinVault?: string;
  onSuccess?: () => void;
}

/**
 * Modal de dépôt single-sided qui s'intègre avec le hook useSingleDeposit existant
 */
export const SingleSideDepositModal: React.FC<SingleSideDepositModalProps> = ({
  isOpen,
  onClose,
  depositHook,
  tokenIn,
  tokenOut,
  amount,
  vaultAddress,
  enableAutoWin,
  autoWinVault, // Used to check if AutoWin vault exists before showing AutoCompound banner
  onSuccess
}) => {
  // Local state for AutoWin toggle (can be changed in modal)
  const [isAutoWinEnabled, setIsAutoWinEnabled] = useState(enableAutoWin || false);

  // Reset local state when modal opens with new initial value
  useEffect(() => {
    if (isOpen) {
      setIsAutoWinEnabled(enableAutoWin || false);
    }
  }, [isOpen, enableAutoWin]);

  const modalState = useVaultDepositModalState({
    mode: 'single-sided',
    depositHook: {
      allowance: {
        isNeed: depositHook.allowance.isNeed,
        isApprove: depositHook.allowance.isApprove,
        hash: depositHook.allowance.hash
      },
      deposit: {
        isPending: depositHook.deposit.isPending,
        isLoading: depositHook.deposit.isLoading,
        isSuccess: depositHook.deposit.isSuccess,
        hash: depositHook.deposit.hash
      }
    },
    vaultAddress
  });

  // Sync modal state with external isOpen - but don't close automatically on SUCCESS step
  useEffect(() => {
    if (isOpen && !modalState.isOpen) {
      modalState.openModal();
    } else if (!isOpen && modalState.isOpen && modalState.currentStep !== VaultModalStep.SUCCESS) {
      console.log('SingleSideDepositModal: External isOpen=false, closing modal (not on SUCCESS step)');
      modalState.closeModal();
    } else if (!isOpen && modalState.isOpen && modalState.currentStep === VaultModalStep.SUCCESS) {
      console.log('SingleSideDepositModal: External isOpen=false but on SUCCESS step, keeping modal open');
    }
  }, [isOpen, modalState.isOpen, modalState.currentStep]);

  // Handle success - don't call onSuccess automatically, let user see success step
  useEffect(() => {
    if (depositHook.deposit.isSuccess && modalState.currentStep === VaultModalStep.SUCCESS) {
      console.log('SingleSideDepositModal: Success detected, staying on SUCCESS step');
      // Don't call onSuccess automatically - let the user see the success step
    }
  }, [depositHook.deposit.isSuccess, modalState.currentStep]);

  const { current, total } = modalState.getStepNumbers();

  // Récupérer les vrais logos
  const tokenInDisplay = useMemo(() => {
    const displayInfo = getPoolDisplayToken(tokenIn.address);
    return {
      symbol: displayInfo?.symbol || tokenIn.symbol,
      logoUri: displayInfo?.logoUri || tokenIn.logoUri || '',
      decimals: tokenIn.decimals
    };
  }, [tokenIn]);

  const tokenOutDisplay = useMemo(() => {
    const displayInfo = getPoolDisplayToken(tokenOut.address);
    return {
      symbol: displayInfo?.symbol || tokenOut.symbol,
      logoUri: displayInfo?.logoUri || tokenOut.logoUri || '',
      decimals: tokenOut.decimals
    };
  }, [tokenOut]);

  // Render step content based on current step
  const renderStepContent = () => {
    switch (modalState.currentStep) {
      case VaultModalStep.APPROVE_SINGLE_TOKEN:
        return (
          <ApprovalStep
            tokenSymbol={tokenInDisplay.symbol}
            tokenLogoUri={tokenInDisplay.logoUri}
            amount={amount}
            decimals={tokenInDisplay.decimals}
            currentAllowance={depositHook.allowance.current}
            isApproving={depositHook.allowance.isApprove}
            onApprove={depositHook.allowance.allow}
          />
        );

      case VaultModalStep.CONFIRM_DEPOSIT:
        // For single-sided, we show simplified confirm with estimated shares
        return (
          <ConfirmDepositStep
            token0={tokenInDisplay}
            token1={tokenOutDisplay}
            amount0={depositHook.swapQuote.amountIn}
            amount1={depositHook.swapQuote.amountOut || 0n}
            expectedShares={depositHook.vaultQuote.minShares || 0n}
            minShares={depositHook.vaultQuote.minShares || 0n}
            hasAutoWinVault={!!autoWinVault}
            isAutoWinEnabled={isAutoWinEnabled}
            onToggleAutoWin={setIsAutoWinEnabled}
            isPending={depositHook.deposit.isPending}
            onConfirm={depositHook.deposit.execute}
          />
        );

      case VaultModalStep.WAITING_DEPOSIT:
        return (
          <WaitingStep
            title="Waiting For Confirmation"
            description={`Zapping ${tokenIn.symbol} into the vault`}
            message="Confirm this transaction in your wallet"
          />
        );

      case VaultModalStep.SUCCESS:
        return (
          <SuccessStep
            message="Your liquidity has been successfully deposited to the vault!"
            txHash={depositHook.deposit.hash}
            explorerUrl="https://beratrail.io"
            onClose={() => {
              console.log('SingleSideDepositModal: Success step closed, resetting all states');
              depositHook.deposit.reset(); // Reset deposit hook state (clears isSuccess)
              modalState.resetModal(); // Reset modal state and clear localStorage
              onSuccess?.(); // Call onSuccess to refresh parent component
              onClose(); // Close the modal
            }}
            autoCloseDelay={isAutoWinEnabled ? 3000 : 0} // Auto-close only if AutoWin is ON
            showStakingOptions={!isAutoWinEnabled} // Show staking buttons if AutoWin is OFF
          />
        );

      default:
        return null;
    }
  };

  return (
    <VaultDepositModal
      isOpen={modalState.isOpen}
      onClose={onClose}
      currentStep={modalState.currentStep}
      stepNumber={current}
      totalSteps={total}
    >
      {renderStepContent()}
    </VaultDepositModal>
  );
};

