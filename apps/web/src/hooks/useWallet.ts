import { useCallback } from 'react';
import { useAppDispatch } from '../store/hooks';
import { setWalletConnected, setWalletDisconnected, setError } from '../store/slices/walletSlice';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { injected, walletConnect } from 'wagmi/connectors';

export const useWallet = () => {
  const dispatch = useAppDispatch();
  const { address, isConnected, chainId } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect: wagmiDisconnect } = useDisconnect();

  const connectWallet = useCallback(async (connectorId: 'injected' | 'walletConnect') => {
    try {
      const connector = connectorId === 'injected' ? injected() : walletConnect({
        projectId: '3fcc6bba6f1de962d911bb5b5c3dba68'
      });
      await connect({ connector });

      if (address && chainId) {
        dispatch(setWalletConnected({
          address,
          chainId: Number(chainId)
        }));
      }
    } catch (err) {
      dispatch(setError(err instanceof Error ? err.message : 'Erreur de connexion'));
    }
  }, [connect, address, chainId, dispatch]);

  const disconnectWallet = useCallback(() => {
    try {
      wagmiDisconnect();
      dispatch(setWalletDisconnected());
    } catch (err) {
      dispatch(setError(err instanceof Error ? err.message : 'Erreur de déconnexion'));
    }
  }, [wagmiDisconnect, dispatch]);

  return {
    connect: connectWallet,
    disconnect: disconnectWallet,
    address,
    chainId,
    isConnected,
    isConnecting: isPending,
    connectors
  };
}; 