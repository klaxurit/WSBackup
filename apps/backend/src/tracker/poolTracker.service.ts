import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool } from '@repo/db';
import { V3_FACTORY_ABI } from 'src/blockchain/abis/V3_FACTORY_ABI';
import { V3_POOL_ABI } from 'src/blockchain/abis/V3_POOL_ABI';
import { BlockchainService } from 'src/blockchain/blockchain.service';
import { DatabaseService } from 'src/database/database.service';
import { Address, decodeEventLog, Log, parseAbiItem, zeroAddress } from 'viem';

/**
 * Track:
 *   - new Pool
 *   - Create Position
 *   - Deposite liquidity
 *   - Withdraw liquidity
 *   - Burn Position
 */
export const EVENTS = {
  poolCreated: parseAbiItem(
    'event PoolCreated(address indexed token0, address indexed token1, uint24 indexed fee, int24 tickSpacing, address pool)',
  ),
  mint: parseAbiItem(
    'event Mint(address sender, address indexed owner, int24 indexed tickLower, int24 indexed tickUpper, uint128 amount,uint256 amount0, uint256 amount1)',
  ),
  burn: parseAbiItem(
    'event Burn(address indexed owner, int24 indexed tickLower, int24 indexed tickUpper, uint128 amount, uint256 amount0, uint256 amount1)',
  ),
};

@Injectable()
export class PoolTracker implements OnModuleInit {
  private readonly logger = new Logger(PoolTracker.name);

  constructor(
    private config: ConfigService,
    private db: DatabaseService,
    private blockchain: BlockchainService,
  ) {}

  async onModuleInit() {
    // Track new Pool in realtime
    this.blockchain.client.watchEvent({
      address:
        this.config.get<Address>('V3_CONTRACT_FACTORY_ADDR') || zeroAddress,
      event: EVENTS.poolCreated,
      onLogs: (logs: Log[]) => {
        for (const log of logs) {
          this.handleNewPool(log);
        }
      },
    });

    // Get all pool for individual tracking
    const pools = await this.db.pool.findMany();
    pools.forEach((pool) => this.initPoolTracker(pool));
  }

  // Track each pool events in realtime
  private initPoolTracker(pool: Pool) {
    // Listen position Mint
    this.blockchain.client.watchEvent({
      address: pool.address as Address,
      event: EVENTS.mint,
      onLogs: (logs: Log[]) => {
        for (const log of logs) {
          this.handlePositionMint(log, pool);
        }
      },
    });
    // Listen position Burn
    this.blockchain.client.watchEvent({
      address: pool.address as Address,
      event: EVENTS.burn,
      onLogs: (logs: Log[]) => {
        for (const log of logs) {
          this.handlePositionBurn(log, pool);
        }
      },
    });
  }

  async handleNewPool(log: Log) {
    this.logger.log('🆕 New pool detected');
    try {
      const decoded = decodeEventLog({
        eventName: 'PoolCreated',
        abi: V3_FACTORY_ABI,
        data: log.data,
        topics: log.topics,
      });

      // Check if pool already exists
      const existingPool = await this.db.pool.findUnique({
        where: { address: log.address },
      });

      if (existingPool) {
        this.logger.warn('Pool already exists');
        return;
      }

      const token0 = await this.db.token.findUnique({
        where: { address: decoded.args.token0 },
      });
      const token1 = await this.db.token.findUnique({
        where: { address: decoded.args.token1 },
      });

      if (!token0 || !token1) {
        this.logger.warn('Pool tokens not found!');
        return;
      }

      // Create pool record
      await this.db.pool.create({
        data: {
          address: log.address.toLowerCase(),
          token0Id: token0.id,
          token1Id: token1.id,
          fee: Number(decoded.args.fee),
          tick: Number(decoded.args.tickSpacing),
        },
      });

      this.logger.log(`🆕 New pool tracked: ${log.address}`);
    } catch (error) {
      this.logger.error('Error processing PoolCreated event:', error);
    }
  }

  async handlePositionMint(log: Log, pool?: Pool) {
    this.logger.log('🆕 New position minted');
    try {
      const decoded = decodeEventLog({
        eventName: 'Mint',
        abi: V3_POOL_ABI,
        data: log.data,
        topics: log.topics,
      });
      console.log('Position mint log:', decoded);
    } catch (error) {
      this.logger.error('Error processing posiiton mint event:', error);
    }
  }

  async handlePositionBurn(log: Log, pool?: Pool) {
    this.logger.log('🗑️ Position burned');
    try {
      const decoded = decodeEventLog({
        eventName: 'Burn',
        abi: V3_POOL_ABI,
        data: log.data,
        topics: log.topics,
      });
      console.log('Position burn log:', decoded);
    } catch (error) {
      this.logger.error('Error processing posiiton burn event:', error);
    }
  }
}
