import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  ParseIntPipe,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { IndexerService } from './services/indexer.service';
import { PoolTrackerService } from './services/pool-tracker.service';
import { ReorgHandlerService } from './services/reorg-handler.service';
import { Address } from 'viem';
import { DatabaseService } from 'src/database/database.service';

@Controller('indexer')
export class IndexerController {
  private readonly logger = new Logger(IndexerController.name);

  constructor(
    private indexerService: IndexerService,
    private poolTracker: PoolTrackerService,
    private databaseService: DatabaseService,

    private reorgHandler: ReorgHandlerService,
  ) { }

  @Get('status')
  async getStatus() {
    const status = await this.indexerService.getIndexerStatus();
    const poolStats = await this.poolTracker.getPoolStats();

    return {
      ...status,

      ...poolStats,
      timestamp: new Date(),
    };
  }

  @Get('health')
  async getHealth() {
    const status = await this.indexerService.getIndexerStatus();

    return {
      status: status.isHealthy ? 'healthy' : 'unhealthy',
      uptime: process.uptime(),
      timestamp: new Date(),
      details: {
        blocksBehind: Number(status.blocksBehind),
        isRunning: status.isRunning,
        lastUpdate: status.lastUpdate,
      },
    };
  }

  @Post('pause')
  async pauseIndexer() {
    await this.indexerService.pauseIndexer();
    return { message: 'Indexer paused' };
  }

  @Post('resume')
  async resumeIndexer() {
    await this.indexerService.resumeIndexer();

    return { message: 'Indexer resumed' };
  }

  @Post('reindex/:fromBlock')
  reindexFromBlock(@Param('fromBlock', ParseIntPipe) fromBlock: number) {
    if (fromBlock < 0) {
      throw new BadRequestException('Block number must be positive');
    }

    this.logger.log(`📥 Manual reindex requested from block ${fromBlock}`);

    // Run reindex in background
    this.indexerService.reindexFromBlock(BigInt(fromBlock)).catch((error) => {
      this.logger.error('Reindex failed:', error);
    });

    return {
      message: `Reindex started from block ${fromBlock}`,
      note: 'Check logs for progress',
    };
  }

  @Get('pools')
  async getTrackedPools() {
    return await this.poolTracker.getAllTrackedPools();
  }

  @Post('pools')
  async addPool(@Body() body: { address: Address }) {
    if (!body.address || !/^0x[a-fA-F0-9]{40}$/.test(body.address)) {
      throw new BadRequestException('Invalid pool address format');
    }

    await this.poolTracker.addPoolManually(body.address);
    return { message: `Pool ${body.address} added for tracking` };
  }

  @Post('pools/:address/remove')
  async removePool(@Param('address') address: Address) {
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      throw new BadRequestException('Invalid pool address format');
    }

    await this.poolTracker.removePool(address);
    return { message: `Pool ${address} removed from tracking` };
  }

  @Get('swaps')
  async getSwaps() {
    return await this.databaseService.swap.findMany({
      include: {
        pool: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  @Post('reorg/:fromBlock')
  forceReorg(@Param('fromBlock', ParseIntPipe) fromBlock: number) {
    if (fromBlock < 0) {
      throw new BadRequestException('Block number must be positive');
    }

    this.logger.warn(
      `⚠️ Manual reorg handling requested from block ${fromBlock}`,
    );

    // await this.reorgHandler.forceReorganizationFrom(BigInt(fromBlock));

    return {
      message: `Reorganization handled from block ${fromBlock}`,
      warning:
        'This operation deletes data and should only be used in emergencies',
    };
  }

  @Get('metrics')
  async getMetrics() {
    const status = await this.indexerService.getIndexerStatus();
    const poolStats = await this.poolTracker.getPoolStats();

    // Additional metrics for monitoring
    return {
      indexer: {
        blocks_behind: Number(status.blocksBehind),
        is_running: status.isRunning ? 1 : 0,
        is_healthy: status.isHealthy ? 1 : 0,
        last_indexed_block: Number(status.lastIndexedBlock),
        current_chain_block: Number(status.currentChainBlock),
      },
      pools: {
        total_tracked: poolStats.totalPoolsTracked,
        swaps_24h: poolStats.swapsLast24h,
      },
      system: {
        uptime_seconds: process.uptime(),
        memory_usage_mb: Math.round(
          process.memoryUsage().heapUsed / 1024 / 1024,
        ),
      },
      timestamp: Date.now(),
    };
  }
}
