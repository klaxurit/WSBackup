import { CacheInterceptor, CacheKey, CacheTTL } from '@nestjs/cache-manager';
import {
  Controller,
  ParseIntPipe,
  Query,
  UseInterceptors,
  Get,
} from '@nestjs/common';
import { Prisma } from '@repo/db';
import { DatabaseService } from 'src/database/database.service';

@Controller('pools')
@UseInterceptors(CacheInterceptor)
export class PoolController {
  constructor(private readonly db: DatabaseService) {}

  @Get('/')
  @CacheKey('pool:stats')
  @CacheTTL(5 * 60 * 1000) // 5 minutes
  async getAllTokensWithStats(
    @Query('currentPage', new ParseIntPipe({ optional: true }))
    currentPage: number = 1,
    @Query('itemByPage', new ParseIntPipe({ optional: true }))
    itemByPage: number = 50,
    @Query('searchValue') searchValue?: string,
  ) {
    const page = Math.max(1, currentPage);
    const limit = Math.min(Math.max(1, itemByPage), 1000);
    const skip = (page - 1) * limit;

    const searchFilter = searchValue
      ? {
          OR: [
            {
              token0Symbol: {
                contains: searchValue,
                mode: Prisma.QueryMode.insensitive,
              },
            },
            {
              token1Symbol: {
                contains: searchValue,
                mode: Prisma.QueryMode.insensitive,
              },
            },
          ],
        }
      : {};

    const count = await this.db.poolStats.count({ where: searchFilter });
    const pools = await this.db.poolStats.findMany({
      where: searchFilter,
      take: limit,
      skip: skip,
    });
    const totalPages = Math.ceil(count / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    return {
      data: pools,
      pagination: {
        currentPage: page,
        itemsPerPage: limit,
        totalItems: count,
        totalPages: totalPages,
        hasNextPage: hasNextPage,
        hasPreviousPage: hasPreviousPage,
      },
    };
  }

  @Get('/top')
  @CacheKey('pool:top')
  @CacheTTL(5 * 60 * 1000)
  async getTopPools() {
    return await this.db.poolStats.findMany({
      orderBy: {
        tvlUSD: 'desc',
      },
      take: 4,
    });
  }
}
