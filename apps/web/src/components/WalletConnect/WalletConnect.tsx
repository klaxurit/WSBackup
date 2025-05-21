import React from 'react';
import { useAppSelector } from '../../store/hooks';
import { useWallet } from '../../hooks/useWallet';
import '../../styles/WalletConnect.scss';

export const WalletConnect: React.FC = () => {
  const { address, isConnected } = useAppSelector((state) => state.wallet);
  const { disconnect } = useWallet();

  const formatAddress = (addr: string) => {
    if (!addr) return '';
    const start = addr.substring(0, 6);
    const end = addr.substring(addr.length - 4);
    return `${start}...${end}`;
  };

  if (!isConnected || !address) {
    return null;
  }

  return (
    <div className="wallet-connect">
      <div className="wallet-info">
        <div className="wallet-address">
          <span className="label">Adresse :</span>
          <span className="value">{formatAddress(address)}</span>
        </div>
      </div>
      <button
        className="disconnect-button"
        onClick={() => disconnect()}
      >
        Déconnecter
      </button>
    </div>
  );
}; 