import { useCallback, useEffect } from 'react';
import { useAppDispatch } from '../store/hooks';
import { setWalletConnected, setWalletDisconnected, setError, setBalance } from '../store/slices/walletSlice';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { injected, walletConnect } from 'wagmi/connectors';
import { createPublicClient, http, formatEther } from 'viem';
import { berachain, berachainBepolia } from 'viem/chains';

export const useWallet = () => {
  const dispatch = useAppDispatch();
  const { address, isConnected, chainId } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect: wagmiDisconnect } = useDisconnect();

  // Synchroniser l'état Wagmi avec Redux à chaque changement
  useEffect(() => {
    if (isConnected && address && chainId) {
      dispatch(setWalletConnected({
        address,
        chainId: Number(chainId)
      }));
      // Récupérer la balance BERA
      const client = createPublicClient({ chain: berachain, transport: http('https://rpc.berachain.com/') });
      client.getBalance({ address }).then((balance) => {
        dispatch(setBalance(formatEther(balance)));
      }).catch(() => {
        dispatch(setBalance('0'));
      });
    } else if (!isConnected) {
      dispatch(setWalletDisconnected());
    }
  }, [isConnected, address, chainId, dispatch]);

  const connectWallet = useCallback(async (connectorId: 'injected' | 'walletConnect') => {
    try {
      const connector = connectorId === 'injected' ? injected() : walletConnect({
        projectId: '3fcc6bba6f1de962d911bb5b5c3dba68'
      });
      connect(
        { connector, chainId: berachainBepolia.id },
        {
          onSuccess: () => {
            // Redux sera synchronisé automatiquement par le useEffect
          },
          onError: (error) => {
            dispatch(setError(error instanceof Error ? error.message : 'Erreur de connexion'));
          }
        }
      );
    } catch (err) {
      dispatch(setError(err instanceof Error ? err.message : 'Erreur de connexion'));
    }
  }, [connect, dispatch]);

  const disconnectWallet = useCallback(() => {
    try {
      wagmiDisconnect();
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
