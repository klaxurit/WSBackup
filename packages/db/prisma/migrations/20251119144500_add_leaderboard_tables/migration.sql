-- CreateTable
CREATE TABLE "leaderboard_entries" (
    "id" TEXT NOT NULL,
    "wallet" TEXT NOT NULL,
    "swapVolumeUSD" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "liquidityDepositVolumeUSD" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalVolumeUSD" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "currentLiquidityUSD" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "positionsCount" INTEGER NOT NULL DEFAULT 0,
    "v3PoolsLiquidityUSD" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "stickyVaultsLiquidityUSD" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "autoWinVaultsLiquidityUSD" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "volumePoints" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "liquidityPoints" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalPoints" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "rank" INTEGER NOT NULL,
    "previousRank" INTEGER,
    "lastUpdatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "leaderboard_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leaderboard_snapshots" (
    "id" TEXT NOT NULL,
    "wallet" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "rank" INTEGER NOT NULL,
    "totalPoints" DOUBLE PRECISION NOT NULL,
    "totalVolumeUSD" DOUBLE PRECISION NOT NULL,
    "currentLiquidityUSD" DOUBLE PRECISION NOT NULL,
    "positionsCount" INTEGER NOT NULL,

    CONSTRAINT "leaderboard_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "leaderboard_entries_wallet_key" ON "leaderboard_entries"("wallet");

-- CreateIndex
CREATE INDEX "leaderboard_entries_totalPoints_idx" ON "leaderboard_entries"("totalPoints" DESC);

-- CreateIndex
CREATE INDEX "leaderboard_entries_rank_idx" ON "leaderboard_entries"("rank");

-- CreateIndex
CREATE INDEX "leaderboard_entries_wallet_idx" ON "leaderboard_entries"("wallet");

-- CreateIndex
CREATE INDEX "leaderboard_entries_lastUpdatedAt_idx" ON "leaderboard_entries"("lastUpdatedAt" DESC);

-- CreateIndex
CREATE INDEX "leaderboard_snapshots_wallet_timestamp_idx" ON "leaderboard_snapshots"("wallet", "timestamp" DESC);

-- CreateIndex
CREATE INDEX "leaderboard_snapshots_timestamp_idx" ON "leaderboard_snapshots"("timestamp" DESC);

-- AddForeignKey
ALTER TABLE "leaderboard_snapshots" ADD CONSTRAINT "leaderboard_snapshots_wallet_fkey" FOREIGN KEY ("wallet") REFERENCES "leaderboard_entries"("wallet") ON DELETE CASCADE ON UPDATE CASCADE;
