import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { BlockchainService } from './blockchain.service';
import { Address, decodeEventLog, getContract, Log, parseAbiItem } from 'viem';
import { UNISWAP_V3_FACTORY_ABI, UNISWAP_V3_POOL_ABI } from '../constants/abis';
import { Pool, Prisma } from '@repo/db';
import { TokensTrackerService } from './tokens.service';

@Injectable()
export class PoolTrackerService {
  private readonly logger = new Logger(PoolTrackerService.name);
  private readonly factoryAddress: Address;

  constructor(
    private databaseService: DatabaseService,
    private blockchainService: BlockchainService,
    private tokenService: TokensTrackerService,
  ) {
    this.factoryAddress = (process.env.UNISWAP_V3_FACTORY_ADDRESS ||
      '0x000') as Address;
  }

  async getAllTrackedPools(args?: Prisma.PoolFindManyArgs): Promise<Pool[]> {
    return await this.databaseService.pool.findMany(args);
  }

  async trackNewPools(fromBlock: bigint, toBlock: bigint): Promise<void> {
    try {
      // Get PoolCreated events from factory
      const logs = await this.blockchainService.getLogs({
        fromBlock,
        toBlock,
        addresses: [this.factoryAddress],
        event: parseAbiItem(
          'event PoolCreated(address indexed token0, address indexed token1, uint24 indexed fee, int24 tickSpacing, address pool)',
        ),
      });

      for (const log of logs) {
        await this.processPoolCreatedEvent(log);
      }
    } catch (error) {
      this.logger.error('Error tracking new pools:', error);
    }
  }

  private async processPoolCreatedEvent(log: Log): Promise<void> {
    try {
      // Decode pool created event
      const decoded = decodeEventLog({
        abi: UNISWAP_V3_FACTORY_ABI,
        data: log.data,
        topics: log.topics,
      });

      // Check if pool already exists
      const existingPool = await this.databaseService.pool.findUnique({
        where: { address: decoded.args.pool },
      });

      if (existingPool) {
        this.logger.warn('New pool already exists');
        return;
      }

      const token0 = await this.tokenService.getToken(decoded.args.token0);
      const token1 = await this.tokenService.getToken(decoded.args.token1);

      if (!token0 || !token1) {
        this.logger.warn('New pool tokens not found!');
        return;
      }

      // Create pool record
      await this.databaseService.pool.create({
        data: {
          address: decoded.args.pool.toLowerCase(),
          token0Id: token0.id,
          token1Id: token1.id,
          fee: Number(decoded.args.fee),
          tick: Number(decoded.args.tickSpacing),
        },
      });

      this.logger.log(`🆕 New pool tracked: ${decoded.args.pool}`);
    } catch (error) {
      this.logger.error('Error processing PoolCreated event:', error);
    }
  }

  async addPoolManually(poolAddress: Address): Promise<void> {
    try {
      // Check if pool already exists
      const existingPool = await this.databaseService.pool.findUnique({
        where: { address: poolAddress },
      });

      if (existingPool) {
        this.logger.warn(`Pool ${poolAddress} already tracked`);
        return;
      }

      // Get pool contract
      const poolContract = getContract({
        address: poolAddress,
        abi: UNISWAP_V3_POOL_ABI,
        client: this.blockchainService.getPublicClient(),
      });

      // Get pool details
      const [token0Addr, token1Addr, fee, liquidity] = await Promise.all([
        poolContract.read.token0(),
        poolContract.read.token1(),
        poolContract.read.fee(),
        poolContract.read.liquidity(),
      ]);

      const token0 = await this.tokenService.getToken(token0Addr);
      const token1 = await this.tokenService.getToken(token1Addr);

      if (!token0 || !token1) return;

      // Create pool record
      await this.databaseService.pool.create({
        data: {
          address: poolAddress.toLowerCase(),
          token0Id: token0.id,
          token1Id: token1.id,
          fee: Number(fee),
          tick: 60, // Default, should be fetched from factory
          liquidity: liquidity.toString(),
        },
      });

      this.logger.log(`✅ Manually added pool: ${poolAddress}`);
    } catch (error) {
      this.logger.error(`Error adding pool ${poolAddress}:`, error);
      throw error;
    }
  }

  async removePool(poolAddress: string): Promise<void> {
    await this.databaseService.pool.delete({
      where: { address: poolAddress },
    });

    this.logger.log(`🗑️ Removed pool: ${poolAddress}`);
  }

  async getPoolStats() {
    const totalPools = await this.databaseService.pool.count();
    const recentSwaps = await this.databaseService.swap.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24h
        },
      },
    });

    return {
      totalPoolsTracked: totalPools,
      swapsLast24h: recentSwaps,
    };
  }

  async getPoolOnChainDatas(poolAddress: Address) {
    const [slot0, liquidity, feeGrowthGlobal0X128, feeGrowthGlobal1X128] =
      await this.blockchainService.getPublicClient().multicall({
        contracts: [
          {
            address: poolAddress,
            abi: UNISWAP_V3_POOL_ABI,
            functionName: 'slot0',
          },
          {
            address: poolAddress,
            abi: UNISWAP_V3_POOL_ABI,
            functionName: 'liquidity',
          },
          {
            address: poolAddress,
            abi: UNISWAP_V3_POOL_ABI,
            functionName: 'feeGrowthGlobal0X128',
          },
          {
            address: poolAddress,
            abi: UNISWAP_V3_POOL_ABI,
            functionName: 'feeGrowthGlobal1X128',
          },
        ],
      });

    if (slot0?.status !== 'success' || liquidity?.status !== 'success')
      return null;

    return {
      sqrtPriceX96: slot0.result[0],
      tick: slot0.result[1],
      // observationIndex: slot0.result?.[2],
      // observationCardinality: slot0.result?.[3],
      // observationCardinalityNext: slot0.result?.[4],
      // feeProtocol: slot0.result?.[5],
      // unlocked: slot0.result?.[6],
      liquidity: liquidity.result,
      // feeGrowthGlobal0X128: feeGrowthGlobal0X128.result,
      // feeGrowthGlobal1X128: feeGrowthGlobal1X128.result,
    };
  }
}
