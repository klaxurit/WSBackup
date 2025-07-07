import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { PoolPriceService } from './poolPrice.service';
import { Token } from '@repo/db';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CoinGeckoService } from 'src/coingecko/coingecko.service';
import { PoolWithTokens } from '../types/tokenPrices';
import { BigNumber } from 'bignumber.js';

@Injectable()
export class PriceService {
  private readonly logger = new Logger(PriceService.name);

  private cachedTokens: Map<string, number> = new Map();

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
    this.cachedTokens = new Map();

    const tokens = await this.databaseService.token.findMany();

    // First update all token with coingeckoId
    const tokenWithCoinGecko = tokens.filter((t) => !!t.coingeckoId);
    await this.updateWithCoingecko(tokenWithCoinGecko);

    // For other get price using pool
    const otherTokens = tokens.filter((t) => !t.coingeckoId);
    otherTokens.forEach(async (token) => {
      const currentPrice = await this.getPriceFromPools(token);
      if (currentPrice) {
        console.log(`${token.symbol} ->  ${currentPrice}`);
        this.cachedTokens.set(token.address, currentPrice);
      }
    });

    //   const promises = batch.map(async (token) => {
    //     const volume = await this.calculateVolume24h(token);
    //     const currentPrice = await this.getTokenPrice(token);
    //
    //     if (currentPrice) {
    //       const oneHourEvolution = await this.getPriceVariation(
    //         token,
    //         1,
    //         currentPrice,
    //       );
    //       const oneDayEvolution = await this.getPriceVariation(
    //         token,
    //         24,
    //         currentPrice,
    //       );
    //
    //       await this.databaseService.tokenStats.create({
    //         data: {
    //           token: { connect: { id: token.id } },
    //           price: currentPrice || 0,
    //           oneHourEvolution: oneHourEvolution || 0,
    //           oneDayEvolution: oneDayEvolution || 0,
    //           volume: volume || 0,
    //         },
    //       });
    //     }
    //
    //     return { token };
    //   });
    console.log(this.cachedTokens);
  }

  async updateWithCoingecko(tokens: Token[]) {
    this.logger.log(`Update ${tokens.length} tokens with CoinGecko`);
    const ids = tokens.map((t) => t.coingeckoId).join(',');

    const prices = await this.coingeckoService.getMultiTokensData(ids);
    if (!prices) return;

    tokens.forEach((t) => {
      const price = prices[t.coingeckoId!];
      if (price) {
        this.cachedTokens.set(t.address, price.usd);
      }
    });
  }

  private async getPriceFromPools(token: Token): Promise<number | null> {
    // Find a pool with thie token and one of the cachedTokens
    const cachedTokensAddr = Array.from(this.cachedTokens.keys());
    const pools = await this.databaseService.pool.findMany({
      where: {
        OR: [
          {
            token0: { address: token.address },
            token1: { address: { in: cachedTokensAddr } },
          },
          {
            token0: { address: { in: cachedTokensAddr } },
            token1: { address: token.address },
          },
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

    let price: number | null = null;
    for (const pool of pools) {
      price = await this.calculateTokenPrice(token.address, pool);

      if (price) {
        break;
      }
    }

    return price;
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

  private calculateTokenPrice(
    tokenAddress: string,
    pool: PoolWithTokens,
  ): number | null {
    try {
      const { token0, token1 } = pool;

      if (!pool.sqrtPriceX96) throw new Error('No sqrtPriceX96 for this pool');

      const isToken0 =
        token0.address.toLowerCase() === tokenAddress.toLowerCase();
      const targetToken = isToken0 ? token0 : token1;
      const referenceToken = isToken0 ? token1 : token0;

      const referencePrice = this.cachedTokens.get(referenceToken.address);

      if (!referencePrice) {
        throw new Error('Token not in cachedTokens...');
        // referencePrice = await this.findReferencePriceRecursively(
        //   referenceToken.address,
        //   2,
        // );
      }

      const price = this.calculatePriceFromSqrtPriceX96(
        pool.sqrtPriceX96,
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

  // private async findReferencePriceRecursively(
  //   tokenAddress: string,
  //   maxDepth: number,
  //   visited: Set<string> = new Set(),
  // ): Promise<number | null> {
  //   if (maxDepth <= 0 || visited.has(tokenAddress)) {
  //     return null;
  //   }
  //
  //   visited.add(tokenAddress);
  //
  //   try {
  //     const pools = await this.databaseService.pool.findMany({
  //       where: {
  //         OR: [
  //           { token0: { address: tokenAddress } },
  //           { token1: { address: tokenAddress } },
  //         ],
  //       },
  //       include: {
  //         token0: true,
  //         token1: true,
  //       },
  //       orderBy: {
  //         liquidity: 'desc',
  //       },
  //       take: 5,
  //     });
  //
  //     for (const pool of pools) {
  //       const { token0, token1 } = pool;
  //       const otherToken =
  //         token0.address.toLowerCase() === tokenAddress.toLowerCase()
  //           ? token1
  //           : token0;
  //
  //       if (otherToken.coingeckoId) {
  //         const otherTokenPrice = await this.coinGeckoService.getTokenData(
  //           otherToken.coingeckoId,
  //         );
  //         if (otherTokenPrice) {
  //           const isToken0 =
  //             token0.address.toLowerCase() === tokenAddress.toLowerCase();
  //           const priceRatio = this.calculatePriceFromSqrtPriceX96(
  //             pool.sqrtPriceX96 || '0',
  //             token0.decimals,
  //             token1.decimals,
  //             isToken0,
  //           );
  //
  //           return priceRatio * otherTokenPrice;
  //         }
  //       }
  //
  //       if (maxDepth > 1) {
  //         const recursivePrice = await this.findReferencePriceRecursively(
  //           otherToken.address,
  //           maxDepth - 1,
  //           new Set(visited),
  //         );
  //
  //         if (recursivePrice) {
  //           const isToken0 =
  //             token0.address.toLowerCase() === tokenAddress.toLowerCase();
  //           const priceRatio = this.calculatePriceFromSqrtPriceX96(
  //             pool.sqrtPriceX96 || '0',
  //             token0.decimals,
  //             token1.decimals,
  //             isToken0,
  //           );
  //
  //           return priceRatio * recursivePrice;
  //         }
  //       }
  //     }
  //
  //     return null;
  //   } catch (error) {
  //     this.logger.error(
  //       `Error find recursive price for ${tokenAddress}:`,
  //       error,
  //     );
  //
  //     return null;
  //   }
  // }
}
