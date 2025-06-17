import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class ReorgHandlerService {
  private readonly logger = new Logger(ReorgHandlerService.name);
  private readonly reorgCheckDepth = 20;

  constructor(private databaseService: DatabaseService) {}

  async checkForReorganizations() {
    try {
      const indexerState = await this.databaseService.indexerState.findUnique({
        where: { id: 'singleton' },
      });

      if (!indexerState) return;

      const startBlock = indexerState.lastBlock - BigInt(this.reorgCheckDepth);
      const endBlock = indexerState.lastBlock;

      this.logger.log(
        `TODO: Check Reorg from block ${startBlock.toString()} to block ${endBlock.toString()}`,
      );
    } catch (error) {
      this.logger.error('Error checking for reorganizations:', error);
    }
  }
}
