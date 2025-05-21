import { useCallback, useEffect } from 'react';
import { useAppSelector } from '../../store/hooks';
import { useWallet } from '../../hooks/useWallet';
import { useBeraname } from '../../hooks/useBeraname';
import '../../styles/buttons.scss';

interface NavbarConnectButtonProps {
  onClick?: () => void;
  customClassName?: string;
}

export const NavbarConnectButton: React.FC<NavbarConnectButtonProps> = ({
  onClick,
  customClassName = '',
}) => {
  const { isConnected } = useAppSelector((state) => state.wallet);
  const { connect, disconnect, address, chainId } = useWallet();
  const beraname = useBeraname(address);
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
  );
};