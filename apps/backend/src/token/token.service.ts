import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { BlockchainModule } from 'src/blockchain/blockchain.module';
import { DatabaseService } from 'src/database/database.service';
import { PonderService } from 'src/ponder/ponder.service';

@Injectable()
export class TokenService implements OnModuleInit {
  private readonly logger = new Logger(TokenService.name);

  constructor(
    private readonly ponder: PonderService,
    private readonly db: DatabaseService,
    private readonly bc: BlockchainModule,
  ) { }

  onModuleInit() {
    this.ponder.subscribe(
      'poolCreateForToken',
      'pools',
      (result) => this.handleNewPool(result),
      (error) => {
        this.logger.error('Error when subscribe to poolCreate' + error.message);
      },
    );
  }

  private handleNewPool(result: any[]) {
    console.log('result', result);
  }
}
