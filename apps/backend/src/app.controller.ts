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
    return await this.db.token.findMany();
  }
}
