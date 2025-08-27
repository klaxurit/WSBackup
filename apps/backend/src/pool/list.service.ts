import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Prisma } from '@repo/db';
import { and, eq, gte } from 'drizzle-orm';
import { V3_POOL_ABI } from 'src/blockchain/abis/V3_POOL_ABI';
import { BlockchainService } from 'src/blockchain/blockchain.service';
import { DatabaseService } from 'src/database/database.service';
import { Pool, pools, Swap, swaps } from 'src/ponder/ponder.schema';
import { PonderService } from 'src/ponder/ponder.service';
import { formatUnits } from 'viem';

interface BlockchainPoolData {
  sqrtPriceX96: bigint;
  liquidity: bigint;
  fee: number;
  isValid: boolean;
}

type TokenWithPrice = Prisma.TokenGetPayload<{
  include: {
    TokenPrice: true;
  };
}>;

@Injectable()
export class PoolListService implements OnModuleInit {
  private readonly logger = new Logger(PoolListService.name);

  constructor(
    private readonly ponder: PonderService,
    private readonly db: DatabaseService,
    private readonly bc: BlockchainService,
  ) { }

  async onModuleInit() {
    // await this.updateGeneralList();
  }

  @Cron(CronExpression.EVERY_5_MINUTES)
  private async updateGeneralList() {
    const allPools = await this.ponder.database.select().from(pools);
    this.logger.log(`Update ${allPools.length} pools data`);

    await Promise.all(allPools.map((p) => this.savePoolData(p)));
  }
  private async savePoolData(pool: Pool) {
    this.logger.debug('Update pool datas', pool);

    const onChainData = await this.getOnChainData(
      pool.address as `0x${string}`,
    );
    if (!onChainData) {
      this.logger.error('Cant fetch pool data onChain');
      return;
    }

    const tokenPrices = await this.getTokensAndPrices(
      pool.token0Address,
      pool.token1Address,
    );
    if (!tokenPrices) {
      this.logger.error("Cant fetch pool's tokens price");
      return;
    }

    const dayVolUSD =
      (await this.getVolumeByPeriod(pool, 24, tokenPrices)) || 0;
    const monthVolUSD =
      (await this.getVolumeByPeriod(pool, 24 * 30, tokenPrices)) || 0;

    const aprAndTvl = await this.calculateAprAndTvl(
      pool,
      onChainData,
      tokenPrices,
      dayVolUSD,
    );

    if (!aprAndTvl?.apr || !aprAndTvl?.tvlUSD) {
      this.logger.error("Cant fetch pool's APR or TVL");
      return;
    }

    this.logger.debug(
      `Update pool ${tokenPrices?.token0.symbol}/${tokenPrices.token1.symbol} :`,
      { ...aprAndTvl, dayVolUSD, monthVolUSD, ...onChainData },
    );
    await this.db.poolStats.upsert({
      where: { address: pool.address },
      create: {
        address: pool.address,
        tickSpacing: pool.tickSpacing!,
        fee: pool.fee || onChainData.fee || 3000,
        createdAt: pool.createdAt.toString(),
        createdAtBlock: pool.createdAtBlock.toString(),
        token0Address: pool.token0Address,
        token1Address: pool.token1Address,
        token0Symbol: tokenPrices.token0.symbol,
        token1Symbol: tokenPrices.token1.symbol,
        token0LogoUri: tokenPrices.token0.logoUri,
        token1LogoUri: tokenPrices.token1.logoUri,
        sqrtPriceX96: onChainData.sqrtPriceX96.toString(),
        liquidity: onChainData.liquidity.toString(),
        isValid: onChainData.isValid,
        dayVolumeUSD: dayVolUSD,
        monthVolumeUSD: monthVolUSD,
        apr: aprAndTvl.apr,
        tvlUSD: aprAndTvl.tvlUSD,
      },
      update: {
        sqrtPriceX96: onChainData.sqrtPriceX96.toString(),
        liquidity: onChainData.liquidity.toString(),
        isValid: onChainData.isValid,
        dayVolumeUSD: dayVolUSD,
        monthVolumeUSD: monthVolUSD,
        apr: aprAndTvl.apr,
        tvlUSD: aprAndTvl.tvlUSD,
      },
    });
  }

  private async getOnChainData(poolAddress: `0x${string}`) {
    try {
      const [slot0, liquidity, fee] = await this.bc.client.multicall({
        contracts: [
          {
            address: poolAddress,
            abi: V3_POOL_ABI,
            functionName: 'slot0',
          },
          {
            address: poolAddress,
            abi: V3_POOL_ABI,
            functionName: 'liquidity',
          },
          {
            address: poolAddress,
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

      return data;
    } catch (error) {
      this.logger.error(
        `Error fetching blockchain data for pool ${poolAddress}:`,
        error,
      );
      return null;
    }
  }

  private async getTokensAndPrices(
    t0: string,
    t1: string,
  ): Promise<{ token0: TokenWithPrice; token1: TokenWithPrice } | null> {
    const token0 = await this.db.token.findFirst({
      where: {
        address: t0,
      },
      include: {
        TokenPrice: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });
    const token1 = await this.db.token.findFirst({
      where: {
        address: t1,
      },
      include: {
        TokenPrice: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (
      !token0 ||
      !token1 ||
      token0.TokenPrice.length === 0 ||
      token1.TokenPrice.length === 0
    )
      return null;

    return {
      token0,
      token1,
    };
  }

  private async getVolumeByPeriod(
    pool: Pool,
    hourPeriod: number = 24,
    tokens: { token0: TokenWithPrice; token1: TokenWithPrice },
  ) {
    const now = Math.floor(Date.now() / 1000);
    const xHourAgo = now - hourPeriod * 60 * 60;

    const recentSwaps = await this.ponder.database
      .select()
      .from(swaps)
      .where(
        and(
          eq(swaps.poolAddress, pool.address),
          gte(swaps.createdAt, BigInt(xHourAgo)),
        ),
      );

    const volumeUSD = recentSwaps.reduce((total: number, swap: Swap) => {
      const amount0 = formatUnits(swap.amount0, tokens.token0.decimals);
      const amount1 = formatUnits(swap.amount1, tokens.token1.decimals);

      const vol0USD =
        Math.abs(parseFloat(amount0)) * tokens.token0.TokenPrice[0].price;
      const vol1USD =
        Math.abs(parseFloat(amount1)) * tokens.token1.TokenPrice[0].price;

      return total + vol0USD + vol1USD;
    }, 0);

    return volumeUSD;
  }

  private async calculateAprAndTvl(
    pool: Pool,
    onChainData: BlockchainPoolData,
    tokens: { token0: TokenWithPrice; token1: TokenWithPrice },
    volume24hUSD: number,
  ) {
    try {
      // Calcul correct du prix spot depuis sqrtPriceX96
      // Prix = (sqrtPriceX96 / 2^96)^2 * 10^(decimals0 - decimals1)
      const sqrtPrice = Number(onChainData.sqrtPriceX96) / 2 ** 96;
      const price =
        sqrtPrice ** 2 *
        10 ** (tokens.token0.decimals - tokens.token1.decimals);

      // Calcul correct de la TVL selon Uniswap V3
      // Pour une range complète [-∞, +∞], L = sqrt(amount0 * amount1)
      // amount0 = L * (sqrt(P_upper) - sqrt(P_current)) / (sqrt(P_current) * sqrt(P_upper))
      // amount1 = L * (sqrt(P_current) - sqrt(P_lower))
      // Pour simplifier, on utilise la liquidity comme approximation
      const liquidityNum = Number(onChainData.liquidity);

      // Estimation des amounts basée sur la liquidity et le prix current
      // Cette approximation suppose une range large autour du prix current
      const amount1Estimated =
        liquidityNum / Math.sqrt(price) / 10 ** tokens.token1.decimals;
      const amount0Estimated =
        (liquidityNum * Math.sqrt(price)) / 10 ** tokens.token0.decimals;

      // TVL en USD
      const tvlUSD = Math.abs(
        amount0Estimated * tokens.token0.TokenPrice[0].price +
        amount1Estimated * tokens.token1.TokenPrice[0].price,
      );

      // Volume 24h déjà en USD depuis getVolumeByPeriod
      const vol24hUSD = volume24hUSD;

      // Calcul des fees 24h
      const fees24h = vol24hUSD * (onChainData.fee / 1000000);

      // Calcul APR avec fallback pour pools sans transactions récentes
      let apr = 0;
      if (fees24h > 0 && tvlUSD > 0) {
        // APR normal basé sur les fees des dernières 24h
        apr = (fees24h / tvlUSD) * 365 * 100;
      } else if (tvlUSD > 0) {
        // Fallback : utiliser la moyenne des 7 derniers jours
        const volume7dUSD = await this.getVolumeByPeriod(pool, 24 * 7, tokens);
        const avgDailyVolumeUSD = volume7dUSD / 7;
        const avgDailyFees = avgDailyVolumeUSD * (onChainData.fee / 1000000);

        if (avgDailyFees > 0) {
          apr = (avgDailyFees / tvlUSD) * 365 * 100;
          this.logger.debug(
            `Using 7-day average for APR calculation: ${apr.toFixed(2)}%`,
          );
        } else {
          // Dernier recours : APR basé sur le fee tier et une estimation de volume minimal
          // Estimer 0.01% du TVL comme volume quotidien minimal pour pools actifs
          const minDailyVolumeEstimate = tvlUSD * 0.0001;
          const minDailyFees =
            minDailyVolumeEstimate * (onChainData.fee / 1000000);
          apr = (minDailyFees / tvlUSD) * 365 * 100;
          this.logger.debug(
            `Using minimal theoretical APR: ${apr.toFixed(4)}% (${onChainData.fee / 10000}% fee tier)`,
          );
        }
      }

      return {
        apr: Math.max(0, Math.min(10000, apr)), // Cap APR entre 0% et 10000%
        tvlUSD: Math.max(0, tvlUSD),
      };
    } catch (error) {
      this.logger.error('Error in advanced metrics calculation:', error);
      return null;
    }
  }
}
