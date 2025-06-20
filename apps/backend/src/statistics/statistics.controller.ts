import { Controller, Get } from '@nestjs/common';
import { PriceService } from './services/price.service';

@Controller('stats')
export class StatisticsController {
  constructor(private readonly priceService: PriceService) { }

  @Get('/tokens')
  async getTokensWithStats() {
    return await this.priceService.getTokenStats();
  }

  @Get("/test")
  async getTest() {
    return await this.priceService.updateTokensPrice()
  }
}
