import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ServiceUnavailableException,
} from '@nestjs/common';
import { IndexerService } from '../services/indexer.service';

@Injectable()
export class IndexerHealthGuard implements CanActivate {
  constructor(private indexerService: IndexerService) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const status = await this.indexerService.getIndexerStatus();

    if (!status.isHealthy) {
      throw new ServiceUnavailableException('Indexer is not healthy');
    }

    // Check if we're too far behind
    const maxBlocksBehind = 1000n; // Configure as needed
    if (status.blocksBehind > maxBlocksBehind) {
      throw new ServiceUnavailableException(
        'Indexer is too far behind the chain',
      );
    }

    return true;
  }
}
