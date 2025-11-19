import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DatabaseService } from '../database/database.service';
import { LeaderboardCalculatorService } from './leaderboard-calculator.service';
import {
  LeaderboardEntryDto,
  LeaderboardResponseDto,
  LeaderboardWalletDetailDto,
  LeaderboardSnapshotDto,
} from './dto/leaderboard-entry.dto';
import { LeaderboardQueryDto } from './dto/leaderboard-query.dto';

@Injectable()
export class LeaderboardService {
  private readonly logger = new Logger(LeaderboardService.name);

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly calculator: LeaderboardCalculatorService,
  ) {}

  private get prisma() {
    return this.databaseService.client;
  }

  /**
   * Cron job to calculate leaderboard every hour
   */
  @Cron(CronExpression.EVERY_HOUR)
  async handleCron() {
    this.logger.log('Cron job: Starting leaderboard calculation');
    try {
      await this.calculator.calculateLeaderboard();
      this.logger.log('Cron job: Leaderboard calculation completed');
    } catch (error) {
      this.logger.error(
        'Cron job: Leaderboard calculation failed:',
        error,
      );
    }
  }

  /**
   * Get leaderboard with pagination
   */
  async getLeaderboard(
    query: LeaderboardQueryDto,
  ): Promise<LeaderboardResponseDto> {
    const { page = 1, limit = 100 } = query;
    const skip = (page - 1) * limit;

    const [entries, total, lastEntry] = await Promise.all([
      this.prisma.leaderboardEntry.findMany({
        skip,
        take: limit,
        orderBy: {
          rank: 'asc',
        },
      }),
      this.prisma.leaderboardEntry.count(),
      this.prisma.leaderboardEntry.findFirst({
        orderBy: {
          lastUpdatedAt: 'desc',
        },
        select: {
          lastUpdatedAt: true,
        },
      }),
    ]);

    const mappedEntries: LeaderboardEntryDto[] = entries.map((entry) =>
      this.mapToDto(entry),
    );

    return {
      entries: mappedEntries,
      total,
      page,
      limit,
      lastUpdatedAt: lastEntry?.lastUpdatedAt,
    };
  }

  /**
   * Get wallet details with history
   */
  async getWalletDetail(
    wallet: string,
  ): Promise<LeaderboardWalletDetailDto> {
    const normalizedWallet = wallet.toLowerCase();

    const entry = await this.prisma.leaderboardEntry.findUnique({
      where: { wallet: normalizedWallet },
      include: {
        snapshots: {
          orderBy: {
            timestamp: 'desc',
          },
          take: 100, // Last 100 snapshots
        },
      },
    });

    if (!entry) {
      throw new NotFoundException(
        `Wallet ${wallet} not found in leaderboard`,
      );
    }

    const history: LeaderboardSnapshotDto[] = entry.snapshots.map(
      (snapshot) => ({
        timestamp: snapshot.timestamp,
        rank: snapshot.rank,
        totalPoints: snapshot.totalPoints,
        totalVolumeUSD: snapshot.totalVolumeUSD,
        currentLiquidityUSD: snapshot.currentLiquidityUSD,
        positionsCount: snapshot.positionsCount,
      }),
    );

    const dto = this.mapToDto(entry);

    return {
      ...dto,
      history,
    };
  }

  /**
   * Manually trigger leaderboard calculation
   */
  async triggerCalculation(): Promise<{ message: string }> {
    this.logger.log('Manual trigger: Starting leaderboard calculation');
    await this.calculator.calculateLeaderboard();
    return {
      message: 'Leaderboard calculation completed successfully',
    };
  }

  /**
   * Get leaderboard statistics
   */
  async getStatistics() {
    return this.calculator.getStatistics();
  }

  /**
   * Map database entry to DTO
   */
  private mapToDto(entry: any): LeaderboardEntryDto {
    const rankChange =
      entry.previousRank !== null
        ? entry.previousRank - entry.rank
        : undefined;

    return {
      wallet: entry.wallet,
      swapVolumeUSD: entry.swapVolumeUSD,
      liquidityDepositVolumeUSD: entry.liquidityDepositVolumeUSD,
      totalVolumeUSD: entry.totalVolumeUSD,
      currentLiquidityUSD: entry.currentLiquidityUSD,
      positionsCount: entry.positionsCount,
      v3PoolsLiquidityUSD: entry.v3PoolsLiquidityUSD,
      stickyVaultsLiquidityUSD: entry.stickyVaultsLiquidityUSD,
      autoWinVaultsLiquidityUSD: entry.autoWinVaultsLiquidityUSD,
      volumePoints: entry.volumePoints,
      liquidityPoints: entry.liquidityPoints,
      totalPoints: entry.totalPoints,
      rank: entry.rank,
      previousRank: entry.previousRank,
      rankChange,
      lastUpdatedAt: entry.lastUpdatedAt,
    };
  }
}
