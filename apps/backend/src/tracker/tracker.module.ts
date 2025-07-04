import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BlockchainModule } from 'src/blockchain/blockchain.module';
import { DatabaseModule } from 'src/database/database.module';
import { FallbackIndexerService } from './fallbackIndexer.service';
import { PoolTracker } from './poolTracker.service';

@Module({
  imports: [ConfigModule, DatabaseModule, BlockchainModule],
  providers: [FallbackIndexerService, PoolTracker],
  exports: [],
})
export class TrackerModule {}
