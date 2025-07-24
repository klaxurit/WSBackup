import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { PriceService } from './services/price.service';
import { PoolPriceService } from './services/poolPrice.service';
import { Address } from 'viem';
import { DatabaseService } from 'src/database/database.service';
import { BlockchainService } from 'src/blockchain/blockchain.service';
import { V3_POSITION_MANAGER_ABI } from 'src/blockchain/abis/V3_POSITION_MANAGER_ABI';

@Controller('stats')
export class StatisticsController {
  private readonly positionManagerAddress =
    '0xEf089afF769bC068520a1A90f0773037eF31fbBC';

  constructor(
    private readonly priceService: PriceService,
    private readonly poolService: PoolPriceService,
    private readonly blockchainService: BlockchainService,
    private readonly databaseService: DatabaseService,
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

  @Get('/swaps')
  async getSwapHistory(
    @Query('currentPage', new ParseIntPipe({ optional: true }))
    currentPage: number = 1,
    @Query('itemByPage', new ParseIntPipe({ optional: true }))
    itemByPage: number = 100,
  ) {
    const page = Math.max(1, currentPage);
    const limit = Math.min(Math.max(1, itemByPage), 1000);
    const skip = (page - 1) * limit;

    const totalCount = await this.databaseService.swap.count();
    const swaps = await this.databaseService.swap.findMany({
      include: {
        pool: {
          include: {
            token0: {
              include: {
                Statistic: {
                  orderBy: {
                    createdAt: 'desc',
                  },
                  take: 1,
                  select: {
                    price: true,
                  },
                },
              },
            },
            token1: {
              include: {
                Statistic: {
                  orderBy: {
                    createdAt: 'desc',
                  },
                  take: 1,
                  select: {
                    price: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      skip: skip,
    });

    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    return {
      data: swaps,
      pagination: {
        currentPage: page,
        itemsPerPage: limit,
        totalItems: totalCount,
        totalPages: totalPages,
        hasNextPage: hasNextPage,
        hasPreviousPage: hasPreviousPage,
      },
    };
  }

  @Get('/positions/:address')
  async getAddressPositions(@Param('address') address: Address) {
    try {
      const balance = await this.blockchainService.client.readContract({
        address: this.positionManagerAddress,
        abi: V3_POSITION_MANAGER_ABI,
        functionName: 'balanceOf',
        args: [address],
      });

      if (!balance) throw new Error('balance requested but undefined');
      if (balance === 0n) return [];

      const positionsWithPool = await Promise.all(
        Array.from({ length: Number(balance) }, (_, index) => index).map(
          async (i) => {
            const tokenId = await this.blockchainService.client.readContract({
              address: this.positionManagerAddress,
              abi: V3_POSITION_MANAGER_ABI,
              functionName: 'tokenOfOwnerByIndex',
              args: [address, BigInt(i)],
            });

            if (!tokenId) return null;

            const position = await this.blockchainService.client.readContract({
              address: this.positionManagerAddress,
              abi: V3_POSITION_MANAGER_ABI,
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

  @Get('/token/:address')
  async getTokenPrice(@Param('address') address: Address) {
    const priceHistory = await this.databaseService.tokenStats.findMany({
      where: {
        token: {
          address,
        },
      },
      select: {
        price: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return priceHistory.map((stat) => ({
      price: stat.price,
      timestamp: stat.createdAt.getTime(),
    }));
  }
}
