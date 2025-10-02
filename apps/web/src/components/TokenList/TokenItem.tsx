import React, { useState } from 'react';
import type { BerachainToken } from '../../hooks/useBerachainTokenList';
import { FallbackImg } from '../utils/FallbackImg';

interface NetworkItemProps {
  token: BerachainToken;
  isSelected: boolean;
  onSelect: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
}

const baseExplorer = import.meta.env.VITE_NODE_ENV === "production"
  ? "https://berascan.com/token/"
  : "https://bepolia.beratrail.io/token/"

export const TokenItem: React.FC<NetworkItemProps> = ({
  token,
  isSelected,
  onSelect,
}) => {
  const [displayFallback, setDisplayFallback] = useState<boolean>(false)

  // Les balances et prix USD sont maintenant fournis directement par le backend
  const balance = token.balance || '';
  const balanceUsd = token.balanceUSD || 0;

  return (
    <div
      className={`Modal__Item${isSelected ? ' selected' : ''}`}
      onClick={onSelect}
      tabIndex={0}
    >
      <div className="Modal__ItemLogo">
        {displayFallback || !token.logoUri
          ? <FallbackImg content={token.symbol} />
          : (
            <img
              src={token.logoUri}
              alt={token.name}
              onError={() => setDisplayFallback(true)}
              className="Modal__ItemImage"
            />
          )}
      </div>
      <div className="Modal__ItemInfo">
        <span className="Modal__ItemName">{token.name}</span>
        <div className="Modal__ItemDetails">
          <span className="Modal__ItemSymbol">{token.symbol}</span>
          {token.address && (
            <a href={`${baseExplorer}${token.address}`} target='_blank' onClick={(e) => e.stopPropagation()}>
              <span className="Modal__ItemAddress">
                {token.address.slice(0, 6) + '...' + token.address.slice(-4)}
              </span>
            </a>
          )}
        </div>
      </div>
      <div className="Modal__ItemBalanceContainer">
        <>
          <span className="Modal__ItemBalance">
            {balance && parseFloat(balance) > 0
              ? `${parseFloat(balance).toFixed(4)}`
              : ''
            }
          </span>
          <span className="Modal__ItemPrice">
            {balanceUsd && balanceUsd > 0 ? `$${balanceUsd.toFixed(2)}` : ''}
          </span>
        </>
      </div>
    </div>
  );
}; 
