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
      setConnectorMenuOpen(true);
    } else {
      connect('injected').catch((err: any) => {
        setError(err?.message || 'Connection error with Injected wallet');
      });
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
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button
        className={className}
        onClick={handleConnect}
        disabled={isConnecting}
        style={style}
      >
        {isConnecting ? <Loader size="mini" /> : 'Connect Wallet'}
      </button>
      {connectorMenuOpen && isMobile() && (
        <div className="Navbar__Dropdown" ref={connectorMenuRef} style={{ minWidth: 200, position: 'absolute', zIndex: 10 }}>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>Select a wallet</div>
          <button className="Navbar__DropdownButton" onClick={handleConnectInjected} style={{ width: '100%', marginBottom: 6 }}>
            Metamask / Injected
          </button>
          <button className="Navbar__DropdownButton" onClick={handleConnectWalletConnect} style={{ width: '100%' }}>
            WalletConnect (Mobile)
          </button>
          {error && <div style={{ color: 'red', marginTop: 8, fontSize: 13 }}>{error}</div>}
        </div>
      )}
    </div>
  );
};
