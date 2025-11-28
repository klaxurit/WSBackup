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
import { TokenPriceService } from './price.service';
import { TokenBalanceService } from './balance.service';
import { NewTokenDTO } from './token.dto';

@Controller('token')
@UseInterceptors(CacheInterceptor)
export class TokenController {
  constructor(
    private readonly db: DatabaseService,
    private readonly tokenListService: TokenListService,
    private readonly tokenPriceService: TokenPriceService,
    private readonly tokenBalanceService: TokenBalanceService,
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

  @Get('/sync/in-pool')
  async syncInPoolTokens() {
    try {
      await this.tokenListService.updateInPoolStatus();

      const inPoolTokens = await this.db.token.findMany({
        where: { status: 'IN_POOL' },
        select: {
          address: true,
          symbol: true,
          name: true,
          status: true,
        },
      });

      return {
        success: true,
        message: 'IN_POOL status sync completed',
        data: {
          count: inPoolTokens.length,
          tokens: inPoolTokens,
        },
      };
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

  @Get('/prices/test')
  async testTokenPrices() {
    try {
      // Forcer la mise à jour des prix
      await this.tokenPriceService.updateTokenPrices();

      // Récupérer les prix récents
      const recentPrices = await this.db.tokenPrice.findMany({
        where: {
          priceSource: 'COINGECKO_FALLBACK', // Maintenant GraphQL
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          token: {
            select: {
              symbol: true,
              name: true,
            },
          },
        },
      });

      return {
        success: true,
        message: 'Token prices updated and retrieved successfully from GraphQL',
        data: {
          priceCount: recentPrices.length,
          prices: recentPrices.map(price => ({
            token: price.token.symbol,
            price: price.price,
            source: price.priceSource,
            createdAt: price.createdAt,
          })),
        },
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error testing token prices',
        error: error.message,
      };
    }
  }

  @Post('/balances/test')
  async testUserBalances(@Body() body: { walletAddress: string }) {
    try {
      const { walletAddress } = body;

      if (!walletAddress) {
        return {
          success: false,
          message: 'Wallet address is required',
        };
      }

      // Récupérer les balances de l'utilisateur
      const balances = await this.tokenBalanceService.getUserTokenBalancesSafe(walletAddress);

      if (!balances) {
        return {
          success: false,
          message: 'Invalid wallet address or error fetching balances',
        };
      }

      return {
        success: true,
        message: 'User balances retrieved successfully',
        data: {
          walletAddress: balances.walletAddress,
          totalBalanceUSD: balances.totalBalanceUSD,
          tokenCount: balances.tokens.length,
          tokens: balances.tokens.map(token => ({
            symbol: token.symbol,
            balance: token.balance,
            balanceUSD: token.balanceUSD,
            priceUSD: token.priceUSD,
          })),
        },
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error fetching user balances',
        error: error.message,
      };
    }
  }

  @Post('/list-with-balances')
  @CacheTTL(30 * 1000) // 30 secondes pour les balances
  async getTokensWithBalances(@Body() body: { walletAddress?: string }) {
    try {
      const { walletAddress } = body;

      // Créer une clé de cache dynamique basée sur le wallet
      const cacheKey = `token:list-with-balances:${walletAddress || 'no-wallet'}`;

      // Vérifier le cache manuellement
      // Pour l'instant, on laisse le cache désactivé pour éviter les problèmes

      // Récupérer tous les tokens IN_POOL
      const tokensInPool = await this.db.token.findMany({
        where: {
          status: 'IN_POOL',
        },
        select: {
          address: true,
          symbol: true,
          name: true,
          decimals: true,
          logoUri: true,
          status: true,
        },
        orderBy: [
          { lastActivityAt: 'desc' },
          { discoveredAt: 'desc' },
        ],
      });

      // Ajouter BERA natif manuellement (car il n'existe pas dans les pools)
      const beraNative = {
        address: '0x0000000000000000000000000000000000000000',
        symbol: 'BERA',
        name: 'Berachain Token',
        decimals: 18,
        logoUri: 'https://res.cloudinary.com/duv0g402y/raw/upload/v1717773645/src/assets/bera.png',
        status: 'IN_POOL' as const,
      };

      // Insérer BERA natif en première position
      tokensInPool.unshift(beraNative);

      if (tokensInPool.length === 0) {
        return {
          success: true,
          message: 'No tokens IN_POOL found',
          data: {
            tokens: [],
            totalBalanceUSD: 0,
            hasWallet: false,
          },
        };
      }

      // Si pas de wallet fourni, retourner juste les tokens IN_POOL
      if (!walletAddress) {
        return {
          success: true,
          message: 'Tokens IN_POOL retrieved successfully (no wallet provided)',
          data: {
            tokens: tokensInPool.map(token => ({
              address: token.address,
              symbol: token.symbol,
              name: token.name,
              decimals: token.decimals,
              logoUri: token.logoUri,
              status: token.status,
              // Pas de balance ni prix USD
            })),
            totalBalanceUSD: 0,
            hasWallet: false,
          },
        };
      }

      // Si wallet fourni, récupérer les balances et prix
      const balances = await this.tokenBalanceService.getUserTokenBalancesSafe(walletAddress);

      if (!balances) {
        return {
          success: false,
          message: 'Invalid wallet address',
        };
      }

      // Créer un map des balances par adresse de token
      const balanceMap = new Map<string, any>();
      balances.tokens.forEach(token => {
        balanceMap.set(token.tokenAddress.toLowerCase(), token);
      });

      // Combiner les tokens IN_POOL avec les balances
      const tokensWithBalances = tokensInPool.map(token => {
        const balance = balanceMap.get(token.address.toLowerCase());

        return {
          address: token.address,
          symbol: token.symbol,
          name: token.name,
          decimals: token.decimals,
          logoUri: token.logoUri,
          status: token.status,
          // Ajouter les données de balance si disponibles
          balance: balance?.balance || '0',
          balanceUSD: balance?.balanceUSD || 0,
          priceUSD: balance?.priceUSD || 0,
        };
      });

      return {
        success: true,
        message: 'Tokens with balances retrieved successfully',
        data: {
          tokens: tokensWithBalances,
          totalBalanceUSD: balances.totalBalanceUSD,
          hasWallet: true,
          walletAddress: walletAddress,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error fetching tokens with balances',
        error: error.message,
      };
    }
  }
}
