import { useMemo, useState } from "react";
import { SearchBar } from "../SearchBar/SearchBar";
import { TokenItem } from './TokenItem';
import { PopularTokens } from './PopularTokens';
import { useTokens, type BerachainToken } from '../../hooks/useBerachainTokenList';
import { Modal } from '../Common/Modal';
import type { Address } from "viem";
import { zeroAddress } from "viem";
import { useAccount } from "wagmi";
import { useTokenBalances } from "../../hooks/useTokenBalances";
import { useQuery } from "@tanstack/react-query";
import { getStatsAddress } from "../../utils/tokenMapping";

interface NetworksListProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (token: BerachainToken) => void;
  selectedToken?: BerachainToken | null;
  onlyPoolToken: boolean
}

export const TokenList = ({
  isOpen,
  onClose,
  onSelect,
  selectedToken,
  onlyPoolToken
}: NetworksListProps) => {
  const [searchValue, setSearchValue] = useState<string>("");
  const { data: tokens = [] } = useTokens()
  const { address, isConnected } = useAccount()

  const { data: tokensStats } = useQuery({
    queryKey: ["tokensStatsForList"],
    queryFn: async () => {
      const resp = await fetch(`${import.meta.env.VITE_API_URL}/stats/tokens`)
      if (!resp.ok) return { data: [] as any[] }
      return resp.json()
    },
    staleTime: 60_000
  })

  const handleTokenSelect = (token: BerachainToken) => {
    onSelect(token);
    onClose();
  };

  const filteredTokens = useMemo(() => {
    const onlyPoolOrAllTokens = onlyPoolToken
      ? tokens.filter(t => t.inPool === onlyPoolToken || t.address === zeroAddress)
      : tokens

    // Exclure le token BGT qui n'est pas tradable
    const tokensWithoutBGT = onlyPoolOrAllTokens.filter(t => t.symbol !== 'BGT')

    if (searchValue === "") return tokensWithoutBGT;
    return tokensWithoutBGT.filter((token) =>
      token.name.toLowerCase().includes(searchValue.toLowerCase()) ||
      token.symbol.toLowerCase().includes(searchValue.toLowerCase())
    );
  }, [searchValue, tokens, onlyPoolToken]);

  const availableTokensForPopular = useMemo(() => {
    const baseTokens = onlyPoolToken
      ? tokens.filter(t => t.inPool === onlyPoolToken || t.address === zeroAddress)
      : tokens

    // Exclure le token BGT qui n'est pas tradable
    return baseTokens.filter(t => t.symbol !== 'BGT');
  }, [tokens, onlyPoolToken]);

  const marketCapByAddress = useMemo(() => {
    const map = new Map<string, number>()
    const statsArray: any[] = tokensStats?.data || []
    for (const t of statsArray) {
      const addr: string | undefined = t.address || t.token?.address
      const mc: number = t?.Statistic?.[0]?.marketCap || 0
      if (addr) map.set(String(addr).toLowerCase(), Number(mc) || 0)
    }
    return map
  }, [tokensStats])

  const balanceInputTokens = useMemo(() => {
    return filteredTokens.map(t => ({
      address: t.address === zeroAddress ? undefined : (t.address as unknown as string),
      symbol: t.symbol,
      decimals: t.decimals
    }))
  }, [filteredTokens])

  const { balances } = useTokenBalances(balanceInputTokens, address as `0x${string}`)

  const sortedTokens = useMemo(() => {
    if (!filteredTokens.length) return filteredTokens

    const getBalanceUsd = (token: BerachainToken): number => {
      const balanceStr = (balances as Record<string, string | undefined>)[token.symbol]
      const amount = balanceStr ? parseFloat(balanceStr) : 0
      if (!amount || !isFinite(amount) || amount <= 0) return 0
      const price = token.lastPrice || 0
      return amount * price
    }

    const getMarketCap = (token: BerachainToken): number => {
      const statsAddr = token.address ? getStatsAddress(token.address as Address) : undefined
      if (!statsAddr) return 0
      return marketCapByAddress.get(String(statsAddr).toLowerCase()) || 0
    }

    if (isConnected) {
      const withBalance: BerachainToken[] = []
      const withoutBalance: BerachainToken[] = []

      for (const t of filteredTokens) {
        const usd = getBalanceUsd(t)
        if (usd > 0) withBalance.push(t)
        else withoutBalance.push(t)
      }

      // Tri par valeur USD décroissante pour les tokens avec balance
      withBalance.sort((a, b) => getBalanceUsd(b) - getBalanceUsd(a))

      // Tri par market cap décroissant pour les tokens sans balance
      withoutBalance.sort((a, b) => getMarketCap(b) - getMarketCap(a))

      return [...withBalance, ...withoutBalance]
    }

    // Tri par market cap décroissant quand non connecté
    return [...filteredTokens].sort((a, b) => getMarketCap(b) - getMarketCap(a))
  }, [filteredTokens, balances, isConnected, marketCapByAddress])

  return (
    <Modal open={isOpen} onClose={onClose} className="Modal" overlayClassName="NetworksList">
      <div className="Modal__Header">
        <div className="Modal__HeaderContent">
          <span className="Modal__HeaderTitle">Select a token</span>
          <button
            className="Modal__HeaderClose"
            onClick={onClose}
            tabIndex={0}
            aria-label="Close"
          >
            <svg viewBox="0 0 16 16" fill="none" strokeWidth="8" style={{ width: '24px', height: '24px', color: 'rgba(255, 255, 255, 0.65)' }}>
              <path d="M12.5303 4.53033C12.8232 4.23744 12.8232 3.76256 12.5303 3.46967C12.2374 3.17678 11.7626 3.17678 11.4697 3.46967L12.5303 4.53033ZM3.46967 11.4697C3.17678 11.7626 3.17678 12.2374 3.46967 12.5303C3.76256 12.8232 4.23744 12.8232 4.53033 12.5303L3.46967 11.4697ZM4.53033 3.46967C4.23744 3.17678 3.76256 3.17678 3.46967 3.46967C3.17678 3.76256 3.17678 4.23744 3.46967 4.53033L4.53033 3.46967ZM11.4697 12.5303C11.7626 12.8232 12.2374 12.8232 12.5303 12.5303C12.8232 12.2374 12.8232 11.7626 12.5303 11.4697L11.4697 12.5303ZM11.4697 3.46967L3.46967 11.4697L4.53033 12.5303L12.5303 4.53033L11.4697 3.46967ZM3.46967 4.53033L11.4697 12.5303L12.5303 11.4697L4.53033 3.46967L3.46967 4.53033Z" fill="currentColor"></path>
            </svg>
          </button>
        </div>
      </div>

      <SearchBar
        searchValue={searchValue}
        setSearchValue={setSearchValue}
        networksList={true}
      />
      {searchValue === "" && (
        <PopularTokens
          tokens={availableTokensForPopular}
          onTokenSelect={handleTokenSelect}
          selectedToken={selectedToken}
        />
      )}

      <div className="Modal__Content">
        {sortedTokens.map((token) => (
          <TokenItem
            key={token.address || token.symbol}
            token={token}
            isSelected={selectedToken?.symbol === token.symbol}
            onSelect={handleTokenSelect.bind(null, token)}
          />
        ))}
      </div>
    </Modal>
  );
};