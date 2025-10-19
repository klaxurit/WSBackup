import { useCallback, useEffect } from 'react';
import { useAppDispatch } from '../store/hooks';
import { setWalletConnected, setError, setBalance, clearWalletState } from '../store/slices/walletSlice';
import { useAccount, useDisconnect } from 'wagmi';
import { createPublicClient, http, formatEther } from 'viem';
import { berachain } from 'viem/chains';
import { useBerachainForce } from './useBerachainForce';
import { useAppKit } from '@reown/appkit/react';

export const useWallet = () => {
  const dispatch = useAppDispatch();
  const { address, isConnected, chainId } = useAccount();
  const { disconnect: wagmiDisconnect } = useDisconnect();
  const { isCorrectNetwork } = useBerachainForce();
  const { open } = useAppKit();

  // Synchroniser l'état Wagmi avec Redux à chaque changement
  useEffect(() => {
    if (isConnected && address && chainId) {
      console.log('[useWallet] Wallet connected:', {
        address,
        chainId,
        isCorrectNetwork
      });

      dispatch(setWalletConnected({
        address,
        chainId: Number(chainId)
      }));
      // Récupérer la balance BERA
      // Utiliser VITE_BERACHAIN_API_URL si disponible, sinon RPC par défaut
      const rpcUrl = import.meta.env.VITE_BERACHAIN_API_URL || 'https://rpc.berachain.com/';
      const client = createPublicClient({ chain: berachain, transport: http(rpcUrl) });
      client.getBalance({ address }).then((balance) => {
        console.log('[useWallet] Balance fetched:', formatEther(balance), 'BERA');
        dispatch(setBalance(formatEther(balance)));
      }).catch((error) => {
        console.error('[useWallet] Error fetching balance:', error);
        dispatch(setBalance('0'));
      });
    } else if (!isConnected) {
      console.log('[useWallet] Wallet disconnected');
      dispatch(clearWalletState());
    }
  }, [isConnected, address, chainId, dispatch, isCorrectNetwork]);

  const connectWallet = useCallback(() => {
    try {
      console.log('[useWallet] Opening connection modal...');
      // Ouvrir la modal de connexion AppKit
      open();
    } catch (err) {
      console.error('[useWallet] Connection error:', err);
      dispatch(setError(err instanceof Error ? err.message : 'Connection error'));
    }
  }, [open, dispatch]);

  const disconnectWallet = useCallback(async () => {
    try {
      console.log('[useWallet] Disconnecting wallet...');
      // Déconnecter via Wagmi
      await wagmiDisconnect();

      // Nettoyer l'état Redux
      dispatch(clearWalletState());
      console.log('[useWallet] Wallet disconnected successfully');

    } catch (err) {
      console.error('[useWallet] Disconnection error:', err);
      dispatch(setError(err instanceof Error ? err.message : 'Disconnection error'));
    }
  }, [wagmiDisconnect, dispatch]);

  return {
    connect: connectWallet,
    disconnect: disconnectWallet,
    address,
    chainId,
    isConnected,
    isConnecting: false,
    connectors: [],
    isCorrectNetwork,
  };
};
