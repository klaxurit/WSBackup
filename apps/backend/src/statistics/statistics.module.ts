import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { CacheModule } from '@nestjs/cache-manager';
import { DatabaseModule } from 'src/database/database.module';
import { PriceService } from './services/price.service';
import { HttpModule } from '@nestjs/axios';
import { PoolPriceService } from './services/poolPrice.service';
import { StatisticsController } from './statistics.controller';
import { CoingeckoModule } from 'src/coingecko/coingecko.module';
import { BlockchainModule } from 'src/blockchain/blockchain.module';
import { DatabaseService } from 'src/database/database.service';
import { CoinGeckoService } from 'src/coingecko/coingecko.service';
import { BlockchainService } from 'src/blockchain/blockchain.service';

@Module({
  imports: [
    ConfigModule,
    ScheduleModule.forRoot(),
    CacheModule.register({
      ttl: 30 * 1000, // 30 secondes TTL par défaut
      max: 1000, // 1000 entrées maximum
      isGlobal: false, // Cache local au module Statistics
    }),
    DatabaseModule,
    HttpModule,
    CoingeckoModule,
    BlockchainModule,
  ],
  providers: [
    PriceService,
    PoolPriceService
  ],
  exports: [PriceService],
  controllers: [StatisticsController],
})
export class StatisticsModule { }
