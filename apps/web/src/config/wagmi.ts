import { createConfig, http } from 'wagmi';
import { mainnet, sepolia } from 'wagmi/chains';
import { berachain } from 'viem/chains';

declare module 'wagmi' {
  interface Register {
    config: typeof config;
  }
}

export const config = createConfig({
  chains: [mainnet, sepolia, berachain],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [berachain.id]: http('https://api.henlo-winnie.dev/v1/mainnet/29d1c692-5145-4ae5-8bef-42f00f5f4671'),
  },
}); 