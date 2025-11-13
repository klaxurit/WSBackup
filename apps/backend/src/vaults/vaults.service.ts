import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';

// ============ INTERFACES ============

export interface StickyVaultFromIndexer {
  id: string; // vault address
  name: string;
  pool: string;
  totalValueLockedUSD: string;
  apy: string;
  netAPR: string; // Net APR after management fees (from indexer)
  maxPotentialAPR: string; // Max potential APR from pool (from vaultDayData)
  poolAPR: string; // Pure pool APR from underlying Uniswap V3 pool
}

export interface InfraRedVault {
  address: string; // InfraRed vault address
  stake_token: {
    address: string; // StickyVault token address (this is what we match!)
    symbol: string;
    name: string;
  };
  apr: number; // Current APR
  apr_7d_moving_average: number; // 7-day average APR (more stable)
  slug: string;
  name: string;
  type: string;
}

export interface AutoWinVault {
  id: string; // AutoWin vault address
  stakingToken: string; // StickyVault address
  estimatedAPR: string; // BGT injection APR calculated by indexer
  totalBgtClaimed: string;
  avgBgtPerClaim: string;
  claimCount: number;
  lastClaimTimestamp: bigint;
}

export interface BGTPoolData {
  token0: string;
  token1: string;
  token0Price: string;
  token1Price: string;
  totalValueLockedToken0: string;
  totalValueLockedToken1: string;
}

export interface SyncResult {
  success: boolean;
  updated: number;
  failed: number;
  details: Array<{
    vault: string;
    name?: string;
    stakingAPR?: number;
    status: 'updated' | 'failed' | 'not_available_on_infrared';
  }>;
}

@Injectable()
export class VaultsService implements OnModuleInit {
  private readonly logger = new Logger(VaultsService.name);
  private readonly indexerApiUrl: string;
  private readonly graphqlUrl: string;
  private readonly infraRedApiUrl: string;

  // In-memory cache for staking APRs (avoids touching indexer DB)
  private stakingAPRCache: Map<string, { apr: number; slug: string; lastUpdate: number }> = new Map();
  private readonly CACHE_TTL = 3600000; // 1 hour in milliseconds

  // In-memory cache for BGT price
  private bgtPriceCache: { price: number; lastUpdate: number } | null = null;
  private readonly BGT_PRICE_CACHE_TTL = 300000; // 5 minutes in milliseconds

  constructor(
    private readonly httpService: HttpService,
    private config: ConfigService,
  ) {
    this.indexerApiUrl =
      this.config.get<string>('INDEXER_API_URL') ||
      'http://localhost:42069';
    this.graphqlUrl =
      this.config.get<string>('GRAPHQL_URL') ||
      'http://localhost:42069/graphql';
    this.infraRedApiUrl =
      this.config.get<string>('INFRARED_API_URL') ||
      'https://milano.80094.infrared.finance';
  }

  async onModuleInit() {
    this.logger.log('VaultsService initialized');
    // Initial sync on startup
    this.logger.log('🚀 Running initial staking APR sync...');
    await this.compareAndUpdateStakingAPR();
  }

  // ============ PUBLIC METHODS (for controller) ============
  /**
   * Expose fetchVaultsFromIndexer for controller use
   */
  async getVaultsFromIndexer(): Promise<StickyVaultFromIndexer[]> {
    return this.fetchVaultsFromIndexer();
  }

  /**
   * Expose fetchInfraRedVaults for controller use
   */
  async getInfraRedVaults(): Promise<InfraRedVault[]> {
    return this.fetchInfraRedVaults();
  }

  async getOneInfraRedVault(slug: string): Promise<InfraRedVault | null> {
    return this.fetchOneInfraRedVault(slug);
  }

  /**
   * Get staking APR from cache for a vault
   */
  getStakingAPR(vaultAddress: string): { apr: number; slug: string } | null {
    return this.getStakingAPRFromCache(vaultAddress);
  }

  /**
   * Get AutoWin vault data from indexer
   */
  async getAutoWinVault(autoWinVaultAddress: string): Promise<AutoWinVault | null> {
    const query = `
      query GetAutoWinVault($id: String!) {
        autoWinVault(id: $id) {
          id
          stakingToken
          estimatedAPR
          totalBgtClaimed
          avgBgtPerClaim
          claimCount
          lastClaimTimestamp
        }
      }
    `;

    try {
      const response = await this.httpService.axiosRef.post(
        this.graphqlUrl,
        { query, variables: { id: autoWinVaultAddress } },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 10000,
        },
      );

      if (response.data.errors) {
        this.logger.error(
          'GraphQL errors while fetching AutoWin vault:',
          JSON.stringify(response.data.errors),
        );
        return null;
      }

      const autoWinVault = response.data?.data?.autoWinVault || null;

      if (autoWinVault) {
        this.logger.debug(`✅ Fetched AutoWin vault ${autoWinVaultAddress}`);
      }

      return autoWinVault;
    } catch (error: any) {
      this.logger.error(
        `Error fetching AutoWin vault ${autoWinVaultAddress}:`,
        error?.message || error,
      );
      return null;
    }
  }

  /**
   * Get BGT price from BERA-BGT pool
   * Uses cache to avoid frequent indexer queries
   */
  async getBGTPrice(): Promise<number> {
    // Check cache first
    if (this.bgtPriceCache) {
      const now = Date.now();
      if (now - this.bgtPriceCache.lastUpdate < this.BGT_PRICE_CACHE_TTL) {
        this.logger.debug(`Using cached BGT price: $${this.bgtPriceCache.price}`);
        return this.bgtPriceCache.price;
      }
    }

    // Fetch BGT price from pool
    const query = `
      query GetBGTPrice {
        pools(where: {
          or: [
            { token0: "0x0E4aaF1351de4c0264C5c7056Ef3777b41BD8e03", token1: "0x7507c1dc16935B82698e4C63f2746A2fCf994dF8" },
            { token0: "0x7507c1dc16935B82698e4C63f2746A2fCf994dF8", token1: "0x0E4aaF1351de4c0264C5c7056Ef3777b41BD8e03" }
          ]
        }) {
          items {
            id
            token0
            token1
            token0Price
            token1Price
            totalValueLockedToken0
            totalValueLockedToken1
          }
        }
      }
    `;

    try {
      const response = await this.httpService.axiosRef.post(
        this.graphqlUrl,
        { query },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 10000,
        },
      );

      if (response.data.errors) {
        this.logger.error(
          'GraphQL errors while fetching BGT price:',
          JSON.stringify(response.data.errors),
        );
        return 0.50; // Fallback price
      }

      const pools = response.data?.data?.pools?.items || [];

      if (pools.length === 0) {
        this.logger.warn('No BERA-BGT pool found, using fallback price $0.50');
        return 0.50;
      }

      // Get the first pool (should be BERA-BGT)
      const pool = pools[0];
      const BGT_ADDRESS = '0x0E4aaF1351de4c0264C5c7056Ef3777b41BD8e03'.toLowerCase();

      // Determine which token is BGT and get its price
      let bgtPrice: number;
      if (pool.token0.toLowerCase() === BGT_ADDRESS) {
        bgtPrice = parseFloat(pool.token0Price) || 0.50;
      } else {
        bgtPrice = parseFloat(pool.token1Price) || 0.50;
      }

      // Cache the result
      this.bgtPriceCache = {
        price: bgtPrice,
        lastUpdate: Date.now(),
      };

      this.logger.log(`✅ Fetched BGT price from pool: $${bgtPrice.toFixed(4)}`);
      return bgtPrice;
    } catch (error: any) {
      this.logger.error(
        'Error fetching BGT price from pool:',
        error?.message || error,
      );
      return 0.50; // Fallback price
    }
  }

  // ============ PRIVATE METHODS ============

  /**
   * Fetches the list of StickyVaults from the indexer via GraphQL
   */
  private async fetchVaultsFromIndexer(): Promise<StickyVaultFromIndexer[]> {
    const query = `
      query GetStickyVaults {
        stickyVaults {
          items {
            id
            name
            pool
            totalValueLockedUSD
            apy
            netAPR
            vaultDayData(orderBy: "date", orderDirection: "desc", limit: 1) {
              items {
                maxPotentialAPR
              }
            }
            poolRef {
              poolDayData(orderBy: "date", orderDirection: "desc", limit: 1) {
                items {
                  apr
                }
              }
            }
          }
        }
      }
    `;

    try {
      const response = await this.httpService.axiosRef.post(
        this.graphqlUrl,
        { query },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 10000,
        },
      );

      if (response.data.errors) {
        this.logger.error(
          'GraphQL errors while fetching vaults:',
          JSON.stringify(response.data.errors),
        );
        return [];
      }

      const vaults = response.data?.data?.stickyVaults?.items || [];

      // Map vaults to include maxPotentialAPR from vaultDayData and poolAPR from poolRef
      return vaults.map((vault: any) => ({
        id: vault.id,
        name: vault.name,
        pool: vault.pool,
        totalValueLockedUSD: vault.totalValueLockedUSD,
        apy: vault.apy,
        netAPR: vault.netAPR,
        maxPotentialAPR: vault.vaultDayData?.items?.[0]?.maxPotentialAPR || '0',
        poolAPR: vault.poolRef?.poolDayData?.items?.[0]?.apr || '0'
      }));
    } catch (error: any) {
      this.logger.error(
        'Error fetching vaults from indexer:',
        error?.message || error,
      );
      return [];
    }
  }

  /**
   * Fetches the list of vaults available on InfraRed
   * Uses InfraRed API: https://milano.80094.infrared.finance/vaults
   */
  private async fetchInfraRedVaults(): Promise<InfraRedVault[]> {
    try {
      const apiKey = this.config.get<string>('INFRARED_API_KEY');

      if (!apiKey) {
        this.logger.warn(
          '⚠️ INFRARED_API_KEY not configured, skipping InfraRed sync',
        );
        return [];
      }

      const response = await this.httpService.axiosRef.get(
        `${this.infraRedApiUrl}/vaults`,
        {
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
          },
          timeout: 10000,
        },
      );

      // InfraRed response format: { vaults: [...], timestamp, tvl, apr_max }
      const vaults = response.data?.vaults || [];

      // Filter only WinnieSwap vaults if needed
      // You can filter by protocol.id === 'winnieswap' if you only want WinnieSwap vaults
      return vaults;
    } catch (error: any) {
      this.logger.error(
        '❌ Error fetching InfraRed vaults:',
        error?.message || error,
      );

      if (error?.response?.status === 401 || error?.response?.status === 403) {
        this.logger.error('🔒 InfraRed API authentication failed - check API key');
      }

      return [];
    }
  }

  /**
   * Fetches one vault available on InfraRed by slug
   * Uses InfraRed API: https://milano.80094.infrared.finance/vault/<slug>
   */
  private async fetchOneInfraRedVault(slug: string): Promise<InfraRedVault | null> {
    try {
      const apiKey = this.config.get<string>('INFRARED_API_KEY');

      if (!apiKey) {
        this.logger.warn(
          '⚠️ INFRARED_API_KEY not configured, skipping InfraRed sync',
        );
        return null;
      }

      const response = await this.httpService.axiosRef.get(
        `${this.infraRedApiUrl}/vault/${slug}`,
        {
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
          },
          timeout: 10000,
        },
      );

      // InfraRed response format: { vaults: [...], timestamp, tvl, apr_max }
      return response.data?.vault || null;
    } catch (error: any) {
      this.logger.error(
        '❌ Error fetching InfraRed vaults:',
        error?.message || error,
        console.log(`${this.infraRedApiUrl}/vault/${slug}`)
      );

      if (error?.response?.status === 401 || error?.response?.status === 403) {
        this.logger.error('🔒 InfraRed API authentication failed - check API key');
      }

      return null;
    }
  }

  /**
   * Updates a vault's staking APR in the in-memory cache
   * This avoids touching the indexer database (no resync needed)
   */
  private updateVaultStakingAPRInternal(
    vaultAddress: string,
    stakingAPR: number,
    slug: string
  ): boolean {
    try {
      const normalizedAddress = vaultAddress.toLowerCase();
      this.stakingAPRCache.set(normalizedAddress, {
        apr: stakingAPR,
        slug: slug,
        lastUpdate: Date.now(),
      });

      this.logger.log(
        `✅ Cached stakingAPR for vault ${vaultAddress}: ${stakingAPR.toFixed(2)}% (slug: ${slug})`
      );
      return true;
    } catch (error) {
      this.logger.error(
        `❌ Error caching stakingAPR for vault ${vaultAddress}:`,
        error.message
      );
      return false;
    }
  }

  /**
   * Gets staking APR from cache for a specific vault
   * Returns null if not found or expired
   */
  private getStakingAPRFromCache(vaultAddress: string): { apr: number; slug: string } | null {
    const normalizedAddress = vaultAddress.toLowerCase();
    const cached = this.stakingAPRCache.get(normalizedAddress);

    if (!cached) {
      return null;
    }

    // Check if cache is expired
    const now = Date.now();
    if (now - cached.lastUpdate > this.CACHE_TTL) {
      this.stakingAPRCache.delete(normalizedAddress);
      return null;
    }

    return { apr: cached.apr, slug: cached.slug };
  }

  /**
   * Compares indexer vaults with InfraRed vaults and updates staking APRs
   * This is the main synchronization method
   */
  async compareAndUpdateStakingAPR(): Promise<SyncResult> {
    this.logger.log('🔄 Starting staking APR sync with InfraRed...');

    // 1. Fetch vaults from indexer
    const indexerVaults = await this.fetchVaultsFromIndexer();
    this.logger.log(`📊 Found ${indexerVaults.length} vaults in indexer`);

    if (indexerVaults.length === 0) {
      this.logger.warn('⚠️ No vaults found in indexer, skipping sync');
      return {
        success: false,
        updated: 0,
        failed: 0,
        details: [],
      };
    }

    // 2. Fetch vaults from InfraRed
    const infraRedVaults = await this.fetchInfraRedVaults();
    this.logger.log(`📊 Found ${infraRedVaults.length} vaults in InfraRed`);

    if (infraRedVaults.length === 0) {
      this.logger.warn(
        '⚠️ No vaults found in InfraRed (API might not be configured)',
      );
    }

    // 3. Create a map of InfraRed APRs by stake_token address (StickyVault address)
    // ⚠️ Important: We match on stake_token.address, not vault.address!
    const infraRedAPRMap = new Map<string, { apr: number; slug: string }>();
    infraRedVaults.forEach((vault) => {
      const stakeTokenAddress = vault.stake_token.address.toLowerCase();
      // Use 7-day average APR for more stability (convert to percentage)
      const apr = vault.apr_7d_moving_average * 100;
      infraRedAPRMap.set(stakeTokenAddress, { apr, slug: vault.slug });
    });

    // 4. Compare and update
    let updatedCount = 0;
    let failedCount = 0;
    const details: SyncResult['details'] = [];

    for (const vault of indexerVaults) {
      const vaultAddress = vault.id.toLowerCase();
      const infraRedData = infraRedAPRMap.get(vaultAddress);

      if (infraRedData) {
        // This vault exists on InfraRed
        const success = this.updateVaultStakingAPRInternal(
          vaultAddress,
          infraRedData.apr,
          infraRedData.slug
        );

        if (success) {
          updatedCount++;
          details.push({
            vault: vaultAddress,
            name: vault.name,
            stakingAPR: infraRedData.apr,
            status: 'updated',
          });
          this.logger.log(
            `✅ ${vault.name} (${vaultAddress.slice(0, 10)}...): ${infraRedData.apr.toFixed(2)}% APR from InfraRed (${infraRedData.slug})`,
          );
        } else {
          failedCount++;
          details.push({
            vault: vaultAddress,
            name: vault.name,
            stakingAPR: infraRedData.apr,
            status: 'failed',
          });
        }
      } else {
        // This vault is not available on InfraRed
        details.push({
          vault: vaultAddress,
          name: vault.name,
          status: 'not_available_on_infrared',
        });
      }
    }

    this.logger.log(
      `✅ Staking APR sync completed: ${updatedCount} updated, ${failedCount} failed`,
    );

    return {
      success: failedCount === 0,
      updated: updatedCount,
      failed: failedCount,
      details,
    };
  }

  /**
   * Scheduled task: Updates staking APRs every hour
   * Can be adjusted with different cron expressions:
   * - EVERY_30_MINUTES
   * - EVERY_HOUR
   * - EVERY_6_HOURS
   */
  @Cron(CronExpression.EVERY_HOUR)
  async scheduledStakingAPRUpdate() {
    this.logger.log('⏰ Running scheduled staking APR update...');
    const result = await this.compareAndUpdateStakingAPR();

    if (result.success) {
      this.logger.log(
        `✅ Scheduled update successful: ${result.updated} vaults updated`,
      );
    } else {
      this.logger.warn(
        `⚠️ Scheduled update completed with errors: ${result.failed} failures`,
      );
    }
  }
}
