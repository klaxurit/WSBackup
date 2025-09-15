/*
  Warnings:

  - The primary key for the `token_daily_stats` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `date` on the `token_daily_stats` table. All the data in the column will be lost.
  - You are about to drop the column `rankByMarketCap` on the `token_daily_stats` table. All the data in the column will be lost.
  - You are about to drop the column `rankByTvl` on the `token_daily_stats` table. All the data in the column will be lost.
  - You are about to drop the column `rankByVolume` on the `token_daily_stats` table. All the data in the column will be lost.
  - You are about to drop the column `uniqueTraders24h` on the `token_daily_stats` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "token_daily_stats_date_marketCap_idx";

-- DropIndex
DROP INDEX "token_daily_stats_date_tvlInPools_idx";

-- DropIndex
DROP INDEX "token_daily_stats_date_volumeUSD24h_idx";

-- DropIndex
DROP INDEX "token_daily_stats_tokenAddress_date_idx";

-- AlterTable
ALTER TABLE "token_daily_stats" DROP CONSTRAINT "token_daily_stats_pkey",
DROP COLUMN "date",
DROP COLUMN "rankByMarketCap",
DROP COLUMN "rankByTvl",
DROP COLUMN "rankByVolume",
DROP COLUMN "uniqueTraders24h",
ADD CONSTRAINT "token_daily_stats_pkey" PRIMARY KEY ("tokenAddress");

-- CreateIndex
CREATE INDEX "token_daily_stats_tvlInPools_idx" ON "token_daily_stats"("tvlInPools" DESC);

-- CreateIndex
CREATE INDEX "token_daily_stats_volumeUSD24h_idx" ON "token_daily_stats"("volumeUSD24h" DESC);

-- CreateIndex
CREATE INDEX "token_daily_stats_marketCap_idx" ON "token_daily_stats"("marketCap" DESC);
