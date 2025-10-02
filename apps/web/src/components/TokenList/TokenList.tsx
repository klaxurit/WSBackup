import { useMemo, useState } from "react";
import { SearchBar } from "../SearchBar/SearchBar";
import { TokenItem } from './TokenItem';
import { PopularTokens } from './PopularTokens';
import { useTokensInPool, convertToBerachainTokens } from '../../hooks/useTokensInPool';
import { Modal } from '../Common/Modal';
import type { BerachainToken } from '../../hooks/useBerachainTokenList';

interface NetworksListProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (token: BerachainToken) => void;
  selectedToken?: BerachainToken | null;
}

export const TokenList = ({
  isOpen,
  onClose,
  onSelect,
  selectedToken,
}: NetworksListProps) => {
  const [searchValue, setSearchValue] = useState<string>("");

  // Utilisation du nouveau hook optimisé
  const {
    data: tokensData,
    isLoading,
    error,
    isError
  } = useTokensInPool();

  // Convertir les tokens du backend en format BerachainToken
  const cachedTokens = useMemo(() => {
    if (!tokensData?.data?.tokens) return [];
    return convertToBerachainTokens(tokensData.data.tokens);
  }, [tokensData]);

  // Tokens populaires (premiers tokens avec balance > 0)
  const popularTokens = useMemo(() => {
    return cachedTokens
      .filter(token => token.balanceUSD && token.balanceUSD > 0)
      .slice(0, 4);
  }, [cachedTokens]);

  // États dérivés pour compatibilité
  const hasError = isError;
  const hasTokens = cachedTokens.length > 0;
  const isReady = !isLoading && !error;

  // Filtrer et trier les tokens selon la recherche et les balances
  const sortedTokens = useMemo(() => {
    let filteredTokens = cachedTokens;

    // Filtrer par recherche si nécessaire
    if (searchValue !== "") {
      const searchLower = searchValue.toLowerCase();
      filteredTokens = cachedTokens.filter(token =>
        token.symbol.toLowerCase().includes(searchLower) ||
        token.name.toLowerCase().includes(searchLower) ||
        token.address.toLowerCase().includes(searchLower)
      );
    }

    // Trier par balance USD (déjà calculée par le backend)
    return filteredTokens.sort((a, b) => {
      const aValue = a.balanceUSD || 0;
      const bValue = b.balanceUSD || 0;

      // Tokens avec balance en premier, triés par valeur USD décroissante
      if (aValue === 0 && bValue === 0) return 0;
      if (aValue === 0) return 1;
      if (bValue === 0) return -1;

      return bValue - aValue;
    });
  }, [cachedTokens, searchValue]);

  const handleTokenSelect = (token: BerachainToken) => {
    onSelect(token);
    onClose();
  };

  // Tokens pour les tokens populaires (sans recherche)
  const availableTokensForPopular = useMemo(() => {
    if (searchValue !== "") return [];
    return popularTokens;
  }, [popularTokens, searchValue]);


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
      {isLoading || !isReady ? (
        <div className="Modal__Content">
          <div className="Modal__Loading">
            <div className="Modal__LoadingText">
              Loading token data...
            </div>
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