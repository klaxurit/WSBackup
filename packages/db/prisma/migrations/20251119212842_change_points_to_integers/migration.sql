-- AlterTable
ALTER TABLE "api"."leaderboard_entries"
  ALTER COLUMN "volumePoints" SET DATA TYPE INTEGER USING ROUND("volumePoints"),
  ALTER COLUMN "liquidityPoints" SET DATA TYPE INTEGER USING ROUND("liquidityPoints"),
  ALTER COLUMN "totalPoints" SET DATA TYPE INTEGER USING ROUND("totalPoints");

-- AlterTable
ALTER TABLE "api"."leaderboard_snapshots"
  ALTER COLUMN "totalPoints" SET DATA TYPE INTEGER USING ROUND("totalPoints");
