/*
  Warnings:

  - Changed the type of `volumeUSD24h` on the `token_daily_stats` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "token_daily_stats" DROP COLUMN "volumeUSD24h",
ADD COLUMN     "volumeUSD24h" DOUBLE PRECISION NOT NULL;

-- CreateIndex
CREATE INDEX "token_daily_stats_volumeUSD24h_idx" ON "token_daily_stats"("volumeUSD24h" DESC);
