import { useState, useEffect } from "react";
import { NetworksList } from "../NetworksList/NetworksList";
import "../../styles/networkSelector.scss";

// Types simplifiés pour l'affichage
interface Token {
  denom: string;
  name: string;
  logo?: string;
}

interface NetworkSelectorProps {
  preSelected?: Token | null;
  onSelect?: (token: Token) => void;
  customClassName?: string;
  showSvg?: boolean;
  onToggleNetworkList?: (isOpen: boolean) => void;
  dominantColor?: string;
  secondaryColor?: string;
  minimized?: boolean;
  isHomePage?: boolean;
}

const DEFAULT_IMAGE = '/default-token.png';

const NetworkSelector: React.FC<NetworkSelectorProps> = ({
  preSelected,
  onSelect,
  customClassName,
  showSvg,
  onToggleNetworkList,
  minimized,
  dominantColor,
  secondaryColor,
  isHomePage,
}) => {
  const [isNetworksListOpen, setIsNetworksListOpen] = useState(false);
  const [selectedToken, setSelectedToken] = useState<Token | null>(preSelected || null);

  useEffect(() => {
    if (preSelected) {
      setSelectedToken(preSelected);
    }
  }, [preSelected]);

  const handleNetworksListToggle = () => {
    const newState = !isNetworksListOpen;
    setIsNetworksListOpen(newState);
    if (onToggleNetworkList) {
      onToggleNetworkList(newState);
    }
  };

  const getDisplayName = (token: Token) => {
    if (!token || !token.denom) return 'Unknown';
    const sdenom = token.denom.split("/");
    const name = token.name && !token.name.startsWith('factory/') ? token.name : sdenom[sdenom.length - 1];
    return truncateText(name, 10);
  };

  const handleTokenSelect = (token: Token) => {
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
  };

  const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
  };

  const textColor = dominantColor ? '#FFFFFF' : '#12110E';

  const getButtonStyles = () => {
    if (isHomePage) {
      if (selectedToken) {
        return {
          backgroundColor: '#393836',
          color: '#FFFFFF'
        };
      } else {
        return {
          backgroundColor: '#E39229',
          color: '#12110E'
        };
      }
    } else if (dominantColor) {
      return {
        backgroundColor: dominantColor,
        color: textColor,
        borderColor: dominantColor
      };
    }
    return {
      backgroundColor: '#E39229',
      color: '#12110E'
    };
  };

  const buttonStyles = getButtonStyles();

  const renderButton = selectedToken ? (
    <button
      className={`networkSelector ${minimized ? "minimizedSelector" : ""}`}
      onClick={handleNetworksListToggle}
      style={buttonStyles}
    >
      {showSvg ? (
        <>
          <span className="Form__PoolBtnContent">
            <img
              src={selectedToken.logo || DEFAULT_IMAGE}
              alt={selectedToken.name}
              style={{ width: '24px', height: '24px' }}
            />
            <p style={{ color: textColor }}>{getDisplayName(selectedToken)}</p>
          </span>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8.00233 3V12.3308M8.00233 12.3308V12.3333M8.00233 12.3308L12.6687 7.66441L7.99961 12.3308L3.33325 7.66441" stroke="white" strokeWidth="1.6" />
          </svg>
        </>
      ) : (
        <>
          <img
            src={selectedToken.logo || DEFAULT_IMAGE}
            alt={selectedToken.name}
            style={{ width: '16px', height: '16px' }}
          />
          {!minimized && <p style={{ color: textColor }}>{getDisplayName(selectedToken)}</p>}
        </>
      )}
    </button>
  ) : (
    <button
      className={`btn btn--small btn__main ${customClassName}`}
      onClick={handleNetworksListToggle}
      style={buttonStyles}
    >
      {showSvg ? (
        <>
          <p>Select meme</p>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8.00233 3V12.3308M8.00233 12.3308V12.3333M8.00233 12.3308L12.6687 7.66441L7.99961 12.3308L3.33325 7.66441" stroke="#12110E" strokeWidth="1.6" />
          </svg>
        </>
      ) : (
        <p>Select</p>
      )}
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
        />
      )}
    </>
  );
};

export default NetworkSelector;
