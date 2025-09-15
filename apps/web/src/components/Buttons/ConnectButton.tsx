import { useCallback, useState, useRef, useEffect } from 'react';
import { useWallet } from '../../hooks/useWallet';
import { Loader } from '../Loader/Loader';

interface ConnectButtonProps {
  size?: 'large' | 'small';
  onClick?: () => void;
  dominantColor?: string;
  secondaryColor?: string;
  tokenSelected?: boolean;
  amountEntered?: boolean;
  customClassName?: string;
}

function isMobile() {
  if (typeof navigator === 'undefined') return false;
  return /Mobi|Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent);
}

export const ConnectButton: React.FC<ConnectButtonProps> = ({
  size = 'large',
  dominantColor,
  secondaryColor,
  customClassName = '',
  onClick,
}) => {
  const { connect, isConnecting } = useWallet();
  const [connectorMenuOpen, setConnectorMenuOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const connectorMenuRef = useRef<HTMLDivElement>(null);

  const handleConnect = useCallback(() => {
    if (isMobile()) {
      // Sur mobile, on utilise directement WalletConnect
      connect('walletConnect').catch((err: any) => {
        setError(err?.message || 'Connection error with WalletConnect');
      });
    } else {
      // Sur desktop, on affiche le menu de sélection
      setConnectorMenuOpen(true);
    }
  }, [connect]);

  const handleConnectInjected = useCallback(async () => {
    setError(null);
    try {
      await connect('injected');
      setConnectorMenuOpen(false);
      if (onClick) onClick();
    } catch (err: any) {
      setError(err?.message || 'Connection error with Injected wallet');
    }
  }, [connect, onClick]);

  const handleConnectWalletConnect = useCallback(async () => {
    setError(null);
    try {
      await connect('walletConnect');
      setConnectorMenuOpen(false);
      if (onClick) onClick();
    } catch (err: any) {
      setError(err?.message || 'Connection error with WalletConnect');
    }
  }, [connect, onClick]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (connectorMenuRef.current && !connectorMenuRef.current.contains(event.target as Node)) {
        setConnectorMenuOpen(false);
      }
    }
    if (connectorMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [connectorMenuOpen]);

  const className = `btn btn--${size} btn__shade ${customClassName}`.trim();

  const style: React.CSSProperties = {};
  if (dominantColor) style.color = dominantColor;
  if (secondaryColor) style.backgroundColor = secondaryColor;

  return (
    <div style={{ position: 'relative', display: 'inline-block', width: '100%' }}>
      <button
        className={className}
        onClick={handleConnect}
        disabled={isConnecting}
        style={style}
      >
        {isConnecting ? <Loader size="mini" /> : 'Connect Wallet'}
      </button>
      {connectorMenuOpen && (
        <div className="Navbar__Dropdown Navbar__ConnectorDropdown Navbar__ConnectorDropdown--left" ref={connectorMenuRef}>
          <div className="Navbar__DropdownTitle">
            Choose a wallet
          </div>
          <button
            className="Navbar__DropdownButton"
            onClick={handleConnectInjected}
          >
            MetaMask / Injected
          </button>
          <button
            className="Navbar__DropdownButton"
            onClick={handleConnectWalletConnect}
          >
            WalletConnect
          </button>
          {error && <div className="Navbar__DropdownError">{error}</div>}
        </div>
      )}
    </div>
  );
};
