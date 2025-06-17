import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { BlockchainService } from './blockchain.service';
import { EventProcessorService } from './event-processor.service';
import { PoolTrackerService } from './pool-tracker.service';
import { DatabaseService } from 'src/database/database.service';
import { Address } from 'viem';

@Injectable()
export class IndexerService implements OnModuleInit {
  private readonly logger = new Logger(IndexerService.name);

  private isRunning = false;

  private lastProcessedBlock = 0n;
  private readonly batchSize: bigint;
  private readonly confirmations: bigint;

  constructor(
    private configService: ConfigService,
    private databaseService: DatabaseService,
    private blockchainService: BlockchainService,
    private eventProcessor: EventProcessorService,
    private poolTracker: PoolTrackerService,
  ) {
    // this.batchSize = this.configService.get<bigint>('INDEXER_BATCH_SIZE', 100n);
    this.batchSize = 10000n;
    this.confirmations = 12n;
    // this.confirmations = this.configService.get<bigint>(
    //   'INDEXER_CONFIRMATIONS',
    //   12n,
    // );
  }

  async onModuleInit() {
    await this.initializeIndexer();
  }

  private async initializeIndexer() {
    try {
      // Get last indexed block from database
      let indexerState = await this.databaseService.indexerState.findUnique({
        where: { id: 'singleton' },
      });

      if (!indexerState) {
        // Initialize with start block if first run
        const startBlock = BigInt(
          this.configService.get<string>('START_BLOCK', '0'),
        );
        indexerState = await this.databaseService.indexerState.create({
          data: {
            id: 'singleton',
            lastBlock: startBlock,
          },
        });
      }

      this.lastProcessedBlock = indexerState.lastBlock;
      this.logger.log(
        `🚀 Indexer initialized - Last block: ${this.lastProcessedBlock}`,
      );

      // Start real-time subscription for confirmed blocks
      await this.startRealtimeIndexing();
    } catch (error) {
      this.logger.error('Failed to initialize indexer:', error);

      throw error;
    }
  }

  private async startRealtimeIndexing() {
    // Subscribe to all tracked pools
    const pools = await this.poolTracker.getAllTrackedPools();
    const poolAddresses = pools.map((pool) => pool.address) as Address[];

    if (poolAddresses.length > 0) {
      this.blockchainService.subscribeToSwapEvents(
        poolAddresses,
        async (log) => {
          await this.eventProcessor.processSwapEvent(log);
        },
      );

      this.logger.log(
        `📡 Subscribed to ${poolAddresses.length} pools for real-time events`,
      );
    }
  }

  @Cron(CronExpression.EVERY_10_SECONDS)
  async processNewBlocks() {
    if (this.isRunning) return;

    try {
      this.isRunning = true;
      const currentBlock = await this.blockchainService.getCurrentBlock();
      const targetBlock = currentBlock - this.confirmations;

      if (targetBlock <= this.lastProcessedBlock) {
        return; // No new confirmed blocks
      }

      const fromBlock = this.lastProcessedBlock + 1n;
      const toBlock =
        fromBlock + this.batchSize - 1n > targetBlock
          ? targetBlock
          : fromBlock + this.batchSize - 1n;

      this.logger.log(`🔄 Processing blocks ${fromBlock} to ${toBlock}`);

      await this.poolTracker.trackNewPools(fromBlock, toBlock);
      await this.processBatchBlocks(fromBlock, toBlock);

      // Update state
      this.lastProcessedBlock = toBlock;
      await this.updateIndexerState(toBlock);
    } catch (error) {
      this.logger.error('Error processing new blocks:', error);
    } finally {
      this.isRunning = false;
    }
  }

  private async processBatchBlocks(fromBlock: bigint, toBlock: bigint) {
    // Get all tracked pools
    const pools = await this.poolTracker.getAllTrackedPools();

    if (pools.length === 0) {
      this.logger.warn('No pools to track');
      return;
    }

    // Process each pool's events in this block range
    for (const pool of pools) {
      try {
        await this.eventProcessor.processPoolEvents(
          pool.address as Address,
          fromBlock,
          toBlock,
        );
      } catch (error) {
        this.logger.error(`Error processing pool ${pool.address}:`, error);
        // Continue with other pools
      }
    }
  }

  private async updateIndexerState(blockNumber: bigint) {
    await this.databaseService.indexerState.update({
      where: { id: 'singleton' },
      data: {
        lastBlock: blockNumber,
        lastUpdate: new Date(),
      },
    });
  }

  // Manual reindex from specific block
  async reindexFromBlock(fromBlock: bigint): Promise<void> {
    this.logger.log(`🔄 Starting reindex from block ${fromBlock}`);

    const currentBlock = await this.blockchainService.getCurrentBlock();
    const targetBlock = currentBlock - this.confirmations;

    this.lastProcessedBlock = fromBlock - 1n;

    while (this.lastProcessedBlock < targetBlock) {
      const batchStart = this.lastProcessedBlock + 1n;
      const batchEnd =
        batchStart + this.batchSize - 1n > targetBlock
          ? targetBlock
          : batchStart + this.batchSize - 1n;

      await this.processBatchBlocks(batchStart, batchEnd);
      this.lastProcessedBlock = batchEnd;

      this.logger.log(`📊 Reindexed up to block ${batchEnd}`);

      // Small delay to prevent overwhelming the RPC
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    await this.updateIndexerState(this.lastProcessedBlock);
    this.logger.log(
      `✅ Reindex completed up to block ${this.lastProcessedBlock}`,
    );
  }

  async getIndexerStatus() {
    const currentBlock = await this.blockchainService.getCurrentBlock();
    const indexerState = await this.databaseService.indexerState.findUnique({
      where: { id: 'singleton' },
    });

    return {
      isRunning: this.isRunning,
      currentChainBlock: currentBlock,
      lastIndexedBlock: indexerState?.lastBlock || 0n,
      blocksBehind: currentBlock - (indexerState?.lastBlock || 0n),
      lastUpdate: indexerState?.lastUpdate,
      isHealthy: this.blockchainService.isHealthy(),
    };
  }

  pauseIndexer() {
    this.isRunning = false;
    this.logger.log('⏸️ Indexer paused');
  }

  resumeIndexer() {
    this.isRunning = false; // Reset flag
    this.logger.log('▶️ Indexer resumed');
  }
}
