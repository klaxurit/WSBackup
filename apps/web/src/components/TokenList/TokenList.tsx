import { useMemo, useState } from "react";
import { SearchBar } from "../SearchBar/SearchBar";
import { TokenItem } from './TokenItem';
import { PopularTokens } from './PopularTokens';
import { useTokens, type BerachainToken } from '../../hooks/useBerachainTokenList';
import { Modal } from '../Common/Modal';
import { zeroAddress } from "viem";

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

  const handleTokenSelect = (token: BerachainToken) => {
    onSelect(token);
    onClose();
  };

  const filteredTokens = useMemo(() => {
    const onlyPoolOrAllTokens = onlyPoolToken
      ? tokens.filter(t => t.inPool === onlyPoolToken || t.address === zeroAddress)
      : tokens
    if (searchValue === "") return onlyPoolOrAllTokens;
    return onlyPoolOrAllTokens.filter((token) =>
      token.name.toLowerCase().includes(searchValue.toLowerCase()) ||
      token.symbol.toLowerCase().includes(searchValue.toLowerCase())
    );
  }, [searchValue, tokens, onlyPoolToken]);

  const availableTokensForPopular = useMemo(() => {
    return onlyPoolToken
      ? tokens.filter(t => t.inPool === onlyPoolToken || t.address === zeroAddress)
      : tokens;
  }, [tokens, onlyPoolToken]);

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
        {filteredTokens.map((token) => (
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