import React, { useState } from 'react';
import { Loader } from '../Loader/Loader';
import { formatUnits, zeroAddress } from 'viem';
import { useAccount, useBalance } from 'wagmi';
import type { BerachainToken } from '../../hooks/useBerachainTokenList';
import { FallbackImg } from '../utils/FallbackImg';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

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

  // Récupérer les stats du token pour avoir le prix USD
  const { data: tokenStats } = useQuery({
    queryKey: ["tokenStats", token.address],
    queryFn: async () => {
      if (!token.address) return null;
      const resp = await fetch(`${import.meta.env.VITE_API_URL}/token/list`)
      if (!resp.ok) return null;
      const data = await resp.json();
      return data.find((t: any) =>
        t.address?.toLowerCase() === token.address?.toLowerCase()
      );
    },
    enabled: !!token.address,
    staleTime: 60_000
  });

  // Récupérer aussi les stats du WBERA pour le fallback du BERA
  const { data: wBeraStats } = useQuery({
    queryKey: ["wBeraStats"],
    queryFn: async () => {
      const resp = await fetch(`${import.meta.env.VITE_API_URL}/token/list`)
      if (!resp.ok) return null;
      const data = await resp.json();
      return data.find((t: any) =>
        t.symbol === 'wBERA' || t.address?.toLowerCase() === '0x6969696969696969696969696969696969696969'
      );
    },
    staleTime: 60_000
  });

  // Calculer la valeur USD de la balance
  const balanceUsd = useMemo(() => {
    if (!balance || balance.value === 0n) return 0;

    let price = 0;

    // Essayer d'abord le prix du token lui-même
    if (tokenStats) {
      price = tokenStats?.TokenDailyStats?.[0]?.price || 0;
    }

    // Si c'est le token BERA (zeroAddress) et qu'on n'a pas de prix, utiliser le prix du WBERA
    if (price === 0 && token.address === zeroAddress && wBeraStats) {
      price = wBeraStats?.TokenDailyStats?.[0]?.price || 0;
    }

    if (price === 0) return 0;

    const amount = parseFloat(formatUnits(balance.value, token.decimals || 18));
    return amount * price;
  }, [balance, tokenStats, wBeraStats, token.address, token.decimals]);

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
                {balanceUsd > 0 ? `$${balanceUsd.toFixed(2)}` : ''}
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
