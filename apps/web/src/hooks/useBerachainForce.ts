import { useEffect } from 'react';
import { useAccount, useSwitchChain } from 'wagmi';
import { useAppKitNetwork } from '@reown/appkit/react';
import { currentChain, berachainNetwork } from '../config/wagmi';

/**
 * Hook pour forcer la connexion sur Berachain
 * - Switch automatique vers Berachain lors de la connexion
 */
export const useBerachainForce = () => {
  const { isConnected, chainId } = useAccount();
  const { switchChain } = useSwitchChain();
  const { switchNetwork } = useAppKitNetwork();

  // Vérifier si l'utilisateur est sur le bon réseau
  const isCorrectNetwork = chainId === currentChain.id;

  // Déterminer le réseau AppKit correspondant
  const targetAppKitNetwork = berachainNetwork;

  // Switch automatique vers Berachain lors de la connexion
  useEffect(() => {
    if (isConnected && !isCorrectNetwork) {
      // Essayer de switch automatiquement avec AppKit
      try {
        switchNetwork(targetAppKitNetwork);
      } catch (error) {
        console.warn('AppKit auto-switch failed, trying Wagmi:', error);
        // Fallback vers Wagmi si AppKit échoue
        try {
          switchChain({ chainId: currentChain.id });
        } catch (wagmiError) {
          console.warn('Wagmi auto-switch also failed:', wagmiError);
        }
      }
    }
  }, [isConnected, isCorrectNetwork, switchNetwork, switchChain, targetAppKitNetwork]);

  return {
    isCorrectNetwork,
    currentChainId: chainId,
    targetChainId: currentChain.id,
    targetChainName: currentChain.name,
  };
};
