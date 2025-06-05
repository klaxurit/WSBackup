import { createConfig, http } from 'wagmi';
// import { mainnet, sepolia } from 'wagmi/chains';
import { berachain, berachainBepolia } from 'viem/chains';

declare module 'wagmi' {
  interface Register {
    config: typeof config;
  }
}

// const berachainApiUrl = import.meta.env.VITE_BERACHAIN_API_URL;

export const config = createConfig({
  chains: [berachainBepolia],
  transports: {
    [berachainBepolia.id]: http(),
  },
}); 
