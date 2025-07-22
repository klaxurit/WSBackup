import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BlockchainModule } from 'src/blockchain/blockchain.module';
import { DatabaseModule } from 'src/database/database.module';
import { FallbackIndexerService } from './fallbackIndexer.service';
import { PoolTracker } from './poolTracker.service';
import { TokensTrackerService } from './tokens.service';
import { SwapTrackerService } from './swapTracker.service';
import { CoingeckoModule } from 'src/coingecko/coingecko.module';

@Module({
  imports: [ConfigModule, DatabaseModule, BlockchainModule, CoingeckoModule],
  providers: [
    FallbackIndexerService,
    PoolTracker,
    TokensTrackerService,
    SwapTrackerService,
  ],
  exports: [FallbackIndexerService],
})
export class TrackerModule {}
