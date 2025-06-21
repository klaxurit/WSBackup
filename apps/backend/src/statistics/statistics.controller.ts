import { Controller, Get, Param } from '@nestjs/common';
import { PriceService } from './services/price.service';
import { PoolPriceService } from './services/poolPrice.service';
import { Address } from 'viem';
import { BlockchainService } from 'src/indexer/services/blockchain.service';
import { POSITION_MANAGER_ABI } from 'src/indexer/constants/abis';

@Controller('stats')
export class StatisticsController {
  private readonly positionManagerAddress =
    '0xEf089afF769bC068520a1A90f0773037eF31fbBC';

  constructor(
    private readonly priceService: PriceService,
    private readonly poolService: PoolPriceService,
    private readonly blockchainService: BlockchainService,
  ) {}

  @Get('/tokens')
  async getTokensWithStats() {
    return await this.priceService.getTokenStats();
  }

  @Get('/pools')
  async getPoolsWithStats() {
    return await this.poolService.getPoolStats();
  }

  @Get('/positions/:address')
  async getAddressPositions(@Param('address') address: Address) {
    const positions: any[] = [];
    const client = this.blockchainService.getPublicClient();
    const balance = await client.readContract({
      address: this.positionManagerAddress,
      abi: POSITION_MANAGER_ABI,
      functionName: 'balanceOf',
      args: [address],
    });

    for (let i = 0; i < Number(balance); i++) {
      try {
        const tokenId = await client.readContract({
          address: this.positionManagerAddress,
          abi: POSITION_MANAGER_ABI,
          functionName: 'tokenOfOwnerByIndex',
          args: [address, BigInt(i)],
        });

        const details = await client.readContract({
          address: this.positionManagerAddress,
          abi: POSITION_MANAGER_ABI,
          functionName: 'positions',
          args: [tokenId],
        });

        const pool = await this.poolService.getOnePoolStat(
          (details as any)[2] as string,
          (details as any)[3] as string,
          (details as any)[4] as number,
        );

        positions.push(pool);
      } catch (error) {
        console.error('Error fetching position:', error);
      }
    }

    return positions;
  }
  // @Get("/test")
  // async getTest() {
  //   return await this.poolService.updatePoolStats()
  // }
}
