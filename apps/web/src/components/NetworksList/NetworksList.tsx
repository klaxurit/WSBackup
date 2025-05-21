import React, { useMemo, useState } from "react";
import ReactDOM from "react-dom";
import "../../styles/networksList.scss";
import { SearchBar } from "../SearchBar/SearchBar";

// Types simplifiés pour l'affichage
interface Token {
  denom: string;
  name: string;
  logo?: string;
}

interface NetworksListProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (token: Token) => void;
  selectedToken?: Token | null;
}

// Données de test
const MOCK_TOKENS: Token[] = [
  { denom: "token1", name: "Token 1", logo: "/tokens/token1.png" },
  { denom: "token2", name: "Token 2", logo: "/tokens/token2.png" },
  { denom: "token3", name: "Token 3", logo: "/tokens/token3.png" },
  { denom: "token4", name: "Token 4", logo: "/tokens/token4.png" },
  { denom: "token5", name: "Token 5", logo: "/tokens/token5.png" },
];

export const NetworksList = ({
  isOpen,
  onClose,
  onSelect,
  selectedToken,
}: NetworksListProps) => {
  const [searchValue, setSearchValue] = useState<string>("");

  const handleTokenSelect = (token: Token) => {
    onSelect(token);
    onClose();
  };

  const filteredTokens = useMemo(() => {
    if (searchValue === "") return MOCK_TOKENS;
    return MOCK_TOKENS.filter((token) =>
      token.name.toLowerCase().includes(searchValue.toLowerCase())
    );
  }, [searchValue]);

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="NetworksList" onClick={onClose}>
      <div className="Modal">
        <div className="Modal__Header">
          <div className="Modal__HeaderContent">
            <span onClick={onClose}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" onClick={onClose}>
                <path d="M12.9998 7.99862H3.66908M3.66908 7.99862H3.6665M3.66908 7.99862L8.33438 3.33331L3.66908 8.00134L8.33438 12.6666" stroke="white" strokeWidth="1.6" />
              </svg>
            </span>
            <p className="Modal__HeaderTitle">Select meme</p>
            <span className="Modal__HeaderBlankIcon"></span>
          </div>
        </div>
        <SearchBar
          searchValue={searchValue}
          setSearchValue={setSearchValue}
          networksList={true}
        />
        <div className="Modal__Content">
          {filteredTokens.map((token) => (
            <div
              key={token.denom}
              className={`Modal__Item ${selectedToken?.denom === token.denom ? "selected" : ""}`}
              onClick={() => handleTokenSelect(token)}
            >
              <img src={token.logo || "/default-token.png"} alt={token.name} className="Modal__ItemImage" />
              <span className="Modal__ItemName">{token.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>,
    document.body
  );
};
