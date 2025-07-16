import { useCallback, useState, useRef, useEffect } from 'react';
import { useWallet } from '../../hooks/useWallet';
import { useBeraname } from '../../hooks/useBeraname';
import { Loader } from '../Loader/Loader';
import { useAccount, useBalance } from 'wagmi';
import { formatEther } from 'viem';
import { WinnieFavicon } from '../SVGs/LogoSVGs';

interface NavbarConnectButtonProps {
  onClick?: () => void;
  customClassName?: string;
}

function isMobile() {
  if (typeof navigator === 'undefined') return false;
  return /Mobi|Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent);
}

function getWalletName() {
  if (window.ethereum?.isMetaMask) return 'MetaMask';
  if (window.ethereum?.isRabby) return 'Rabby';
  if (window.ethereum?.isCoinbaseWallet) return 'Coinbase Wallet';
  return 'Wallet';
}

const CopyIcon = () => (
  <svg width="16" height="16" fill="none" viewBox="0 0 16 16">
    <rect x="5" y="5" width="8" height="8" rx="2" fill="currentColor" stroke="currentColor" strokeWidth="1.5" />
    <rect x="3" y="3" width="8" height="8" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

const LogoutIcon = () => (
  <svg width="16" height="16" fill="none" viewBox="0 0 16 16"><path d="M6 12.5V13A1.5 1.5 0 0 0 7.5 14.5h5A1.5 1.5 0 0 0 14 13V3A1.5 1.5 0 0 0 12.5 1.5h-5A1.5 1.5 0 0 0 6 3v.5" stroke="#fff" strokeWidth="1.5" /><path d="M2.5 8h7m0 0-2-2m2 2-2 2" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
);

export const NavbarConnectButton: React.FC<NavbarConnectButtonProps> = ({
  onClick,
  customClassName = '',
}) => {
  const { connect, disconnect, isConnecting } = useWallet();
  const { isConnected, address } = useAccount();
  const { beraname } = useBeraname(address);
  const { data: balance, isLoading } = useBalance({ address });

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [connectorMenuOpen, setConnectorMenuOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const connectorMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
      if (connectorMenuRef.current && !connectorMenuRef.current.contains(event.target as Node)) {
        setConnectorMenuOpen(false);
      }
    }
    if (dropdownOpen || connectorMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen, connectorMenuOpen]);

  const formatAddress = (addr: string) => {
    if (!addr) return '';
    const start = addr.substring(0, 6);
    const end = addr.substring(addr.length - 4);
    return `${start}...${end}`;
  };

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

  const handleDisconnect = useCallback(() => {
    disconnect();
    setDropdownOpen(false);
    if (onClick) onClick();
  }, [disconnect, onClick]);

  const handleCopy = useCallback(() => {
    if (address) navigator.clipboard.writeText(address);
  }, [address]);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <div style={{ position: 'relative' }} ref={dropdownRef}>
        <button
          className={`Navbar__ConnectButton btn btn--small btn__shade ${customClassName}`.trim()}
          onClick={isConnected ? () => setDropdownOpen((v) => !v) : handleConnect}
          disabled={isConnecting}
        >
          {isConnected && address ? (
            beraname ? `${beraname}` : `⛓️ ${formatAddress(address)}`
          ) : isConnecting ? <Loader size="mini" /> : 'Connect'}
        </button>
        {/* Menu de sélection du connecteur uniquement sur mobile */}
        {!isConnected && connectorMenuOpen && isMobile() && (
          <div className="Navbar__Dropdown" ref={connectorMenuRef} style={{ minWidth: 200 }}>
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
        {isConnected && dropdownOpen && (
          <div className="Navbar__Dropdown">
            <div className="Navbar__DropdownHeader">
              <p className="Navbar__Address">{beraname ? beraname : formatAddress(address!)}</p>
              <button
                className="Navbar__CopyButton"
                onClick={handleCopy}
                title="Copy address"
              >
                <CopyIcon />
              </button>
            </div>
            <div className="Navbar__DropdownWalletName">{getWalletName()}</div>
            <button
              className="Navbar__DisconnectButton"
              onClick={handleDisconnect}
              title="Disconnect"
            >
              <LogoutIcon /> Disconnect
            </button>
          </div>
        )}
      </div>
      {isConnected && (
        <button
          className="Navbar__BalanceButton btn btn--small btn__disabled"
          disabled
        >
          <span className="Navbar__BalanceIcon">
            <WinnieFavicon />
          </span>
          {isLoading ? (
            <Loader size='mini' />
          ) : (
            balance?.value !== 0n ? `${parseFloat(formatEther(balance!.value)).toFixed(4)} BERA` : "0 BERA"
          )}
        </button>
      )}
    </div>
  );
};
