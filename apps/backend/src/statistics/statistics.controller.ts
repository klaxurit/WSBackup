import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
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
  ) {}

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

  @Get('/poolByTokens/:token0/:token1/:fee')
  async getPoolByTokens(
    @Param('token0') token0: Address,
    @Param('token1') token1: Address,
    @Param('fee', ParseIntPipe) fee: number,
  ) {
    return await this.poolService.getOnePoolStat(token0, token1, fee);
  }

  @Get('/positions/:address')
  async getAddressPositions(@Param('address') address: Address) {
    try {
      const balance = await this.blockchainService
        .getPublicClient()
        .readContract({
          address: this.positionManagerAddress,
          abi: POSITION_MANAGER_ABI,
          functionName: 'balanceOf',
          args: [address],
        });

      if (!balance) throw new Error('balance requested but undefined');
      if (balance === 0n) return [];

      const positionsWithPool = await Promise.all(
        Array.from({ length: Number(balance) }, (_, index) => index).map(
          async (i) => {
            const tokenId = await this.blockchainService
              .getPublicClient()
              .readContract({
                address: this.positionManagerAddress,
                abi: POSITION_MANAGER_ABI,
                functionName: 'tokenOfOwnerByIndex',
                args: [address, BigInt(i)],
              });

            if (!tokenId) return null;

            const position = await this.blockchainService
              .getPublicClient()
              .readContract({
                address: this.positionManagerAddress,
                abi: POSITION_MANAGER_ABI,
                functionName: 'positions',
                args: [tokenId],
              });

            if (!position) return null;

            const pool = await this.poolService.getOnePoolStat(
              position[2],
              position[3],
              position[4],
            );

            return {
              nftTokenId: tokenId.toString(),
              position: {
                fee: position[4],
                tickLower: position[5],
                tickUpper: position[6],
                liquidity: position[7].toString(),
                tokenOwed0: position[10].toString(),
                tokenOwed1: position[11].toString(),
              },
              pool,
            };
          },
        ),
      );

      return positionsWithPool;
    } catch (error) {
      console.error("Can't address position balance", error);
      return [];
    }
  }
}
