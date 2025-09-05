// Configuration des vaults WinnieSwap
export const VAULT_CONFIG = {
  // Adresses des contrats (à remplacer par les vraies adresses)
  ROUTER_ADDRESS: import.meta.env.VITE_STICKY_VAULT_ROUTER || '0x...',

  // Configuration par défaut
  DEFAULT_SLIPPAGE_BPS: 100, // 1%
  DEFAULT_MAX_STAKING_SLIPPAGE_BPS: 100, // 1%

  // Swap executors supportés
  SWAP_EXECUTORS: {
    UNISWAP_V3: '0x...', // À remplacer par l'adresse réelle
    // Ajouter d'autres DEX si nécessaire
  },

  // Configuration des fees
  FEES: {
    PERFORMANCE_FEE: 10, // 10%
    MANAGEMENT_FEE: 2,   // 2%
  }
};

// Types pour les vaults
export interface VaultInfo {
  address: string;
  name: string;
  token0Address: string;
  token1Address: string;
  token0Symbol: string;
  token1Symbol: string;
  token0LogoUri?: string;
  token1LogoUri?: string;
  strategy: string;
  tvlUSD: number;
  apr: number;
  feesApr: number;
  rewardsApr: number;
  dayVolumeUSD: number;
  monthVolumeUSD: number;
  performanceFee: number;
  managementFee: number;
  underlyingPool: string;
  createdAt: string;
}

// Vaults disponibles (exemple - à remplacer par les vraies données)
export const AVAILABLE_VAULTS: VaultInfo[] = [
  {
    address: '0x...',
    name: 'WBERA/HONEY Auto-Compound',
    token0Address: '0x...',
    token1Address: '0x...',
    token0Symbol: 'WBERA',
    token1Symbol: 'HONEY',
    token0LogoUri: '/tokens/wbera.png',
    token1LogoUri: '/tokens/honey.png',
    strategy: 'Auto-Compound',
    tvlUSD: 1250000,
    apr: 15.5,
    feesApr: 8.2,
    rewardsApr: 7.3,
    dayVolumeUSD: 45000,
    monthVolumeUSD: 1200000,
    performanceFee: 10,
    managementFee: 2,
    underlyingPool: 'Uniswap V3',
    createdAt: '2024-01-15T00:00:00Z'
  },
  // Ajouter d'autres vaults ici
];

// Helper pour obtenir la configuration d'un vault
export const getVaultConfig = (vaultAddress: string) => {
  return {
    routerAddress: VAULT_CONFIG.ROUTER_ADDRESS,
    vaultAddress
  };
};

// Helper pour obtenir les informations d'un vault
export const getVaultInfo = (vaultAddress: string): VaultInfo | undefined => {
  return AVAILABLE_VAULTS.find(vault => vault.address.toLowerCase() === vaultAddress.toLowerCase());
};
