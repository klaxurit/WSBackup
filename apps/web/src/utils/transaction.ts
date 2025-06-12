import { formatEther } from 'viem';

export function getUsdAmount(tokenUsdPrice: number, amount: bigint) {
  if (!tokenUsdPrice || amount === 0n) return 0;
  return tokenUsdPrice * +formatEther(amount);
}

export function getPoolFeesInBera(selectedRoute: any) {
  if (!selectedRoute) return 0;
  return selectedRoute.pools.reduce((t: number, pool: any) => (t + pool.fee), 0);
}
