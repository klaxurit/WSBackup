import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import indexerConfig from './indexer/config/indexer.config';
import { IndexerModule } from './indexer/indexer.module';
import { StatisticsModule } from './statistics/statistics.module';
import { BlockchainModule } from './blockchain/blockchain.module';
import { CoingeckoModule } from './coingecko/coingecko.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [indexerConfig],
    }),
    IndexerModule,
    StatisticsModule,
    BlockchainModule,
    CoingeckoModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
