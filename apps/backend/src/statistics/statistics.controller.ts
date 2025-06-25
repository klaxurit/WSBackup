import { Controller, Get, Param } from '@nestjs/common';
import { PriceService } from './services/price.service';
import { PoolPriceService } from './services/poolPrice.service';
import { Address } from 'viem';
import { BlockchainService } from 'src/indexer/services/blockchain.service';
import { POSITION_MANAGER_ABI } from 'src/indexer/constants/abis';
import { BigNumber } from 'bignumber.js';

@Controller('stats')
export class StatisticsController {
  private readonly positionManagerAddress =
    '0xEf089afF769bC068520a1A90f0773037eF31fbBC';

  constructor(
    private readonly priceService: PriceService,
    private readonly poolService: PoolPriceService,
    private readonly blockchainService: BlockchainService,
  ) { }

  @Get('/tokens')
  async getTokensWithStats() {
    return await this.priceService.getTokenStats();
  }

  @Get('/pools')
  async getPoolsWithStats() {
    return await this.poolService.getPoolStats();
  }

  @Get('/topPools')
  async getTopPools() {
    return await this.poolService.getTopPoolStats();
  }

  @Get('/positions/:address')
  async getAddressPositions(@Param('address') address: Address) {
    console.log(`🚀 Starting getAddressPositions for ${address}`);

    try {
      // Timeout de 15 secondes pour être plus restrictif
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout after 15 seconds')), 15000);
      });

      const positionsPromise = this.fetchPositionsWithTimeout(address);

      const result = await Promise.race([positionsPromise, timeoutPromise]);
      return result;

    } catch (error) {
      console.error('❌ Error in getAddressPositions:', error.message);
      return [];
    }
  }

  private async fetchPositionsWithTimeout(address: Address) {
    console.log(`📡 Connecting to blockchain...`);

    const client = this.blockchainService.getPublicClient();

    if (!client) {
      console.error('❌ No blockchain client available');
      return [];
    }

    try {
      console.log(`🔍 Checking balance for address: ${address}`);

      // Test simple d'abord
      if (!address || address === '0x0000000000000000000000000000000000000000') {
        console.log('❌ Invalid address provided');
        return [];
      }

      // Vérifier le balance de positions NFT
      let balance: bigint;
      try {
        console.log('🔄 Calling balanceOf...');
        balance = await client.readContract({
          address: this.positionManagerAddress,
          abi: [
            {
              name: 'balanceOf',
              type: 'function',
              inputs: [{ name: 'owner', type: 'address' }],
              outputs: [{ name: '', type: 'uint256' }],
              stateMutability: 'view',
            }
          ],
          functionName: 'balanceOf',
          args: [address],
        });
        console.log(`✅ Balance call successful: ${balance}`);
      } catch (balanceError) {
        console.error('❌ Error calling balanceOf:', balanceError.message);
        return [];
      }

      if (Number(balance) === 0) {
        console.log('ℹ️ No positions found, returning empty array');
        return [];
      }

      console.log(`📊 Found ${balance} positions for address ${address}`);
      const positions: any[] = [];
      const maxPositions = Math.min(Number(balance), 5); // Réduire encore plus

      for (let i = 0; i < maxPositions; i++) {
        try {
          console.log(`🔄 Processing position ${i + 1}/${maxPositions}...`);

          // Ajouter un timeout par position
          const positionPromise = this.processPosition(client, address, i);
          const positionTimeout = new Promise((_, reject) => {
            setTimeout(() => reject(new Error(`Position ${i} timeout`)), 5000);
          });

          const position = await Promise.race([positionPromise, positionTimeout]);

          if (position) {
            positions.push(position);
            console.log(`✅ Successfully processed position ${i + 1}`);
          }

        } catch (positionError) {
          console.error(`❌ Error processing position ${i}:`, positionError.message);
          continue;
        }
      }

      console.log(`🎉 Returning ${positions.length} positions`);
      return positions;

    } catch (error) {
      console.error('❌ Error in fetchPositionsWithTimeout:', error.message);
      return [];
    }
  }

  private async processPosition(client: any, address: Address, index: number) {
    try {
      // Récupérer l'ID du token
      const tokenId = await client.readContract({
        address: this.positionManagerAddress,
        abi: [
          {
            name: 'tokenOfOwnerByIndex',
            type: 'function',
            inputs: [
              { name: 'owner', type: 'address' },
              { name: 'index', type: 'uint256' }
            ],
            outputs: [{ name: '', type: 'uint256' }],
            stateMutability: 'view',
          }
        ],
        functionName: 'tokenOfOwnerByIndex',
        args: [address, BigInt(index)],
      });

      console.log(`📝 Position ${index}: tokenId = ${tokenId}`);

      // Récupérer les détails
      const details = await client.readContract({
        address: this.positionManagerAddress,
        abi: [
          {
            name: 'positions',
            type: 'function',
            inputs: [{ name: 'tokenId', type: 'uint256' }],
            outputs: [
              { name: 'nonce', type: 'uint96' },
              { name: 'operator', type: 'address' },
              { name: 'token0', type: 'address' },
              { name: 'token1', type: 'address' },
              { name: 'fee', type: 'uint24' },
              { name: 'tickLower', type: 'int24' },
              { name: 'tickUpper', type: 'int24' },
              { name: 'liquidity', type: 'uint128' },
              { name: 'feeGrowthInside0LastX128', type: 'uint256' },
              { name: 'feeGrowthInside1LastX128', type: 'uint256' },
              { name: 'tokensOwed0', type: 'uint128' },
              { name: 'tokensOwed1', type: 'uint128' }
            ],
            stateMutability: 'view',
          }
        ],
        functionName: 'positions',
        args: [tokenId],
      });

      const [
        nonce,
        operator,
        token0Address,
        token1Address,
        fee,
        tickLower,
        tickUpper,
        liquidity,
        feeGrowthInside0LastX128,
        feeGrowthInside1LastX128,
        tokensOwed0,
        tokensOwed1
      ] = details as unknown as any[];

      console.log(`📊 Position details:`, {
        tokenId: tokenId.toString(),
        token0: token0Address,
        token1: token1Address,
        fee: Number(fee),
        liquidity: liquidity.toString()
      });

      // Ignorer si pas de liquidité
      if (BigInt(liquidity.toString()) === 0n) {
        console.log(`⏭️ Position ${tokenId} has no liquidity, skipping`);
        return null;
      }

      // Trouver la pool
      console.log(`🔍 Looking for pool...`);
      const pool = await this.poolService.getOnePoolStat(
        token0Address as string,
        token1Address as string,
        Number(fee),
      );

      if (!pool) {
        console.log(`❌ Pool not found for position ${tokenId}`);
        return null;
      }

      console.log(`✅ Found pool for position:`, {
        poolAddress: pool.address,
        token0Symbol: pool.token0?.symbol,
        token1Symbol: pool.token1?.symbol
      });

      // Calculer les montants de manière sécurisée
      const amounts = this.calculateAmountsSafely(pool, liquidity, tickLower, tickUpper);

      // Calculer les prix
      const prices = this.getPricesSafely(pool);

      // Calculer les valeurs USD
      const usdValues = this.calculateUSDValues(amounts, prices);

      // Calculer les fees
      const fees = this.calculateFees(tokensOwed0, tokensOwed1, pool, prices);

      // Vérifier in range
      const currentTick = pool.tick || 0;
      const inRange = currentTick >= Number(tickLower) && currentTick <= Number(tickUpper);

      // Calculer la part
      const sharePercentage = this.calculateShare(liquidity, pool.liquidity);

      const position = {
        tokenId: tokenId.toString(),
        address: pool.address,
        liquidity: liquidity.toString(),
        tickLower: Number(tickLower),
        tickUpper: Number(tickUpper),
        fee: Number(fee),
        inRange,

        // Montants
        amount0: amounts.amount0,
        amount1: amounts.amount1,
        depositedToken0: amounts.amount0,
        depositedToken1: amounts.amount1,

        // USD
        amount0USD: usdValues.amount0USD,
        amount1USD: usdValues.amount1USD,
        totalUSD: usdValues.totalUSD,
        positionValue: `$${usdValues.totalUSD}`,

        // Fees
        feesOwed0: fees.feesOwed0,
        feesOwed1: fees.feesOwed1,
        feesOwedUSD: fees.feesOwedUSD,

        // Tokens
        token0: {
          address: pool.token0.address,
          symbol: pool.token0.symbol,
          name: pool.token0.name,
          decimals: pool.token0.decimals,
          logoUri: pool.token0.logoUri,
          price: prices.token0Price
        },
        token1: {
          address: pool.token1.address,
          symbol: pool.token1.symbol,
          name: pool.token1.name,
          decimals: pool.token1.decimals,
          logoUri: pool.token1.logoUri,
          price: prices.token1Price
        },

        // Pool stats
        PoolStatistic: pool.PoolStatistic || [],
        share: `${sharePercentage.toFixed(4)}%`,

        // Raw data
        pool: {
          id: pool.id,
          address: pool.address,
          sqrtPriceX96: pool.sqrtPriceX96,
          tick: pool.tick,
          liquidity: pool.liquidity
        }
      };

      return position;

    } catch (error) {
      console.error(`❌ Error in processPosition ${index}:`, error.message);
      return null;
    }
  }

  private calculateAmountsSafely(pool: any, liquidity: any, tickLower: any, tickUpper: any) {
    try {
      console.log(`🧮 Calculating amounts with simple estimation...`);

      const liquidityNum = parseFloat(liquidity.toString());
      const decimals0 = pool.token0?.decimals || 18;
      const decimals1 = pool.token1?.decimals || 18;

      console.log(`📊 Input values:`, {
        liquidity: liquidityNum,
        decimals0,
        decimals1,
        poolTVL: pool.PoolStatistic?.[0]?.tvlUSD,
        poolLiquidity: pool.liquidity
      });

      // Calcul basé sur la proportion de liquidité dans la pool
      const poolTVL = pool.PoolStatistic?.[0]?.tvlUSD || 0;
      const poolLiquidityNum = parseFloat(pool.liquidity || '1');

      if (poolTVL > 0 && poolLiquidityNum > 0 && liquidityNum > 0) {
        // Ratio de cette position par rapport à la pool totale
        const positionRatio = liquidityNum / poolLiquidityNum;
        const estimatedPositionValue = poolTVL * positionRatio;

        console.log(`📊 Calculation:`, {
          positionRatio: positionRatio,
          estimatedPositionValue: estimatedPositionValue
        });

        // Obtenir les prix des tokens
        const token0Price = pool.token0?.Statistic?.[0]?.price || 0;
        const token1Price = pool.token1?.Statistic?.[0]?.price || 0;

        console.log(`💵 Token prices:`, { token0Price, token1Price });

        if (token0Price > 0 && token1Price > 0) {
          // Estimation simple : répartition selon les prix relatifs
          // Plus le token est cher, moins on en a en quantité
          const priceRatio = token0Price / (token0Price + token1Price);

          const value0 = estimatedPositionValue * (1 - priceRatio); // Plus de tokens moins chers
          const value1 = estimatedPositionValue * priceRatio;       // Moins de tokens plus chers

          const amount0 = (value0 / token0Price).toFixed(6);
          const amount1 = (value1 / token1Price).toFixed(6);

          console.log(`💰 Calculated amounts:`, {
            value0,
            value1,
            amount0,
            amount1,
            totalValue: value0 + value1
          });

          return { amount0, amount1 };
        }
      }

      // Fallback si pas assez de données
      console.log(`⚠️ Using fallback calculation`);

      // Très simple : diviser la liquidité par des facteurs d'échelle
      const scale0 = Math.pow(10, decimals0 + 8); // Facteur d'échelle
      const scale1 = Math.pow(10, decimals1 + 8);

      const amount0 = (liquidityNum / scale0).toFixed(6);
      const amount1 = (liquidityNum / scale1).toFixed(6);

      console.log(`🔧 Fallback amounts:`, { amount0, amount1 });

      return { amount0, amount1 };

    } catch (error) {
      console.error(`❌ Error calculating amounts:`, error.message);
      return { amount0: "0.000000", amount1: "0.000000" };
    }
  }

  private getPricesSafely(pool: any) {
    try {
      let token0Price = 0;
      let token1Price = 0;

      if (pool.token0?.Statistic?.length > 0) {
        token0Price = pool.token0.Statistic[0].price || 0;
      }
      if (pool.token1?.Statistic?.length > 0) {
        token1Price = pool.token1.Statistic[0].price || 0;
      }

      console.log(`💵 Token prices:`, { token0Price, token1Price });
      return { token0Price, token1Price };
    } catch (error) {
      console.error(`❌ Error getting prices:`, error.message);
      return { token0Price: 0, token1Price: 0 };
    }
  }

  private calculateUSDValues(amounts: any, prices: any) {
    try {
      const amount0USD = parseFloat(amounts.amount0) * prices.token0Price;
      const amount1USD = parseFloat(amounts.amount1) * prices.token1Price;
      const totalUSD = amount0USD + amount1USD;

      return {
        amount0USD: amount0USD.toFixed(2),
        amount1USD: amount1USD.toFixed(2),
        totalUSD: totalUSD.toFixed(2)
      };
    } catch (error) {
      console.error(`❌ Error calculating USD values:`, error.message);
      return {
        amount0USD: "0.00",
        amount1USD: "0.00",
        totalUSD: "0.00"
      };
    }
  }

  private calculateFees(tokensOwed0: any, tokensOwed1: any, pool: any, prices: any) {
    try {
      const decimals0 = pool.token0?.decimals || 18;
      const decimals1 = pool.token1?.decimals || 18;

      const feesOwed0 = parseFloat(tokensOwed0.toString()) / Math.pow(10, decimals0);
      const feesOwed1 = parseFloat(tokensOwed1.toString()) / Math.pow(10, decimals1);

      const feesOwed0USD = feesOwed0 * prices.token0Price;
      const feesOwed1USD = feesOwed1 * prices.token1Price;
      const totalFeesUSD = feesOwed0USD + feesOwed1USD;

      return {
        feesOwed0: feesOwed0.toFixed(6),
        feesOwed1: feesOwed1.toFixed(6),
        feesOwedUSD: totalFeesUSD.toFixed(2)
      };
    } catch (error) {
      console.error(`❌ Error calculating fees:`, error.message);
      return {
        feesOwed0: "0.000000",
        feesOwed1: "0.000000",
        feesOwedUSD: "0.00"
      };
    }
  }

  private calculateShare(liquidity: any, poolLiquidity: any) {
    try {
      const poolLiq = parseFloat(poolLiquidity || '0');
      const posLiq = parseFloat(liquidity.toString());

      if (poolLiq === 0) return new BigNumber(0);

      return new BigNumber((posLiq / poolLiq) * 100);
    } catch (error) {
      console.error(`❌ Error calculating share:`, error.message);
      return new BigNumber(0);
    }
  }
}