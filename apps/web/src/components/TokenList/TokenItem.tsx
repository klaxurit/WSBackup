import React, { useState } from 'react';
import { Loader } from '../Loader/Loader';
import { formatUnits, zeroAddress } from 'viem';
import { useAccount, useBalance } from 'wagmi';
import type { BerachainToken } from '../../hooks/useBerachainTokenList';
import { FallbackImg } from '../utils/FallbackImg';

interface NetworkItemProps {
  token: BerachainToken;
  isSelected: boolean;
  onSelect: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
  balance?: string;
  loading?: boolean;
}

const baseExplorer = import.meta.env.VITE_NODE_ENV === "production"
  ? "https://berascan.com/token/"
  : "https://bepolia.beratrail.io/token/"

export const TokenItem: React.FC<NetworkItemProps> = ({
  token,
  isSelected,
  onSelect,
}) => {
  const { address } = useAccount()
  const [displayFallback, setDisplayFallback] = useState<boolean>(false)
  const { data: balance, isLoading: isLoading } = useBalance({
    address,
    token: token.address === zeroAddress ? undefined : (token.address as `0x${string}`)
  })

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
        {isLoading
          ? (
            <span className="Modal__ItemPrice">
              <Loader size="mini" />
            </span>
          ) : (
            <>
              <span className="Modal__ItemPrice">
                {balance && balance.value !== 0n && token.lastPrice && token.lastPrice !== 0
                  ? `$${(token.lastPrice * +formatUnits(balance.value, token.decimals || 18)).toFixed(2)}`
                  : ''
                }
              </span>
              <span className="Modal__ItemBalance">
                {balance && balance.value !== 0n
                  ? `${parseFloat(formatUnits(balance.value, token.decimals || 18)).toFixed(4)}`
                  : ''
                }
              </span>
            </>
          )}
      </div>
    </div>
  );
}; 
