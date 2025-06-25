import React, { useMemo, useState } from 'react';
import { Loader } from '../Loader/Loader';
import { formatEther, zeroAddress } from 'viem';
import { useAccount, useBalance } from 'wagmi';
import type { BerachainToken } from '../../hooks/useBerachainTokenList';
import { FallbackImg } from '../utils/FallbackImg';
import { usePrice } from '../../hooks/usePrice';

interface NetworkItemProps {
  token: BerachainToken;
  isSelected: boolean;
  onSelect: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
  balance?: string;
  loading?: boolean;
}

const baseExplorer = import.meta.env.NODE_ENV === "production"
  ? "https://berascan.com/token/"
  : "https://bepolia.beratrail.io/token/"

export const TokenItem: React.FC<NetworkItemProps> = ({
  token,
  isSelected,
  onSelect,
}) => {
  const { address } = useAccount()
  const [displayFallback, setDisplayFallback] = useState<boolean>(false)
  const { data: balance, isLoading: balanceLoading } = useBalance({
    address,
    token: token.address === zeroAddress ? undefined : (token.address as `0x${string}`)
  })
  const { data: usdValue, isLoading: priceLoading } = usePrice(token)

  const isLoading = useMemo(() => {
    return balanceLoading || priceLoading
  }, [balanceLoading, priceLoading])

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
        <span className="Modal__ItemPrice">
          {isLoading
            ? <Loader size="mini" />
            : (
              balance && balance.value !== 0n && usdValue && usdValue !== 0
                ? `$${(usdValue * +formatEther(balance.value)).toFixed(2)}`
                : ''
            )
          }
        </span>
        <span className="Modal__ItemBalance">
          {isLoading
            ? <Loader size="mini" />
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
