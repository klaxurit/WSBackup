import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { V3_POOL_ABI } from 'src/blockchain/abis/V3_POOL_ABI';
import { BlockchainService } from 'src/blockchain/blockchain.service';
import { DatabaseService } from 'src/database/database.service';
import { Address, decodeEventLog, Log, parseAbiItem } from 'viem';

@Injectable()
export class SwapTrackerService implements OnModuleInit {
  private readonly logger = new Logger(SwapTrackerService.name);

  constructor(
    private readonly db: DatabaseService,
    private readonly blockchain: BlockchainService,
  ) {}

  async onModuleInit() {
    const pools = await this.db.pool.findMany();

    for (const pool of pools) {
      // Track Swap in realtime
      this.blockchain.client.watchEvent({
        address: pool.address as Address,
        event: parseAbiItem(
          'event Swap(address indexed sender, address indexed recipient, int256 amount0, int256 amount1, uint160 sqrtPriceX96, uint128 liquidity, int24 tick)',
        ),
        onLogs: (logs: Log[]) => {
          for (const log of logs) {
            this.handleNewSwap(log);
          }
        },
      });
    }

    this.logger.log(
      `📡 Subscribed to ${pools.length} pools for real-time swap events`,
    );
  }

  async handleNewSwap(log: Log) {
    try {
      const decoded = decodeEventLog({
        eventName: 'Swap',
        abi: V3_POOL_ABI,
        data: log.data,
        topics: log.topics,
      });

      // Check if pool already exists
      const existingPool = await this.db.pool.findUnique({
        where: { address: log.address },
      });

      if (!existingPool) {
        this.logger.error('Pool of swap not exists', log.address);
        return;
      }

      const receipt = await this.blockchain.client.getTransactionReceipt({
        hash: log.transactionHash!,
      });

      await this.db.swap.upsert({
        where: {
          transactionHash_logIndex: {
            transactionHash: log.transactionHash!,
            logIndex: log.logIndex!,
          },
        },
        create: {
          sender: decoded.args.sender,
          recipient: decoded.args.recipient,
          amount0: decoded.args.amount0.toString(),
          amount1: decoded.args.amount1.toString(),
          sqrtPriceX96: decoded.args.sqrtPriceX96.toString(),
          tick: decoded.args.tick,
          transactionHash: log.transactionHash!,
          logIndex: log.logIndex!,
          poolAddress: log.address,
          poolId: existingPool.id,
          gasUsed: parseInt(receipt.gasUsed.toString()),
          gasPrice: receipt.effectiveGasPrice.toString(),
          createdAt: new Date(parseInt((log as any).blockTimestamp, 16) * 1000),
        },
        update: {
          createdAt: new Date(parseInt((log as any).blockTimestamp, 16) * 1000),
        },
      });

      this.logger.log(`🆕 New swap saved`);
    } catch (error) {
      this.logger.error(`Error when save a new swap.`, error);
    }
  }
}
