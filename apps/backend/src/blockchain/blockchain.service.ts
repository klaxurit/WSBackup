import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  PublicClient,
  createPublicClient,
  http,
} from 'viem';
import { berachain } from 'viem/chains';

@Injectable()
export class BlockchainService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(BlockchainService.name);
  private publicClient: PublicClient;
  private isConnected: boolean = false;

  constructor(private config: ConfigService) { }

  // Init connection
  async onModuleInit() {
    await this.initializeClient();
  }

  // Set isConnected false
  onModuleDestroy() {
    this.isConnected = false;
  }

  // Connect to Berachain
  private async initializeClient() {
    try {
      this.publicClient = createPublicClient({
        chain: berachain,
        transport: http(this.config.get<string>('BERACHAIN_RPC_URL')),
        batch: {
          multicall: true,
        },
      });

      // Test connection
      const blockNumber = await this.publicClient.getBlockNumber();
      this.logger.log(`✅ Connected to Berachain - Block: ${blockNumber}`);
      this.isConnected = true;
    } catch (error) {
      this.logger.error('❌ Failed to connect to blockchain:', error);
      throw error;
    }
  }

  // Return all swap event from bunch of blocks
  // async getSwapEvents(
  //   poolAddress: Address,
  //   fromBlock: bigint,
  //   toBlock: bigint,
  // ): Promise<Log[]> {
  //   const logs = await this.getLogs({
  //     fromBlock,
  //     toBlock,
  //     addresses: [poolAddress],
  //     event: parseAbiItem(
  //       'event Swap(address indexed sender, address indexed recipient, int256 amount0, int256 amount1, uint160 sqrtPriceX96, uint128 liquidity, int24 tick)',
  //     ),
  //   });
  //
  //   return logs;
  // }
  //
  // // Subscribe to real-time events
  // subscribeToSwapEvents(poolAddresses: Address[], callback: (log: Log) => any) {
  //   return this.publicClient.watchEvent({
  //     address: poolAddresses,
  //     event: parseAbiItem(
  //       'event Swap(address indexed sender, address indexed recipient, int256 amount0, int256 amount1, uint160 sqrtPriceX96, uint128 liquidity, int24 tick)',
  //     ),
  //     onLogs: (logs) => {
  //       logs.forEach((log) => callback(log as Log));
  //     },
  //   });
  // }

  get client(): PublicClient {
    return this.publicClient;
  }
}
