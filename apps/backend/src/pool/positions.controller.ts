import { CacheInterceptor, CacheKey, CacheTTL } from '@nestjs/cache-manager';
import { Controller, Param, UseInterceptors, Get } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { positions } from 'src/ponder/ponder.schema';
import { PonderService } from 'src/ponder/ponder.service';
import { eq } from 'drizzle-orm';
import { V3_POSITION_MANAGER_ABI } from 'src/blockchain/abis/V3_POSITION_MANAGER_ABI';
import { BlockchainService } from 'src/blockchain/blockchain.service';

@Controller('positions')
@UseInterceptors(CacheInterceptor)
export class PositionsController {
  constructor(
    private readonly ponder: PonderService,
    private readonly db: DatabaseService,
    private readonly bc: BlockchainService,
  ) {}

  @Get('/:address')
  @CacheKey('positions:user')
  @CacheTTL(2 * 60 * 1000) // 2 minutes
  async getUserPositions(@Param('address') address: string) {
    try {
      console.log(`Fetching positions for address: ${address}`);

      const userPositions = await this.ponder.database
        .select()
        .from(positions)
        .where(eq(positions.sender, address.toLowerCase()));

      const poolsAddr = userPositions.map((up) => up.poolAddress);
      const pools = await this.db.poolStats.findMany({
        include: {
          token0: {
            include: {
              TokenPrice: {
                orderBy: { createdAt: 'desc' },
                take: 1,
              },
            },
          },
          token1: {
            include: {
              TokenPrice: {
                orderBy: { createdAt: 'desc' },
                take: 1,
              },
            },
          },
        },
        where: {
          address: {
            in: poolsAddr,
          },
        },
      });

      return await Promise.all(
        userPositions.map(async (pos) => {
          const pool = pools.find((p) => p.address === pos.poolAddress);
          const posOnChain = await this.bc.client.readContract({
            address: '0xEf089afF769bC068520a1A90f0773037eF31fbBC',
            abi: V3_POSITION_MANAGER_ABI,
            functionName: 'positions',
            args: [BigInt(pos.tokenId)],
          });

          return {
            position: {
              ...pos,
              createdAt: pos.createdAt.toString(),
              updatedAt: pos.updatedAt.toString(),
              liquidity: pos.liquidity.toString(),
              amount0: pos.amount0.toString(),
              amount1: pos.amount1.toString(),
              liquidity2: posOnChain[7].toString(),
              tokenOwed0: posOnChain[10].toString(),
              tokenOwed1: posOnChain[11].toString(),
            },
            pool,
          };
        }),
      );
    } catch (error) {
      console.error('Error fetching user positions:', error);
      return [];
    }
  }
}
