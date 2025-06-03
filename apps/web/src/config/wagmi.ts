import { createConfig, http } from 'wagmi';
import { mainnet, sepolia } from 'wagmi/chains';
import { berachain } from 'viem/chains';

declare module 'wagmi' {
  interface Register {
    config: typeof config;
  }
}

const berachainApiUrl = import.meta.env.VITE_BERACHAIN_API_URL;

export const config = createConfig({
  chains: [mainnet, sepolia, berachain],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [berachain.id]: http(berachainApiUrl),
  },
}); 