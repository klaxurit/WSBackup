import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { VaultsService } from './vaults.service';
import { BeraHubService } from './berahub.service';

@Controller('vaults')
export class VaultsController {
  constructor(
    private readonly vaultsService: VaultsService,
    private readonly beraHubService: BeraHubService,
  ) { }

  /**
   * POST /vaults/sync-staking-apr
   * Manually trigger synchronization of staking APRs from InfraRed
   */
  @Post('/sync-staking-apr')
  async syncStakingAPR() {
    const result = await this.vaultsService.compareAndUpdateStakingAPR();

    return {
      success: result.success,
      message: `Sync completed: ${result.updated} vaults updated, ${result.failed} failed`,
      summary: {
        updated: result.updated,
        failed: result.failed,
        total: result.details.length,
      },
      details: result.details,
    };
  }

  /**
   * GET /vaults/list
   * Get the list of all vaults from the indexer
   */
  @Get('/list')
  async listVaults() {
    const vaults = await this.vaultsService.getVaultsFromIndexer();

    return {
      success: true,
      count: vaults.length,
      vaults,
    };
  }

  /**
   * GET /vaults/infrared/list
   * Get the list of vaults available on InfraRed
   */
  @Get('/infrared/list')
  async listInfraRedVaults() {
    const vaults = await this.vaultsService.getInfraRedVaults();

    return {
      success: true,
      count: vaults.length,
      vaults,
      note: vaults.length === 0
        ? 'InfraRed API integration pending - please configure INFRARED_API_URL'
        : undefined,
    };
  }

  /**
   * GET /vaults/infrared/:slug
   * Get one vault available on InfraRed
   */
  @Get('/infrared/:slug')
  async getOneInfraRedVault(@Param('slug') slug: string) {
    const vault = await this.vaultsService.getOneInfraRedVault(slug);

    return {
      success: !!vault,
      vault,
    };
  }

  /**
   * GET /vaults/:address/apr
   * Get comprehensive APR data for a specific vault with detailed breakdowns
   * Returns all available strategies: Sticky, AutoWin, Infrared, BeraHub
   */
  @Get('/:address/apr')
  async getVaultAPRs(@Param('address') address: string) {
    const vaultAddress = address.toLowerCase();

    // Get vault data from indexer
    const vaults = await this.vaultsService.getVaultsFromIndexer();
    const vault = vaults.find(v => v.id.toLowerCase() === vaultAddress);

    if (!vault) {
      return {
        success: false,
        error: 'Vault not found',
        address: vaultAddress,
      };
    }

    // Parse base APRs from vault
    const baseAPR = parseFloat(vault.apy || '0');
    const netAPR = parseFloat(vault.netAPR || '0');

    // Fetch BGT price for accurate calculations
    const bgtPrice = await this.vaultsService.getBGTPrice();

    // Initialize strategies array (only add available ones)
    const strategies: any[] = [];

    // Strategy 1: Sticky Vault (always available)
    strategies.push({
      name: 'sticky',
      available: true,
      baseAPR: baseAPR,
      bgtAPR: 0,
      totalAPR: baseAPR,
      breakdown: {
        fees: { value: baseAPR, source: 'vault' }
      },
      description: 'Deposit in StickyVault and earn fees from Uniswap V3 swaps'
    });

    // Strategy 2: AutoWin (if vault has AutoWin)
    // We need to fetch the AutoWin vault address from the vault data
    // For now, we'll query via GraphQL to get autoWinVault field
    const autoWinQuery = `
      query GetVaultWithAutoWin($id: String!) {
        stickyVault(id: $id) {
          autoWinVault
        }
      }
    `;

    try {
      const response = await this.vaultsService['httpService'].axiosRef.post(
        this.vaultsService['graphqlUrl'],
        { query: autoWinQuery, variables: { id: vaultAddress } },
        { headers: { 'Content-Type': 'application/json' }, timeout: 10000 }
      );

      const autoWinVaultAddress = response.data?.data?.stickyVault?.autoWinVault;

      if (autoWinVaultAddress) {
        const autoWinVault = await this.vaultsService.getAutoWinVault(autoWinVaultAddress);

        if (autoWinVault) {
          const bgtInjectionAPR = parseFloat(autoWinVault.estimatedAPR || '0');
          const autoWinTotal = baseAPR + bgtInjectionAPR;

          strategies.push({
            name: 'autowin',
            available: true,
            baseAPR: baseAPR,
            bgtAPR: bgtInjectionAPR,
            totalAPR: autoWinTotal,
            breakdown: {
              fees: { value: baseAPR, source: 'vault' },
              bgtInjection: { value: bgtInjectionAPR, source: 'autowin' }
            },
            autoWinVaultAddress: autoWinVaultAddress,
            description: `Stake StickyVault tokens in AutoWin for automatic BGT harvesting and auto-compounding`,
            stats: {
              totalBgtClaimed: autoWinVault.totalBgtClaimed,
              avgBgtPerClaim: autoWinVault.avgBgtPerClaim,
              claimCount: autoWinVault.claimCount
            }
          });
        }
      }
    } catch (error) {
      // AutoWin vault not found or error fetching - skip this strategy
      this.vaultsService['logger'].debug(`No AutoWin vault found for ${vaultAddress}`);
    }

    // Strategy 3: Infrared (if available in cache)
    const stakingAPR = this.vaultsService.getStakingAPR(vaultAddress);
    if (stakingAPR) {
      const infraredTotal = baseAPR + stakingAPR.apr;

      strategies.push({
        name: 'infrared',
        available: true,
        baseAPR: baseAPR,
        bgtAPR: stakingAPR.apr,
        totalAPR: infraredTotal,
        breakdown: {
          fees: { value: baseAPR, source: 'vault' },
          bgtStaking: { value: stakingAPR.apr, source: 'infrared' }
        },
        slug: stakingAPR.slug,
        externalLink: `https://app.infrared.finance/vault/${stakingAPR.slug}`,
        description: 'Stake StickyVault tokens on Infrared to earn additional BGT rewards'
      });
    }

    // Strategy 4: BeraHub (if available via API)
    const beraHubVault = await this.beraHubService.getRewardVaultByStakingToken(vaultAddress);
    if (beraHubVault) {
      const beraHubBgtAPR = this.beraHubService.calculateTotalAPR(beraHubVault, bgtPrice);
      const beraHubTotal = baseAPR + beraHubBgtAPR;
      const beraHubBGT = this.beraHubService.getBGTEmissions(beraHubVault);

      strategies.push({
        name: 'berahub',
        available: true,
        baseAPR: baseAPR,
        bgtAPR: beraHubBgtAPR,
        totalAPR: beraHubTotal,
        breakdown: {
          fees: { value: baseAPR, source: 'vault' },
          bgtStaking: { value: beraHubBgtAPR, source: 'berahub' }
        },
        rewardVaultAddress: beraHubVault.vaultAddress,
        externalLink: `https://bartio.hub.berachain.com/vaults/${beraHubVault.vaultAddress}`,
        description: 'Stake StickyVault tokens on BeraHub to earn BGT emissions',
        bgtEmissions: {
          bgtPerBlock: beraHubBGT.bgtPerBlock,
          totalBGTReceived: beraHubBGT.totalBGTReceived
        }
      });
    }

    // Determine best strategy
    const maxAPR = Math.max(...strategies.map(s => s.totalAPR));
    const bestStrategy = strategies.find(s => s.totalAPR === maxAPR);

    // Return comprehensive response
    return {
      success: true,
      vaultAddress: vaultAddress,
      vaultName: vault.name,
      bgtPrice: bgtPrice,
      strategies: strategies,
      bestStrategy: {
        name: bestStrategy.name,
        totalAPR: bestStrategy.totalAPR,
        description: `Best returns: ${bestStrategy.totalAPR.toFixed(2)}% APR via ${bestStrategy.name}`
      }
    };
  }
}
