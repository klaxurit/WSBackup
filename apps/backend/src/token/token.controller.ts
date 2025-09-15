import { CacheInterceptor, CacheKey, CacheTTL } from '@nestjs/cache-manager';
import {
  Controller,
  Query,
  UseInterceptors,
  Get,
  Post,
  Body,
  Param,
} from '@nestjs/common';
import { Prisma } from '@repo/db';
import { DatabaseService } from 'src/database/database.service';
import { TokenListService } from './list.service';
import { NewTokenDTO } from './token.dto';

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
  async getOneToken(@Param('address') address: string) {
    return await this.db.token.findUnique({
      where: { address },
    });
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
