import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';

export interface CoinGeckoResponse {
  [key: string]: {
    usd: number;
    usd_24h_change: number;
  };
}

@Injectable()
export class CoinGeckoService {
  private readonly logger = new Logger(CoinGeckoService.name);
  private readonly baseUrl =
    'https://coingecko-api.stakelab.zone/price?vs_currencies=usd';

  constructor(private readonly http: HttpService) {}

  // Fetch all tokens data
  // Param coingeckoId: string; list of all coingeckoId separate by comma.
  async getTokenData(coingeckoId: string): Promise<number | null> {
    try {
      this.logger.debug(`Call CoinGecko for ${coingeckoId}`);

      const url = `${this.baseUrl}&symbols=${coingeckoId}`;
      const response = await firstValueFrom(
        this.http.get<CoinGeckoResponse>(url, {
          timeout: 10000,
        }),
      );

      if (!response.data?.[coingeckoId]) {
        this.logger.warn(`No Data for ${coingeckoId}`);
        return null;
      }

      return response.data[coingeckoId].usd;
    } catch (error: any) {
      this.logger.error(`CoinGecko error for ${coingeckoId}:`, error?.message);
      if (error?.response?.status === 429) {
        this.logger.warn('Coingecko Rate limit reached');
      }

      return null;
    }
  }

  async getMultiTokensData(ids: string): Promise<CoinGeckoResponse | null> {
    try {
      const url = `${this.baseUrl}&symbols=${ids}`;
      const response = await firstValueFrom(
        this.http.get(url, {
          timeout: 10000,
        }),
      );

      return response.data;
    } catch (error: any) {
      this.logger.error(
        `CoinGecko error for when call multi tokens:`,
        error?.message,
      );
      if (error?.response?.status === 429) {
        this.logger.warn('Coingecko Rate limit reached');
      }

      return null;
    }
  }

  async getTokenDetails(
    id: string,
  ): Promise<{ website: string; description: string; twitter: string } | null> {
    try {
      const url = `https://api.coingecko.com/api/v3/coins/${id}`;
      const response = await firstValueFrom(
        this.http.get(url, {
          timeout: 10000,
        }),
      );

      return {
        website: response.data?.links.homepage[0],
        description: response.data?.description.en,
        twitter: response.data?.links.twitter_screen_name,
      };
    } catch (error: any) {
      this.logger.error(
        `CoinGecko error for when call tokens details:`,
        error?.message,
      );
      if (error?.response?.status === 429) {
        this.logger.warn('Coingecko Rate limit reached');
      }

      return null;
    }
  }
}
