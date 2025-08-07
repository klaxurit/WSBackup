import { Module } from '@nestjs/common';
import { TokenService } from './token.service';
import { PonderModule } from 'src/ponder/ponder.module';
import { DatabaseModule } from 'src/database/database.module';
import { BlockchainModule } from 'src/blockchain/blockchain.module';

@Module({
  imports: [PonderModule, DatabaseModule, BlockchainModule],
  providers: [TokenService],
  exports: [TokenService],
})
export class TokenModule { }
