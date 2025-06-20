import { Controller, Get } from '@nestjs/common';
import { PriceService } from './services/price.service';
import { PoolPriceService } from './services/poolPrice.service';

@Controller('stats')
export class StatisticsController {
  constructor(private readonly priceService: PriceService, private readonly poolService: PoolPriceService) { }

  @Get('/tokens')
  async getTokensWithStats() {
    return await this.priceService.getTokenStats();
  }

  @Get('/pools')
  async getPoolsWithStats() {
    return await this.poolService.getPoolStats()
  }
  // @Get("/test")
  // async getTest() {
  //   return await this.poolService.updatePoolStats()
  // }
}
