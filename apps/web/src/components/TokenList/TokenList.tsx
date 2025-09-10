import { useMemo, useState } from "react";
import { SearchBar } from "../SearchBar/SearchBar";
import { TokenItem } from './TokenItem';
import { PopularTokens } from './PopularTokens';
import { useTokens, type BerachainToken } from '../../hooks/useBerachainTokenList';
import { Modal } from '../Common/Modal';
import { zeroAddress } from "viem";
import { useAccount } from "wagmi";
import { useTokenBalances } from "../../hooks/useTokenBalances";
import { useQuery } from "@tanstack/react-query";
import { ensureArray } from "../../utils/dataValidation";

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
  const { data: tokens, isLoading: tokensLoading, error: tokensError } = useTokens()
  const { address, isConnected } = useAccount()

  const { data: tokensStats, isLoading: tokensStatsLoading } = useQuery({
    queryKey: ["tokensStatsForList"],
    queryFn: async () => {
      const resp = await fetch(`${import.meta.env.VITE_API_URL}/token/list`)
      if (!resp.ok) return { data: [] as any[] }
      return resp.json()
    },
    staleTime: 60_000,
    enabled: isOpen // Ne charger que quand la modal est ouverte
  })

  const tokensArray = ensureArray<BerachainToken>(tokens);

  const handleTokenSelect = (token: BerachainToken) => {
    onSelect(token);
    onClose();
  };

  const filteredTokens = useMemo(() => {
    if (!tokens || tokensLoading) {
      return [];
    }

    const tokensArray = ensureArray(tokens) as BerachainToken[];

    const onlyPoolOrAllTokens = onlyPoolToken
      ? tokensArray.filter(t => t.status === 'IN_POOL' || t.address === zeroAddress)
      : tokensArray

    const tokensWithoutBGT = onlyPoolOrAllTokens.filter(t => t.symbol !== 'BGT')

    // Déduplication des tokens par adresse pour éviter les doublons
    const uniqueTokens = tokensWithoutBGT.reduce((acc, token) => {
      const key = token.address.toLowerCase();
      if (!acc.has(key)) {
        acc.set(key, token);
      }
      return acc;
    }, new Map<string, BerachainToken>());

    const deduplicatedTokens = Array.from(uniqueTokens.values());

    if (searchValue === "") {
      return deduplicatedTokens;
    }

    return deduplicatedTokens.filter((token) =>
      token.name.toLowerCase().includes(searchValue.toLowerCase()) ||
      token.symbol.toLowerCase().includes(searchValue.toLowerCase())
    );
  }, [searchValue, tokens, tokensLoading, onlyPoolToken]);

  const availableTokensForPopular = useMemo(() => {
    if (!tokens || tokensLoading) return [];

    const tokensArray = ensureArray(tokens) as BerachainToken[];

    const baseTokens = onlyPoolToken
      ? tokensArray.filter(t => t.status === 'IN_POOL' || t.address === zeroAddress)
      : tokensArray

    const tokensWithoutBGT = baseTokens.filter(t => t.symbol !== 'BGT');

    // Déduplication des tokens par adresse pour éviter les doublons
    const uniqueTokens = tokensWithoutBGT.reduce((acc, token) => {
      const key = token.address.toLowerCase();
      if (!acc.has(key)) {
        acc.set(key, token);
      }
      return acc;
    }, new Map<string, BerachainToken>());

    return Array.from(uniqueTokens.values());
  }, [tokens, tokensLoading, onlyPoolToken]);

  const marketCapByAddress = useMemo(() => {
    const map = new Map<string, number>()
    const statsArray: any[] = tokensStats || []
    for (const t of statsArray) {
      const addr: string = t.address
      const mc: number = t?.TokenDailyStats?.[0]?.marketCap || 0
      if (addr) map.set(String(addr).toLowerCase(), Number(mc) || 0)
    }
    return map
  }, [tokensStats])

  const validateAddress = (addr: string | undefined): string | undefined => {
    if (!addr) return undefined;
    if (addr.startsWith('0x') && addr.length === 42) {
      return addr;
    }
    return undefined;
  };

  const balanceInputTokens = useMemo(() => {
    return filteredTokens.map(t => ({
      address: t.address === zeroAddress ? undefined : validateAddress(t.address),
      symbol: t.symbol,
      decimals: t.decimals
    }))
  }, [filteredTokens])

  const { balances } = useTokenBalances(balanceInputTokens, address as `0x${string}`)

  const sortedTokens = useMemo(() => {
    if (!filteredTokens.length) return filteredTokens

    const getBalanceUsd = (token: BerachainToken): number => {
      const balanceStr = (balances as Record<string, string | undefined>)[token.symbol]
      if (!balanceStr) return 0

      const amount = parseFloat(balanceStr)
      if (!amount || !isFinite(amount) || amount <= 0) return 0

      let tokenStats = tokensStats?.find((t: any) =>
        t.address?.toLowerCase() === token.address?.toLowerCase()
      )

      let price = tokenStats?.TokenDailyStats?.[0]?.price || 0

      if (price === 0 && token.address === zeroAddress) {
        const wBeraStats = tokensStats?.find((t: any) =>
          t.symbol === 'wBERA' || t.address?.toLowerCase() === '0x6969696969696969696969696969696969696969'
        )
        price = wBeraStats?.TokenDailyStats?.[0]?.price || 0
      }

      if (price === 0) return 0

      return amount * price
    }

    const getMarketCap = (token: BerachainToken): number => {
      if (!token.address || !tokensStats) return 0

      const marketCap = marketCapByAddress.get(token.address.toLowerCase()) || 0

      return marketCap
    }

    if (isConnected) {
      const withBalance: BerachainToken[] = []
      const withoutBalance: BerachainToken[] = []

      for (const t of filteredTokens) {
        const usd = getBalanceUsd(t)
        if (usd > 0) {
          withBalance.push(t)
        } else {
          withoutBalance.push(t)
        }
      }

      withBalance.sort((a, b) => getBalanceUsd(b) - getBalanceUsd(a))
      withoutBalance.sort((a, b) => getMarketCap(b) - getMarketCap(a))

      return [...withBalance, ...withoutBalance]
    }

    return [...filteredTokens].sort((a, b) => getMarketCap(b) - getMarketCap(a))
  }, [filteredTokens, balances, isConnected, tokensStats, marketCapByAddress])

  // Gestion des états de chargement et d'erreur
  const isLoading = tokensLoading || tokensStatsLoading;
  const hasError = !!tokensError;
  const hasTokens = tokensArray.length > 0;


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

      {/* Affichage conditionnel basé sur l'état de chargement */}
      {isLoading ? (
        <div className="Modal__Content">
          <div className="Modal__Loading">
            <div className="Modal__LoadingText">Loading tokens...</div>
          </div>
        </div>
      ) : hasError ? (
        <div className="Modal__Content">
          <div className="Modal__Error">
            <div className="Modal__ErrorText">Failed to load tokens. Please try again.</div>
            <button
              className="Modal__RetryButton"
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
          </div>
        </div>
      ) : !hasTokens ? (
        <div className="Modal__Content">
          <div className="Modal__Empty">
            <div className="Modal__EmptyText">No tokens available</div>
          </div>
        </div>
      ) : (
        <>
          {searchValue === "" && (
            <PopularTokens
              tokens={availableTokensForPopular}
              onTokenSelect={handleTokenSelect}
              selectedToken={selectedToken}
            />
          )}

          <div className="Modal__Content">
            {sortedTokens.map((token, index) => (
              <TokenItem
                key={`${token.address || token.symbol}-${index}`}
                token={token}
                isSelected={selectedToken?.address === token.address}
                onSelect={handleTokenSelect.bind(null, token)}
              />
            ))}
          </div>
        </>
      )}
    </Modal>
  );
};