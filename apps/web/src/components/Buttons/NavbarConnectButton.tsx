import { useCallback, useEffect } from 'react';
import { useAppSelector } from '../../store/hooks';
import { useWallet } from '../../hooks/useWallet';
import { useBeraname } from '../../hooks/useBeraname';
import '../../styles/buttons.scss';
import { Loader } from '../Loader/Loader';

interface NavbarConnectButtonProps {
  onClick?: () => void;
  customClassName?: string;
}

export const NavbarConnectButton: React.FC<NavbarConnectButtonProps> = ({
  onClick,
  customClassName = '',
}) => {
  const { isConnected, address, balance } = useAppSelector((state) => state.wallet);
  const { connect, disconnect } = useWallet();
  const { beraname, isLoading, error } = useBeraname(address || undefined);
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
      console.error('Erreur de connexion:', err);
    }
  }, [connect, onClick]);

  const handleDisconnect = useCallback(() => {
    disconnect();
    if (onClick) onClick();
  }, [disconnect, onClick]);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <button
        className={`Navbar__ConnectButton btn btn--small btn__shade ${customClassName}`.trim()}
        onClick={isConnected ? handleDisconnect : handleConnect}
      >
        {isConnected && address ? (
          beraname ? `${beraname}` : `⛓️ ${formatAddress(address)}`
        ) : 'Connect'}
      </button>
      {isConnected && (
        <button
          className="Navbar__BalanceButton btn btn--small btn__disabled"
          disabled
        >
          {balance === undefined || balance === null || balance === '' ? (
            <Loader />
          ) : (
            `${parseFloat(balance).toFixed(4)} BERA`
          )}
        </button>
      )}
    </div>
  );
};