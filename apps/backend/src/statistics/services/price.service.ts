import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { PoolPriceService } from './poolPrice.service';
import { Token } from '@repo/db';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CoinGeckoService } from 'src/coingecko/coingecko.service';

@Injectable()
export class PriceService {
  private readonly logger = new Logger(PriceService.name);

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly poolPrice: PoolPriceService,
    private readonly coingeckoService: CoinGeckoService,
  ) {}

  async getTokenStats() {
    return await this.databaseService.token.findMany({
      include: {
        Statistic: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        },
      },
    });
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async updateTokensPrice() {
    const tokens = await this.databaseService.token.findMany();
    const batches = this.chunkArray(tokens, 10);

    for (const batch of batches) {
      const promises = batch.map(async (token) => {
        const volume = await this.calculateVolume24h(token);
        const currentPrice = await this.getTokenPrice(token);

        if (currentPrice) {
          const oneHourEvolution = await this.getPriceVariation(
            token,
            1,
            currentPrice,
          );
          const oneDayEvolution = await this.getPriceVariation(
            token,
            24,
            currentPrice,
          );

          await this.databaseService.tokenStats.create({
            data: {
              tokenId: token.id,
              price: currentPrice,
              oneHourEvolution: oneHourEvolution || 0,
              oneDayEvolution: oneDayEvolution || 0,
              volume: volume || 0,
            },
          });
        }

        return { token };
      });

      await Promise.all(promises);
    }
  }

  async getTokenPrice(token: Token): Promise<number | null> {
    this.logger.debug('Looking price of ' + token.symbol);

    let currentPrice: number | null = null;
    if (token?.coingeckoId) {
      try {
        currentPrice = await this.coingeckoService.getTokenData(
          token.coingeckoId,
        );
        this.logger.debug('Coingecko price: ', currentPrice);
      } catch (error) {
        this.logger.error(
          `Coingecko error for ${token.symbol}:`,
          error.message,
        );
      }
    }

    if (!currentPrice) {
      try {
        currentPrice = await this.getPriceFromPools(token);
        this.logger.debug('Pools price ', currentPrice);
      } catch (error) {
        this.logger.error(
          `calculation error for ${token.symbol}:`,
          error.message,
        );
      }
    }

    return currentPrice;
  }

  async getMultipleTokensPrices(tokens: Token[]): Promise<Map<string, number>> {
    const results = new Map<string, number>();

    const batches = this.chunkArray(tokens, 10);

    for (const batch of batches) {
      const promises = batch.map((token) =>
        this.getTokenPrice(token)
          .then((price) => ({ address: token.address, price }))
          .catch((error) => {
            this.logger.error(`Error for ${token.symbol}:`, error);
            return { address: token.address, price: null };
          }),
      );

      const batchResults = await Promise.all(promises);
      batchResults.forEach(({ address, price }) => {
        if (price) {
          results.set(address, price);
        }
      });
    }

    return results;
  }

  private async getPriceFromPools(token: Token): Promise<number | null> {
    const pools = await this.databaseService.pool.findMany({
      where: {
        OR: [
          { token0: { address: token.address } },
          { token1: { address: token.address } },
        ],
      },
      include: {
        token0: true,
        token1: true,
      },
      orderBy: {
        liquidity: 'desc',
      },
    });

    if (pools.length === 0) {
      this.logger.warn(`No pool for token ${token.address}`);
      return null;
    }

    for (const pool of pools) {
      try {
        const price = await this.poolPrice.calculateTokenPrice(
          token.address,
          pool,
        );

        if (price) {
          return price;
        }
      } catch (error) {
        this.logger.error(`calculation error for pool ${pool.address}:`, error);
        continue;
      }
    }

    return null;
  }

  private async getPriceVariation(
    token: Token,
    hour: number,
    currentPrice: number,
  ): Promise<number | null> {
    const xHourAgo = new Date();
    xHourAgo.setHours(xHourAgo.getHours() - hour);

    const prevStat = await this.databaseService.token.findMany({
      where: { id: token.id },
      include: {
        Statistic: {
          where: {
            createdAt: {
              lte: xHourAgo,
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        },
      },
    });

    if (
      !prevStat ||
      prevStat.length === 0 ||
      prevStat[0].Statistic.length === 0
    )
      return null;

    return (
      ((currentPrice - prevStat[0].Statistic[0].price) /
        prevStat[0].Statistic[0].price) *
      100
    );
  }

  private async calculateVolume24h(token: Token): Promise<number | null> {
    const oneDayAgo = new Date();
    oneDayAgo.setHours(oneDayAgo.getHours() - 24);

    const tokenWithSwaps = await this.databaseService.token.findUnique({
      where: {
        address: token.address,
      },
      include: {
        poolsAsToken0: {
          include: {
            swaps: {
              where: {
                createdAt: {
                  gte: oneDayAgo,
                },
              },
            },
          },
        },
        poolsAsToken1: {
          include: {
            swaps: {
              where: {
                createdAt: {
                  gte: oneDayAgo,
                },
              },
            },
          },
        },
      },
    });

    if (!tokenWithSwaps) return null;

    const totalAsToken0 = tokenWithSwaps.poolsAsToken0.reduce((total, pool) => {
      return pool.swaps.reduce((swapVol, swap) => {
        return total + swapVol + Math.abs(parseInt(swap.amount0));
      }, 0);
    }, 0);
    const totalAsToken1 = tokenWithSwaps.poolsAsToken1.reduce((total, pool) => {
      return (
        total +
        pool.swaps.reduce((swapVol, swap) => {
          return swapVol + Math.abs(parseInt(swap.amount1));
        }, 0)
      );
    }, 0);

    return totalAsToken0 + totalAsToken1;
  }

  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }
}
