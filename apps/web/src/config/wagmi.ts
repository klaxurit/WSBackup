import { createConfig, http } from 'wagmi';
import { berachain, berachainBepolia } from 'viem/chains';

declare module 'wagmi' {
  interface Register {
    config: typeof config;
  }
}

// const berachainApiUrl = import.meta.env.VITE_BERACHAIN_API_URL;
//
export const currentChain = import.meta.env.NODE_ENV === "production"
  ? berachain
  : berachainBepolia

export const config = createConfig({
  chains: [currentChain],
  transports: {
    [berachain.id]: http(),
    [berachainBepolia.id]: http()
  },
}); 
