import { Module } from '@nestjs/common';
import { TokenListService } from './list.service';
import { PonderModule } from 'src/ponder/ponder.module';
import { DatabaseModule } from 'src/database/database.module';
import { BlockchainModule } from 'src/blockchain/blockchain.module';
import { CoingeckoModule } from 'src/coingecko/coingecko.module';

@Module({
  imports: [PonderModule, DatabaseModule, BlockchainModule, CoingeckoModule],
  providers: [TokenListService],
  exports: [],
})
export class TokenModule {}
