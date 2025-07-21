import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Token } from '@repo/db';
import { DatabaseService } from './database/database.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly db: DatabaseService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('/tokens')
  async getTokens(): Promise<Token[]> {
    const tokens = await this.db.token.findMany({
      include: {
        _count: {
          select: {
            poolsAsToken0: true,
            poolsAsToken1: true,
          },
        },
      },
    });

    return tokens.map(({ _count, ...token }) => ({
      ...token,
      inPool: _count.poolsAsToken0 > 0 || _count.poolsAsToken1 > 0,
    }));
  }
}
