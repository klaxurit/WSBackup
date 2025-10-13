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
  stakingAPR: string;
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
    // Initial sync on startup (optional - uncomment to enable)
    // await this.compareAndUpdateStakingAPR();
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
            stakingAPR
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

      return response.data?.data?.stickyVaults?.items || [];
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
   * Updates a vault's staking APR directly in the database
   * Uses direct SQL query to bypass Ponder's read-only API
   */
  private async updateVaultStakingAPRInternal(
    vaultAddress: string,
    stakingAPR: number,
    slug: string
  ): Promise<boolean> {
    try {
      const response = await this.httpService.axiosRef.post(
        `${this.indexerApiUrl}/api/vaults/update-staking-apr`,
        {
          vaultAddress: vaultAddress.toLowerCase(),
          stakingAPR,
          slug
        },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 5000,
        }
      );

      if (response.data.success) {
        this.logger.log(
          `Successfully updated stakingAPR for vault ${vaultAddress}: ${stakingAPR}%`
        );
        return true;
      }

      return false;
    } catch (error) {
      this.logger.error(
        `Error updating stakingAPR for vault ${vaultAddress}:`,
        error.message
      );
      return false;
    }
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
        const success = await this.updateVaultStakingAPRInternal(
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
  // @Cron(CronExpression.EVERY_HOUR)
  // async scheduledStakingAPRUpdate() {
  //   this.logger.log('⏰ Running scheduled staking APR update...');
  //   const result = await this.compareAndUpdateStakingAPR();

  //   if (result.success) {
  //     this.logger.log(
  //       `✅ Scheduled update successful: ${result.updated} vaults updated`,
  //     );
  //   } else {
  //     this.logger.warn(
  //       `⚠️ Scheduled update completed with errors: ${result.failed} failures`,
  //     );
  //   }
  // }
}
