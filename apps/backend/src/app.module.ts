import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { BlockchainModule } from './blockchain/blockchain.module';
import { CoingeckoModule } from './coingecko/coingecko.module';
import { TrackerModule } from './tracker/tracker.module';
import { StatisticsModule } from './statistics/statistics.module';

import appConfig from './app.config';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
    }),
    BlockchainModule,
    CoingeckoModule,
    TrackerModule,
    StatisticsModule,
    DatabaseModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
