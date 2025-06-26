import { useMemo } from "react"
import { formatUnits } from "viem"
import { Pool, Position } from "@uniswap/v3-sdk"
import { berachainBepolia } from "wagmi/chains"
import { Token } from "@uniswap/sdk-core"
import type { PositionData } from "./usePositions"

export const usePositionManager = (positionData?: PositionData) => {
  const pool = positionData?.pool || null
  const position = positionData?.position || null

  const inRange = useMemo(() => {
    if (!pool || !position) return false
    return pool.tick >= position.tickLower && pool.tick < position.tickUpper
  }, [pool, position])

  const sdkPool = useMemo(() => {
    if (!pool) return null

    try {
      return new Pool(
        new Token(berachainBepolia.id, pool.token0.address, pool.token0.decimals, pool.token0.symbol, pool.token0.name),
        new Token(berachainBepolia.id, pool.token1.address, pool.token1.decimals, pool.token1.symbol, pool.token1.name),
        pool.fee,
        pool.sqrtPriceX96 || "0",
        pool.liquidity || "0",
        pool.tick
      )
    } catch (error) {
      console.error('Error when formating pool:', error)
      return null
    }
  }, [pool])

  const sdkPosition = useMemo(() => {
    if (!sdkPool || !position) return null

    try {
      return new Position({
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

  const positionDetails = useMemo(() => {
    if (!sdkPosition) return null

    try {
      return {
        token0Amount: sdkPosition.amount0.toExact(),
        token1Amount: sdkPosition.amount1.toExact(),
        totalTokens: +sdkPosition.amount0.toFixed(6) + +sdkPosition.amount1.toFixed(6),
        currentPrice: sdkPosition.pool.token0Price.toSignificant(6),
        liquidityShare: pool?.liquidity && position?.liquidity ?
          ((Number(position.liquidity?.toString() || '0') / Number(pool.liquidity.toString())) * 100).toFixed(2) + '%' : '0%'
      }
    } catch (error) {
      console.error("Error when calculate position's datas:", error)
      return null
    }
  }, [position, pool, sdkPosition])

  const unclaimedFees = useMemo(() => {
    if (!position || !pool) {
      return {
        token0Amount: 0,
        token1Amount: 0,
        hasUnclaimed: false
      }
    }

    return {
      token0Amount: parseFloat(formatUnits(BigInt(position.tokenOwed0), pool.token0.decimals)).toFixed(6),
      token1Amount: parseFloat(formatUnits(BigInt(position.tokenOwed1), pool.token1.decimals)).toFixed(6),
      hasUnclaimed: BigInt(position.tokenOwed0) > 0n || BigInt(position.tokenOwed1) > 0n
    }
  }, [pool, position])

  return {
    inRange,
    positionDetails,
    unclaimedFees
  }
}
