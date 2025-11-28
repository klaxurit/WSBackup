export class LeaderboardEntryDto {
  wallet: string;

  // Volume metrics
  swapVolumeUSD: number;
  liquidityDepositVolumeUSD: number;
  totalVolumeUSD: number;

  // Liquidity metrics
  currentLiquidityUSD: number;
  positionsCount: number;

  // Breakdown
  v3PoolsLiquidityUSD: number;
  stickyVaultsLiquidityUSD: number;
  autoWinVaultsLiquidityUSD: number;

  // Points and ranking
  volumePoints: number;
  liquidityPoints: number;
  totalPoints: number;
  rank: number;
  previousRank?: number;
  rankChange?: number; // Calculated: previousRank - rank (positive = moved up)

  // Metadata
  lastUpdatedAt: Date;
}

export class LeaderboardSnapshotDto {
  timestamp: Date;
  rank: number;
  totalPoints: number;
  totalVolumeUSD: number;
  currentLiquidityUSD: number;
  positionsCount: number;
}

export class LeaderboardWalletDetailDto extends LeaderboardEntryDto {
  history: LeaderboardSnapshotDto[];
}

export class LeaderboardResponseDto {
  entries: LeaderboardEntryDto[];
  total: number;
  page: number;
  limit: number;
  lastUpdatedAt?: Date;
}
