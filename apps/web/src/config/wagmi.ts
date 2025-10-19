import React from 'react';
import { createAppKit } from '@reown/appkit/react';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { berachain } from 'viem/chains';
import { defineChain } from 'viem';
// Imports supprimés car nous utilisons maintenant AppKit complètement

// Note: Berachain sera géré via Wagmi directement, pas via AppKit
// car AppKit ne supporte que les réseaux prédéfinis

declare module 'wagmi' {
  interface Register {
    config: typeof config;
  }
}

export const currentChain = berachain

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

// Création du réseau Berachain personnalisé pour AppKit avec configuration WalletConnect complète
const berachainNetwork = defineChain({
  id: berachain.id,
  name: berachain.name,
  chainNamespace: 'eip155',
  caipNetworkId: `eip155:${berachain.id}`,
  nativeCurrency: berachain.nativeCurrency,
  rpcUrls: {
    default: {
      http: [import.meta.env.VITE_BERACHAIN_API_URL || 'https://rpc.berachain.com'],
    },
    public: {
      http: [import.meta.env.VITE_BERACHAIN_API_URL || 'https://rpc.berachain.com'],
    },
  },
  blockExplorers: berachain.blockExplorers,
  testnet: berachain.testnet,
});

// Configuration des réseaux AppKit avec Berachain
const appKitNetworks = [berachainNetwork];

// Export des réseaux Berachain pour utilisation dans les hooks
export { berachainNetwork };

// Création de l'adaptateur Wagmi pour AppKit avec support WalletConnect v2
const wagmiAdapter = new WagmiAdapter({
  networks: appKitNetworks,
  projectId,
  // ssr: true
});

// Configuration Wagmi via AppKit (utilise la config de l'adaptateur)
export const config = wagmiAdapter.wagmiConfig;

// Création d'AppKit avec la configuration personnalisée et support multisig
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
  // Configuration pour supporter les Smart Contract Wallets (Safe, etc.)
  enableCoinbase: true,
  enableInjected: true, // Support pour les wallets injectés et Safe App
  featuredWalletIds: [
    'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96', // MetaMask
    '4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0', // Trust Wallet
    // Safe Wallet sera disponible via WalletConnect
  ],
});

// Provider pour l'application
export function AppKitProvider({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient();

  return React.createElement(
    WagmiProvider,
    { config: config as any }, // Type cast pour résoudre les incompatibilités de version wagmi
    React.createElement(
      QueryClientProvider,
      { client: queryClient },
      children
    )
  );
}