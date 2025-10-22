import { useCallback, useState, useRef, useEffect } from 'react';
import { useWallet } from '../../hooks/useWallet';
import { useBeraname } from '../../hooks/useBeraname';
import { Loader } from '../Loader/Loader';
import { useAccount, useBalance } from 'wagmi';
import { formatEther } from 'viem';
import { WinnieFavicon } from '../SVGs/LogoSVGs';
import earLeft from '../../assets/ear_left.png';
import earRight from '../../assets/ear_right.png';
import { Button } from '../Button/Button';

interface NavbarConnectButtonProps {
  onClick?: () => void;
  customClassName?: string;
  showLeftEar?: boolean;
  showRightEar?: boolean;
}

function getWalletName() {
  if (typeof window !== 'undefined' && (window as any).ethereum?.isMetaMask) return 'MetaMask';
  if (typeof window !== 'undefined' && (window as any).ethereum?.isRabby) return 'Rabby';
  if (typeof window !== 'undefined' && (window as any).ethereum?.isCoinbaseWallet) return 'Coinbase Wallet';
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
  showLeftEar = false,
  showRightEar = false,
}) => {
  const { connect, disconnect, isConnecting } = useWallet();
  const { isConnected, address } = useAccount();
  const { beraname } = useBeraname(address);
  const { data: balance, isLoading } = useBalance({ address });

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  const handleConnect = useCallback(() => {
    // Utiliser Web3Modal pour tous les appareils
    connect();
  }, [connect]);

  const handleDisconnect = useCallback(async () => {
    try {
      await disconnect();
      setDropdownOpen(false);
      if (onClick) onClick();
    } catch (error) {
      console.error('Error when disconnecting:', error);
    }
  }, [disconnect, onClick]);

  const handleCopy = useCallback(() => {
    if (address) navigator.clipboard.writeText(address);
  }, [address]);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <div style={{ position: 'relative' }} ref={dropdownRef}>
        <Button
          size="small"
          variant="shade"
          onClick={isConnected ? () => setDropdownOpen((v) => !v) : handleConnect}
          loading={isConnecting}
          customClassName={`btn__navbar-connect ${customClassName}`.trim()}
        >
          {isConnected && address ? (
            beraname ? `${beraname}` : `⛓️ ${formatAddress(address)}`
          ) : 'Connect'}
        </Button>
        {isConnected && dropdownOpen && (
          <div className="Navbar__Dropdown">
            <div className="Navbar__DropdownHeader">
              <p className="Navbar__Address">{beraname ? beraname : formatAddress(address!)}</p>
              <Button
                size="tiny"
                variant="shade"
                onClick={handleCopy}
                customClassName="btn__navbar-copy"
                title="Copy address"
                aria-label="Copy address"
              >
                <CopyIcon />
              </Button>
            </div>
            <div className="Navbar__DropdownWalletName">{getWalletName()}</div>
            <Button
              size="small"
              variant="accent"
              onClick={handleDisconnect}
              customClassName="btn__navbar-disconnect"
              title="Disconnect"
            >
              <LogoutIcon /> Disconnect
            </Button>
          </div>
        )}
      </div>
      {isConnected && (
        <div className="Navbar__BalanceButtonWrapper">
          {!showLeftEar && (
            <img src={earLeft} alt="Oreille gauche" className="ear left-ear" />
          )}
          <Button
            size="small"
            variant="disabled"
            disabled
            customClassName="btn__navbar-balance"
          >
            <span className="Navbar__BalanceIcon">
              <WinnieFavicon />
            </span>
            {isLoading ? (
              <Loader size='mini' />
            ) : (
              balance && balance.value !== undefined
                ? (balance.value !== 0n
                  ? `${parseFloat(formatEther(balance.value)).toFixed(4)} BERA`
                  : "0 BERA")
                : "—"
            )}
          </Button>
          {!showRightEar && (
            <img src={earRight} alt="Oreille droite" className="ear right-ear" />
          )}
        </div>
      )}
    </div>
  );
};
