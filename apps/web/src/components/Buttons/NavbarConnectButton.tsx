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

// Helper pour détecter le nom du wallet (simple heuristique)
function getWalletName() {
  if (window.ethereum?.isMetaMask) return 'MetaMask';
  if (window.ethereum?.isRabby) return 'Rabby';
  if (window.ethereum?.isCoinbaseWallet) return 'Coinbase Wallet';
  return 'Wallet';
}

// Icône Copy
const CopyIcon = () => (
  <svg width="16" height="16" fill="none" viewBox="0 0 16 16">
    <rect x="5" y="5" width="8" height="8" rx="2" fill="currentColor" stroke="currentColor" strokeWidth="1.5" />
    <rect x="3" y="3" width="8" height="8" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

// Icône Logout
const LogoutIcon = () => (
  <svg width="16" height="16" fill="none" viewBox="0 0 16 16"><path d="M6 12.5V13A1.5 1.5 0 0 0 7.5 14.5h5A1.5 1.5 0 0 0 14 13V3A1.5 1.5 0 0 0 12.5 1.5h-5A1.5 1.5 0 0 0 6 3v.5" stroke="#fff" strokeWidth="1.5" /><path d="M2.5 8h7m0 0-2-2m2 2-2 2" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
);

export const NavbarConnectButton: React.FC<NavbarConnectButtonProps> = ({
  onClick,
  customClassName = '',
}) => {
  const { connect, disconnect } = useWallet();
  const { isConnected, address } = useAccount()
  const { beraname } = useBeraname(address);
  const { data: balance, isLoading } = useBalance({
    address
  })

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fermer le dropdown si clic en dehors
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen]);

  const formatAddress = (addr: string) => {
    if (!addr) return '';
    const start = addr.substring(0, 6);
    const end = addr.substring(addr.length - 4);
    return `${start}...${end}`;
  };

  const handleConnect = useCallback(async () => {
    try {
      await connect('injected');
      if (onClick) onClick();
    } catch (err) {
      console.error('Connection error:', err);
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
        >
          {isConnected && address ? (
            beraname ? `${beraname}` : `⛓️ ${formatAddress(address)}`
          ) : 'Connect'}
        </button>
        {isConnected && dropdownOpen && (
          <div className="Navbar__Dropdown">
            <div className="Navbar__DropdownHeader">
              <p className="Navbar__Address">{beraname ? beraname : formatAddress(address!)}</p>
              <button
                className="Navbar__CopyButton"
                onClick={handleCopy}
                title="Copier l'adresse"
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
            <Loader size='mini'/>
          ) : (
            balance?.value !== 0n ? `${parseFloat(formatEther(balance!.value)).toFixed(4)} BERA` : "0 BERA"
          )}
        </button>
      )}
    </div>
  );
};
