import { useMemo } from "react"
import { formatUnits } from "viem"
import { Pool as PoolV3, Position as PositionV3 } from "@uniswap/v3-sdk"
import { currentChain } from "../../config/wagmi"
import { Token } from "@uniswap/sdk-core"
import { useReadContract } from "wagmi"
import { CONTRACTS_ADDRESS } from "../../config/contractsAddress"
import { POSITION_MANAGER_ABI } from "../../config/abis/positionManagerABI"
import type { Pool } from "../../pages/PoolPage/page"

export interface Position {
  id: string;
  tokenId: string;
  owner: string;
  liquidity: string;
  tickLower: number;
  tickUpper: number;
  depositedToken0: string;
  depositedToken1: string;
  withdrawnToken0: string;
  withdrawnToken1: string;
  collectedFeesToken0: string;
  collectedFeesToken1: string;
  feeGrowthInside0LastX128: string;
  feeGrowthInside1LastX128: string;
}

export interface UsePositionManagerDatas {
  addLiquidity?: {
    t0Amount: bigint;
    t1Amount: bigint;
  };
  withdraw?: {
    liquidity: bigint;
  };
}

const emptyPosition = {
  isReady: false,
  inRange: false,
  positionDetails: null,
  unclaimedFees: null,
  refetch: () => { }
}

export const usePositionDatas = (position: Position, pool: Pool) => {
  if (!position || !pool) return emptyPosition

  /**
   * Datas calculate
   */
  const inRange = useMemo(() => {
    if (!pool.tick || !position) return false
    return pool.tick >= position.tickLower && pool.tick < position.tickUpper
  }, [pool, position])

  const sdkPool = useMemo(() => {
    try {
      return new PoolV3(
        new Token(currentChain.id, pool.token0Ref.id, pool.token0Ref.decimals, pool.token0Ref.symbol, pool.token0Ref.name),
        new Token(currentChain.id, pool.token1Ref.id, pool.token1Ref.decimals, pool.token1Ref.symbol, pool.token1Ref.name),
        pool.feeTier,
        pool.sqrtPrice,
        pool.liquidity,
        pool.tick || 0
      )
    } catch (error) {
      console.error('Error when formating pool:', error)
      return null
    }
  }, [pool])

  const sdkPosition = useMemo(() => {
    if (!sdkPool) return null

    try {
      return new PositionV3({
        pool: sdkPool,
        tickLower: position.tickLower,
        tickUpper: position.tickUpper,
        liquidity: position.liquidity
      })
    } catch (error) {
      console.error('Error when formating position:', error)
      return null
    }
  }, [sdkPool, position])

  const { data: onChainPosition, refetch: refetchOnChain } = useReadContract({
    address: CONTRACTS_ADDRESS.positionManager,
    abi: POSITION_MANAGER_ABI,
    functionName: "positions",
    args: [BigInt(position.tokenId)]
  })

  const formatTokenAmount = useMemo(() => {
    return (amount: string): string => {
      const num = parseFloat(amount);
      if (num === 0) return "0";

      // Si très petit nombre, afficher plus de décimales
      if (num < 0.01) return num.toFixed(6);
      if (num < 1) return num.toFixed(4);
      if (num < 100) return num.toFixed(2);
      return num.toLocaleString('en-US', { maximumFractionDigits: 2 });
    };
  }, []);

  const formatLiquidity = useMemo(() => {
    return (liquidity: string): string => {
      try {
        return BigInt(liquidity).toLocaleString('en-US');
      } catch (error) {
        return "0";
      }
    };
  }, []);

  const positionDetails = useMemo(() => {
    if (!sdkPosition) return null

    const t0Price = parseFloat(pool.token0Ref.tokenDayData?.items?.[0]?.priceUSD || "0")
    const t0Usd = parseFloat(sdkPosition.amount0.toExact()) * t0Price
    const t1Price = parseFloat(pool.token1Ref.tokenDayData?.items?.[0]?.priceUSD || "0")
    const t1Usd = parseFloat(sdkPosition.amount1.toExact()) * t1Price
    const posValueUSD = t0Usd + t1Usd

    try {
      return {
        token0Amount: formatTokenAmount(sdkPosition.amount0.toExact()),
        token1Amount: formatTokenAmount(sdkPosition.amount1.toExact()),
        token0USD: t0Usd,
        token1USD: t1Usd,
        positionValueUSD: posValueUSD,  // Valeur totale de la position en USD
        liquidityAmount: formatLiquidity(position?.liquidity || "0"),  // Quantité de liquidité formatée
        liquidityShare: ((posValueUSD / parseFloat(pool.totalValueLockedUSD)) * 100).toFixed(2)
      }
    } catch (error) {
      console.error("Error when calculate position's datas:", error)
      return null
    }
  }, [position, pool, sdkPosition])


  const unclaimedFees = useMemo(() => {
    if (!position || !pool) {
      return {
        token0Amount: "0",
        token1Amount: "0",
        hasUnclaimed: false
      }
    }

    if (onChainPosition) {
      const tokensOwed0 = onChainPosition[10]; // tokensOwed0 from positions() call
      const tokensOwed1 = onChainPosition[11]; // tokensOwed1 from positions() call

      const token0 = pool.token0Ref || (pool as any).token0
      const token1 = pool.token1Ref || (pool as any).token1

      return {
        token0Amount: formatTokenAmount(formatUnits(tokensOwed0, token0.decimals)),
        token1Amount: formatTokenAmount(formatUnits(tokensOwed1, token1.decimals)),
        hasUnclaimed: tokensOwed0 > 0n || tokensOwed1 > 0n
      }
    }

    if (pool.feeGrowthGlobal0X128 && position.feeGrowthInside0LastX128) {
      const feeGrowthGlobal0 = BigInt(pool.feeGrowthGlobal0X128);
      const feeGrowthGlobal1 = BigInt(pool.feeGrowthGlobal1X128);
      const feeGrowthInside0Last = BigInt(position.feeGrowthInside0LastX128);
      const feeGrowthInside1Last = BigInt(position.feeGrowthInside1LastX128);

      const feeGrowth0 = feeGrowthGlobal0 >= feeGrowthInside0Last
        ? feeGrowthGlobal0 - feeGrowthInside0Last
        : 0n;
      const feeGrowth1 = feeGrowthGlobal1 >= feeGrowthInside1Last
        ? feeGrowthGlobal1 - feeGrowthInside1Last
        : 0n;

      const liquidity = BigInt(position.liquidity);
      const fees0 = (liquidity * feeGrowth0) >> 128n;
      const fees1 = (liquidity * feeGrowth1) >> 128n;

      const token0 = pool.token0Ref || (pool as any).token0
      const token1 = pool.token1Ref || (pool as any).token1

      return {
        token0Amount: formatTokenAmount(formatUnits(fees0, token0.decimals)),
        token1Amount: formatTokenAmount(formatUnits(fees1, token1.decimals)),
        hasUnclaimed: fees0 > 0n || fees1 > 0n
      }
    }

    return {
      token0Amount: "0",
      token1Amount: "0",
      hasUnclaimed: false
    }
  }, [pool, position, onChainPosition, formatTokenAmount])

  return {
    isReady: (!!positionDetails && !!unclaimedFees),
    inRange,
    positionDetails,
    unclaimedFees,
    refetch: refetchOnChain
  }
}