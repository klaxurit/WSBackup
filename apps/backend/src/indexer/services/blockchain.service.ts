import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  createPublicClient,
  http,
  PublicClient,
  parseAbiItem,
  decodeEventLog,
  Log,
  Address,
  AbiEvent,
} from 'viem';
import { berachain } from 'viem/chains';
import { UNISWAP_V3_POOL_ABI } from '../constants/abis';

import { DecodedSwapEvent } from '../types/events.types';

@Injectable()
export class BlockchainService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(BlockchainService.name);
  private publicClient: PublicClient;
  private wsClient: PublicClient;
  private isConnected = false;

  constructor(private configService: ConfigService) { }

  async onModuleInit() {
    await this.initializeClients();
  }

  onModuleDestroy() {
    // Cleanup connections
    this.isConnected = false;
  }

  private async initializeClients() {
    try {
      this.publicClient = createPublicClient({
        chain: berachain,
        transport: http(this.configService.get<string>('BERACHAIN_RPC_URL')),
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

  async getCurrentBlock(): Promise<bigint> {
    return await this.publicClient.getBlockNumber();
  }

  async getBlock(blockNumber: bigint) {
    return await this.publicClient.getBlock({
      blockNumber,
      includeTransactions: false,
    });
  }

  async getLogs(params: {
    fromBlock: bigint;
    toBlock: bigint;
    addresses?: Address[];
    event: AbiEvent;
  }): Promise<Log[]> {
    return await this.publicClient.getLogs({
      fromBlock: params.fromBlock,
      toBlock: params.toBlock,
      address: params.addresses,
      event: params.event,
    });
  }

  async getSwapEvents(
    poolAddress: Address,
    fromBlock: bigint,
    toBlock: bigint,
  ): Promise<Log[]> {
    const logs = await this.getLogs({
      fromBlock,
      toBlock,
      addresses: [poolAddress],
      event: parseAbiItem(
        'event Swap(address indexed sender, address indexed recipient, int256 amount0, int256 amount1, uint160 sqrtPriceX96, uint128 liquidity, int24 tick)',
      ),
    });

    return logs;
  }

  decodeSwapEvent(log: Log): DecodedSwapEvent {
    try {
      const decoded = decodeEventLog({
        abi: UNISWAP_V3_POOL_ABI,
        data: log.data,
        topics: log.topics,
        eventName: 'Swap',
      });

      return {
        sender: decoded.args.sender,
        recipient: decoded.args.recipient,
        amount0: decoded.args.amount0,
        amount1: decoded.args.amount1,
        sqrtPriceX96: decoded.args.sqrtPriceX96,
        liquidity: decoded.args.liquidity,
        tick: decoded.args.tick,
      };
    } catch (error) {
      this.logger.error(`Failed to decode swap event:`, error);
      throw error;
    }
  }

  // Subscribe to real-time events
  subscribeToSwapEvents(
    poolAddresses: Address[],
    callback: (log: Log) => any,
  ) {
    return this.publicClient.watchEvent({
      address: poolAddresses,
      event: parseAbiItem(
        'event Swap(address indexed sender, address indexed recipient, int256 amount0, int256 amount1, uint160 sqrtPriceX96, uint128 liquidity, int24 tick)',
      ),
      onLogs: (logs) => {
        logs.forEach((log) => callback(log as Log));
      },
    });
  }

  getPublicClient(): PublicClient {
    return this.publicClient;
  }

  isHealthy(): boolean {
    return this.isConnected;
  }
}
