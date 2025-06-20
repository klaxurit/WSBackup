import { Injectable, Logger } from '@nestjs/common';
import { CoinGeckoService } from './coingecko.service';
import { DatabaseService } from 'src/database/database.service';
import {
  PoolWithSwap,
  PoolWithTokens,
  SwapWithPool,
} from '../types/tokenPrices';
import { BigNumber } from 'bignumber.js';
import { BlockchainService } from 'src/indexer/services/blockchain.service';
import { Pool } from '@repo/db';
import { UNISWAP_V3_POOL_ABI } from 'src/indexer/constants/abis';
import { Address, formatUnits } from 'viem';

@Injectable()
export class PoolPriceService {
  private readonly logger = new Logger(PoolPriceService.name);

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly coinGeckoService: CoinGeckoService,
    private readonly blockchainService: BlockchainService
  ) { }

  async getPoolStats() {
    return await this.databaseService.pool.findMany({
      include: {
        PoolStatistic: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 1
        },
        token0: true,
        token1: true
      }
    })
  }

  async updatePoolStats() {
    const pools = await this.databaseService.pool.findMany({
      include: {
        swaps: true,
      }
    })

    const batches = this.chunkArray(pools, 10)

    for (const batch of batches) {
      const promises = batch.map(async (pool) => {
        const dayVol = this.getVolumeByPeriod(pool, 24)
        const monthVol = this.getVolumeByPeriod(pool, 24 * 30)
        const aprAndTvl = await this.calculateApr(pool, dayVol)

        if (aprAndTvl) {
          await this.databaseService.poolStats.create({
            data: {
              poolId: pool.id,
              apr: aprAndTvl.apr,
              tvlUSD: aprAndTvl.tvlUSD,
              volOneDay: dayVol.toString(),
              volOneMonth: monthVol.toString(),
            }
          })
        }
      })

      await Promise.all(promises)
    }
  }

  async calculateTokenPrice(
    tokenAddress: string,
    pool: PoolWithTokens,
  ): Promise<number | null> {
    try {
      const { token0, token1 } = pool;

      const isToken0 =
        token0.address.toLowerCase() === tokenAddress.toLowerCase();
      const targetToken = isToken0 ? token0 : token1;
      const referenceToken = isToken0 ? token1 : token0;

      let referencePrice: number | null = null;

      if (referenceToken.coingeckoId) {
        referencePrice = await this.coinGeckoService.getTokenData(
          referenceToken.coingeckoId,
        );
      }

      if (!referencePrice) {
        referencePrice = await this.findReferencePriceRecursively(
          referenceToken.address,
          2,
        );
      }

      if (!referencePrice) {
        this.logger.warn(
          `Can't find price for reference token ${referenceToken.symbol}`,
        );
        return null;
      }

      const price = this.calculatePriceFromSqrtPriceX96(
        pool.sqrtPriceX96 || '0',
        targetToken.decimals,
        referenceToken.decimals,
        isToken0,
      );

      const calculatedPrice = price * referencePrice;

      this.logger.debug(
        `Price calculate for ${targetToken.symbol}: ${calculatedPrice} USD (with ${referenceToken.symbol} @ ${referencePrice})`,
      );

      return calculatedPrice;
    } catch (error) {
      this.logger.error(
        `Error can't calculate price for ${pool.address}:`,
        error,
      );
      return null;
    }
  }

  async calculatePriceFromSwap(
    tokenAddress: string,
    swap: SwapWithPool,
  ): Promise<number> {
    try {
      const { pool } = swap;
      const { token0, token1 } = pool as PoolWithTokens;

      const isToken0 =
        token0.address.toLowerCase() === tokenAddress.toLowerCase();
      const targetToken = isToken0 ? token0 : token1;
      const referenceToken = isToken0 ? token1 : token0;

      const amount0 = new BigNumber(swap.amount0);
      const amount1 = new BigNumber(swap.amount1);

      let priceRatio: number;

      if (isToken0) {
        // price token0 = |amount1| / |amount0| * (10^(decimals0 - decimals1))
        priceRatio = amount1
          .abs()
          .dividedBy(amount0.abs())
          .multipliedBy(
            new BigNumber(10).pow(token0.decimals - token1.decimals),
          )
          .toNumber();
      } else {
        // price token1 = |amount0| / |amount1| * (10^(decimals1 - decimals0))
        priceRatio = amount0
          .abs()
          .dividedBy(amount1.abs())
          .multipliedBy(
            new BigNumber(10).pow(token1.decimals - token0.decimals),
          )
          .toNumber();
      }

      let referencePrice: number | null = null;

      if (referenceToken.coingeckoId) {
        referencePrice = await this.coinGeckoService.getTokenData(
          referenceToken.coingeckoId,
        );
      }

      if (!referencePrice) {
        referencePrice = await this.findReferencePriceRecursively(
          referenceToken.address,
          2,
        );
      }

      if (!referencePrice) {
        return 0;
      }

      return priceRatio * referencePrice;
    } catch (error) {
      this.logger.error(`Error calculate price from swap:`, error);
      return 0;
    }
  }

  private calculatePriceFromSqrtPriceX96(
    sqrtPriceX96: string,
    decimals0: number,
    decimals1: number,
    isToken0: boolean,
  ): number {
    try {
      const sqrtPrice = new BigNumber(sqrtPriceX96);
      const Q96 = new BigNumber(2).pow(96);
      // price = (sqrtPriceX96 / 2^96)^2
      const price = sqrtPrice.dividedBy(Q96).pow(2);
      // price_adjusted = price * 10^(decimals0 - decimals1)
      const decimalAdjustment = new BigNumber(10).pow(decimals0 - decimals1);
      const adjustedPrice = price.multipliedBy(decimalAdjustment);

      if (isToken0) {
        return adjustedPrice.toNumber();
      } else {
        return new BigNumber(1).dividedBy(adjustedPrice).toNumber();
      }
    } catch (error) {
      this.logger.error(`Erreur calcul sqrtPriceX96:`, error);
      return 0;
    }
  }

  private async findReferencePriceRecursively(
    tokenAddress: string,
    maxDepth: number,
    visited: Set<string> = new Set(),
  ): Promise<number | null> {
    if (maxDepth <= 0 || visited.has(tokenAddress)) {
      return null;
    }

    visited.add(tokenAddress);

    try {
      const pools = await this.databaseService.pool.findMany({
        where: {
          OR: [
            { token0: { address: tokenAddress } },
            { token1: { address: tokenAddress } },
          ],
        },
        include: {
          token0: true,
          token1: true,
        },
        orderBy: {
          liquidity: 'desc',
        },
        take: 5,
      });

      for (const pool of pools) {
        const { token0, token1 } = pool;
        const otherToken =
          token0.address.toLowerCase() === tokenAddress.toLowerCase()
            ? token1
            : token0;

        if (otherToken.coingeckoId) {
          const otherTokenPrice = await this.coinGeckoService.getTokenData(
            otherToken.coingeckoId,
          );
          if (otherTokenPrice) {
            const isToken0 =
              token0.address.toLowerCase() === tokenAddress.toLowerCase();
            const priceRatio = this.calculatePriceFromSqrtPriceX96(
              pool.sqrtPriceX96 || '0',
              token0.decimals,
              token1.decimals,
              isToken0,
            );

            return priceRatio * otherTokenPrice;
          }
        }

        if (maxDepth > 1) {
          const recursivePrice = await this.findReferencePriceRecursively(
            otherToken.address,
            maxDepth - 1,
            new Set(visited),
          );

          if (recursivePrice) {
            const isToken0 =
              token0.address.toLowerCase() === tokenAddress.toLowerCase();
            const priceRatio = this.calculatePriceFromSqrtPriceX96(
              pool.sqrtPriceX96 || '0',
              token0.decimals,
              token1.decimals,
              isToken0,
            );

            return priceRatio * recursivePrice;
          }
        }
      }

      return null;
    } catch (error) {
      this.logger.error(
        `Error find recursive price for ${tokenAddress}:`,
        error,
      );

      return null;
    }
  }

  private getVolumeByPeriod(pool: PoolWithSwap, hourPeriod: number = 24): bigint {
    const xHourAgo = new Date()
    xHourAgo.setHours(xHourAgo.getHours() - hourPeriod)

    const dayliSwaps = pool.swaps.filter(s => s.createdAt > xHourAgo)
    const vol = dayliSwaps.reduce((total, swap) => {
      return total + BigInt(Math.abs(parseInt(swap.amount0)))
    }, 0n)

    return vol
  }

  private async calculateApr(pool: Pool, volume24h: bigint): Promise<{ apr: number, tvlUSD: number } | null> {
    const token0Stat = await this.databaseService.tokenStats.findMany({
      where: {
        tokenId: pool.token0Id
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 1
    })
    const token1Stat = await this.databaseService.tokenStats.findMany({
      where: {
        tokenId: pool.token1Id
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 1
    })

    if (token0Stat.length === 0 || token1Stat.length === 0) return null

    const [slot0, liquidity, fee] = await this.blockchainService.getPublicClient().multicall({
      contracts: [
        {
          address: (pool.address as Address),
          abi: UNISWAP_V3_POOL_ABI,
          functionName: 'slot0'
        },
        {
          address: (pool.address as Address),
          abi: UNISWAP_V3_POOL_ABI,
          functionName: 'liquidity'
        },
        {
          address: (pool.address as Address),
          abi: UNISWAP_V3_POOL_ABI,
          functionName: 'fee'
        }
      ]
    })

    const sqrtPriceX96 = slot0.result![0]
    const poolLiquidity = liquidity.result
    const poolFee = fee.result

    if (!sqrtPriceX96 || !poolLiquidity || !poolFee) return null

    const price = Number(sqrtPriceX96) ** 2 / (2 ** 192)
    const amount1 = Number(formatUnits(poolLiquidity || 0n, 18))
    const amount0 = amount1 / price
    const tvlUSD = (amount0 * token0Stat[0].price) + (amount1 * token1Stat[0].price)

    const vol24hUSD = Number(formatUnits(volume24h, 18)) * token0Stat[0].price
    const fees24h = vol24hUSD * (poolFee / 10000)

    const apr = (fees24h / tvlUSD) * 365 / 100

    return { apr, tvlUSD }
  }

  async findBestPricingPath(tokenAddress: string): Promise<string[]> {
    const paths: string[][] = [];

    const explorePaths = async (
      currentToken: string,
      currentPath: string[],
      maxDepth: number,
    ): Promise<void> => {
      if (maxDepth <= 0 || currentPath.includes(currentToken)) return;

      const newPath = [...currentPath, currentToken];

      const token = await this.databaseService.token.findUnique({
        where: { address: currentToken },
      });

      if (token?.coingeckoId) {
        paths.push(newPath);

        return;
      }

      const pools = await this.databaseService.pool.findMany({
        where: {
          OR: [
            { token0: { address: currentToken } },
            { token1: { address: currentToken } },
          ],
        },
        include: {
          token0: true,
          token1: true,
        },
        orderBy: {
          liquidity: 'desc',
        },
        take: 3,
      });

      for (const pool of pools) {
        const otherToken =
          pool.token0.address.toLowerCase() === currentToken.toLowerCase()
            ? pool.token1
            : pool.token0;

        await explorePaths(otherToken.address, newPath, maxDepth - 1);
      }
    };

    await explorePaths(tokenAddress, [], 3);

    return paths.length > 0
      ? paths.reduce((shortest, current) =>
        current.length < shortest.length ? current : shortest,
      )
      : [];
  }

  async validatePoolForPricing(poolAddress: string): Promise<boolean> {
    try {
      const pool = await this.databaseService.pool.findUnique({
        where: { address: poolAddress },
        include: {
          token0: true,
          token1: true,
        },
      });

      if (!pool || !pool.sqrtPriceX96 || !pool.liquidity) {
        return false;
      }

      const hasReference = pool.token0.coingeckoId || pool.token1.coingeckoId;

      if (!hasReference) {
        const token0Path = await this.findBestPricingPath(pool.token0.address);
        const token1Path = await this.findBestPricingPath(pool.token1.address);

        return token0Path.length > 0 || token1Path.length > 0;
      }

      return true;
    } catch (error) {
      this.logger.error(`Error validate pool ${poolAddress}:`, error);
      return false;
    }
  }

  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }
}
