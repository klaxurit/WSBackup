import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CoinGeckoService } from 'src/coingecko/coingecko.service';
import { DatabaseService } from 'src/database/database.service';
import { pools } from 'src/ponder/ponder.schema';
import { PonderService } from 'src/ponder/ponder.service';
import { eq } from 'drizzle-orm';
import { getContract, ResourceUnavailableRpcError } from 'viem';
import { V3_POOL_ABI } from 'src/blockchain/abis/V3_POOL_ABI';
import { BlockchainService } from 'src/blockchain/blockchain.service';

interface PoolConnection {
  poolAddress: string;
  token0: string;
  token1: string;
}

interface TokenGraph {
  [tokenAddress: string]: {
    directPools: PoolConnection[]; // Pool where this token is present
    connectedTokens: Set<string>; // Tokens directtly connected
    level: number; // 0 = Honey, 1 = Bera, 2+ = others
  };
}

interface TokenPriceResult {
  address: string;
  price: number;
  path: string[];
  level: number;
}

@Injectable()
export class PriceTokenService implements OnModuleInit {
  private readonly logger = new Logger(PriceTokenService.name);
  private HoneyPrice: number | null = null;
  private tokensGraph: TokenGraph = {};

  private readonly honeyAddr =
    '0xFCBD14DC51f0A4d49d5E53C2E0950e0bC26d0Dce'.toLowerCase();

  constructor(
    private readonly db: DatabaseService,
    private readonly ponder: PonderService,
    private readonly cgs: CoinGeckoService,
    private readonly blockchain: BlockchainService,
  ) {}

  async onModuleInit() {
    await this.getHoneyPrice();
    await this.updateTokenPrice();
  }

  async updateTokenPrice() {
    await this.buildPathGraph();
    const prices = await this.calculateAllTokenPrices();
    await this.savePrices(prices);
  }

  @Cron(CronExpression.EVERY_10_MINUTES)
  async getHoneyPrice() {
    const price = await this.cgs.getTokenData('honey-3');
    this.HoneyPrice = price ? price : 0.9998;
    this.logger.debug('Honey Price updated @' + this.HoneyPrice);
  }

  async buildPathGraph() {
    const tokensGraphSave = this.tokensGraph;
    this.tokensGraph = {};

    try {
      const currentPools = await this.ponder.database
        .select({
          address: pools.address,
          token0Address: pools.token0Address,
          token1Address: pools.token1Address,
        })
        .from(pools);
      if (!currentPools) throw new Error('No pool found from ponder');

      // Build new graph
      for (const pool of currentPools) {
        const t0 = pool.token0Address.toLowerCase();
        const t1 = pool.token1Address.toLowerCase();

        if (!this.tokensGraph[t0]) {
          this.tokensGraph[t0] = {
            directPools: [],
            connectedTokens: new Set(),
            level: -1,
          };
        }

        if (!this.tokensGraph[t1]) {
          this.tokensGraph[t1] = {
            directPools: [],
            connectedTokens: new Set(),
            level: -1,
          };
        }

        const poolConnection: PoolConnection = {
          poolAddress: pool.address,
          token0: t0,
          token1: t1,
        };

        this.tokensGraph[t0].directPools.push(poolConnection);
        this.tokensGraph[t1].directPools.push(poolConnection);

        this.tokensGraph[t0].connectedTokens.add(t1);
        this.tokensGraph[t1].connectedTokens.add(t0);
      }

      // Assign levels
      // Level 0 : Honey
      if (this.tokensGraph[this.honeyAddr]) {
        this.tokensGraph[this.honeyAddr].level = 0;
      }

      // Level 1 : Bera (wBera) + all tokens directly connected to Honey
      const honeyConnections =
        this.tokensGraph[this.honeyAddr]?.connectedTokens || new Set();
      for (const tokenAddress of honeyConnections) {
        if (this.tokensGraph[tokenAddress]) {
          this.tokensGraph[tokenAddress].level = 1;
        }
      }

      // level 2+: BFS from level 1 tokens
      const queue: { address: string; level: number }[] = [];
      const visited = new Set<string>();
      // init queue with level 1 tokens
      for (const [address, token] of Object.entries(this.tokensGraph)) {
        if (token.level === 1) {
          queue.push({ address, level: 1 });
          visited.add(address);
        }
      }
      // BFS to add other level
      while (queue.length > 0) {
        const current = queue.shift()!;

        for (const connectedAddress of this.tokensGraph[current.address]
          .connectedTokens) {
          if (!visited.has(connectedAddress)) {
            visited.add(connectedAddress);
            this.tokensGraph[connectedAddress].level = current.level + 1;

            if (current.level < 3) {
              queue.push({
                address: connectedAddress,
                level: current.level + 1,
              });
            }
          }
        }
      }

      this.logger.debug(`Token graph updated !`);
    } catch (error) {
      this.logger.error(`Failed to build pricing graph:`, error.message);
      this.tokensGraph = tokensGraphSave;
    }
  }

  async calculateAllTokenPrices(): Promise<TokenPriceResult[]> {
    if (!this.HoneyPrice) {
      this.logger.warn('Honey price not available, skipping price calculation');
      return [];
    }

    const results: TokenPriceResult[] = [];
    const calculatedPrices = new Map<string, number>();

    try {
      // 1. Honey price - level 0
      calculatedPrices.set(this.honeyAddr, this.HoneyPrice);
      results.push({
        address: this.honeyAddr,
        price: this.HoneyPrice,
        path: [this.honeyAddr],
        level: 0,
      });

      this.logger.debug('start calculateAllTokenPrices');
      // 2. Calculate price by level
      for (let level = 1; level <= 3; level++) {
        const tokensAtLevel = Object.entries(this.tokensGraph)
          .filter(([_, token]) => token.level === level)
          .map(([address, _]) => address);

        this.logger.debug(`Tokens level ${level}`, tokensAtLevel);
        for (const tokenAddress of tokensAtLevel) {
          if (tokenAddress === this.honeyAddr) continue;
          const priceResult = await this.calculateTokenPrice(
            tokenAddress,
            calculatedPrices,
          );

          if (priceResult) {
            calculatedPrices.set(tokenAddress, priceResult.price);
            results.push(priceResult);
          }
        }
      }

      this.logger.debug(`Calculated prices for ${results.length} tokens`);
      return results;
    } catch (error) {
      this.logger.error('Failed to calculate token prices:', error.message);
      return [];
    }
  }

  private async calculateTokenPrice(
    targetToken: string,
    knownPrices: Map<string, number>,
  ): Promise<TokenPriceResult | null> {
    const tokenNode = this.tokensGraph[targetToken];

    this.logger.debug(
      `Calculate price token (${targetToken}) via tokenNode:`,
      tokenNode,
    );
    if (!tokenNode) return null;

    // Find a pool who connect this token to a token who already know his price
    for (const pool of tokenNode.directPools) {
      const otherToken =
        pool.token0 === targetToken ? pool.token1 : pool.token0;

      if (knownPrices.has(otherToken)) {
        // Connection found !
        const otherTokenPrice = knownPrices.get(otherToken)!;

        try {
          // Find pool data from pronder.
          const poolData = await this.getPoolData(pool.poolAddress);
          this.logger.debug(`Price calculated from this pool`, poolData);
          if (!poolData) continue;

          // Calculate price
          const calculatedPrice = this.calculatePriceFromPool(
            targetToken,
            otherToken,
            otherTokenPrice,
            poolData,
          );

          this.logger.debug(`Price: ${calculatedPrice}`);
          if (calculatedPrice > 0) {
            return {
              address: targetToken,
              price: calculatedPrice,
              path: [otherToken, targetToken],
              level: tokenNode.level,
            };
          }
        } catch (error) {
          this.logger.warn(
            `Failed to calculate price for ${targetToken} via pool ${pool.poolAddress} `,
          );
          continue;
        }
      }
    }

    return null;
  }

  private async getPoolData(poolAddress: string) {
    try {
      // 1. Récupérer les infos de base depuis Ponder (statiques)
      const poolInfo = await this.ponder.database
        .select({
          address: pools.address,
          token0Address: pools.token0Address,
          token1Address: pools.token1Address,
          fee: pools.fee,
        })
        .from(pools)
        .where(eq(pools.address, poolAddress))
        .limit(1);

      if (!poolInfo.length) return null;

      // 2. Récupérer les données live depuis la blockchain
      const onChainData = await this.getPoolOnChainData(poolAddress);
      if (!onChainData) return null;

      return {
        ...poolInfo[0],
        ...onChainData,
        // liquidityUSD sera calculé plus tard avec les prix
      };
    } catch (error) {
      this.logger.error(
        `Error fetching pool data for ${poolAddress}: `,
        error.message,
      );
      return null;
    }
  }

  private async getPoolOnChainData(poolAddress: string) {
    try {
      const poolContract = getContract({
        address: poolAddress as `0x${string} `,
        abi: V3_POOL_ABI,
        client: this.blockchain.client,
      });

      const [slot0, liquidity] = await Promise.all([
        poolContract.read.slot0(),
        poolContract.read.liquidity(),
      ]);

      return {
        sqrtPriceX96: slot0[0],
        tick: slot0[1],
        liquidity: liquidity,
        ...this.calculateReservesFromSqrtPrice(slot0[0], liquidity),
      };
    } catch (error) {
      this.logger.error(
        `Failed to fetch pool data for ${poolAddress}: `,
        error.message,
      );
      return null;
    }
  }

  private calculateReservesFromSqrtPrice(
    sqrtPriceX96: bigint,
    liquidity: bigint,
  ) {
    // Formules Uniswap V3 pour calculer amount0 et amount1
    // amount0 = liquidity / sqrtPriceX96 * 2^96
    // amount1 = liquidity * sqrtPriceX96 / 2^96

    const Q96 = 2n ** 96n;

    // Reserve0 (token0)
    const amount0 = (liquidity * Q96) / sqrtPriceX96;

    // Reserve1 (token1)
    const amount1 = (liquidity * sqrtPriceX96) / Q96;

    return {
      reserve0: Number(amount0),
      reserve1: Number(amount1),
      liquidityUSD: 0,
    };
  }

  private calculatePriceFromPool(
    targetToken: string,
    referenceToken: string,
    referencePrice: number,
    poolData: Awaited<ReturnType<typeof this.getPoolData>>,
  ): number {
    const isTargetToken0 =
      poolData!.token0Address.toLowerCase() === targetToken;

    if (isTargetToken0) {
      // Prix de token0 en token1, puis convertir en USD
      const rate = poolData!.reserve1 / poolData!.reserve0;
      return rate * referencePrice;
    } else {
      // Prix de token1 en token0, puis convertir en USD
      const rate = poolData!.reserve0 / poolData!.reserve1;
      return rate * referencePrice;
    }
  }

  private calculatePriceFromSqrtPriceX96(
    sqrtPriceX96: bigint,
    decimals0: number,
    decimals1: number,
  ): number {
    // Prix de token0 en termes de token1
    // price = (sqrtPriceX96 / 2^96)^2 * 10^(decimals0 - decimals1)

    const Q96 = 2n ** 96n;
    const sqrtPrice = Number(sqrtPriceX96) / Number(Q96);
    const price = sqrtPrice * sqrtPrice;

    // Ajuster pour les décimales
    const decimalAdjustment = Math.pow(10, decimals0 - decimals1);

    return price * decimalAdjustment;
  }

  private async savePrices(prices: TokenPriceResult[]) {
    this.logger.debug('save this prices:', prices);
    try {
      await this.db.client.$transaction([
        ...prices.map((p) => {
          return this.db.tokenPrice.create({
            data: {
              tokenAddress: p.address,
              price: p.price,
            },
          });
        }),
      ]);
    } catch (error) {
      this.logger.error("Can't save prices in Database", error.message);
    }
  }
}
