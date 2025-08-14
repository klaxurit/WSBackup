import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { PonderService } from 'src/ponder/ponder.service';
import { BlockchainService } from 'src/blockchain/blockchain.service';

@Injectable()
export class PricePoolService implements OnModuleInit {
  private readonly logger = new Logger(PricePoolService.name);

  constructor(
    private readonly db: DatabaseService,
    private readonly ponder: PonderService,
    private readonly blockchain: BlockchainService,
  ) {}

  async onModuleInit() {}
}
