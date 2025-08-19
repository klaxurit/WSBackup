import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { BlockchainService } from 'src/blockchain/blockchain.service';
import { Prisma } from '@repo/db';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CoinGeckoService } from 'src/coingecko/coingecko.service';
import { PoolWithTokens } from '../types/tokenPrices';
import { BigNumber } from 'bignumber.js';
import { Address, formatUnits, parseUnits } from 'viem';

type TokenWithStats = Prisma.TokenGetPayload<{
  include: {
    Statistic: true;
  };
}>;

interface CachedToken {
  tokenId: string;
  fetchedData: TokenWithStats; // default data before token update.
  poolMap: Set<string>;
  price?: number;
  oneHourEvolution?: number | null;
  oneDayEvolution?: number | null;
  volume?: number | null;
  fdv?: number | null;
  marketCap?: number | null;
  totalSupply?: string;
  circulatingSupply?: string;
}

@Injectable()
export class PriceService {
  private readonly logger = new Logger(PriceService.name);
  private readonly BATCH_SIZE = 10;

  private cachedTokens: Map<string, CachedToken> = new Map();
  private poolsCache: Map<string, PoolWithTokens[]> = new Map();

  private isUpdating = false;

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly coingeckoService: CoinGeckoService,
    private readonly blockchainService: BlockchainService,
  ) { }

  async getTokenStats(page: number = 1, limit: number = 50) {
    const skip = (page - 1) * limit;
    const maxLimit = Math.min(limit, 100); // Cap à 100 max

    const tokens = await this.databaseService.token.findMany({
      where: {
        OR: [
          { poolsAsToken0: { some: {} } },
          { poolsAsToken1: { some: {} } }
        ]
      }, // Seulement tokens actifs dans des pools
      include: {
        Statistic: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
          select: {
            price: true,
            oneHourEvolution: true,
            oneDayEvolution: true,
            volume: true,
            fdv: true,
            marketCap: true,
            createdAt: true,
          },
        },
        _count: {
          select: {
            poolsAsToken1: true,
            poolsAsToken0: true,
          },
        },
      },
      orderBy: [
        {
          Statistic: {
            _count: 'desc' // Tokens avec plus de statistiques en premier
          }
        },
        { createdAt: 'desc' }
      ],
      skip,
      take: maxLimit,
    });

    return {
      data: tokens.map((t) => ({
        ...t,
        inPool: t._count.poolsAsToken0 > 0 || t._count.poolsAsToken1 > 0,
      })),
      pagination: {
        page,
        limit: maxLimit,
        hasMore: tokens.length === maxLimit,
        total: tokens.length,
      },
    };
  }

  /**
   * TODO
   * 1. Optimize pool cache. Fetch all pool once only and use cache for buildTokenPoolsMap and getPriceFromPools
   * 2. Fetch Stats from 24h and 1h ago to optimize getPriceVariation function
   */

  // Prepare tokens for update
  private async prepareTokens(): Promise<void> {
    this.cachedTokens.clear();
    this.poolsCache.clear();

    // 1. Create token list to update.
    const tokens = await this.databaseService.token.findMany({
      include: {
        Statistic: {
          orderBy: { createdAt: 'desc' },
          take: 2,
        },
        _count: {
          select: {
            poolsAsToken1: true,
            poolsAsToken0: true,
          },
        },
      },
    });

    this.logger.debug(`${tokens.length} tokens in DB`);
    const tokensInPool = tokens.filter((t) => {
      return t._count.poolsAsToken0 > 0 || t._count.poolsAsToken1 > 0;
    });

    this.logger.debug(`${tokensInPool.length} to update (inPool tokens)`);
    tokensInPool.forEach((t) => {
      this.cachedTokens.set(t.id, {
        tokenId: t.id,
        fetchedData: t,
        poolMap: new Set(),
      });
    });

    await this.buildTokenPoolsMap();
  }

  // Cleanup old statistics to prevent database bloat
  private async cleanupOldStatistics(): Promise<void> {
    try {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      const deleteResult = await this.databaseService.client.tokenStatistic.deleteMany({
        where: {
          createdAt: {
            lt: thirtyDaysAgo
          }
        }
      });

      this.logger.log(`Cleaned up ${deleteResult.count} old token statistics (older than 30 days)`);
    } catch (error) {
      this.logger.error('Error cleaning up old statistics:', error);
    }
  }

  // Main update method with improved error handling
  @Cron(CronExpression.EVERY_5_MINUTES)
  async updateTokenStats(): Promise<void> {
    this.logger.log('🕐 Cron job triggered - starting token statistics update...');

    if (this.isUpdating) {
      this.logger.debug('Update already in progress, skipping...');
      return;
    }

    this.isUpdating = true;
    const startTime = Date.now();

    try {
      this.logger.log('Starting token statistics update...');

      await this.prepareTokens();
      await this.updatePrices();
      await this.updateTokensSupply();
      await this.calculateStatistics();
      await this.saveCachedTokens();

      // Cleanup old data periodically
      if (Math.random() < 0.2) { // 20% chance each run
        await this.cleanupOldStatistics();
      }

      const duration = Date.now() - startTime;
      this.logger.log(`✅ Token statistics update completed in ${duration}ms`);

    } catch (error) {
      this.logger.error('❌ Error in token statistics update:', error);
    } finally {
      this.isUpdating = false;
    }
  }

  private async buildTokenPoolsMap(): Promise<void> {
    const tokenAddresses = [...this.cachedTokens.values()].map(
      (t) => t.fetchedData.address,
    );
    const addressToTokenID = new Map<string, string>();
    this.cachedTokens.forEach((t, tokenId) => {
      addressToTokenID.set(t.fetchedData.address, tokenId);
    });

    const pools = await this.databaseService.pool.findMany({
      where: {
        OR: [
          { token0: { address: { in: tokenAddresses } } },
          { token1: { address: { in: tokenAddresses } } },
        ],
      },
      include: { token0: true, token1: true },
      orderBy: { liquidity: 'desc' },
    });

    pools.forEach((pool) => {
      const addr0 = pool.token0.address;
      const addr1 = pool.token1.address;

      const t0 = addressToTokenID.get(addr0);
      const t1 = addressToTokenID.get(addr1);

      if (t0) {
        this.cachedTokens.get(t0)!.poolMap.add(addr1);
      }
      if (t1) {
        this.cachedTokens.get(t1)!.poolMap.add(addr0);
      }
    });
  }

  private async updatePrices(): Promise<void> {
    const [tokensWithCoinGecko, tokensWithoutCoinGecko] = [
      ...this.cachedTokens.values(),
    ].reduce(
      (acc, token) => {
        acc[token.fetchedData.coingeckoId ? 0 : 1].push(token);
        return acc;
      },
      [[], []] as [CachedToken[], CachedToken[]],
    );

    this.logger.debug(
      `Update price. ${tokensWithCoinGecko.length} tokens with coingeckoID, ${tokensWithoutCoinGecko.length} whitout`,
    );
    await this.updateWithCoingecko(tokensWithCoinGecko);
    await this.updateWithPool(tokensWithoutCoinGecko);
  }

  private async updateTokensSupply(): Promise<void> {
    this.logger.debug(`fetch ${this.cachedTokens.size} tokens supply data`);

    const fetchSupplyPromises = [...this.cachedTokens.values()].map(
      async (token) => {
        try {
          const totalSupply = await this.getTotalSupply(token);
          if (totalSupply) {
            token.totalSupply = totalSupply;
          } else {
            token.totalSupply = token.fetchedData.totalSupply || '0';
          }

          if (token.circulatingSupply) {
            this.logger.debug(
              `Circulatin supply (with CoinGecko) form token ${token.fetchedData.symbol}: ${token.circulatingSupply}`,
            );
            return;
          }
          const circulatingSupply = await this.getCirculatingSupply(token);
          if (circulatingSupply) {
            token.circulatingSupply = circulatingSupply;
          } else {
            token.circulatingSupply =
              token.fetchedData.circulatingSupply || '0';
          }
        } catch (error) {
          this.logger.error(
            `Error enriching token ${token.fetchedData.symbol}:`,
            error,
          );
        }
      },
    );

    await Promise.all(fetchSupplyPromises);
    this.logger.debug(`fetch supply completed for tokens`);
  }

  // total supply functions
  private async getTotalSupply(token: CachedToken): Promise<string | null> {
    try {
      const totalSupply = await this.blockchainService.client.readContract({
        address: token.fetchedData.address as Address,
        abi: [
          {
            inputs: [],
            name: 'totalSupply',
            outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
            stateMutability: 'view',
            type: 'function',
          },
        ],
        functionName: 'totalSupply',
      });

      this.logger.debug(
        `TotalSupply for token ${token.fetchedData.symbol} : ${totalSupply}`,
      );
      return totalSupply.toString();
    } catch (error) {
      this.logger.error(
        `Error fetching total supply for ${token.fetchedData.symbol}:`,
        error,
      );
      return null;
    }
  }

  // Circulating supply functions
  private async getCirculatingSupply(
    token: CachedToken,
  ): Promise<string | null> {
    try {
      if (token?.totalSupply === '0') {
        return null;
      }

      // Strategy 1: Burn analysis
      const burnedSupply = await this.getBurnedSupply(token);
      if (burnedSupply) {
        const circulating = BigInt(token.totalSupply!) - BigInt(burnedSupply);

        if (circulating > 0n) {
          this.logger.debug(
            `Circulating supply (with burn analysis) for token ${token.fetchedData.symbol} : ${circulating.toString()}`,
          );
          return circulating.toString();
        }
      }

      // Strategy 2: Heuristic estimation
      const ratio = this.getCirculatingRatioHeuristic(token);
      const estimatedCirculating = (BigInt(token.totalSupply!) * ratio) / 100n;
      if (estimatedCirculating > 0n) {
        this.logger.debug(
          `Circulating supply (with heuristic estimation) for token ${token.fetchedData.symbol} : ${estimatedCirculating}`,
        );
        return estimatedCirculating.toString();
      }
      this.logger.debug(
        `No Circulating supply for token ${token.fetchedData.symbol}`,
      );
      return null;
    } catch (error) {
      this.logger.error(
        `Error calculating circulating supply in memory for ${token.fetchedData.symbol}:`,
        error,
      );
      return null;
    }
  }
  private async getBurnedSupply(token: CachedToken): Promise<string | null> {
    try {
      const burnAddresses = [
        '0x000000000000000000000000000000000000dead',
        '0x0000000000000000000000000000000000000000',
        '0x000000000000000000000000000000000000dEaD',
      ];

      let totalBurned = new BigNumber(0);

      for (const burnAddress of burnAddresses) {
        try {
          const balance = await this.blockchainService.client.readContract({
            address: token.fetchedData.address as Address,
            abi: [
              {
                inputs: [
                  { internalType: 'address', name: 'account', type: 'address' },
                ],
                name: 'balanceOf',
                outputs: [
                  { internalType: 'uint256', name: '', type: 'uint256' },
                ],
                stateMutability: 'view',
                type: 'function',
              },
            ],
            functionName: 'balanceOf',
            args: [burnAddress as Address],
          });

          totalBurned = totalBurned.plus(balance.toString());
        } catch {
          continue;
        }
      }

      return totalBurned.gt(0) ? totalBurned.toString() : null;
    } catch (error) {
      this.logger.error(
        `Error calculating burned supply for ${token.fetchedData.symbol}:`,
        error,
      );
      return null;
    }
  }
  private getCirculatingRatioHeuristic(token: CachedToken): bigint {
    try {
      // Base assumption: most DeFi tokens have high circulation (80-95%)
      let baseRatio = 0.85; // 85% default

      const tokenAgeMonths =
        (Date.now() - token.fetchedData.createdAt.getTime()) /
        (1000 * 60 * 60 * 24 * 30);

      if (tokenAgeMonths < 1) {
        // Very new tokens: 90-95% circulating (most launches)
        baseRatio = 0.92;
      } else if (tokenAgeMonths < 6) {
        // Recent tokens: 85-90% circulating
        baseRatio = 0.87;
      } else {
        // Established tokens: 80-85% circulating
        baseRatio = 0.82;
      }

      // Check if token has high trading activity (suggests good distribution)
      if (token.volume && token.volume > 1000) {
        // $1000+ daily volume
        baseRatio += 0.05; // Increase by 5% for active tokens
      }

      // Cap the ratio at 95%
      return BigInt(Math.round(Math.min(baseRatio, 0.95) * 100));
    } catch {
      this.logger.error(
        `Error in heuristic calculation for ${token.fetchedData.symbol}`,
      );
      return BigInt(Math.round(0.85 * 100)); // Safe default
    }
  }

  // Price functions
  private async updateWithCoingecko(tokens: CachedToken[]) {
    if (tokens.length === 0) return;

    const ids = tokens.map((t) => t.fetchedData.coingeckoId).join(',');

    try {
      const prices = await this.coingeckoService.getMultiTokensData(ids);

      if (!prices) {
        this.logger.warn(`No prices received from CoinGecko for ${tokens.length} tokens`);
        return;
      }

      let successCount = 0;
      let failureCount = 0;

      for (const token of tokens) {
        try {
          const price = prices[token.fetchedData.coingeckoId!];

          if (price) {
            this.cachedTokens.set(token.fetchedData.id, {
              ...token,
              ...(price.usd && { price: price.usd }),
              ...(price.circulating_supply && {
                circulatingSupply: parseUnits(
                  price.circulating_supply.toString(),
                  token.fetchedData.decimals,
                ).toString(),
              }),
              ...(price.usd_24h_change && {
                oneDayEvolution: price.usd_24h_change,
              }),
              ...(price.usd_market_cap && { marketCap: price.usd_market_cap }),
            });
            successCount++;

            this.logger.debug(
              `Price (with coingecko) for token ${token.fetchedData.symbol}: ${price?.usd}`,
            );
          } else {
            this.logger.warn(`No price data for token ${token.fetchedData.symbol} (ID: ${token.fetchedData.coingeckoId})`);
            failureCount++;
          }
        } catch (error) {
          this.logger.error(`Error processing token ${token.fetchedData.symbol}:`, error);
          failureCount++;
        }
      }

      this.logger.log(`CoinGecko update completed: ${successCount} success, ${failureCount} failures`);

    } catch (error) {
      this.logger.error('Error in updateWithCoingecko:', error);

      // Fallback: essayer de récupérer les prix un par un en cas d'échec global
      this.logger.log('Attempting individual token price updates as fallback...');
      await this.updateWithCoingeckoFallback(tokens);
    }
  }

  private async updateWithCoingeckoFallback(tokens: CachedToken[]) {
    const BATCH_SIZE = 5; // Traiter par petits groupes pour éviter le rate limiting

    for (let i = 0; i < tokens.length; i += BATCH_SIZE) {
      const batch = tokens.slice(i, i + BATCH_SIZE);

      const batchPromises = batch.map(async (token) => {
        try {
          const price = await this.coingeckoService.getTokenData(token.fetchedData.coingeckoId!);

          if (price) {
            this.cachedTokens.set(token.fetchedData.id, {
              ...token,
              price: price,
            });

            this.logger.debug(
              `Fallback price for token ${token.fetchedData.symbol}: ${price}`,
            );
          }
        } catch (error) {
          this.logger.error(`Fallback error for token ${token.fetchedData.symbol}:`, error);
        }
      });

      await Promise.all(batchPromises);

      // Pause entre les batches pour éviter le rate limiting
      if (i + BATCH_SIZE < tokens.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }
  private async updateWithPool(tokens: CachedToken[]): Promise<void> {
    if (tokens.length === 0) return;

    const sortedTokens = tokens.sort((a, b) => {
      return b.poolMap.size - a.poolMap.size;
    });

    let successCount = 0;
    let failureCount = 0;

    for (let i = 0; i < sortedTokens.length; i += this.BATCH_SIZE) {
      const batch = sortedTokens.slice(i, i + this.BATCH_SIZE);

      const batchPromises = batch.map(async (token) => {
        try {
          const price = await this.getPriceFromPools(token);

          if (price) {
            this.cachedTokens.set(token.fetchedData.id, {
              ...token,
              price: price,
            });
            successCount++;

            this.logger.debug(
              `Price (with pool) for token ${token.fetchedData.symbol}: ${price}`,
            );
          } else {
            this.logger.warn(`No price found from pools for token ${token.fetchedData.symbol}`);
            failureCount++;
          }
        } catch (error) {
          this.logger.error(`Error getting price from pools for token ${token.fetchedData.symbol}:`, error);
          failureCount++;
        }
      });

      await Promise.all(batchPromises);

      // Pause entre les batches pour éviter la surcharge
      if (i + this.BATCH_SIZE < sortedTokens.length) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    this.logger.log(`Pool price update completed: ${successCount} success, ${failureCount} failures`);
  }
  private async getPriceFromPools(token: CachedToken): Promise<number | null> {
    const cacheKey = `pools_${token.fetchedData.address}`;
    let pools = this.poolsCache.get(cacheKey);

    if (!pools) {
      const pairTokens = [...token.poolMap.values()];
      pools = await this.databaseService.pool.findMany({
        where: {
          OR: [
            {
              token0: { address: token.fetchedData.address },
              token1: { address: { in: pairTokens } },
            },
            {
              token0: { address: { in: pairTokens } },
              token1: { address: token.fetchedData.address },
            },
          ],
        },
        include: { token0: true, token1: true },
        orderBy: { liquidity: 'desc' },
        take: 3,
      });

      this.poolsCache.set(cacheKey, pools);
    }

    if (pools.length === 0) {
      return null;
    }

    for (const pool of pools) {
      const price = this.calculateTokenPrice(token.fetchedData.address, pool);
      if (price) {
        return price;
      }
    }

    return null;
  }
  private calculateTokenPrice(
    tokenAddress: string,
    pool: PoolWithTokens,
  ): number | null {
    try {
      const { token0, token1 } = pool;

      if (!pool.sqrtPriceX96) {
        throw new Error('No sqrtPriceX96 for this pool');
      }

      const isToken0 =
        token0.address.toLowerCase() === tokenAddress.toLowerCase();
      const targetToken = isToken0 ? token0 : token1;
      const referenceToken = isToken0 ? token1 : token0;

      const referencePrice = this.cachedTokens.get(referenceToken.id)?.price;
      if (!referencePrice) {
        return null;
      }

      const price = this.calculatePriceFromSqrtPriceX96(
        pool.sqrtPriceX96,
        targetToken.decimals,
        referenceToken.decimals,
        isToken0,
      );

      const calculatedPrice = price * referencePrice;

      this.logger.debug(
        `Price calculated for ${targetToken.symbol}: ${calculatedPrice} USD (via ${referenceToken.symbol} @ ${referencePrice})`,
      );

      return calculatedPrice;
    } catch (error) {
      this.logger.error(
        `Error calculating price for pool ${pool.address}:`,
        error?.message,
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
      const price = sqrtPrice.dividedBy(Q96).pow(2);
      const decimalAdjustment = new BigNumber(10).pow(decimals0 - decimals1);
      const adjustedPrice = price.multipliedBy(decimalAdjustment);

      return isToken0
        ? adjustedPrice.toNumber()
        : new BigNumber(1).dividedBy(adjustedPrice).toNumber();
    } catch (error) {
      this.logger.error('Error calculating sqrtPriceX96:', error);
      return 0;
    }
  }

  // Stats functions
  private async calculateStatistics() {
    const statisticsPromises = [...this.cachedTokens.values()].map(
      async (token) => {
        const [volume, oneHourEvolution, oneDayEvolution] = await Promise.all([
          this.calculateVolume24h(token),
          this.getPriceVariation(token, 1),
          this.getPriceVariation(token, 24),
        ]);
        const [fdv, marketCap] = this.calculateFDVAndMarketCap(token);
        this.logger.debug(
          `Stats for token ${token.fetchedData.symbol}: volume: ${volume}, oneHourEvolution: ${oneHourEvolution}, oneDayEvolution: ${oneDayEvolution}, fdv: ${fdv}, marketCap: ${marketCap}`,
        );
        this.cachedTokens.set(token.tokenId, {
          ...token,
          volume,
          oneHourEvolution,
          oneDayEvolution,
          fdv,
          marketCap,
        });
      },
    );

    await Promise.all(statisticsPromises);
  }
  private async calculateVolume24h(token: CachedToken): Promise<number | null> {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    try {
      const result = await this.databaseService.client.$queryRaw<
        Array<{ volume0: string; volume1: string }>
      >`
        SELECT 
          COALESCE(SUM(ABS(CAST(s.amount0 AS DECIMAL))), 0) as volume0,
          COALESCE(SUM(ABS(CAST(s.amount1 AS DECIMAL))), 0) as volume1
        FROM swaps s
        INNER JOIN pools p ON s."poolId" = p.id
        WHERE (p."token0Id" = ${token.tokenId} OR p."token1Id" = ${token.tokenId})
          AND s."createdAt" >= ${oneDayAgo}
      `;

      if (result.length === 0) return null;

      const volume0 = parseFloat(result[0].volume0) || 0;
      const volume1 = parseFloat(result[0].volume1) || 0;

      return volume0 + volume1;
    } catch (error) {
      this.logger.error(
        `Error calculating volume for ${token.fetchedData.symbol}:`,
        error,
      );

      return null;
    }
  }
  private async getPriceVariation(
    token: CachedToken,
    hours: number,
  ): Promise<number | null> {
    if (!token.price) return null;

    if (token.fetchedData.Statistic && token.fetchedData.Statistic.length > 0) {
      const xHoursAgo = new Date(Date.now() - hours * 60 * 60 * 1000);
      const relevantStat = token.fetchedData.Statistic.find(
        (stat) => stat.createdAt <= xHoursAgo,
      );

      if (relevantStat) {
        return ((token.price - relevantStat.price) / relevantStat.price) * 100;
      }
    }

    // Fallback if no stats found
    const xHoursAgo = new Date(Date.now() - hours * 60 * 60 * 1000);
    const prevStat = await this.databaseService.tokenStats.findFirst({
      where: {
        tokenId: token.tokenId,
        createdAt: { lte: xHoursAgo },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!prevStat) return null;

    return ((token.price - prevStat.price) / prevStat.price) * 100;
  }
  private calculateFDVAndMarketCap(
    token: CachedToken,
  ): [number | null, number | null] {
    try {
      if (!token.totalSupply || !token.price) {
        this.logger.debug(
          `No total supply or price available for ${token.fetchedData.symbol}`,
        );
        return [null, null];
      }

      const totalSupplyNumber =
        Number(token.totalSupply) / 10 ** token.fetchedData.decimals;
      const fdv = totalSupplyNumber * token.price;

      let marketCap: number | null = null;

      if (token.circulatingSupply) {
        const circulatingSupplyNumber =
          Number(token.circulatingSupply) / 10 ** token.fetchedData.decimals;

        if (circulatingSupplyNumber <= 0) {
          this.logger.warn(
            `Circulating supply converted to zero for ${token.fetchedData.symbol}: raw=${token.circulatingSupply}, decimals=${token.fetchedData.decimals}, converted=${circulatingSupplyNumber}. Using FDV as fallback.`,
          );
          marketCap = fdv; // Use FDV as fallback
        } else {
          marketCap = circulatingSupplyNumber * token.price;
        }
      } else {
        // Fallback: use FDV as Market Cap if no circulating supply available
        marketCap = fdv;
      }

      return [fdv, marketCap];
    } catch (error) {
      this.logger.error(
        `Error calculating FDV for ${token.fetchedData.symbol}:`,
        error,
      );
      return [null, null];
    }
  }
  private async saveCachedTokens(): Promise<void> {
    try {
      const toSaveTokens = [...this.cachedTokens.values()];
      if (toSaveTokens.length === 0) return;

      const newStatsDatas: Prisma.TokenStatisticCreateArgs[] = [];
      const toUpdateToken: Prisma.TokenUpdateArgs[] = [];

      toSaveTokens.forEach((t) => {
        // Sauvegarder les statistiques même si certaines données sont manquantes
        // Cela permet d'avoir au moins un historique partiel
        if (t.price) { // Prix minimum requis
          const statData: any = {
            tokenId: t.tokenId,
            price: t.price,
          };

          // Ajouter les données disponibles
          if (t.oneHourEvolution !== undefined && t.oneHourEvolution !== null) {
            statData.oneHourEvolution = t.oneHourEvolution;
          }
          if (t.oneDayEvolution !== undefined && t.oneDayEvolution !== null) {
            statData.oneDayEvolution = t.oneDayEvolution;
          }
          if (t.volume !== undefined && t.volume !== null) {
            statData.volume = t.volume;
          }
          if (t.fdv !== undefined && t.fdv !== null) {
            statData.fdv = t.fdv;
          }
          if (t.marketCap !== undefined && t.marketCap !== null) {
            statData.marketCap = t.marketCap;
          }

          // S'assurer que les champs obligatoires ont des valeurs par défaut
          if (!statData.oneHourEvolution) statData.oneHourEvolution = 0;
          if (!statData.oneDayEvolution) statData.oneDayEvolution = 0;
          if (!statData.volume) statData.volume = 0;

          newStatsDatas.push({
            data: statData,
          });
        }

        // Mettre à jour les tokens avec les nouvelles données de supply
        if (t.totalSupply && t.circulatingSupply) {
          toUpdateToken.push({
            where: { id: t.tokenId },
            data: {
              totalSupply: t.totalSupply,
              circulatingSupply: t.circulatingSupply,
            },
          });
        }
      });

      await this.databaseService.client.$transaction([
        ...newStatsDatas.map((datas) =>
          this.databaseService.tokenStats.create(datas),
        ),
        ...toUpdateToken.map((datas) =>
          this.databaseService.token.update(datas),
        ),
      ]);

      this.logger.log(
        `Saved ${newStatsDatas.length} token statistics to database (${toSaveTokens.length} tokens processed)`,
      );
    } catch (error) {
      this.logger.error('Error saving cached tokens to database:', error);
    }
  }
}
