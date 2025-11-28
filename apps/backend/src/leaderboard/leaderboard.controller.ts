import {
  Controller,
  Get,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { LeaderboardService } from './leaderboard.service';
import {
  LeaderboardResponseDto,
  LeaderboardWalletDetailDto,
} from './dto/leaderboard-entry.dto';
import { LeaderboardQueryDto } from './dto/leaderboard-query.dto';

@Controller('leaderboard')
export class LeaderboardController {
  private readonly logger = new Logger(LeaderboardController.name);

  constructor(private readonly leaderboardService: LeaderboardService) { }

  /**
   * GET /leaderboard
   * Get leaderboard rankings with pagination
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  async getLeaderboard(
    @Query() query: LeaderboardQueryDto,
  ): Promise<LeaderboardResponseDto> {
    this.logger.log(
      `Getting leaderboard - page: ${query.page}, limit: ${query.limit}`,
    );
    return this.leaderboardService.getLeaderboard(query);
  }

  /**
   * GET /leaderboard/stats/overview
   * Get leaderboard statistics (optional endpoint)
   */
  @Get('stats/overview')
  @HttpCode(HttpStatus.OK)
  async getStatistics() {
    this.logger.log('Getting leaderboard statistics');
    return this.leaderboardService.getStatistics();
  }

  /**
   * GET /leaderboard/stats/overview
   * Get leaderboard statistics (optional endpoint)
   */
  @Get('trigger')
  async trigger() {
    this.logger.log('trigger Calculation manually');
    return this.leaderboardService.triggerCalculation();
  }

  /**
   * GET /leaderboard/:wallet
   * Get wallet details with stats and history
   */
  @Get(':wallet')
  @HttpCode(HttpStatus.OK)
  async getWalletDetail(
    @Param('wallet') wallet: string,
  ): Promise<LeaderboardWalletDetailDto> {
    this.logger.log(`Getting wallet detail for: ${wallet}`);
    return this.leaderboardService.getWalletDetail(wallet);
  }
}
