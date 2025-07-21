import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BlockchainService } from 'src/blockchain/blockchain.service';
import { DatabaseService } from 'src/database/database.service';
import { PoolTracker } from './poolTracker.service';
import { Address, parseAbi } from 'viem';
import { SwapTrackerService } from './swapTracker.service';

@Injectable()
export class FallbackIndexerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(FallbackIndexerService.name);
  private batchSize: bigint;
  private confirmations: bigint;

  private isRunning = false;
  private lastProcessedBlock = 0n;
  private factoryAddr: Address;

  private indexer: NodeJS.Timeout;

  constructor(
    private readonly db: DatabaseService,
    private readonly config: ConfigService,
    private readonly blockchain: BlockchainService,
    private readonly poolTracker: PoolTracker,
    private readonly swapTracker: SwapTrackerService,
  ) {
    this.batchSize = BigInt(
      this.config.get<string>('INDEXER_BATCH_SIZE', '10000'),
    );
    this.confirmations = BigInt(
      this.config.get<string>('INDEXER_CONFIRMATIONS', '12'),
    );
    this.factoryAddr = this.config.get<Address>('V3_FACTORY_ADDRESS') || '0x00';
  }

  async onModuleInit() {
    try {
      // Get last indexed block from database
      let indexerState = await this.db.indexerState.findUnique({
        where: { id: 'singleton' },
      });

      if (!indexerState) {
        // Initialize with start block if first run
        const startBlock = BigInt(
          this.config.get<string>('START_BLOCK', '4700000'),
        );
        indexerState = await this.db.indexerState.create({
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

      this.indexer = setInterval(() => {
        this.processNewBlocks();
      }, 1000 * 10);
    } catch (error) {
      this.logger.error('Failed to initialize indexer:', error);

      throw error;
    }
  }

  onModuleDestroy() {
    clearInterval(this.indexer);
  }

  private async processNewBlocks() {
    if (this.isRunning) return;

    try {
      this.isRunning = true;

      const currentBlock = await this.blockchain.client.getBlockNumber();

      const pools = await this.db.pool.findMany();
      const poolsAddr = pools.map((p) => p.address as Address);

      const targetBlock = currentBlock - this.confirmations;

      const fromBlock = this.lastProcessedBlock + 1n;
      const toBlock =
        fromBlock + this.batchSize - 1n > targetBlock
          ? targetBlock
          : fromBlock + this.batchSize - 1n;

      this.logger.log(`🔄 Processing blocks ${fromBlock} to ${toBlock}`);

      // Processing
      const logs = await this.blockchain.client.getLogs({
        fromBlock,
        toBlock,
        address: [...poolsAddr, this.factoryAddr],
        events: parseAbi([
          'event PoolCreated(address indexed token0, address indexed token1, uint24 indexed fee, int24 tickSpacing, address pool)',
          'event Mint(address sender, address indexed owner, int24 indexed tickLower, int24 indexed tickUpper, uint128 amount,uint256 amount0, uint256 amount1)',
          'event Burn(address indexed owner, int24 indexed tickLower, int24 indexed tickUpper, uint128 amount, uint256 amount0, uint256 amount1)',
          'event Swap(address indexed sender, address indexed recipient, int256 amount0, int256 amount1, uint160 sqrtPriceX96, uint128 liquidity, int24 tick)',
        ]),
      });

      for (const log of logs) {
        if (log.eventName === 'PoolCreated') {
          await this.poolTracker.handleNewPool(log);
        }
        if (log.eventName === 'Mint') {
          await this.poolTracker.handlePositionMint(log);
        }
        if (log.eventName === 'Burn') {
          await this.poolTracker.handlePositionBurn(log);
        }
        if (log.eventName === 'Swap') {
          await this.swapTracker.handleNewSwap(log);
        }
      }

      this.lastProcessedBlock = toBlock;
      await this.db.indexerState.update({
        where: { id: 'singleton' },
        data: {
          lastBlock: toBlock,
          lastUpdate: new Date(),
        },
      });
    } catch (error) {
      this.logger.error('Error when indexing Blocks:', error);
    } finally {
      this.isRunning = false;
    }
  }
  async reIndex(startBlock = 4700000n) {
    while (this.isRunning) {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    try {
      this.isRunning = true;

      let isFinish = false;
      const batchSize = 10000n;
      let lastBlock = startBlock;

      while (!isFinish) {
        const currentBlock =
          (await this.blockchain.client.getBlockNumber()) - this.confirmations;
        const pools = await this.db.pool.findMany();
        const poolsAddr = pools.map((p) => p.address as Address);

        const fromBlock = lastBlock + 1n;
        const toBlock =
          fromBlock + batchSize > currentBlock
            ? currentBlock
            : fromBlock + batchSize;

        this.logger.log(`🔄 Reindex blocks ${fromBlock} to ${toBlock}`);
        const logs = await this.blockchain.client.getLogs({
          fromBlock,
          toBlock,
          address: [...poolsAddr, this.factoryAddr],
          events: parseAbi([
            'event PoolCreated(address indexed token0, address indexed token1, uint24 indexed fee, int24 tickSpacing, address pool)',
            'event Mint(address sender, address indexed owner, int24 indexed tickLower, int24 indexed tickUpper, uint128 amount,uint256 amount0, uint256 amount1)',
            'event Burn(address indexed owner, int24 indexed tickLower, int24 indexed tickUpper, uint128 amount, uint256 amount0, uint256 amount1)',
            'event Swap(address indexed sender, address indexed recipient, int256 amount0, int256 amount1, uint160 sqrtPriceX96, uint128 liquidity, int24 tick)',
          ]),
        });

        for (const log of logs) {
          if (log.eventName === 'PoolCreated') {
            await this.poolTracker.handleNewPool(log);
          }
          if (log.eventName === 'Mint') {
            await this.poolTracker.handlePositionMint(log);
          }
          if (log.eventName === 'Burn') {
            await this.poolTracker.handlePositionBurn(log);
          }
          if (log.eventName === 'Swap') {
            await this.swapTracker.handleNewSwap(log);
          }
        }

        lastBlock = toBlock;
        isFinish = lastBlock >= currentBlock;
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    } catch (error) {
      this.logger.error('Error when indexing Blocks:', error);
    } finally {
      this.isRunning = false;
    }
  }
}
