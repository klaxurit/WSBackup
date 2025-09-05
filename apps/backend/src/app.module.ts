import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { BlockchainModule } from './blockchain/blockchain.module';
import { CoingeckoModule } from './coingecko/coingecko.module';

import appConfig from './app.config';
import { DatabaseModule } from './database/database.module';
import { CacheModule } from '@nestjs/cache-manager';
import { PonderModule } from './ponder/ponder.module';
import { TokenModule } from './token/token.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
    }),
    CacheModule.register({
      ttl: 2000,
      isGlobal: true,
    }),
    BlockchainModule,
    CoingeckoModule,
    DatabaseModule,
    PonderModule,
    TokenModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
