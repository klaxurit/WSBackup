-- CreateTable
CREATE TABLE "pool_stats" (
    "address" TEXT NOT NULL,
    "tickSpacing" INTEGER NOT NULL,
    "fee" INTEGER NOT NULL,
    "createdAt" TEXT NOT NULL,
    "createdAtBlock" TEXT NOT NULL,
    "token0Address" TEXT NOT NULL,
    "token1Address" TEXT NOT NULL,
    "token0Symbol" TEXT NOT NULL,
    "token1Symbol" TEXT NOT NULL,
    "token0LogoUri" TEXT NOT NULL,
    "token1LogoUri" TEXT NOT NULL,
    "sqrtPriceX96" TEXT NOT NULL,
    "liquidity" TEXT NOT NULL,
    "isValid" BOOLEAN NOT NULL,
    "dayVolumeUSD" INTEGER NOT NULL,
    "monthVolumeUSD" INTEGER NOT NULL,
    "apr" INTEGER NOT NULL,
    "tvlUSD" INTEGER NOT NULL,

    CONSTRAINT "pool_stats_pkey" PRIMARY KEY ("address")
);

-- CreateIndex
CREATE INDEX "pool_stats_createdAt_apr_idx" ON "pool_stats"("createdAt", "apr" DESC);

-- CreateIndex
CREATE INDEX "pool_stats_createdAt_dayVolumeUSD_idx" ON "pool_stats"("createdAt", "dayVolumeUSD" DESC);

-- CreateIndex
CREATE INDEX "pool_stats_createdAt_monthVolumeUSD_idx" ON "pool_stats"("createdAt", "monthVolumeUSD" DESC);

-- CreateIndex
CREATE INDEX "pool_stats_createdAt_tvlUSD_idx" ON "pool_stats"("createdAt", "tvlUSD" DESC);
