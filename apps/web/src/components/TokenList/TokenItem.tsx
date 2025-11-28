import React, { useState } from 'react';
import type { BerachainToken } from '../../hooks/useBerachainTokenList';
import { TokenLogo } from '../Common/TokenLogo';
import { formatTokenForDisplay } from '../../utils/tokenDisplay';

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
  const [displayFallback] = useState<boolean>(false)

  // Les balances et prix USD sont maintenant fournis directement par le backend
  const balance = token.balance || '';
  const balanceUsd = token.balanceUSD || 0;

  // Apply Sticky Vault formatting if needed
  const displayToken = formatTokenForDisplay(token);

  return (
    <div
      className={`Modal__Item${isSelected ? ' selected' : ''}`}
      onClick={onSelect}
      tabIndex={0}
    >
      <div className="Modal__ItemLogo">
        <TokenLogo logoUri={!displayFallback ? token.logoUri : null} symbol={token.symbol} size="large" className="Modal__ItemImage" />
      </div>
      <div className="Modal__ItemInfo">
        <span className="Modal__ItemName">{displayToken.name}</span>
        <div className="Modal__ItemDetails">
          <span className="Modal__ItemSymbol">{displayToken.symbol}</span>
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
