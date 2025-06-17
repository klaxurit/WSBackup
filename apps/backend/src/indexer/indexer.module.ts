import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { MetricsInterceptor } from './interceptors/indexer.interceptor';
import { IndexerHealthGuard } from './guards/indexer-health.guard';
import { IndexerService } from './services/indexer.service';
import { BlockchainService } from './services/blockchain.service';
import { EventProcessorService } from './services/event-processor.service';
import { PoolTrackerService } from './services/pool-tracker.service';
import { ReorgHandlerService } from './services/reorg-handler.service';
import { IndexerController } from './indexer.controller';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [ConfigModule, ScheduleModule.forRoot(), DatabaseModule],
  providers: [
    IndexerService,
    BlockchainService,
    EventProcessorService,
    PoolTrackerService,
    ReorgHandlerService,
    {
      provide: APP_INTERCEPTOR,
      useClass: MetricsInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: IndexerHealthGuard,
    },
  ],
  controllers: [IndexerController],
  exports: [IndexerService, BlockchainService],
})
export class IndexerModule { }
