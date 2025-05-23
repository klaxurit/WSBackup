import React, { useMemo, useState } from "react";
import ReactDOM from "react-dom";
import "../../styles/networksList.scss";
import { SearchBar } from "../SearchBar/SearchBar";
import { BERACHAIN_TOKENS } from '../../config/berachainTokens';
import { useAppSelector } from '../../store/hooks';
import { NetworkItem } from './NetworkItem';
import type { BerachainToken } from '../../hooks/useBerachainTokenList';

// Types simplifiés pour l'affichage
interface Token {
  name: string;
  symbol: string;
  address: string | null;
  logo?: string;
  decimals: number;
}

interface NetworksListProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (token: BerachainToken) => void;
  selectedToken?: BerachainToken | null;
  tokens: BerachainToken[];
  balances: { [symbol: string]: string };
  loading: boolean;
}

export const NetworksList = ({
  isOpen,
  onClose,
  onSelect,
  selectedToken,
  tokens,
  balances,
  loading,
}: NetworksListProps) => {
  const [searchValue, setSearchValue] = useState<string>("");

  const handleTokenSelect = (token: BerachainToken) => {
    onSelect(token);
    onClose();
  };

  const filteredTokens = useMemo(() => {
    if (searchValue === "") return tokens;
    return tokens.filter((token) =>
      token.name.toLowerCase().includes(searchValue.toLowerCase()) ||
      token.symbol.toLowerCase().includes(searchValue.toLowerCase())
    );
  }, [searchValue, tokens]);

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="NetworksList" onClick={onClose}>
      <div className="Modal">
        <div className="Modal__Header">
          <div className="Modal__HeaderContent">
            <span className="Modal__HeaderTitle">Select a token</span>
            <button
              className="Modal__HeaderClose"
              onClick={onClose}
              tabIndex={0}
              aria-label="Close"
            >
              <svg viewBox="0 0 16 16" fill="none" stroke-width="8" style={{ width: '24px', height: '24px', color: 'rgba(255, 255, 255, 0.65)' }}>
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
        <div className="Modal__Content">
          {filteredTokens.map((token) => (
            <NetworkItem
              key={token.symbol}
              token={token}
              isSelected={selectedToken?.symbol === token.symbol}
              onSelect={handleTokenSelect.bind(null, token)}
              balance={balances[token.symbol]}
              loading={loading}
            />
          ))}
        </div>
      </div>
    </div>,
    document.body
  );
};
