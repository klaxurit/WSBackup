import React from 'react';
import { createAppKit } from '@reown/appkit/react';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { berachain, berachainBepolia } from 'viem/chains';
import { arbitrum, mainnet, polygon, base, defineChain } from '@reown/appkit/networks';
// Imports supprimés car nous utilisons maintenant AppKit complètement

// Note: Berachain sera géré via Wagmi directement, pas via AppKit
// car AppKit ne supporte que les réseaux prédéfinis

declare module 'wagmi' {
  interface Register {
    config: typeof config;
  }
}

export const currentChain = import.meta.env.VITE_NODE_ENV === "production"
  ? berachain
  : berachainBepolia

// Project ID WalletConnect
const projectId = 'f5f6f0d2a4bb55b22ce05e9e92a4e95e';

// Métadonnées de l'application
const metadata = {
  name: 'WinnieSwap',
  description: 'WinnieSwap - DeFi Protocol on Berachain',
  url: 'https://winnieswap.com',
  icons: ['https://winnieswap.com/logo.png']
};

// Note: Les chaînes sont maintenant gérées par AppKit via WagmiAdapter

// Création du réseau Berachain personnalisé pour AppKit
const berachainNetwork = defineChain({
  id: berachain.id,
  name: berachain.name,
  chainNamespace: 'eip155',
  caipNetworkId: `eip155:${berachain.id}`,
  nativeCurrency: berachain.nativeCurrency,
  rpcUrls: berachain.rpcUrls,
  blockExplorers: berachain.blockExplorers,
  testnet: berachain.testnet,
});

const berachainBepoliaNetwork = defineChain({
  id: berachainBepolia.id,
  name: berachainBepolia.name,
  chainNamespace: 'eip155',
  caipNetworkId: `eip155:${berachainBepolia.id}`,
  nativeCurrency: berachainBepolia.nativeCurrency,
  rpcUrls: berachainBepolia.rpcUrls,
  blockExplorers: berachainBepolia.blockExplorers,
  testnet: berachainBepolia.testnet,
});

// Configuration des réseaux AppKit avec Berachain
const appKitNetworks = [mainnet, polygon, arbitrum, base, berachainNetwork, berachainBepoliaNetwork];

// Export des réseaux Berachain pour utilisation dans les hooks
export { berachainNetwork, berachainBepoliaNetwork };

// Création de l'adaptateur Wagmi pour AppKit
const wagmiAdapter = new WagmiAdapter({
  networks: appKitNetworks,
  projectId,
  ssr: true
});

// Configuration Wagmi via AppKit (utilise la config de l'adaptateur)
export const config = wagmiAdapter.wagmiConfig;

// Création d'AppKit avec la configuration personnalisée
export const appKit = createAppKit({
  adapters: [wagmiAdapter],
  networks: appKitNetworks as any, // Cast temporaire pour éviter l'erreur de type
  projectId,
  metadata,
  themeMode: 'dark',
  themeVariables: {
    '--w3m-color-mix': '#180E00',
    '--w3m-color-mix-strength': 40,
    '--w3m-accent': '#ffa42d',
    '--w3m-font-family': 'inherit',
    '--w3m-border-radius-master': '16px',
  },
  features: {
    analytics: true,
    email: false, // Désactiver la connexion par email
    socials: [], // Désactiver toutes les connexions sociales
    onramp: false, // Désactiver l'onramp
  },
  enableWalletConnect: true,
  enableWallets: true, // S'assurer que les wallets sont activés
  enableNetworkSwitch: true,
  enableReconnect: true,
  allowUnsupportedChain: true, // Permettre Berachain même s'il n'est pas dans les réseaux supportés
});

// Provider pour l'application
export function AppKitProvider({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient();

  return React.createElement(
    WagmiProvider,
    { config },
    React.createElement(
      QueryClientProvider,
      { client: queryClient },
      children
    )
  );
}