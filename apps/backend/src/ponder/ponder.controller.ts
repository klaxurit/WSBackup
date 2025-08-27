import { CacheInterceptor, CacheKey } from '@nestjs/cache-manager';
import {
  Controller,
  ParseIntPipe,
  Query,
  UseInterceptors,
  Get,
} from '@nestjs/common';
import { PonderService } from './ponder.service';
import { swaps } from './ponder.schema';
import { count, desc } from 'drizzle-orm';

@Controller('indexer')
@UseInterceptors(CacheInterceptor)
export class PonderController {
  constructor(private readonly ponder: PonderService) {}

  @Get('/swaps')
  @CacheKey('ponder:swaps')
  async getAllSwaps(
    @Query('currentPage', new ParseIntPipe({ optional: true }))
    currentPage: number = 1,
    @Query('itemByPage', new ParseIntPipe({ optional: true }))
    itemByPage: number = 50,
    @Query('searchValue') searchValue?: string,
  ) {
    const page = Math.max(1, currentPage);
    const limit = Math.min(Math.max(1, itemByPage), 1000);
    const skip = (page - 1) * limit;

    const total = await this.ponder.database
      .select({ count: count() })
      .from(swaps);
    const allswaps = await this.ponder.database
      .select()
      .from(swaps)
      .orderBy(desc(swaps.createdAt))
      .limit(limit)
      .offset(skip);

    // Fix BigInt serialization
    const transformedSwaps = allswaps.map((swap) => ({
      ...swap,
      amount0: swap.amount0.toString(),
      amount1: swap.amount1.toString(),
      sqrtPriceX96: swap.sqrtPriceX96.toString(),
      liquidity: swap.liquidity.toString(),
      createdAt: swap.createdAt.toString(),
      blockNumber: swap.blockNumber.toString(),
    }));

    const totalPages = Math.ceil(total[0].count / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    return {
      data: transformedSwaps,
      pagination: {
        currentPage: page,
        itemsPerPage: limit,
        totalItems: total[0].count,
        totalPages: totalPages,
        hasNextPage: hasNextPage,
        hasPreviousPage: hasPreviousPage,
      },
    };
  }
}
