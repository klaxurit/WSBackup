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
  const beraname = useBeraname(address || undefined);
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

  const className = `btn btn--small btn__shade ${customClassName}`.trim();

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <button
        className={className}
        onClick={isConnected ? handleDisconnect : handleConnect}
        style={{
          color: 'white',
          border: 'none',
        }}
      >
        {isConnected && address ? (
          beraname ? `${beraname}` : `⛓️ ${formatAddress(address)}`
        ) : 'Connect'}
      </button>
      {isConnected && (
        <button
          className="btn btn--small btn__disabled"
          style={{
            color: '#FFD056',
            background: 'rgba(255,255,255,0.08)',
            border: 'none',
            cursor: 'default',
            minWidth: 90,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            fontWeight: 600,
            fontSize: 14
          }}
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