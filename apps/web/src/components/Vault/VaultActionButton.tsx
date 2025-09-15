import React, { useMemo } from 'react';
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
  const allowData = useMemo(() => {
    if (vm.isWithdraw) return { handler: vm.burnAllowance.allow, text: "withdraw" }
    if (vm.isDeposite && vm.isOneSide) return { handler: vm.osAllowance.allow, text: "deposit" }
    if (vm.t0Allowance.isNeed) return { handler: vm.t0Allowance.allow, text: t0Symbol }
    if (vm.t1Allowance.isNeed) return { handler: vm.t1Allowance.allow, text: t1Symbol }

    return { handler: () => { }, text: '' }
  }, [vm])

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
    return (
      <button
        className={`btn btn--${size} btn__main ${customClassName}`.trim()}
        onClick={allowData.handler}
      >
        Approve {allowData.text}
      </button>
    );
  }


  if (vm.isDeposite) {
    return (
      <button
        className={`btn btn--${size} btn__main ${customClassName}`.trim()}
        onClick={vm.isOneSide ? vm.depositeOneSide.depose : vm.depositeTwoSide.depose}
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

