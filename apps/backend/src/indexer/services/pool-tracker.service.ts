import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { BlockchainService } from './blockchain.service';
import { Address, decodeEventLog, getContract, Log, parseAbiItem } from 'viem';
import { UNISWAP_V3_FACTORY_ABI, UNISWAP_V3_POOL_ABI } from '../constants/abis';
import { Pool } from '@repo/db';

@Injectable()
export class PoolTrackerService {
  private readonly logger = new Logger(PoolTrackerService.name);
  private readonly factoryAddress: Address;

  constructor(
    private databaseService: DatabaseService,
    private blockchainService: BlockchainService,
  ) {
    this.factoryAddress = (process.env.UNISWAP_V3_FACTORY_ADDRESS ||
      '0x000') as Address;
  }

  async getAllTrackedPools(): Promise<Pool[]> {
    return await this.databaseService.pool.findMany();
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

      const {
        token0,
        token1,
        fee,
        tickSpacing,
        pool: poolAddress,
      } = decoded.args;

      // Check if pool already exists
      const existingPool = await this.databaseService.pool.findUnique({
        where: { address: poolAddress },
      });

      if (existingPool) {
        return; // Pool already tracked
      }

      // Create pool record
      await this.databaseService.pool.create({
        data: {
          address: poolAddress.toLowerCase(),
          token0: token0,
          token1: token1,
          fee: Number(fee),
          tick: Number(tickSpacing),
        },
      });

      this.logger.log(`🆕 New pool tracked: ${poolAddress}`);
    } catch (error) {
      this.logger.error('Error processing PoolCreated event:', error);
    }
  }

  private async getTokenSymbol(tokenAddress: string): Promise<string> {
    try {
      const tokenContract = getContract({
        address: tokenAddress as `0x${string}`,
        abi: [
          {
            name: 'symbol',
            type: 'function',
            stateMutability: 'view',
            inputs: [],
            outputs: [{ type: 'string' }],
          },
        ],
        client: this.blockchainService.getPublicClient(),
      });

      return await tokenContract.read.symbol();
    } catch (error) {
      this.logger.warn(`Could not get symbol for token ${tokenAddress}`);
      return 'UNKNOWN';
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
      const [token0, token1, fee, liquidity] = await Promise.all([
        poolContract.read.token0(),
        poolContract.read.token1(),
        poolContract.read.fee(),
        poolContract.read.liquidity(),
      ]);

      // Create pool record
      await this.databaseService.pool.create({
        data: {
          address: poolAddress.toLowerCase(),
          token0: token0,
          token1: token1,
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
}
