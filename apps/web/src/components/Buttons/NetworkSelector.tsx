import { useState, useEffect, useCallback } from "react";
import { NetworksList } from "../NetworksList/NetworksList";
import "../../styles/networkSelector.scss";
import { useTokenBalances } from '../../hooks/useTokenBalances';
import { useAppSelector } from '../../store/hooks';
import { useBerachainTokenList } from '../../hooks/useBerachainTokenList';
import type { BerachainToken } from '../../hooks/useBerachainTokenList';

interface Token {
  name: string;
  symbol: string;
  address: string;
  decimals: number;
  logoURI: string;
  logoSymbol?: string;
}

interface NetworkSelectorProps {
  preSelected?: BerachainToken | null;
  onSelect?: (token: BerachainToken) => void;
  customClassName?: string;
  showSvg?: boolean;
  onToggleNetworkList?: (isOpen: boolean) => void;
  dominantColor?: string;
  secondaryColor?: string;
  minimized?: boolean;
  isHomePage?: boolean;
}

const NetworkSelector: React.FC<NetworkSelectorProps> = ({
  preSelected,
  onSelect,
  onToggleNetworkList,
}) => {
  const [isNetworksListOpen, setIsNetworksListOpen] = useState(false);
  const [selectedToken, setSelectedToken] = useState<BerachainToken | null>(preSelected || null);
  const address = useAppSelector((state) => state.wallet.address);
  const tokens = useBerachainTokenList();
  const { balances, loading } = useTokenBalances(tokens, address as `0x${string}`);

  useEffect(() => {
    if (preSelected) {
      setSelectedToken(preSelected);
    }
  }, [preSelected]);

  const handleNetworksListToggle = useCallback(() => {
    const newState = !isNetworksListOpen;
    setIsNetworksListOpen(newState);
    if (onToggleNetworkList) {
      onToggleNetworkList(newState);
    }
  }, [isNetworksListOpen, onToggleNetworkList]);

  const handleTokenSelect = useCallback((token: BerachainToken) => {
    setTimeout(() => {
      setSelectedToken(token);
      setIsNetworksListOpen(false);
      if (onSelect) {
        onSelect(token);
      }
      if (onToggleNetworkList) {
        onToggleNetworkList(false);
      }
    }, 0);
  }, [onSelect, onToggleNetworkList]);

  const getDisplayName = (token: Token) => {
    if (!token || !token.symbol) return 'Unknown';
    return token.symbol;
  };

  const renderButton = (
    <button
      className={`networkSelector${selectedToken ? ' has-token' : ''}${isNetworksListOpen ? ' open' : ''}`}
      onClick={handleNetworksListToggle}
      style={{}}
    >
      {selectedToken ? (
        <>
          <span className="networkSelector__logoWrapper">
            <img
              src={selectedToken.logoURI}
              alt={selectedToken.name}
            />
          </span>
          <span className="networkSelector__symbol">{getDisplayName(selectedToken)}</span>
        </>
      ) : (
        <span className="networkSelector__symbol">Select</span>
      )}
      <span className={`networkSelector__chevron${isNetworksListOpen ? ' open' : ''}`}>
        <svg viewBox="0 0 24 24" fill="none" strokeWidth="8" style={{ color: 'rgba(255,255,255,0.65)' }}>
          <path d="M15.7071 5.29289C16.0976 5.68342 16.0976 6.31658 15.7071 6.70711L10.4142 12L15.7071 17.2929C16.0976 17.6834 16.0976 18.3166 15.7071 18.7071C15.3166 19.0976 14.6834 19.0976 14.2929 18.7071L8.2929 12.7071C7.9024 12.3166 7.9024 11.6834 8.2929 11.2929L14.2929 5.29289C14.6834 4.90237 15.3166 4.90237 15.7071 5.29289Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
        </svg>
      </span>
    </button>
  );

  return (
    <>
      {renderButton}
      {isNetworksListOpen && (
        <NetworksList
          isOpen={isNetworksListOpen}
          onClose={handleNetworksListToggle}
          onSelect={handleTokenSelect}
          selectedToken={selectedToken || preSelected}
          tokens={tokens}
          balances={balances}
          loading={loading}
        />
      )}
    </>
  );
};

export default NetworkSelector;
