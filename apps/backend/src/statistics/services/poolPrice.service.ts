import { Injectable, Logger } from '@nestjs/common';
import { CoinGeckoService } from './coingecko.service';
import { DatabaseService } from 'src/database/database.service';
import {
  PoolPriceCalculation,
  PoolWithTokens,
  SwapWithPool,
} from '../types/tokenPrices';
import { BigNumber } from 'bignumber.js';

@Injectable()
export class PoolPriceService {
  private readonly logger = new Logger(PoolPriceService.name);

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly coinGeckoService: CoinGeckoService,
  ) {}

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
}
