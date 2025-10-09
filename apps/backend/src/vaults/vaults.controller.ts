import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { VaultsService } from './vaults.service';

@Controller('vaults')
export class VaultsController {
  constructor(private readonly vaultsService: VaultsService) { }

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
   * GET /vaults/infrared/list
   * Get the list of vaults available on InfraRed
   */
  @Get('/infrared/:slug')
  async getOneInfraRedVault(@Param('slug') slug: string) {
    const vault = await this.vaultsService.getOneInfraRedVault(slug);

    return {
      success: !!vault,
      vault,
    };
  }
}
