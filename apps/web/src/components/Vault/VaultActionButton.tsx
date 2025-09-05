import React from 'react';
import { useAccount } from 'wagmi';
import { ConnectButton } from '../Buttons/ConnectButton';
import type { VaultManager } from '../../hooks/useVault';

interface VaultActionButtonProps {
  size?: 'large' | 'small';
  customClassName?: string;
  vm: VaultManager,
  t0Symbol: string,
  t1Symbol: string
}

export const VaultActionButton: React.FC<VaultActionButtonProps> = ({
  size = 'large',
  customClassName = '',
  vm,
  t0Symbol,
  t1Symbol
}) => {
  const { isConnected } = useAccount();

  // Si l'utilisateur n'est pas connecté, utiliser le ConnectButton standard
  if (!isConnected) {
    return (
      <ConnectButton
        size={size}
        customClassName={customClassName}
        onClick={() => { }}
      />
    );
  }

  // Il manque des amounts
  if (!vm.isReady) {
    return (
      <button
        className={`btn btn--${size} btn__disabled ${customClassName}`.trim()}
        disabled
      >
        Enter amount
      </button>
    );
  }

  // Il faut approve un token
  if (!vm.isAllow) {
    const handler = vm.isWithdraw
      ? vm.burnAllowance.allow
      : vm.t0Allowance.isNeed ? vm.t0Allowance.allow : vm.t10Allowance.allow
    const text = vm.isWithdraw
      ? 'burn'
      : vm.t0Allowance.isNeed ? t0Symbol : t1Symbol

    return (
      <button
        className={`btn btn--${size} btn__main ${customClassName}`.trim()}
        onClick={handler}
      >
        Approve {text}
      </button>
    );
  }


  if (vm.isDeposite) {
    return (
      <button
        className={`btn btn--${size} btn__main ${customClassName}`.trim()}
        onClick={vm.depositeTwoSide.depose}
      >
        Deposit
      </button>
    );
  } else {
    return (
      <button
        className={`btn btn--${size} btn__main ${customClassName}`.trim()}
        onClick={vm.withdraw.burn}
      >
        Withdraw
      </button>
    )
  }



  return (
    <button
      className={`btn btn--${size} btn__disabled ${customClassName}`.trim()}
      disabled
    >
      Error
    </button>
  );

};

