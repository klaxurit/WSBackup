import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { PonderGraphqlService } from './ponder-graphql.service';

interface WalletMetrics {
  wallet: string;
  swapVolumeUSD: number;
  liquidityDepositVolumeUSD: number;
  totalVolumeUSD: number;
  currentLiquidityUSD: number;
  positionsCount: number;
  v3PoolsLiquidityUSD: number;
  stickyVaultsLiquidityUSD: number;
  autoWinVaultsLiquidityUSD: number;
  volumePoints: number;
  liquidityPoints: number;
  referralPoints: number;
  totalPoints: number;
}

@Injectable()
export class LeaderboardCalculatorService {
  private readonly logger = new Logger(LeaderboardCalculatorService.name);
  private readonly VOLUME_MULTIPLIER = 1.2;
  private readonly LIQUIDITY_MULTIPLIER = 1.0;
  private readonly REFERRAL_BONUS_RATE = 0.2; // 20% of referrals' points

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly ponderGraphql: PonderGraphqlService,
  ) {}

  private get prisma() {
    return this.databaseService.client;
  }

  /**
   * Calculate leaderboard for all wallets
   * This is the main method called by the cron job
   */
  async calculateLeaderboard(): Promise<void> {
    this.logger.log('Starting leaderboard calculation...');
    const startTime = Date.now();

    try {
      // 1. Fetch prices and vault info from Ponder
      this.logger.log('Fetching prices and vault info from Ponder indexer...');
      const [tokenPrices, stickyVaultInfo, autoWinToSticky] =
        await Promise.all([
          this.ponderGraphql.getTokenPrices(),
          this.ponderGraphql.getStickyVaultInfo(),
          this.ponderGraphql.getAutoWinToStickyMapping(),
        ]);

      // 2. Fetch data from Ponder (using prices for calculations)
      this.logger.log('Fetching wallet data from Ponder indexer...');
      const [
        swapVolumes,
        liquidityVolumes,
        v3Positions,
        vaultPositions,
        autoWinPositions,
      ] = await Promise.all([
        this.ponderGraphql.getSwapVolumeByWallet(),
        this.ponderGraphql.getLiquidityVolumeByWallet(),
        this.ponderGraphql.getV3PoolPositionsWithPrices(tokenPrices),
        this.ponderGraphql.getStickyVaultPositions(),
        this.ponderGraphql.getAutoWinPositionsWithPrices(
          stickyVaultInfo,
          autoWinToSticky,
        ),
      ]);

      // 3. Get all unique wallets
      const allWallets = new Set<string>();
      swapVolumes.forEach((_, wallet) => allWallets.add(wallet));
      liquidityVolumes.forEach((_, wallet) => allWallets.add(wallet));
      v3Positions.forEach((_, wallet) => allWallets.add(wallet));
      vaultPositions.forEach((_, wallet) => allWallets.add(wallet));
      autoWinPositions.forEach((_, wallet) => allWallets.add(wallet));

      this.logger.log(
        `Processing ${allWallets.size} unique wallets with USD prices...`,
      );

      // 4. Calculate metrics for each wallet
      const walletMetrics: WalletMetrics[] = [];

      for (const wallet of allWallets) {
        const swapVolumeUSD = swapVolumes.get(wallet) || 0;
        const liquidityDepositVolumeUSD =
          liquidityVolumes.get(wallet) || 0;

        const v3Data = v3Positions.get(wallet) || {
          count: 0,
          totalUSD: 0,
        };
        const vaultData = vaultPositions.get(wallet) || {
          count: 0,
          totalUSD: 0,
        };
        const autoWinData = autoWinPositions.get(wallet) || {
          count: 0,
          totalUSD: 0,
        };

        const totalVolumeUSD =
          swapVolumeUSD + liquidityDepositVolumeUSD;
        const currentLiquidityUSD =
          v3Data.totalUSD + vaultData.totalUSD + autoWinData.totalUSD;
        const positionsCount =
          v3Data.count + vaultData.count + autoWinData.count;

        // Calculate points (rounded to integers)
        // S'assurer que toutes les valeurs sont des nombres valides (pas NaN)
        const volumePoints = Math.round(
          (isNaN(totalVolumeUSD) ? 0 : totalVolumeUSD) * this.VOLUME_MULTIPLIER,
        );
        const liquidityPoints = Math.round(
          (isNaN(currentLiquidityUSD) ? 0 : currentLiquidityUSD) * this.LIQUIDITY_MULTIPLIER,
        );
        // Base points without referral bonus (referral points added later)
        const basePoints = volumePoints + liquidityPoints;

        // Valider que toutes les valeurs sont des nombres valides
        const safeSwapVolumeUSD = isNaN(swapVolumeUSD) ? 0 : swapVolumeUSD;
        const safeLiquidityDepositVolumeUSD = isNaN(liquidityDepositVolumeUSD) ? 0 : liquidityDepositVolumeUSD;
        const safeTotalVolumeUSD = isNaN(totalVolumeUSD) ? 0 : totalVolumeUSD;
        const safeCurrentLiquidityUSD = isNaN(currentLiquidityUSD) ? 0 : currentLiquidityUSD;
        const safeV3PoolsLiquidityUSD = isNaN(v3Data.totalUSD) ? 0 : v3Data.totalUSD;
        const safeStickyVaultsLiquidityUSD = isNaN(vaultData.totalUSD) ? 0 : vaultData.totalUSD;
        const safeAutoWinVaultsLiquidityUSD = isNaN(autoWinData.totalUSD) ? 0 : autoWinData.totalUSD;

        walletMetrics.push({
          wallet,
          swapVolumeUSD: safeSwapVolumeUSD,
          liquidityDepositVolumeUSD: safeLiquidityDepositVolumeUSD,
          totalVolumeUSD: safeTotalVolumeUSD,
          currentLiquidityUSD: safeCurrentLiquidityUSD,
          positionsCount,
          v3PoolsLiquidityUSD: safeV3PoolsLiquidityUSD,
          stickyVaultsLiquidityUSD: safeStickyVaultsLiquidityUSD,
          autoWinVaultsLiquidityUSD: safeAutoWinVaultsLiquidityUSD,
          volumePoints,
          liquidityPoints,
          referralPoints: 0, // Will be calculated after
          totalPoints: basePoints, // Will be updated with referral points
        });
      }

      // 4.5. Calculate referral bonus points
      // Get all referral relationships
      const referralRelations = await this.prisma.leaderboardEntry.findMany({
        where: { referredBy: { not: null } },
        select: { wallet: true, referredBy: true },
      });

      // Build map: referrer -> list of referred wallets
      const referrerToReferred = new Map<string, string[]>();
      for (const rel of referralRelations) {
        if (rel.referredBy) {
          const existing = referrerToReferred.get(rel.referredBy) || [];
          existing.push(rel.wallet);
          referrerToReferred.set(rel.referredBy, existing);
        }
      }

      // Build map: wallet -> base points for quick lookup
      const walletBasePoints = new Map<string, number>();
      for (const m of walletMetrics) {
        walletBasePoints.set(m.wallet, m.volumePoints + m.liquidityPoints);
      }

      // Calculate referral points for each referrer
      for (const metrics of walletMetrics) {
        const referredWallets = referrerToReferred.get(metrics.wallet) || [];
        let referralPoints = 0;
        for (const referredWallet of referredWallets) {
          const referredBasePoints = walletBasePoints.get(referredWallet) || 0;
          referralPoints += Math.round(referredBasePoints * this.REFERRAL_BONUS_RATE);
        }
        metrics.referralPoints = referralPoints;
        metrics.totalPoints = metrics.volumePoints + metrics.liquidityPoints + referralPoints;
      }

      // 5. Sort by total points and assign ranks
      walletMetrics.sort((a, b) => b.totalPoints - a.totalPoints);

      // 6. Get existing entries to track rank changes
      const existingEntries = await this.prisma.leaderboardEntry.findMany(
        {
          select: {
            wallet: true,
            rank: true,
          },
        },
      );

      const existingRanks = new Map(
        existingEntries.map((e) => [e.wallet, e.rank]),
      );

      // 7. Update database
      this.logger.log('Updating database with calculated USD values...');
      const now = new Date();

      for (let i = 0; i < walletMetrics.length; i++) {
        const metrics = walletMetrics[i];
        const newRank = i + 1;
        const previousRank = existingRanks.get(metrics.wallet);
        
        // S'assurer que previousRank est un nombre ou null (pas undefined)
        const safePreviousRank = previousRank !== undefined ? previousRank : null;

        // Upsert leaderboard entry
        await this.prisma.leaderboardEntry.upsert({
          where: { wallet: metrics.wallet },
          create: {
            id: metrics.wallet,
            wallet: metrics.wallet,
            swapVolumeUSD: metrics.swapVolumeUSD,
            liquidityDepositVolumeUSD:
              metrics.liquidityDepositVolumeUSD,
            totalVolumeUSD: metrics.totalVolumeUSD,
            currentLiquidityUSD: metrics.currentLiquidityUSD,
            positionsCount: metrics.positionsCount,
            v3PoolsLiquidityUSD: metrics.v3PoolsLiquidityUSD,
            stickyVaultsLiquidityUSD: metrics.stickyVaultsLiquidityUSD,
            autoWinVaultsLiquidityUSD: metrics.autoWinVaultsLiquidityUSD,
            volumePoints: metrics.volumePoints,
            liquidityPoints: metrics.liquidityPoints,
            referralPoints: metrics.referralPoints,
            totalPoints: metrics.totalPoints,
            rank: newRank,
            previousRank: safePreviousRank,
            lastUpdatedAt: now,
          },
          update: {
            swapVolumeUSD: metrics.swapVolumeUSD,
            liquidityDepositVolumeUSD:
              metrics.liquidityDepositVolumeUSD,
            totalVolumeUSD: metrics.totalVolumeUSD,
            currentLiquidityUSD: metrics.currentLiquidityUSD,
            positionsCount: metrics.positionsCount,
            v3PoolsLiquidityUSD: metrics.v3PoolsLiquidityUSD,
            stickyVaultsLiquidityUSD: metrics.stickyVaultsLiquidityUSD,
            autoWinVaultsLiquidityUSD: metrics.autoWinVaultsLiquidityUSD,
            volumePoints: metrics.volumePoints,
            liquidityPoints: metrics.liquidityPoints,
            referralPoints: metrics.referralPoints,
            totalPoints: metrics.totalPoints,
            previousRank: safePreviousRank,
            rank: newRank,
            lastUpdatedAt: now,
          },
        });

        // Create snapshot for historical tracking
        const snapshotId = `${now.getTime()}-${metrics.wallet}`;
        await this.prisma.leaderboardSnapshot.create({
          data: {
            id: snapshotId,
            wallet: metrics.wallet,
            timestamp: now,
            rank: newRank,
            totalPoints: metrics.totalPoints,
            totalVolumeUSD: metrics.totalVolumeUSD,
            currentLiquidityUSD: metrics.currentLiquidityUSD,
            positionsCount: metrics.positionsCount,
          },
        });
      }

      const duration = Date.now() - startTime;
      this.logger.log(
        `Leaderboard calculation completed in ${duration}ms. Processed ${walletMetrics.length} wallets.`,
      );
    } catch (error) {
      this.logger.error('Leaderboard calculation failed:', error);
      throw error;
    }
  }

  /**
   * Get leaderboard statistics
   */
  async getStatistics() {
    const [totalWallets, totalVolume, totalLiquidity] =
      await Promise.all([
        this.prisma.leaderboardEntry.count(),
        this.prisma.leaderboardEntry.aggregate({
          _sum: {
            totalVolumeUSD: true,
          },
        }),
        this.prisma.leaderboardEntry.aggregate({
          _sum: {
            currentLiquidityUSD: true,
          },
        }),
      ]);

    return {
      totalWallets,
      totalVolume: totalVolume._sum.totalVolumeUSD || 0,
      totalLiquidity: totalLiquidity._sum.currentLiquidityUSD || 0,
    };
  }
}
