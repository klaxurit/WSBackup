import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { PoolWithSwap } from '../types/tokenPrices';
import { Pool } from '@repo/db';
import { Address, formatUnits } from 'viem';
import { Cron, CronExpression } from '@nestjs/schedule';
import { BlockchainService } from 'src/blockchain/blockchain.service';
import { V3_POOL_ABI } from 'src/blockchain/abis/V3_POOL_ABI';

@Injectable()
export class PoolPriceService {
  private readonly logger = new Logger(PoolPriceService.name);

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly blockchainService: BlockchainService,
  ) {}

  async getPoolStats() {
    return await this.databaseService.pool.findMany({
      include: {
        PoolStatistic: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        },
        token0: true,
        token1: true,
      },
    });
  }

  async getOnePoolStat(token0Addr: string, token1Addr: string, fee: number) {
    const pool = await this.databaseService.pool.findFirst({
      where: {
        OR: [
          {
            AND: [
              {
                token0: {
                  address: { equals: token0Addr, mode: 'insensitive' },
                },
              },
              {
                token1: {
                  address: { equals: token1Addr, mode: 'insensitive' },
                },
              },
              { fee: fee },
            ],
          },
          {
            AND: [
              {
                token0: {
                  address: { equals: token1Addr, mode: 'insensitive' },
                },
              },
              {
                token1: {
                  address: { equals: token0Addr, mode: 'insensitive' },
                },
              },
              { fee: fee },
            ],
          },
        ],
      },
      include: {
        PoolStatistic: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        },
        token0: {
          include: {
            Statistic: {
              orderBy: {
                createdAt: 'desc',
              },
              take: 1,
            },
          },
        },
        token1: {
          include: {
            Statistic: {
              orderBy: {
                createdAt: 'desc',
              },
              take: 1,
            },
          },
        },
      },
    });

    return pool;
  }

  async getTopPoolStats() {
    return await this.databaseService.pool.findMany({
      include: {
        PoolStatistic: {
          orderBy: {
            tvlUSD: 'desc',
          },
          take: 1,
        },
        token0: true,
        token1: true,
      },
      take: 4,
    });
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async updatePoolStats() {
    const pools = await this.databaseService.pool.findMany({
      include: {
        swaps: true,
      },
    });

    const batches = this.chunkArray(pools, 10);

    for (const batch of batches) {
      const promises = batch.map(async (pool) => {
        const dayVol = this.getVolumeByPeriod(pool, 24);
        const monthVol = this.getVolumeByPeriod(pool, 24 * 30);
        const aprAndTvl = await this.calculateApr(pool, dayVol);

        if (aprAndTvl) {
          await this.databaseService.poolStats.create({
            data: {
              poolId: pool.id,
              apr: aprAndTvl.apr,
              tvlUSD: aprAndTvl.tvlUSD,
              volOneDay: dayVol.toString(),
              volOneMonth: monthVol.toString(),
            },
          });
        }
      });

      await Promise.all(promises);
    }
  }

  private getVolumeByPeriod(
    pool: PoolWithSwap,
    hourPeriod: number = 24,
  ): bigint {
    const xHourAgo = new Date();
    xHourAgo.setHours(xHourAgo.getHours() - hourPeriod);

    const dayliSwaps = pool.swaps.filter((s) => s.createdAt > xHourAgo);
    const vol = dayliSwaps.reduce((total, swap) => {
      return total + BigInt(Math.abs(parseInt(swap.amount0)));
    }, 0n);

    return vol;
  }

  private async calculateApr(
    pool: Pool,
    volume24h: bigint,
  ): Promise<{ apr: number; tvlUSD: number } | null> {
    const token0Stat = await this.databaseService.tokenStats.findMany({
      where: {
        tokenId: pool.token0Id,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 1,
    });
    const token1Stat = await this.databaseService.tokenStats.findMany({
      where: {
        tokenId: pool.token1Id,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 1,
    });

    if (token0Stat.length === 0 || token1Stat.length === 0) return null;

    const [slot0, liquidity, fee] =
      await this.blockchainService.client.multicall({
        contracts: [
          {
            address: pool.address as Address,
            abi: V3_POOL_ABI,
            functionName: 'slot0',
          },
          {
            address: pool.address as Address,
            abi: V3_POOL_ABI,
            functionName: 'liquidity',
          },
          {
            address: pool.address as Address,
            abi: V3_POOL_ABI,
            functionName: 'fee',
          },
        ],
      });

    const sqrtPriceX96 = slot0.result![0];
    const poolLiquidity = liquidity.result;
    const poolFee = fee.result;

    if (!sqrtPriceX96 || !poolLiquidity || !poolFee) return null;

    const price = Number(sqrtPriceX96) ** 2 / 2 ** 192;
    const amount1 = Number(formatUnits(poolLiquidity || 0n, 18));
    const amount0 = amount1 / price;
    const tvlUSD =
      amount0 * token0Stat[0].price + amount1 * token1Stat[0].price;

    const vol24hUSD = Number(formatUnits(volume24h, 18)) * token0Stat[0].price;
    const fees24h = vol24hUSD * (poolFee / 10000);

    const apr = ((fees24h / tvlUSD) * 365) / 100;

    return { apr, tvlUSD };
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
