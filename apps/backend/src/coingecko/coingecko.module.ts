import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { CoinGeckoService } from './coingecko.service';

@Module({
  imports: [HttpModule],
  providers: [CoinGeckoService],
  exports: [CoinGeckoService],
})
export class CoingeckoModule {}
