import {
  forwardRef,
  Inject,
  Injectable,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool } from '@repo/db';
import { V3_FACTORY_ABI } from 'src/blockchain/abis/V3_FACTORY_ABI';
import { V3_POOL_ABI } from 'src/blockchain/abis/V3_POOL_ABI';
import { BlockchainService } from 'src/blockchain/blockchain.service';
import { DatabaseService } from 'src/database/database.service';
import { Address, decodeEventLog, Log, parseAbiItem, zeroAddress } from 'viem';
import { SwapTrackerService } from './swapTracker.service';

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
    @Inject(forwardRef(() => SwapTrackerService))
    private swapTracker: SwapTrackerService,
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
        where: { address: decoded.args.pool },
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
      const pool = await this.db.pool.create({
        data: {
          address: decoded.args.pool.toLowerCase(),
          token0Id: token0.id,
          token1Id: token1.id,
          fee: Number(decoded.args.fee),
          tick: 0,
        },
      });

      this.initPoolTracker(pool);
      this.logger.log(`🆕 New pool tracked: ${decoded.args.pool}`);
      this.swapTracker.trackNewPool(pool);
    } catch (error) {
      this.logger.error('Error processing PoolCreated event:', error);
    }
  }

  async handlePositionMint(log: Log, pool?: Pool | null) {
    this.logger.log('🆕 New position minted');
    try {
      if (!pool) {
        pool = await this.db.pool.findUnique({
          where: { address: log.address },
        });
      }

      if (!pool) return;

      await this.updatePoolDatas(pool);
      // const decoded = decodeEventLog({
      //   eventName: 'Mint',
      //   abi: V3_POOL_ABI,
      //   data: log.data,
      //   topics: log.topics,
      // });
      // console.log('Position mint log:', decoded, log);
    } catch (error) {
      this.logger.error('Error processing posiiton mint event:', error);
    }
  }

  async handlePositionBurn(log: Log, pool?: Pool | null) {
    this.logger.log('🗑️ Position burned');
    try {
      if (!pool) {
        pool = await this.db.pool.findUnique({
          where: { address: log.address },
        });
      }

      if (!pool) return;

      // const decoded = decodeEventLog({
      //   eventName: 'Burn',
      //   abi: V3_POOL_ABI,
      //   data: log.data,
      //   topics: log.topics,
      // });
      // console.log('Position burn log:', decoded);
      await this.updatePoolDatas(pool);
    } catch (error) {
      this.logger.error('Error processing posiiton burn event:', error);
    }
  }

  async updatePoolDatas(pool: Pool) {
    const [slot0, liquidity] = await this.blockchain.client.multicall({
      contracts: [
        {
          address: pool.address as Address,
          abi: V3_POOL_ABI,
          functionName: 'slot0',
        },
        {
          address: pool.address as Address,
          abi: V3_POOL_ABI,
          functionName: 'liquidity',
        },
      ],
    });

    const sqrtPriceX96 = slot0.result![0];
    const tick = slot0.result![1];
    const poolLiquidity = liquidity.result;

    if (!sqrtPriceX96 || !poolLiquidity) return null;

    await this.db.pool.update({
      where: { id: pool.id },
      data: {
        sqrtPriceX96: sqrtPriceX96.toString(),
        liquidity: poolLiquidity.toString(),
        tick: Number(tick),
      },
    });
  }
}
