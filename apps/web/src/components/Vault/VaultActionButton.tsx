import React from 'react';
import { useAccount } from 'wagmi';
import { ConnectButton } from '../Buttons/ConnectButton';

interface VaultActionButtonProps {
  action: 'deposit' | 'withdraw';
  amount: bigint;
  size?: 'large' | 'small';
  customClassName?: string;
  onClick?: () => void;
}

export const VaultActionButton: React.FC<VaultActionButtonProps> = ({
  action,
  amount,
  size = 'large',
  customClassName = '',
  onClick
}) => {
  const { address, isConnected } = useAccount();

  // Si l'utilisateur n'est pas connecté, utiliser le ConnectButton standard
  if (!isConnected) {
    return (
      <ConnectButton
        size={size}
        customClassName={customClassName}
        onClick={onClick}
      />
    );
  }

  // Si l'utilisateur est connecté mais n'a pas saisi de montant
  if (amount === 0n) {
    return (
      <button
        className={`btn btn--${size} btn__disabled ${customClassName}`.trim()}
        disabled
      >
        Enter amount
      </button>
    );
  }

  // Si l'utilisateur est connecté et a saisi un montant
  const buttonText = action === 'deposit' ? 'Deposit' : 'Withdraw';

  return (
    <button
      className={`btn btn--${size} btn__main ${customClassName}`.trim()}
      onClick={onClick}
    >
      {buttonText}
    </button>
  );
};

