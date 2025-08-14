import { Module } from '@nestjs/common';
import { PonderModule } from 'src/ponder/ponder.module';
import { DatabaseModule } from 'src/database/database.module';
import { BlockchainModule } from 'src/blockchain/blockchain.module';
import { PricePoolService } from './price.service';
import { ScheduleModule } from '@nestjs/schedule';
import { PoolListService } from './list.service';
import { PoolController } from './pool.controller';

@Module({
  imports: [
    PonderModule,
    DatabaseModule,
    BlockchainModule,
    ScheduleModule.forRoot(),
  ],
  providers: [PricePoolService, PoolListService],
  exports: [],
  controllers: [PoolController],
})
export class PoolModule {}
