import { formatUnits } from 'viem';
import type { OptimizedRoute, PoolInfo, SingleRoute } from '../hooks/useSwap';

export function getUsdAmount(tokenUsdPrice: number, amount: bigint, decimal: number = 18) {
  if (!tokenUsdPrice || amount === 0n) return 0;
  return tokenUsdPrice * +formatUnits(amount, decimal);
}

export function getPoolFeesInBera(opRoute: OptimizedRoute | null) {
  if (!opRoute) return 0;
  return opRoute.routes.reduce((total: number, { route }: { route: SingleRoute }) => {
    const poolsTotal = route.pools.reduce((ut: number, pool: PoolInfo) => {
      return ut + pool.fee
    }, 0)

    return poolsTotal + total
  }, 0);
}
