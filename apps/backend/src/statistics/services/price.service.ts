import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { Token } from '@repo/db';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CoinGeckoService } from 'src/coingecko/coingecko.service';
import { PoolWithTokens } from '../types/tokenPrices';
import { BigNumber } from 'bignumber.js';

interface CachedToken {
  tokenId: string;
  price: number;
  oneHourEvolution: number;
  oneDayEvolution: number;
  volume: number;
}

interface TokenWithStats extends Token {
  Statistic: Array<{
    price: number;
    createdAt: Date;
  }>;
  _count: {
    poolsAsToken1: number;
    poolsAsToken0: number;
  };
}

@Injectable()
export class PriceService {
  private readonly logger = new Logger(PriceService.name);
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  private readonly MAX_PASSES = 5;
  private readonly BATCH_SIZE = 10;

  private cachedTokens: Map<string, CachedToken> = new Map();
  private poolsCache: Map<string, PoolWithTokens[]> = new Map();

  private tokenPoolsMap: Map<string, Set<string>> = new Map();

  constructor(
    private readonly databaseService: DatabaseService,
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
    const startTime = Date.now();
    let processedTokens = 0;

    try {
      this.cachedTokens.clear();
      this.poolsCache.clear();
      this.tokenPoolsMap.clear();

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

      // Retirer les tokens qui ne sont pas dans une pool
      const tokensInPool = tokens.filter((t) => {
        return t._count.poolsAsToken0 > 0 || t._count.poolsAsToken1 > 0;
      });

      await this.buildTokenPoolsMap(tokensInPool);

      // Séparer les tokens par source de prix
      const [tokensWithCoinGecko, tokensWithoutCoinGecko] =
        this.partitionTokens(tokensInPool);

      // 1. Première étape : tokens avec CoinGecko (prix de référence)
      if (tokensWithCoinGecko.length > 0) {
        await this.updateWithCoingecko(tokensWithCoinGecko);
      }

      // 2. Deuxième étape : résolution des dépendances avec passes multiples
      await this.resolveTokenDependencies(tokensWithoutCoinGecko);

      // 3. Calcul des statistiques (volume, évolutions) pour tous les tokens
      await this.calculateTokenStatistics(tokensInPool);

      // 4. Sauvegarde en base
      await this.saveCachedTokens();

      processedTokens = this.cachedTokens.size;
      this.logger.log(
        `Price update completed: ${processedTokens}/${tokensInPool.length} tokens`,
      );
    } catch (error) {
      this.logger.error('Critical error in price update:', error);
    } finally {
      const duration = Date.now() - startTime;
      this.logger.log(
        `Price update took ${duration}ms for ${processedTokens} tokens`,
      );

      if (duration > 50000) {
        this.logger.warn(
          `Price update took ${duration}ms - consider optimization`,
        );
      }
    }
  }

  /**
   * Build dependence Map between Token based on pools
   */
  private async buildTokenPoolsMap(tokens: Token[]): Promise<void> {
    const tokenAddresses = tokens.map((t) => t.address);

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

    tokens.forEach((token) => {
      this.tokenPoolsMap.set(token.address, new Set());
    });

    pools.forEach((pool) => {
      const addr0 = pool.token0.address;
      const addr1 = pool.token1.address;

      if (this.tokenPoolsMap.has(addr0)) {
        this.tokenPoolsMap.get(addr0)!.add(addr1);
      }
      if (this.tokenPoolsMap.has(addr1)) {
        this.tokenPoolsMap.get(addr1)!.add(addr0);
      }
    });
  }

  /**
   * Sort tokens depend of their price source (coingocko / pool)
   */
  private partitionTokens(
    tokens: TokenWithStats[],
  ): [TokenWithStats[], TokenWithStats[]] {
    return tokens.reduce(
      (acc, token) => {
        acc[token.coingeckoId ? 0 : 1].push(token);
        return acc;
      },
      [[], []] as [TokenWithStats[], TokenWithStats[]],
    );
  }

  /**
   * Resolve dependencies with multiple pass
   */
  private async resolveTokenDependencies(
    tokens: TokenWithStats[],
  ): Promise<void> {
    let remainingTokens = [...tokens];
    let pass = 0;

    while (remainingTokens.length > 0 && pass < this.MAX_PASSES) {
      pass++;
      const initialCount = remainingTokens.length;

      this.logger.debug(
        `Pass ${pass}: attempting to resolve ${remainingTokens.length} tokens`,
      );

      const sortedTokens = this.sortTokensByResolvability(remainingTokens);

      const newlyResolved: string[] = [];

      for (let i = 0; i < sortedTokens.length; i += this.BATCH_SIZE) {
        const batch = sortedTokens.slice(i, i + this.BATCH_SIZE);

        const batchPromises = batch.map(async (token) => {
          const price = await this.getPriceFromPools(token);
          if (price !== null) {
            this.cachedTokens.set(token.address, {
              tokenId: token.id,
              price,
              oneHourEvolution: 0,
              oneDayEvolution: 0,
              volume: 0,
            });
            newlyResolved.push(token.address);
          }
        });

        await Promise.all(batchPromises);
      }

      remainingTokens = remainingTokens.filter(
        (token) => !newlyResolved.includes(token.address),
      );

      this.logger.debug(
        `Pass ${pass}: resolved ${newlyResolved.length} tokens`,
      );

      if (remainingTokens.length === initialCount) {
        this.logger.warn(
          `No progress in pass ${pass}, stopping. Remaining tokens: ${remainingTokens.map((t) => t.symbol).join(', ')}`,
        );
        break;
      }
    }

    if (remainingTokens.length > 0) {
      this.logger.warn(
        `Failed to resolve prices for ${remainingTokens.length} tokens: ${remainingTokens.map((t) => t.symbol).join(', ')}`,
      );
    }
  }

  private sortTokensByResolvability(
    tokens: TokenWithStats[],
  ): TokenWithStats[] {
    return tokens.sort((a, b) => {
      const aReferences = this.countAvailableReferences(a.address);
      const bReferences = this.countAvailableReferences(b.address);

      return bReferences - aReferences; // Tri décroissant
    });
  }

  private countAvailableReferences(tokenAddress: string): number {
    const connectedTokens = this.tokenPoolsMap.get(tokenAddress) || new Set();
    let availableReferences = 0;

    connectedTokens.forEach((connectedAddr) => {
      if (this.cachedTokens.has(connectedAddr)) {
        availableReferences++;
      }
    });

    return availableReferences;
  }

  private async calculateTokenStatistics(tokens: TokenWithStats[]) {
    const statisticsPromises = tokens.map(async (token) => {
      if (!this.cachedTokens.has(token.address)) return;

      const cachedToken = this.cachedTokens.get(token.address)!;

      const [volume, oneHourEvolution, oneDayEvolution] = await Promise.all([
        this.calculateVolume24h(token),
        this.getPriceVariation(token, 1, cachedToken.price),
        this.getPriceVariation(token, 24, cachedToken.price),
      ]);

      this.cachedTokens.set(token.address, {
        ...cachedToken,
        oneHourEvolution: oneHourEvolution || 0,
        oneDayEvolution: oneDayEvolution || 0,
        volume: volume || 0,
      });
    });

    await Promise.all(statisticsPromises);
  }

  async updateWithCoingecko(tokens: TokenWithStats[]) {
    this.logger.log(`Updating ${tokens.length} tokens with CoinGecko`);

    const ids = tokens.map((t) => t.coingeckoId).join(',');
    const prices = await this.coingeckoService.getMultiTokensData(ids);

    if (!prices) return;

    tokens.forEach((token) => {
      const price = prices[token.coingeckoId!];
      if (price) {
        this.cachedTokens.set(token.address, {
          tokenId: token.id,
          price: price.usd,
          oneDayEvolution: 0,
          oneHourEvolution: 0,
          volume: 0,
        });
      }
    });
  }

  private async getPriceFromPools(token: Token): Promise<number | null> {
    const cacheKey = `pools_${token.address}`;
    let pools = this.poolsCache.get(cacheKey);

    if (!pools) {
      const cachedTokensAddr = Array.from(this.cachedTokens.keys());

      pools = await this.databaseService.pool.findMany({
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
        include: { token0: true, token1: true },

        orderBy: { liquidity: 'desc' },
        take: 3, // Limiter aux 3 meilleurs pools
      });

      this.poolsCache.set(cacheKey, pools);

      setTimeout(() => this.poolsCache.delete(cacheKey), this.CACHE_TTL);
    }

    if (pools.length === 0) {
      return null;
    }

    for (const pool of pools) {
      const price = this.calculateTokenPrice(token.address, pool);
      if (price !== null) {
        return price;
      }
    }

    return null;
  }

  private async getPriceVariation(
    token: TokenWithStats,
    hours: number,
    currentPrice: number,
  ): Promise<number | null> {
    // Try with preload stats is available
    if (token.Statistic && token.Statistic.length > 0) {
      const xHoursAgo = new Date(Date.now() - hours * 60 * 60 * 1000);

      // find the most newly stats
      const relevantStat = token.Statistic.find(
        (stat) => stat.createdAt <= xHoursAgo,
      );

      if (relevantStat) {
        return ((currentPrice - relevantStat.price) / relevantStat.price) * 100;
      }
    }

    // Fallback if no stats found
    const xHoursAgo = new Date(Date.now() - hours * 60 * 60 * 1000);

    const prevStat = await this.databaseService.tokenStats.findFirst({
      where: {
        tokenId: token.id,
        createdAt: { lte: xHoursAgo },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!prevStat) return null;

    return ((currentPrice - prevStat.price) / prevStat.price) * 100;
  }

  private async calculateVolume24h(token: Token): Promise<number | null> {
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
        WHERE (p."token0Id" = ${token.id} OR p."token1Id" = ${token.id})
          AND s."createdAt" >= ${oneDayAgo}
      `;

      if (result.length === 0) return null;

      const volume0 = parseFloat(result[0].volume0) || 0;
      const volume1 = parseFloat(result[0].volume1) || 0;

      return volume0 + volume1;
    } catch (error) {
      this.logger.error(`Error calculating volume for ${token.symbol}:`, error);

      return null;
    }
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

      const referencePrice = this.cachedTokens.get(referenceToken.address);
      if (!referencePrice) {
        return null;
      }

      const price = this.calculatePriceFromSqrtPriceX96(
        pool.sqrtPriceX96,
        targetToken.decimals,
        referenceToken.decimals,
        isToken0,
      );

      const calculatedPrice = price * referencePrice.price;

      this.logger.debug(
        `Price calculated for ${targetToken.symbol}: ${calculatedPrice} USD (via ${referenceToken.symbol} @ ${referencePrice.price})`,
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

  private async saveCachedTokens(): Promise<void> {
    try {
      const tokenStatistics = Array.from(this.cachedTokens.values());

      if (tokenStatistics.length === 0) return;

      await this.databaseService.client.$transaction(
        tokenStatistics.map((cachedToken) =>
          this.databaseService.tokenStats.create({
            data: {
              tokenId: cachedToken.tokenId,
              price: cachedToken.price,

              oneHourEvolution: cachedToken.oneHourEvolution,
              oneDayEvolution: cachedToken.oneDayEvolution,
              volume: cachedToken.volume,
            },
          }),
        ),
      );

      this.logger.log(
        `Saved ${tokenStatistics.length} token statistics to database`,
      );
    } catch (error) {
      this.logger.error('Error saving cached tokens to database:', error);
    }
  }
}
