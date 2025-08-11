import { CacheInterceptor, CacheKey, CacheTTL } from '@nestjs/cache-manager';
import {
  Controller,
  ParseIntPipe,
  Query,
  UseInterceptors,
  Get,
  Post,
  Body,
} from '@nestjs/common';
import { Prisma, TokenState } from '@repo/db';
import { DatabaseService } from 'src/database/database.service';
import { NewTokenDTO } from './token.dto';

@Controller('token')
@UseInterceptors(CacheInterceptor)
export class TokenController {
  constructor(private readonly db: DatabaseService) {}

  @Get('/')
  @CacheKey('token:list')
  @CacheTTL(5 * 60 * 1000) // 5 minutes
  async getAllTokens(
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
              name: {
                contains: searchValue,
                mode: Prisma.QueryMode.insensitive,
              },
            },
            {
              symbol: {
                contains: searchValue,
                mode: Prisma.QueryMode.insensitive,
              },
            },
          ],
        }
      : {};

    const count = await this.db.token.count({ where: searchFilter });
    const tokens = await this.db.token.findMany({
      where: searchFilter,
      take: limit,
      skip: skip,
    });
    const totalPages = Math.ceil(count / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    return {
      data: tokens,
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

  @Get('/stats')
  @CacheKey('token:stats')
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
              name: {
                contains: searchValue,
                mode: Prisma.QueryMode.insensitive,
              },
            },
            {
              symbol: {
                contains: searchValue,
                mode: Prisma.QueryMode.insensitive,
              },
            },
          ],
          status: TokenState.IN_POOL,
        }
      : { status: TokenState.IN_POOL };

    const count = await this.db.token.count({ where: searchFilter });
    console.log(page, limit, skip, searchFilter);
    const tokens = await this.db.token.findMany({
      where: searchFilter,
      include: {
        TokenPrice: true,
      },
      take: limit,
      skip: skip,
    });
    const totalPages = Math.ceil(count / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    return {
      data: tokens,
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

  @Post('/')
  async createToken(@Body() newTokenDTO: NewTokenDTO) {
    return this.db.token.create({
      data: { ...newTokenDTO },
    });
  }
}
