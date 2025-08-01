import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { BlockchainService } from 'src/blockchain/blockchain.service';
import { Token } from '@repo/db';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CoinGeckoService } from 'src/coingecko/coingecko.service';
import { PoolWithTokens } from '../types/tokenPrices';
import { BigNumber } from 'bignumber.js';
import { Address } from 'viem';

interface CachedToken {
  tokenId: string;
  price: number;
  oneHourEvolution: number;
  oneDayEvolution: number;
  volume: number;
  fdv: number | null;
  marketCap: number | null;
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
    private readonly blockchainService: BlockchainService,
  ) {}

  async getTokenStats() {
    const tokens = await this.databaseService.token.findMany({
      include: {
        Statistic: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        },
        _count: {
          select: {
            poolsAsToken1: true,
            poolsAsToken0: true,
          },
        },
      },
    });

    return tokens.map((t) => ({
      ...t,
      inPool: t._count.poolsAsToken0 > 0 || t._count.poolsAsToken1 > 0,
    }));
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
              fdv: null,
              marketCap: null,
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

      // Calculate FDV and Market Cap
      const [fdv, marketCap] = await this.calculateFDVAndMarketCap(
        token,
        cachedToken.price,
      );

      this.cachedTokens.set(token.address, {
        ...cachedToken,
        oneHourEvolution: oneHourEvolution || 0,
        oneDayEvolution: oneDayEvolution || 0,
        volume: volume || 0,
        fdv,
        marketCap,
      });
    });

    await Promise.all(statisticsPromises);
  }

  async updateWithCoingecko(tokens: TokenWithStats[]) {
    this.logger.log(`Updating ${tokens.length} tokens with CoinGecko`);

    const ids = tokens.map((t) => t.coingeckoId).join(',');
    const prices = await this.coingeckoService.getMultiTokensData(ids);

    if (!prices) return;

    for (const token of tokens) {
      const price = prices[token.coingeckoId!];
      if (price) {
        // Store circulating supply from CoinGecko if available
        if (price.circulating_supply) {
          await this.updateCirculatingSupply(
            token,
            price.circulating_supply.toString(),
          );
        }

        this.cachedTokens.set(token.address, {
          tokenId: token.id,
          price: price.usd,
          oneDayEvolution: 0,
          oneHourEvolution: 0,
          volume: 0,
          fdv: null,
          marketCap: null,
        });
      }
    }
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

  /**
   * Calculate FDV (Fully Diluted Valuation) and Market Cap for a token
   */
  private async calculateFDVAndMarketCap(
    token: Token,
    price: number,
  ): Promise<[number | null, number | null]> {
    try {
      // Get total supply for FDV calculation
      const totalSupply = await this.getTotalSupply(token);

      if (!totalSupply) {
        this.logger.debug(`No total supply available for ${token.symbol}`);
        return [null, null];
      }

      // Convert totalSupply to number with proper decimals
      const totalSupplyNumber = Number(totalSupply) / 10 ** token.decimals;

      // FDV = Total Supply × Price
      const fdv = totalSupplyNumber * price;

      // Get circulating supply for Market Cap calculation
      const circulatingSupply = await this.getCirculatingSupply(token);
      let marketCap: number | null = null;

      if (circulatingSupply) {
        const circulatingSupplyNumber =
          Number(circulatingSupply) / 10 ** token.decimals;
        // Market Cap = Circulating Supply × Price
        marketCap = circulatingSupplyNumber * price;

        this.logger.debug(
          `Calculated for ${token.symbol}: FDV=$${fdv.toLocaleString()} | Market Cap=$${marketCap.toLocaleString()} (Circulating: ${circulatingSupplyNumber.toLocaleString()})`,
        );
      } else {
        // Fallback: use FDV as Market Cap if no circulating supply available
        marketCap = fdv;
        this.logger.debug(
          `Using FDV as Market Cap for ${token.symbol}: $${fdv.toLocaleString()} (no circulating supply data)`,
        );
      }

      return [fdv, marketCap];
    } catch (error) {
      this.logger.error(`Error calculating FDV for ${token.symbol}:`, error);
      return [null, null];
    }
  }

  /**
   * Get total supply from cache or fetch from blockchain
   */
  private async getTotalSupply(token: Token): Promise<string | null> {
    try {
      // First check if we have it cached in database
      if (token.totalSupply) {
        return token.totalSupply;
      }

      // Fetch from blockchain using ERC20 totalSupply() function
      const totalSupply = await this.blockchainService.client.readContract({
        address: token.address as Address,
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

      const totalSupplyString = totalSupply.toString();

      // Cache the result in database for future use
      await this.databaseService.token.update({
        where: { id: token.id },
        data: { totalSupply: totalSupplyString },
      });

      this.logger.debug(
        `Fetched and cached total supply for ${token.symbol}: ${totalSupplyString}`,
      );

      return totalSupplyString;
    } catch (error) {
      this.logger.error(
        `Error fetching total supply for ${token.symbol}:`,
        error,
      );
      return null;
    }
  }

  /**
   * Get circulating supply from cache, CoinGecko, or estimate using fallback strategies
   */
  private async getCirculatingSupply(token: Token): Promise<string | null> {
    try {
      // First check if we have it cached in database
      if (token.circulatingSupply) {
        return token.circulatingSupply;
      }

      // For tokens without CoinGecko ID, use fallback estimation strategies
      if (!token.coingeckoId) {
        this.logger.debug(
          `No CoinGecko ID for ${token.symbol}, using fallback strategies`,
        );
        return await this.estimateCirculatingSupply(token);
      }

      // Note: Circulating supply should be fetched from CoinGecko during price updates
      // This is just a fallback in case it wasn't stored
      this.logger.debug(`No cached circulating supply for ${token.symbol}`);
      return null;
    } catch (error) {
      this.logger.error(
        `Error fetching circulating supply for ${token.symbol}:`,
        error,
      );
      return null;
    }
  }

  /**
   * Estimate circulating supply for tokens without CoinGecko ID using multiple strategies
   */
  private async estimateCirculatingSupply(
    token: Token,
  ): Promise<string | null> {
    try {
      const totalSupply = await this.getTotalSupply(token);
      if (!totalSupply) {
        return null;
      }

      // Strategy 1: Check if token has burn mechanisms (common addresses)
      const circulatingSupply = await this.estimateWithBurnAnalysis(
        token,
        totalSupply,
      );
      if (circulatingSupply) {
        // Cache the estimated circulating supply
        await this.updateCirculatingSupply(token, circulatingSupply);
        this.logger.debug(
          `Estimated circulating supply for ${token.symbol}: ${circulatingSupply} (burn analysis)`,
        );
        return circulatingSupply;
      }

      // Strategy 2: For newer/smaller tokens, assume most supply is circulating (80-95%)
      const estimatedRatio = await this.getCirculatingRatioHeuristic(token);
      const totalSupplyBN = new BigNumber(totalSupply);
      const estimatedCirculating = totalSupplyBN
        .multipliedBy(estimatedRatio)
        .toFixed(0);

      // Cache the estimation
      await this.updateCirculatingSupply(token, estimatedCirculating);

      this.logger.debug(
        `Estimated circulating supply for ${token.symbol}: ${estimatedCirculating} (${(estimatedRatio * 100).toFixed(1)}% of total)`,
      );

      return estimatedCirculating;
    } catch (error) {
      this.logger.error(
        `Error estimating circulating supply for ${token.symbol}:`,
        error,
      );
      return null;
    }
  }

  /**
   * Analyze token for burn mechanisms and calculate effective circulating supply
   */
  private async estimateWithBurnAnalysis(
    token: Token,
    totalSupply: string,
  ): Promise<string | null> {
    try {
      // Common burn/dead addresses to check
      const burnAddresses = [
        '0x000000000000000000000000000000000000dead', // Burn address
        '0x0000000000000000000000000000000000000000', // Zero address
        '0x000000000000000000000000000000000000dEaD', // Alternative burn
      ];

      let totalBurned = new BigNumber(0);

      // Check balance of burn addresses
      for (const burnAddress of burnAddresses) {
        try {
          const balance = await this.blockchainService.client.readContract({
            address: token.address as Address,
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
        } catch (error) {
          // Skip if address doesn't exist or contract call fails
          continue;
        }
      }

      // If we found burned tokens, calculate circulating supply
      if (totalBurned.gt(0)) {
        const totalSupplyBN = new BigNumber(totalSupply);
        const circulatingSupply = totalSupplyBN.minus(totalBurned);

        this.logger.debug(
          `Found ${totalBurned.toString()} burned tokens for ${token.symbol}`,
        );

        return circulatingSupply.toString();
      }

      return null;
    } catch (error) {
      this.logger.error(`Error in burn analysis for ${token.symbol}:`, error);
      return null;
    }
  }

  /**
   * Get circulating supply ratio heuristic based on token characteristics
   */
  private async getCirculatingRatioHeuristic(token: Token): Promise<number> {
    try {
      // Base assumption: most DeFi tokens have high circulation (80-95%)
      let baseRatio = 0.85; // 85% default

      // Get token age (if we have creation data)
      const oldestStat = await this.databaseService.tokenStats.findFirst({
        where: { tokenId: token.id },
        orderBy: { createdAt: 'asc' },
      });

      if (oldestStat) {
        const tokenAgeMonths =
          (Date.now() - oldestStat.createdAt.getTime()) /
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
      }

      // Check if token has high trading activity (suggests good distribution)
      const volume24h = await this.calculateVolume24h(token);
      if (volume24h && volume24h > 1000) {
        // $1000+ daily volume
        baseRatio += 0.05; // Increase by 5% for active tokens
      }

      // Cap the ratio at 95%
      return Math.min(baseRatio, 0.95);
    } catch {
      this.logger.error(
        `Error in heuristic calculation for ${token.symbol}`,
      );
      return 0.85; // Safe default
    }
  }

  /**
   * Update circulating supply in database
   */
  private async updateCirculatingSupply(
    token: Token,
    circulatingSupply: string,
  ): Promise<void> {
    try {
      await this.databaseService.token.update({
        where: { id: token.id },
        data: { circulatingSupply },
      });

      this.logger.debug(
        `Updated circulating supply for ${token.symbol}: ${circulatingSupply}`,
      );
    } catch (error) {
      this.logger.error(
        `Error updating circulating supply for ${token.symbol}:`,
        error,
      );
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
              fdv: cachedToken.fdv,
              marketCap: cachedToken.marketCap,
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
