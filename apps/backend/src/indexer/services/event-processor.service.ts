import { Injectable, Logger } from '@nestjs/common';
import { BlockchainService } from './blockchain.service';
import { ProcessedSwapEvent } from '../types/events.types';
import { Address, Log } from 'viem';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class EventProcessorService {
  private readonly logger = new Logger(EventProcessorService.name);

  constructor(
    private blockchainService: BlockchainService,
    private databaseService: DatabaseService,
  ) { }

  async processPoolEvents(
    poolAddress: Address,
    fromBlock: bigint,
    toBlock: bigint,
  ): Promise<void> {
    try {
      // Get swap events for this pool
      const swapLogs = await this.blockchainService.getSwapEvents(
        poolAddress,
        fromBlock,
        toBlock,
      );

      if (swapLogs.length > 0) {
        this.logger.log(
          `📈 Processing ${swapLogs.length} swap events for pool ${poolAddress}`,
        );

        // Process in batches to avoid overwhelming the database
        const batchSize = 50;
        for (let i = 0; i < swapLogs.length; i += batchSize) {
          const batch = swapLogs.slice(i, i + batchSize);
          await this.processSwapBatch(batch);
        }
      }

      // TODO: Process Mint and Burn events similarly
    } catch (error) {
      this.logger.error(
        `Error processing events for pool ${poolAddress}:`,
        error,
      );
      throw error;
    }
  }

  async processSwapEvent(log: Log): Promise<void> {
    try {
      const processedEvent = await this.transformSwapEvent(log);
      await this.saveSwapEvent(processedEvent);

      // Update pool state
      await this.updatePoolState(processedEvent);
    } catch (error) {
      this.logger.error('Error processing swap event:', error);
      // Don't throw to prevent subscription from stopping
    }
  }

  private async processSwapBatch(logs: Log[]): Promise<void> {
    const processedEvents: ProcessedSwapEvent[] = [];

    for (const log of logs) {
      try {
        const processedEvent = await this.transformSwapEvent(log);
        processedEvents.push(processedEvent);
      } catch (error) {
        this.logger.error(
          `Error transforming swap event ${log.transactionHash}:`,
          error,
        );
        continue;
      }
    }

    if (processedEvents.length > 0) {
      await this.saveSwapEventsBatch(processedEvents);

      // Update pool states
      for (const event of processedEvents) {
        await this.updatePoolState(event);
      }
    }
  }

  private async transformSwapEvent(log: Log): Promise<ProcessedSwapEvent> {
    // Decode the event
    const decodedEvent = this.blockchainService.decodeSwapEvent(log);

    // Get block timestamp
    const block = await this.blockchainService.getBlock(log.blockNumber!);

    // Get transaction details for gas info

    const transaction = await this.blockchainService
      .getPublicClient()
      .getTransaction({ hash: log.transactionHash! });

    const receipt = await this.blockchainService
      .getPublicClient()
      .getTransactionReceipt({ hash: log.transactionHash! });

    return {
      ...decodedEvent,
      transactionHash: log.transactionHash!,
      blockNumber: log.blockNumber!,
      blockHash: log.blockHash!,
      logIndex: log.logIndex!,
      poolAddress: log.address,
      timestamp: new Date(Number(block.timestamp) * 1000),
      gasUsed: receipt.gasUsed.toString(),
      gasPrice: transaction.gasPrice?.toString(),
    };
  }

  private async saveSwapEvent(event: ProcessedSwapEvent): Promise<void> {
    // Find or ensure pool exists
    const pool = await this.databaseService.pool.findUnique({
      where: { address: event.poolAddress },
    });

    if (!pool) {
      this.logger.warn(`Pool ${event.poolAddress} not found in database`);
      return;
    }

    // Save swap event
    await this.databaseService.swap.upsert({
      where: {
        transactionHash_logIndex: {
          transactionHash: event.transactionHash,
          logIndex: event.logIndex,
        },
      },
      create: {
        sender: event.sender,
        recipient: event.recipient,
        amount0: event.amount0.toString(),
        amount1: event.amount1.toString(),
        sqrtPriceX96: event.sqrtPriceX96.toString(),
        tick: event.tick,
        transactionHash: event.transactionHash,
        logIndex: event.logIndex,
        poolAddress: event.poolAddress,
        poolId: pool.id,
        gasUsed: parseInt(event.gasUsed || '0'),
        gasPrice: event.gasPrice || '0',
      },
      update: {
        createdAt: event.timestamp,
      },
    });
  }

  private async saveSwapEventsBatch(
    events: ProcessedSwapEvent[],
  ): Promise<void> {
    // Group events by pool for efficiency
    const eventsByPool = events.reduce(
      (acc, event) => {
        if (!acc[event.poolAddress]) {
          acc[event.poolAddress] = [];
        }
        acc[event.poolAddress].push(event);
        return acc;
      },
      {} as Record<string, ProcessedSwapEvent[]>,
    );

    // Process each pool's events
    for (const [poolAddress, poolEvents] of Object.entries(eventsByPool)) {
      const pool = await this.databaseService.pool.findUnique({
        where: { address: poolAddress },
      });

      if (!pool) {
        this.logger.warn(`Pool ${poolAddress} not found, skipping events`);
        continue;
      }

      // Use transaction for atomicity
      await this.databaseService.client.$transaction(async (tx) => {
        for (const event of poolEvents) {
          await tx.swap.upsert({
            where: {
              transactionHash_logIndex: {
                transactionHash: event.transactionHash,
                logIndex: event.logIndex,
              },
            },
            create: {
              sender: event.sender,
              recipient: event.recipient,
              amount0: event.amount0.toString(),
              amount1: event.amount1.toString(),
              sqrtPriceX96: event.sqrtPriceX96.toString(),
              tick: event.tick,
              transactionHash: event.transactionHash,
              logIndex: event.logIndex,
              poolAddress: event.poolAddress,
              poolId: pool.id,
              gasUsed: parseInt(event.gasUsed || '0'),
              gasPrice: event.gasPrice || '0',
            },
            update: {
              createdAt: event.timestamp,
            },
          });
        }
      });
    }
  }

  private async updatePoolState(event: ProcessedSwapEvent): Promise<void> {
    // Update pool with latest state from the swap
    await this.databaseService.pool.update({
      where: { address: event.poolAddress },
      data: {
        sqrtPriceX96: event.sqrtPriceX96.toString(),
        liquidity: event.liquidity.toString(),
        tick: event.tick,
        updatedAt: event.timestamp,
      },
    });
  }
}
