import { useState, useEffect, useCallback } from "react";
import { TokenList } from "../TokenList/TokenList";
import type { BerachainToken } from '../../hooks/useBerachainTokenList';
import { FallbackImg } from "../utils/FallbackImg";

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
  onForceOpen?: () => void;
  forceListOpen?: boolean;
  onlyPoolToken: boolean
}

const TokenSelector: React.FC<NetworkSelectorProps> = ({
  preSelected,
  onSelect,
  onToggleNetworkList,
  onForceOpen,
  forceListOpen,
  onlyPoolToken
}) => {
  const [isNetworksListOpen, setIsNetworksListOpen] = useState(false);
  const [selectedToken, setSelectedToken] = useState<BerachainToken | null>(preSelected || null);

  useEffect(() => {
    setSelectedToken(preSelected || null);
  }, [preSelected]);

  useEffect(() => {
    if (forceListOpen) {
      setIsNetworksListOpen(true);
      if (onToggleNetworkList) {
        onToggleNetworkList(true);
      }
    }
  }, [forceListOpen, onToggleNetworkList]);

  const handleNetworksListToggle = useCallback(() => {
    const newState = !isNetworksListOpen;
    setIsNetworksListOpen(newState);
    if (onToggleNetworkList) {
      onToggleNetworkList(newState);
    }
    if (onForceOpen && !isNetworksListOpen) {
      onForceOpen();
    }
  }, [isNetworksListOpen, onToggleNetworkList, onForceOpen]);

  const handleTokenSelect = useCallback((token: BerachainToken) => {
    setSelectedToken(token);
    setIsNetworksListOpen(false);
    if (onSelect) {
      onSelect(token);
    }
    if (onToggleNetworkList) {
      onToggleNetworkList(false);
    }
  }, [onSelect, onToggleNetworkList]);

  const renderButton = (
    <button
      className={`networkSelector${selectedToken ? ' has-token' : ''}${isNetworksListOpen ? ' open' : ''}`}
      onClick={handleNetworksListToggle}
      style={{}}
    >
      {selectedToken ? (
        <>
          <span className="networkSelector__logoWrapper">
            {!selectedToken.logoUri
              ? <FallbackImg content={selectedToken.symbol} />
              : (
                <img
                  src={selectedToken.logoUri}
                  alt={selectedToken.name}
                />
              )}
          </span>
          <span className="networkSelector__symbol">{selectedToken.symbol}</span>
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
        <TokenList
          isOpen={isNetworksListOpen}
          onClose={handleNetworksListToggle}
          onSelect={handleTokenSelect}
          selectedToken={selectedToken || preSelected}
          onlyPoolToken={onlyPoolToken}
        />
      )}
    </>
  );
};

export default TokenSelector;
