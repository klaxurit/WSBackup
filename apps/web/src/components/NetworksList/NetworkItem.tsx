import React from 'react';
import { Loader } from '../Loader/Loader';
import { formatEther } from 'viem';
import { useAccount, useBalance } from 'wagmi';

interface NetworkItemProps {
  token: {
    name: string;
    symbol: string;
    address: string | null;
    logo?: string;
    decimals: number;
    logoURI: string;
  };
  isSelected: boolean;
  onSelect: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
  balance?: string;
  loading?: boolean;
}

const DEFAULT_IMAGE = '/default-token.png';

export const NetworkItem: React.FC<NetworkItemProps> = ({
  token,
  isSelected,
  onSelect,
}) => {

  const { address } = useAccount()
  const { data: balance2, isLoading } = useBalance({
    address,
    token: (token.address as `0x${string}`)
  })

  return (
    <div
      className={`Modal__Item${isSelected ? ' selected' : ''}`}
      onClick={onSelect}
      tabIndex={0}
    >
      <div className="Modal__ItemLogo">
        <img
          src={token.logoURI || DEFAULT_IMAGE}
          alt={token.name}
          className="Modal__ItemImage"
        />
      </div>
      <div className="Modal__ItemInfo">
        <span className="Modal__ItemName">{token.name}</span>
        <div className="Modal__ItemDetails">
          <span className="Modal__ItemSymbol">{token.symbol}</span>
          {token.address && (
            <span className="Modal__ItemAddress">
              {token.address.slice(0, 6) + '...' + token.address.slice(-4)}
            </span>
          )}
        </div>
      </div>
      <div className="Modal__ItemBalanceContainer">
        <span className="Modal__ItemPrice">$0.00</span>
        <span className="Modal__ItemBalance">
          {/* {loading ? <Loader /> : (balance !== undefined ? `${parseFloat(balance).toFixed(4)}` : '--')} */}
          {isLoading ? <Loader /> : (balance2 ? `${parseInt(formatEther(balance2.value)).toFixed(4)}` : '--')}
        </span>
      </div>
    </div>
  );
}; 
