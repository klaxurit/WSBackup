import { Injectable, Logger } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { CoinGeckoResponse, CoinGeckoTokenData } from '../types/tokenPrices';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class CoinGeckoService {
  private readonly logger = new Logger(CoinGeckoService.name);
  // private readonly baseUrl = 'https://api.coingecko.com/api/v3';
  private readonly baseUrl =
    'https://coingecko-api.stakelab.zone/price?vs_currencies=usd';

  constructor(private readonly httpService: HttpService) {}

  async getTokenData(coingeckoId: string): Promise<number | null> {
    try {
      this.logger.debug(`Call CoinGecko for ${coingeckoId}`);

      const url = `${this.baseUrl}&symbols=${coingeckoId}`;
      const response = await firstValueFrom(
        this.httpService.get<CoinGeckoResponse>(url, {
          timeout: 10000,
        }),
      );

      if (!response.data?.[coingeckoId]) {
        this.logger.warn(`No Data for ${coingeckoId}`);
        return null;
      }

      return response.data[coingeckoId].usd;
    } catch (error) {
      this.logger.error(`CoinGecko error for ${coingeckoId}:`, error.message);
      if (error.response?.status === 429) {
        this.logger.warn('Coingecko Rate limit reached');
      }

      return null;
    }
  }
}
