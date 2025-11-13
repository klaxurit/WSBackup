import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

// ============ INTERFACES ============

export interface BeraHubRewardVault {
  id: string; // vaultAddress on BeraHub
  vaultAddress: string;
  stakingToken: {
    address: string; // This is the StickyVault token address (for matching!)
    name: string;
    symbol: string;
    decimals: number;
  };
  dynamicData: {
    apr: string | null;
    bgtCapturePerBlock: string;
    bgtCapturePercentage: string;
    allTimeReceivedBGTAmount: string;
    activeIncentivesValueUsd: string;
    activeIncentivesRateUsd: string;
    tvl: string | null;
  };
  activeIncentives: Array<{
    active: boolean;
    incentiveRate: string;
    incentiveRateUsd: string;
    token: {
      address: string;
      symbol: string;
    };
  }>;
  metadata: {
    name: string;
    protocolName: string;
    url: string;
  };
}

@Injectable()
export class BeraHubService {
  private readonly logger = new Logger(BeraHubService.name);
  private readonly beraHubApiUrl: string;

  // In-memory cache for BeraHub data to avoid rate limiting
  private beraHubCache: Map<string, {
    data: BeraHubRewardVault | null;
    lastUpdate: number
  }> = new Map();
  private readonly CACHE_TTL = 300000; // 5 minutes (to respect rate limits)

  constructor(
    private readonly httpService: HttpService,
    private config: ConfigService,
  ) {
    this.beraHubApiUrl =
      this.config.get<string>('BERAHUB_API_URL') || 'https://api.berachain.com';
  }

  /**
   * Fetches reward vault data from BeraHub for a specific vault address
   * Uses cache to avoid hitting rate limits
   * @param vaultAddress - The sticky vault token address (stakingToken.address on BeraHub)
   * @returns BeraHub reward vault data or null if not found
   */
  async getRewardVaultByStakingToken(
    vaultAddress: string,
  ): Promise<BeraHubRewardVault | null> {
    const normalizedAddress = vaultAddress.toLowerCase();

    // Check cache first
    const cached = this.beraHubCache.get(normalizedAddress);
    if (cached) {
      const now = Date.now();
      if (now - cached.lastUpdate < this.CACHE_TTL) {
        this.logger.debug(`Using cached BeraHub data for vault ${vaultAddress}`);
        return cached.data;
      } else {
        // Cache expired, remove it
        this.beraHubCache.delete(normalizedAddress);
      }
    }

    try {
      const query = `
        query GetRewardVault($vaultId: String!, $chain: GqlChain!) {
          rewardVault: polGetRewardVault(vaultAddress: $vaultId, chain: $chain) {
            id: vaultAddress
            vaultAddress
            stakingToken {
              address
              name
              symbol
              decimals
            }
            dynamicData {
              apr
              bgtCapturePerBlock
              bgtCapturePercentage
              allTimeReceivedBGTAmount
              activeIncentivesValueUsd
              activeIncentivesRateUsd
              tvl
            }
            activeIncentives {
              active
              incentiveRate
              incentiveRateUsd
              token {
                address
                symbol
              }
            }
            metadata {
              name
              protocolName
              url
            }
          }
        }
      `;

      const response = await this.httpService.axiosRef.post(
        `${this.beraHubApiUrl}/graphql`,
        {
          operationName: 'GetRewardVault',
          query,
          variables: {
            vaultId: vaultAddress,
            chain: 'BERACHAIN',
          },
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        },
      );

      if (response.data.errors) {
        this.logger.error(
          `GraphQL errors from BeraHub for vault ${vaultAddress}:`,
          JSON.stringify(response.data.errors),
        );
        // Cache the null result to avoid repeated failed requests
        this.beraHubCache.set(normalizedAddress, {
          data: null,
          lastUpdate: Date.now(),
        });
        return null;
      }

      const rewardVault = response.data?.data?.rewardVault || null;

      // Cache the result (even if null)
      this.beraHubCache.set(normalizedAddress, {
        data: rewardVault,
        lastUpdate: Date.now(),
      });

      if (rewardVault) {
        this.logger.log(`✅ Fetched BeraHub data for vault ${vaultAddress} (cached for 5 min)`);
      }

      return rewardVault;
    } catch (error: any) {
      // If 404 or not found, vault is not available on BeraHub (normal case)
      if (error?.response?.status === 404 || error?.response?.data?.errors) {
        this.logger.debug(
          `Vault ${vaultAddress} not found on BeraHub (not staked there)`,
        );
        // Cache the null result to avoid repeated requests
        this.beraHubCache.set(normalizedAddress, {
          data: null,
          lastUpdate: Date.now(),
        });
        return null;
      }

      this.logger.error(
        `Error fetching BeraHub data for vault ${vaultAddress}:`,
        error?.message || error,
      );
      // Cache null on errors too (shorter TTL could be better in production)
      this.beraHubCache.set(normalizedAddress, {
        data: null,
        lastUpdate: Date.now(),
      });
      return null;
    }
  }

  /**
   * Calculate total APR from BeraHub including base APR and active incentives
   * @param rewardVault - BeraHub reward vault data
   * @param bgtPriceUSD - BGT price in USD (optional, defaults to $0.50)
   * @returns Total APR percentage or 0 if not available
   */
  calculateTotalAPR(rewardVault: BeraHubRewardVault, bgtPriceUSD: number = 0.50): number {
    try {
      let totalAPR = 0;

      // Add base APR if available
      if (rewardVault.dynamicData.apr) {
        totalAPR += parseFloat(rewardVault.dynamicData.apr);
      }

      // Add incentives APR
      // Note: incentiveRateUsd is the rate, we need to calculate APR from it
      // For now, we'll use a simplified approach
      if (rewardVault.activeIncentives && rewardVault.activeIncentives.length > 0) {
        // If we have active incentives but no base APR, estimate from BGT capture
        // This is a rough estimation: BGT per block * blocks per year / TVL
        if (!rewardVault.dynamicData.apr && rewardVault.dynamicData.bgtCapturePerBlock) {
          // Berachain: ~2 second block time = 15768000 blocks per year
          const blocksPerYear = 15768000;
          const bgtPerYear = parseFloat(rewardVault.dynamicData.bgtCapturePerBlock) * blocksPerYear;

          // Use dynamic BGT price
          const bgtValuePerYear = bgtPerYear * bgtPriceUSD;

          // Calculate APR if we have TVL
          if (rewardVault.dynamicData.tvl) {
            const tvl = parseFloat(rewardVault.dynamicData.tvl);
            if (tvl > 0) {
              const bgtAPR = (bgtValuePerYear / tvl) * 100;
              totalAPR += bgtAPR;
              this.logger.debug(
                `Calculated BGT APR from emissions: ${bgtAPR.toFixed(2)}% ` +
                `(${bgtPerYear.toFixed(2)} BGT/year @ $${bgtPriceUSD.toFixed(4)}, TVL: $${tvl.toFixed(2)})`
              );
            }
          }
        }
      }

      return totalAPR;
    } catch (error: any) {
      this.logger.warn(
        `Error calculating BeraHub APR for vault ${rewardVault.vaultAddress}:`,
        error?.message,
      );
      return 0;
    }
  }

  /**
   * Get BGT emissions info for display
   */
  getBGTEmissions(rewardVault: BeraHubRewardVault): {
    bgtPerBlock: number;
    totalBGTReceived: number;
  } {
    return {
      bgtPerBlock: parseFloat(rewardVault.dynamicData.bgtCapturePerBlock || '0'),
      totalBGTReceived: parseFloat(rewardVault.dynamicData.allTimeReceivedBGTAmount || '0'),
    };
  }
}
