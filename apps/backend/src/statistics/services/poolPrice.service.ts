import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { Address, formatUnits } from 'viem';
import { Cron, CronExpression } from '@nestjs/schedule';
import { BlockchainService } from 'src/blockchain/blockchain.service';
import { V3_POOL_ABI } from 'src/blockchain/abis/V3_POOL_ABI';
import { Swap } from '@repo/db';
import { PoolWithTokensAndSwap } from '../types/tokenPrices';

interface PoolStatData {
  poolId: string;
  apr: number;
  tvlUSD: number;
  volOneDay: string;
  volOneMonth: string;
  impermanentLoss?: number;
  healthScore?: number;
}

interface BlockchainPoolData {
  sqrtPriceX96: bigint;
  liquidity: bigint;
  fee: number;
  isValid: boolean;
}

interface TokenPriceData {
  token0Price: number;
  token1Price: number;
  token0Decimals: number;
  token1Decimals: number;
}

@Injectable()
export class PoolPriceService {
  private readonly logger = new Logger(PoolPriceService.name);

  private readonly BATCH_SIZE = 10;
  private readonly MAX_POOLS_PER_CYCLE = 100; // Limiter le nombre de pools traités par cycle
  private readonly BLOCKCHAIN_CACHE_TTL = 2 * 60 * 1000; // 2 minutes
  private readonly PRICING_PATH_CACHE_TTL = 10 * 60 * 1000; // 10 minutes

  private blockchainDataCache: Map<
    string,
    { data: BlockchainPoolData; timestamp: number }
  > = new Map();
  private pricingPathCache: Map<string, { path: string[]; timestamp: number }> =
    new Map();
  private tokenPriceCache: Map<
    string,
    { price: number; decimals: number; timestamp: number }
  > = new Map();

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

  async getOnePoolStat(poolAddr: string) {
    const pool = await this.databaseService.pool.findFirst({
      where: {
        address: poolAddr,
      },
      include: {
        PoolStatistic: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        token0: {
          include: {
            Statistic: {
              orderBy: { createdAt: 'desc' },
              take: 1,
            },
          },
        },
        token1: {
          include: {
            Statistic: {
              orderBy: { createdAt: 'desc' },
              take: 1,
            },
          },
        },
      },
    });

    return pool;
  }

  async getOnePoolStatByTokens(
    token0Addr: string,
    token1Addr: string,
    fee: number,
  ) {
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
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        token0: {
          include: {
            Statistic: {
              orderBy: { createdAt: 'desc' },
              take: 1,
            },
          },
        },
        token1: {
          include: {
            Statistic: {
              orderBy: { createdAt: 'desc' },
              take: 1,
            },
          },
        },
      },
    });

    return pool;
  }

  async getTopPoolStats() {
    const pools = await this.databaseService.pool.findMany({
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
      where: {
        PoolStatistic: {
          some: {},
        },
      },
      orderBy: {
        PoolStatistic: {
          _count: 'desc',
        },
      },
      take: 4,
    });

    return pools
      .filter((pool) => pool.PoolStatistic.length > 0)
      .sort((a, b) => b.PoolStatistic[0].tvlUSD - a.PoolStatistic[0].tvlUSD)
      .slice(0, 4);
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async updatePoolStats() {
    const startTime = Date.now();
    let processedPools = 0;

    try {
      this.logger.log('Starting pool stats update...');

      // Récupérer les pools avec pagination et données optimisées
      const pools = await this.getPoolsForUpdate();

      if (pools.length === 0) {
        this.logger.log('No pools to update');
        return;
      }

      // Précharger les prix des tokens
      await this.preloadTokenPrices(pools);

      // Traiter par lots
      const batches = this.chunkArray(pools, this.BATCH_SIZE);
      const allPoolStats: PoolStatData[] = [];

      for (const batch of batches) {
        const batchStats = await this.processBatch(batch);
        allPoolStats.push(...batchStats.filter((stat) => stat !== null));
        processedPools += batch.length;
      }

      // Sauvegarder en transaction
      if (allPoolStats.length > 0) {
        this.logger.debug(allPoolStats);
        await this.savePoolStats(allPoolStats);
      }

      // Nettoyer les caches périodiquement
      this.cleanExpiredCaches();
    } catch (error) {
      this.logger.error('Critical error in pool stats update:', error);
    } finally {
      const duration = Date.now() - startTime;
      this.logger.log(
        `Pool stats update completed: ${processedPools} pools in ${duration}ms`,
      );

      if (duration > 50000) {
        this.logger.warn(
          `Pool update took ${duration}ms - consider optimization`,
        );
      }
    }
  }

  /**
   * Récupérer les pools à mettre à jour avec optimisations
   */
  private async getPoolsForUpdate(): Promise<PoolWithTokensAndSwap[]> {
    return await this.databaseService.pool.findMany({
      where: {
        AND: [
          { sqrtPriceX96: { not: null } },
          { liquidity: { not: null } },
          { liquidity: { not: '0' } },
        ],
      },
      include: {
        token0: true,
        token1: true,
        // token0: {
        //   select: {
        //     id: true,
        //     address: true,
        //     decimals: true,
        //     symbol: true,
        //   },
        // },
        // token1: {
        //   select: {
        //     id: true,
        //     address: true,
        //     decimals: true,
        //     symbol: true,
        //   },
        // },
        // Optimisation : ne charger que les swaps récents
        swaps: {
          where: {
            createdAt: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 jours
            },
          },
          // select: {
          //   amount0: true,
          //   amount1: true,
          //   createdAt: true,
          // },
        },
      },
      orderBy: { liquidity: 'desc' },
      take: this.MAX_POOLS_PER_CYCLE,
    });
  }

  /**
   * Précharger les prix des tokens pour éviter les requêtes répétées
   */
  private async preloadTokenPrices(pools: PoolWithTokensAndSwap[]) {
    const tokenIds = new Set<string>();
    pools.forEach((pool) => {
      tokenIds.add(pool.token0.id);
      tokenIds.add(pool.token1.id);
    });

    const tokenStats = await this.databaseService.tokenStats.findMany({
      where: {
        tokenId: { in: Array.from(tokenIds) },
        createdAt: {
          gte: new Date(Date.now() - 10 * 60 * 1000), // Prix de moins de 10 minutes
        },
      },
      orderBy: { createdAt: 'desc' },
      distinct: ['tokenId'],
    });

    // Mettre en cache
    tokenStats.forEach((stat) => {
      this.tokenPriceCache.set(stat.tokenId, {
        price: stat.price,

        decimals: 18, // À ajuster selon vos besoins
        timestamp: Date.now(),
      });
    });
  }

  /**
   * Traiter un lot de pools
   */
  private async processBatch(
    pools: PoolWithTokensAndSwap[],
  ): Promise<(PoolStatData | null)[]> {
    const promises = pools.map(async (pool) => {
      try {
        return await this.processPool(pool);
      } catch (error) {
        this.logger.error(`Error processing pool ${pool.address}:`, error);
        return null;
      }
    });

    return await Promise.all(promises);
  }

  /**
   * Traiter un pool individuel
   */
  private async processPool(
    pool: PoolWithTokensAndSwap,
  ): Promise<PoolStatData | null> {
    // Récupérer les données blockchain avec cache
    const blockchainData = await this.getBlockchainDataWithCache(pool.address);
    if (!blockchainData.isValid) {
      return null;
    }

    // Récupérer les prix des tokens
    const tokenPrices = this.getTokenPrices(pool.token0.id, pool.token1.id);

    if (!tokenPrices) {
      return null;
    }

    // Calculer les volumes
    const dayVol = this.getVolumeByPeriod(pool, 24);
    const monthVol = this.getVolumeByPeriod(pool, 24 * 30);

    // Calculer APR et TVL
    const aprAndTvl = this.calculateAdvancedMetrics(
      blockchainData,
      tokenPrices,
      dayVol,
      pool,
    );

    if (!aprAndTvl) {
      return null;
    }

    return {
      poolId: pool.id,
      apr: aprAndTvl.apr,
      tvlUSD: aprAndTvl.tvlUSD,
      volOneDay: dayVol.toString(),
      volOneMonth: monthVol.toString(),
      impermanentLoss: aprAndTvl.impermanentLoss,
      healthScore: aprAndTvl.healthScore,
    };
  }

  /**
   * Récupérer les données blockchain avec cache et retry logic
   */
  private async getBlockchainDataWithCache(
    poolAddress: string,
  ): Promise<BlockchainPoolData> {
    const cacheKey = `blockchain_${poolAddress}`;
    const cached = this.blockchainDataCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this.BLOCKCHAIN_CACHE_TTL) {
      return cached.data;
    }

    try {
      const [slot0, liquidity, fee] =
        await this.blockchainService.client.multicall({
          contracts: [
            {
              address: poolAddress as Address,
              abi: V3_POOL_ABI,
              functionName: 'slot0',
            },
            {
              address: poolAddress as Address,
              abi: V3_POOL_ABI,
              functionName: 'liquidity',
            },
            {
              address: poolAddress as Address,
              abi: V3_POOL_ABI,
              functionName: 'fee',
            },
          ],
        });

      const data: BlockchainPoolData = {
        sqrtPriceX96: slot0.result?.[0] || 0n,
        liquidity: liquidity.result || 0n,
        fee: fee.result || 0,
        isValid: !!(slot0.result?.[0] && liquidity.result && fee.result),
      };

      // Mettre en cache
      this.blockchainDataCache.set(cacheKey, {
        data,
        timestamp: Date.now(),
      });

      return data;
    } catch (error) {
      this.logger.error(
        `Error fetching blockchain data for pool ${poolAddress}:`,
        error,
      );
      return {
        sqrtPriceX96: 0n,
        liquidity: 0n,
        fee: 0,
        isValid: false,
      };
    }
  }

  /**
   * Récupérer les prix des tokens depuis le cache
   */
  private getTokenPrices(
    token0Id: string,
    token1Id: string,
  ): TokenPriceData | null {
    const token0Data = this.tokenPriceCache.get(token0Id);
    const token1Data = this.tokenPriceCache.get(token1Id);

    if (!token0Data || !token1Data) {
      return null;
    }

    return {
      token0Price: token0Data.price,
      token1Price: token1Data.price,
      token0Decimals: token0Data.decimals,
      token1Decimals: token1Data.decimals,
    };
  }

  /**
   * Calcul du volume optimisé (prend en compte amount0 ET amount1)
   */
  private getVolumeByPeriod(
    pool: PoolWithTokensAndSwap,
    hourPeriod: number = 24,
  ): bigint {
    const xHourAgo = new Date(Date.now() - hourPeriod * 60 * 60 * 1000);

    const recentSwaps = pool.swaps.filter(
      (s: Swap) => new Date(s.createdAt) > xHourAgo,
    );

    const vol = recentSwaps.reduce((total: bigint, swap: Swap) => {
      // Prendre le maximum entre amount0 et amount1 pour éviter la double comptabilisation
      const vol0 = BigInt(Math.abs(parseInt(swap.amount0) || 0));
      const vol1 = BigInt(Math.abs(parseInt(swap.amount1) || 0));
      return total + (vol0 > vol1 ? vol0 : vol1);
    }, 0n);

    return vol;
  }

  /**
   * Calcul avancé des métriques avec impermanent loss et health score
   */
  private calculateAdvancedMetrics(
    blockchainData: BlockchainPoolData,
    tokenPrices: TokenPriceData,
    volume24h: bigint,
    pool: PoolWithTokensAndSwap,
  ): {
    apr: number;
    tvlUSD: number;
    impermanentLoss: number;
    healthScore: number;
  } | null {
    if (!blockchainData.isValid || blockchainData.liquidity === 0n) {
      return null;
    }

    try {
      // Calcul correct du prix spot depuis sqrtPriceX96
      // Prix = (sqrtPriceX96 / 2^96)^2 * 10^(decimals0 - decimals1)
      const sqrtPrice = Number(blockchainData.sqrtPriceX96) / 2 ** 96;
      const price =
        sqrtPrice ** 2 *
        10 ** (tokenPrices.token0Decimals - tokenPrices.token1Decimals);

      // Calcul correct de la TVL selon Uniswap V3
      // Pour une range complète [-∞, +∞], L = sqrt(amount0 * amount1)
      // amount0 = L * (sqrt(P_upper) - sqrt(P_current)) / (sqrt(P_current) * sqrt(P_upper))
      // amount1 = L * (sqrt(P_current) - sqrt(P_lower))
      // Pour simplifier, on utilise la liquidity comme approximation
      const liquidityNum = Number(blockchainData.liquidity);

      // Estimation des amounts basée sur la liquidity et le prix current
      // Cette approximation suppose une range large autour du prix current
      const amount1Estimated =
        liquidityNum / Math.sqrt(price) / 10 ** tokenPrices.token1Decimals;
      const amount0Estimated =
        (liquidityNum * Math.sqrt(price)) / 10 ** tokenPrices.token0Decimals;

      // TVL en USD
      const tvlUSD = Math.abs(
        amount0Estimated * tokenPrices.token0Price +
          amount1Estimated * tokenPrices.token1Price,
      );

      // Volume 24h en USD
      const vol24hUSD =
        Number(formatUnits(volume24h, tokenPrices.token0Decimals)) *
        tokenPrices.token0Price;

      // Calcul des fees 24h
      const fees24h = vol24hUSD * (blockchainData.fee / 1000000);

      // Calcul APR avec fallback pour pools sans transactions récentes
      let apr = 0;
      if (fees24h > 0 && tvlUSD > 0) {
        // APR normal basé sur les fees des dernières 24h
        apr = (fees24h / tvlUSD) * 365 * 100;
      } else if (tvlUSD > 0) {
        // Fallback : utiliser la moyenne des 7 derniers jours
        const volume7d = this.getVolumeByPeriod(pool, 24 * 7);
        const avgDailyVolume =
          Number(formatUnits(volume7d, tokenPrices.token0Decimals)) / 7;
        const avgDailyVolumeUSD = avgDailyVolume * tokenPrices.token0Price;
        const avgDailyFees = avgDailyVolumeUSD * (blockchainData.fee / 1000000);

        if (avgDailyFees > 0) {
          apr = (avgDailyFees / tvlUSD) * 365 * 100;
          this.logger.debug(
            `Using 7-day average for APR calculation: ${apr.toFixed(2)}%`,
          );
        } else {
          // Dernier recours : APR théorique basé sur le fee tier
          // Estimation très conservative : 0.1% du TVL par jour pour un pool actif
          const theoreticalDailyYield = tvlUSD * 0.001;
          apr = (theoreticalDailyYield / tvlUSD) * 365 * 100;
          this.logger.debug(`Using theoretical APR: ${apr.toFixed(2)}%`);
        }
      }

      // Impermanent Loss
      const impermanentLoss = this.calculateImpermanentLoss(
        tokenPrices.token0Price,
        tokenPrices.token1Price,
      );

      // Health Score
      const healthScore = this.calculateHealthScore(
        tvlUSD,
        vol24hUSD,
        blockchainData.liquidity,
      );

      return {
        apr: Math.max(0, Math.min(10000, apr)), // Cap APR entre 0% et 10000%
        tvlUSD: Math.max(0, tvlUSD),
        impermanentLoss,
        healthScore,
      };
    } catch (error) {
      this.logger.error('Error in advanced metrics calculation:', error);
      return null;
    }
  }

  /**
   * Estimation simplifiée de l'impermanent loss
   */
  private calculateImpermanentLoss(
    token0Price: number,
    token1Price: number,
  ): number {
    // Ceci est une estimation simplifiée
    // Dans la réalité, il faudrait les prix historiques
    const priceRatio = token0Price / token1Price;
    const baseRatio = 1; // Ratio de référence

    if (priceRatio === baseRatio) return 0;

    const ratio = priceRatio / baseRatio;
    const impLoss = (2 * Math.sqrt(ratio)) / (1 + ratio) - 1;

    return Math.abs(impLoss) * 100; // En pourcentage
  }

  /**
   * Calcul du score de santé du pool
   */
  private calculateHealthScore(
    tvlUSD: number,
    volume24hUSD: number,
    liquidity: bigint,
  ): number {
    let score = 0;

    // TVL Score (0-40 points)
    if (tvlUSD > 1000000)
      score += 40; // > 1M
    else if (tvlUSD > 100000)
      score += 30; // > 100K
    else if (tvlUSD > 10000)
      score += 20; // > 10K
    else if (tvlUSD > 1000) score += 10; // > 1K

    // Volume Score (0-30 points)
    const volumeToTvlRatio = tvlUSD > 0 ? volume24hUSD / tvlUSD : 0;
    if (volumeToTvlRatio > 0.5)
      score += 30; // Volume/TVL > 50%
    else if (volumeToTvlRatio > 0.1)
      score += 20; // Volume/TVL > 10%
    else if (volumeToTvlRatio > 0.01) score += 10; // Volume/TVL > 1%

    // Liquidity Score (0-30 points)
    const liquidityNum = Number(liquidity);
    if (liquidityNum > 10 ** 18) score += 30;
    else if (liquidityNum > 10 ** 17) score += 20;
    else if (liquidityNum > 10 ** 16) score += 10;

    return Math.min(100, score); // Max 100
  }

  /**
   * Sauvegarder les statistiques en transaction
   */
  private async savePoolStats(poolStats: PoolStatData[]): Promise<void> {
    try {
      await this.databaseService.client.$transaction(
        poolStats.map((stat) =>
          this.databaseService.poolStats.create({
            data: {
              poolId: stat.poolId,
              apr: stat.apr,
              tvlUSD: stat.tvlUSD,
              volOneDay: stat.volOneDay,
              volOneMonth: stat.volOneMonth,
              impermanentLoss: stat.impermanentLoss || 0,
              healthScore: stat.healthScore || 0,
            },
          }),
        ),
      );

      this.logger.log(`Saved ${poolStats.length} pool statistics to database`);
    } catch (error) {
      this.logger.error('Error saving pool stats to database:', error);
    }
  }

  /**
   * Nettoyage des caches expirés
   */
  private cleanExpiredCaches(): void {
    const now = Date.now();

    // Nettoyer blockchain cache
    for (const [key, value] of this.blockchainDataCache.entries()) {
      if (now - value.timestamp > this.BLOCKCHAIN_CACHE_TTL) {
        this.blockchainDataCache.delete(key);
      }
    }

    // Nettoyer pricing path cache
    for (const [key, value] of this.pricingPathCache.entries()) {
      if (now - value.timestamp > this.PRICING_PATH_CACHE_TTL) {
        this.pricingPathCache.delete(key);
      }
    }

    // Nettoyer token price cache
    for (const [key, value] of this.tokenPriceCache.entries()) {
      if (now - value.timestamp > this.BLOCKCHAIN_CACHE_TTL) {
        this.tokenPriceCache.delete(key);
      }
    }
  }

  /**
   * Méthodes utilitaires gardées identiques
   */
  async findBestPricingPath(tokenAddress: string): Promise<string[]> {
    const cacheKey = `path_${tokenAddress}`;
    const cached = this.pricingPathCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this.PRICING_PATH_CACHE_TTL) {
      return cached.path;
    }

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
        select: { coingeckoId: true },
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
          token0: { select: { address: true } },
          token1: { select: { address: true } },
        },
        orderBy: { liquidity: 'desc' },

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

    const bestPath =
      paths.length > 0
        ? paths.reduce((shortest, current) =>
            current.length < shortest.length ? current : shortest,
          )
        : [];

    // Mettre en cache
    this.pricingPathCache.set(cacheKey, {
      path: bestPath,
      timestamp: Date.now(),
    });

    return bestPath;
  }

  async validatePoolForPricing(poolAddress: string): Promise<boolean> {
    try {
      const blockchainData = await this.getBlockchainDataWithCache(poolAddress);
      return blockchainData.isValid;
    } catch (error) {
      this.logger.error(`Error validating pool ${poolAddress}:`, error);
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
