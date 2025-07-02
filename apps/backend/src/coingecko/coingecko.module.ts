import { HttpService } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { CoinGeckoService } from './coingecko.service';

@Module({
  imports: [HttpService],
  providers: [CoinGeckoService],
  exports: [CoinGeckoService],
})
export class CoingeckoModule { }
