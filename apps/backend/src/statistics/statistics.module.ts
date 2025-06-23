import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { DatabaseModule } from 'src/database/database.module';
import { PriceService } from './services/price.service';
import { IndexerModule } from 'src/indexer/indexer.module';
import { HttpModule } from '@nestjs/axios';
import { PoolPriceService } from './services/poolPrice.service';
import { CoinGeckoService } from './services/coingecko.service';
import { StatisticsController } from './statistics.controller';

@Module({
  imports: [
    ConfigModule,
    ScheduleModule.forRoot(),
    DatabaseModule,
    IndexerModule,
    HttpModule,
  ],
  providers: [PriceService, PoolPriceService, CoinGeckoService],
  exports: [PriceService],
  controllers: [StatisticsController],
})
export class StatisticsModule {}
