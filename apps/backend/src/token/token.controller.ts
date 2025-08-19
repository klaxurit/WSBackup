import { CacheInterceptor, CacheKey, CacheTTL } from '@nestjs/cache-manager';
import {
  Controller,
  ParseIntPipe,
  Query,
  UseInterceptors,
  Get,
  Post,
  Body,
  Param,
} from '@nestjs/common';
import { Prisma, TokenState } from '@repo/db';
import { DatabaseService } from 'src/database/database.service';
import { TokenListService } from './list.service';
import { NewTokenDTO } from './token.dto';
import { NotFoundException } from '@nestjs/common';

@Controller('token')
@UseInterceptors(CacheInterceptor)
export class TokenController {
  constructor(
    private readonly db: DatabaseService,
    private readonly tokenListService: TokenListService,
  ) { }

  @Get('/list')
  @CacheKey('token:list')
  @CacheTTL(5 * 60 * 1000) // 5 minutes
  async getTokenList() {
    try {
      // Récupérer tous les tokens depuis la base de données
      const tokens = await this.db.token.findMany({
        include: {
          TokenDailyStats: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
        orderBy: [
          { status: 'desc' }, // IN_POOL en premier
          { lastActivityAt: 'desc' },
          { discoveredAt: 'desc' },
        ],
      });

      if (tokens.length === 0) {
        // Si aucun token, déclencher la synchronisation
        await this.tokenListService.updateGeneralList();

        // Retry après sync
        const tokensAfterSync = await this.db.token.findMany({
          include: {
            TokenDailyStats: {
              orderBy: { createdAt: 'desc' },
              take: 1,
            },
          },
          orderBy: [
            { status: 'desc' },
            { lastActivityAt: 'desc' },
            { discoveredAt: 'desc' },
          ],
        });

        return tokensAfterSync;
      }

      return tokens;
    } catch (error) {
      throw error;
    }
  }

  @Get('/')
  @CacheKey('token:list')
  @CacheTTL(5 * 60 * 1000) // 5 minutes
  async getAllTokens(@Query('searchValue') searchValue?: string) {
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

    return await this.db.token.findMany({
      where: searchFilter,
    });
  }

  @Get('/:address')
  @CacheKey('token:one')
  @CacheTTL(5 * 60 * 1000) // 5 minutes
  async getOneToken(@Param('address') address: string) {
    return await this.db.token.findUnique({
      where: { address },
    });
  }

  @Get('/stats/:address')
  @CacheTTL(2 * 60 * 1000)
  async getTokenStatsByAddress(@Param('address') address: string) {
    const normalizedAddress = address.toLowerCase();

    const token = await this.db.token.findFirst({
      where: {
        address: normalizedAddress,
      },
      include: {
        TokenPrice: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!token) {
      throw new NotFoundException(`Token with address ${address} not found`);
    }

    return {
      data: token,
      meta: {
        address: normalizedAddress,
        hasPrice: token.TokenPrice.length > 0,
        lastPriceUpdate: token.TokenPrice[0]?.createdAt || null,
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
    const tokens = await this.db.token.findMany({
      where: searchFilter,
      include: {
        TokenDailyStats: true,
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

  @Get('/sync')
  async syncTokens() {
    try {
      await this.tokenListService.updateGeneralList();
      return { success: true, message: 'Token sync completed' };
    } catch (error) {
      throw error;
    }
  }

  @Post('/')
  async createToken(@Body() newTokenDTO: NewTokenDTO) {
    return this.db.token.create({
      data: { ...newTokenDTO },
    });
  }
}
