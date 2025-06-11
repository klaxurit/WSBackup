import React, { useState } from 'react';
import { Loader } from '../Loader/Loader';
import { formatEther, zeroAddress } from 'viem';
import { useAccount, useBalance } from 'wagmi';
import type { BerachainToken } from '../../hooks/useBerachainTokenList';

interface NetworkItemProps {
  token: BerachainToken;
  isSelected: boolean;
  onSelect: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
  balance?: string;
  loading?: boolean;
}

const FallbackImg = ({ content }: { content: string }) => {
  return (
    <svg
      width={32}
      height={32}
      viewBox="0 0 100 100"
      className="rounded-full"
    >
      <circle
        cx="50"

        cy="50"
        r="50"
        fill="#000000"
      />
      <text

        x="50"
        y="50"
        textAnchor="middle"
        dominantBaseline="central"
        fill="white"
        fontSize="28"
        fontWeight="bold"
        fontFamily="Arial, sans-serif"
      >
        {content}
      </text>
    </svg>
  )
}

export const TokenItem: React.FC<NetworkItemProps> = ({
  token,
  isSelected,
  onSelect,
}) => {
  const { address } = useAccount()
  const [displayFallback, setDisplayFallback] = useState<boolean>(false)
  const { data: balance, isLoading } = useBalance({
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
        {displayFallback
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
            <span className="Modal__ItemAddress">
              {token.address.slice(0, 6) + '...' + token.address.slice(-4)}
            </span>
          )}
        </div>
      </div>
      <div className="Modal__ItemBalanceContainer">
        <span className="Modal__ItemPrice">$0.00</span>
        <span className="Modal__ItemBalance">
          {isLoading
            ? <Loader />
            : (
              balance && balance.value !== 0n
                ? `${parseFloat(formatEther(balance.value)).toFixed(4)}`
                : ''
            )
          }
        </span>
      </div>
    </div>
  );
}; 
