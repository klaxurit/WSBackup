import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { DatabaseModule } from 'src/database/database.module';
import { PriceService } from './services/price.service';
import { HttpModule } from '@nestjs/axios';
import { PoolPriceService } from './services/poolPrice.service';
import { StatisticsController } from './statistics.controller';
import { CoingeckoModule } from 'src/coingecko/coingecko.module';
import { BlockchainModule } from 'src/blockchain/blockchain.module';

@Module({
  imports: [
    ConfigModule,
    ScheduleModule.forRoot(),
    DatabaseModule,
    HttpModule,
    CoingeckoModule,
    BlockchainModule,
  ],
  providers: [PriceService, PoolPriceService],
  exports: [PriceService],
  controllers: [StatisticsController],
})
export class StatisticsModule {}
