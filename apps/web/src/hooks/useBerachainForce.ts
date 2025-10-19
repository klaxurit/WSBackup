import { useEffect } from 'react';
import { useAccount, useSwitchChain } from 'wagmi';
import { useAppKitNetwork } from '@reown/appkit/react';
import { currentChain, berachainNetwork } from '../config/wagmi';

/**
 * Détecte si le wallet connecté est un smart contract wallet (Safe, etc.)
 */
const isSmartContractWallet = (connectorName?: string): boolean => {
  if (!connectorName) return false;
  const smartWalletIndicators = ['safe', 'gnosis', 'multisig', 'walletconnect'];
  return smartWalletIndicators.some(indicator =>
    connectorName.toLowerCase().includes(indicator)
  );
};

/**
 * Hook pour forcer la connexion sur Berachain
 * - Switch automatique vers Berachain lors de la connexion
 * - Désactivé pour les wallets multisig Safe pour éviter les interruptions de connexion
 */
export const useBerachainForce = () => {
  const { isConnected, chainId, connector } = useAccount();
  const { switchChain } = useSwitchChain();
  const { switchNetwork } = useAppKitNetwork();

  // Vérifier si l'utilisateur est sur le bon réseau
  const isCorrectNetwork = chainId === currentChain.id;

  // Déterminer le réseau AppKit correspondant
  const targetAppKitNetwork = berachainNetwork;

  // Switch automatique vers Berachain lors de la connexion
  useEffect(() => {
    // Ne pas switch automatiquement pour les smart contract wallets (Safe, etc.)
    // car cela peut interrompre le processus de connexion WalletConnect
    const isSafeWallet = isSmartContractWallet(connector?.name);

    if (isConnected && !isCorrectNetwork && !isSafeWallet) {
      console.log('[BerachainForce] Auto-switching to Berachain...', {
        currentChain: chainId,
        targetChain: currentChain.id,
        connector: connector?.name
      });

      // Essayer de switch automatiquement avec AppKit
      try {
        switchNetwork(targetAppKitNetwork);
      } catch (error) {
        console.warn('[BerachainForce] AppKit auto-switch failed, trying Wagmi:', error);
        // Fallback vers Wagmi si AppKit échoue
        try {
          switchChain({ chainId: currentChain.id });
        } catch (wagmiError) {
          console.warn('[BerachainForce] Wagmi auto-switch also failed:', wagmiError);
        }
      }
    } else if (isSafeWallet) {
      console.log('[BerachainForce] Safe wallet detected, skipping auto-switch to prevent connection issues');
    }
  }, [isConnected, isCorrectNetwork, switchNetwork, switchChain, targetAppKitNetwork, chainId, connector]);

  return {
    isCorrectNetwork,
    currentChainId: chainId,
    targetChainId: currentChain.id,
    targetChainName: currentChain.name,
  };
};
