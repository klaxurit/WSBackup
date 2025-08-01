import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DatabaseService } from 'src/database/database.service';
import { Prisma } from '@repo/db';
import { CoinGeckoService } from 'src/coingecko/coingecko.service';

@Injectable()
export class TokensTrackerService implements OnModuleInit {
  private readonly logger = new Logger(TokensTrackerService.name);
  network = 'mainnet';
  tokensRepo = `https://raw.githubusercontent.com/berachain/metadata/main/src/tokens/${this.network}.json`;
  isRunning = false;

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly gcs: CoinGeckoService,
  ) {}

  async fetchTokens() {
    const resp = await fetch(this.tokensRepo);

    if (!resp.ok) return;

    const tokens = await resp.json();

    await this.databaseService.client.$transaction(async (tx) => {
      for (const token of tokens.tokens) {
        await tx.token.upsert({
          where: {
            address: token.address,
          },
          create: {
            address: token.address,
            name: token.name,
            symbol: token.symbol,
            decimals: token.decimals,
            tags: token.tags,
            logoUri: token.logoURI,
            coingeckoId: token.extensions?.coingeckoId,
            website: token.website,
            twitter: token.twitter,
            description: token.description,
          },
          update: {
            name: token.name,
            symbol: token.symbol,
            decimals: token.decimals,
            tags: token.tags,
            logoUri: token.logoURI,
            coingeckoId: token.extensions?.coingeckoId,
            website: token.website,
            twitter: token.twitter,
            description: token.description,
          },
        });
      }
    });

    this.logger.log('Tokens list updated!');
  }

  async updateDetails() {
    const tokens = await this.databaseService.token.findMany({
      include: {
        _count: {
          select: {
            poolsAsToken1: true,
            poolsAsToken0: true,
          },
        },
      },
      where: {
        NOT: {
          coingeckoId: null,
        },
      },
    });

    const inPool = tokens.filter(
      (t) => t._count.poolsAsToken1 > 0 || t._count.poolsAsToken0 > 0,
    );

    for (const token of inPool) {
      try {
        const details = await this.gcs.getTokenDetails(token.coingeckoId!);
        if (!details) return;

        await this.databaseService.token.update({
          data: {
            ...details,
          },
          where: {
            id: token.id,
          },
        });
      } catch (err) {
        this.logger.error('Cant update token details', err);
      }
    }
  }

  async getAllTokens(args?: Prisma.TokenFindManyArgs) {
    return await this.databaseService.token.findMany(args);
  }

  async getToken(address: string) {
    return await this.databaseService.token.findFirst({ where: { address } });
  }

  async create(data: Prisma.TokenCreateInput) {
    return await this.databaseService.token.create({
      data: {
        ...data,
      },
    });
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async autoUpdate() {
    if (this.isRunning) return;
    this.isRunning = true;

    await this.fetchTokens();
    await this.updateDetails();

    this.isRunning = false;
  }

  async onModuleInit() {
    await this.autoUpdate();
  }
}
