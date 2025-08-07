-- CreateEnum
CREATE TYPE "token_status" AS ENUM ('DISCOVERED', 'ENRICHING', 'IN_POOL', 'VERIFIED', 'DEPRECATED');

-- CreateEnum
CREATE TYPE "price_source" AS ENUM ('POOL_CALCULATION', 'COINGECKO_FALLBACK', 'MANUAL_OVERRIDE');

-- CreateTable
CREATE TABLE "tokens" (
    "address" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "decimals" INTEGER NOT NULL,
    "logoUri" TEXT,
    "website" TEXT,
    "twitter" TEXT,
    "description" TEXT,
    "coingeckoId" TEXT,
    "totalSupply" BIGINT NOT NULL,
    "status" "token_status" NOT NULL DEFAULT 'DISCOVERED',
    "discoveredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastEnrichmentAt" TIMESTAMP(3),
    "lastActivityAt" TIMESTAMP(3),
    "isStableCoin" BOOLEAN NOT NULL DEFAULT false,
    "isVerifiedManually" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tokens_pkey" PRIMARY KEY ("address")
);

-- CreateTable
CREATE TABLE "token_prices" (
    "tokenAddress" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "priceSource" "price_source" NOT NULL DEFAULT 'POOL_CALCULATION',
    "confidence" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "volumeUSD" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "liquidityPath" JSONB,
    "poolsInvolved" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "token_prices_pkey" PRIMARY KEY ("tokenAddress","timestamp")
);

-- CreateTable
CREATE TABLE "token_daily_stats" (
    "tokenAddress" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "priceChange1h" DOUBLE PRECISION,
    "priceChange24h" DOUBLE PRECISION,
    "volume24h" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "volumeUSD24h" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "tvlInPools" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "marketCap" DOUBLE PRECISION,
    "fdv" DOUBLE PRECISION,
    "rankByTvl" INTEGER,
    "rankByVolume" INTEGER,
    "rankByMarketCap" INTEGER,
    "swapCount24h" INTEGER NOT NULL DEFAULT 0,
    "uniqueTraders24h" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "token_daily_stats_pkey" PRIMARY KEY ("tokenAddress","date")
);

-- CreateIndex
CREATE INDEX "tokens_status_idx" ON "tokens"("status");

-- CreateIndex
CREATE INDEX "tokens_symbol_idx" ON "tokens"("symbol");

-- CreateIndex
CREATE INDEX "tokens_discoveredAt_idx" ON "tokens"("discoveredAt" DESC);

-- CreateIndex
CREATE INDEX "tokens_lastActivityAt_idx" ON "tokens"("lastActivityAt" DESC);

-- CreateIndex
CREATE INDEX "token_prices_tokenAddress_timestamp_idx" ON "token_prices"("tokenAddress", "timestamp" DESC);

-- CreateIndex
CREATE INDEX "token_prices_timestamp_idx" ON "token_prices"("timestamp" DESC);

-- CreateIndex
CREATE INDEX "token_prices_priceSource_idx" ON "token_prices"("priceSource");

-- CreateIndex
CREATE INDEX "token_daily_stats_date_tvlInPools_idx" ON "token_daily_stats"("date", "tvlInPools" DESC);

-- CreateIndex
CREATE INDEX "token_daily_stats_date_volumeUSD24h_idx" ON "token_daily_stats"("date", "volumeUSD24h" DESC);

-- CreateIndex
CREATE INDEX "token_daily_stats_date_marketCap_idx" ON "token_daily_stats"("date", "marketCap" DESC);

-- CreateIndex
CREATE INDEX "token_daily_stats_tokenAddress_date_idx" ON "token_daily_stats"("tokenAddress", "date" DESC);

-- AddForeignKey
ALTER TABLE "token_prices" ADD CONSTRAINT "token_prices_tokenAddress_fkey" FOREIGN KEY ("tokenAddress") REFERENCES "tokens"("address") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "token_daily_stats" ADD CONSTRAINT "token_daily_stats_tokenAddress_fkey" FOREIGN KEY ("tokenAddress") REFERENCES "tokens"("address") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE EXTENSION IF NOT EXISTS timescaledb;

SELECT create_hypertable(
  'token_prices',
  'timestamp',
  chunk_time_interval => INTERVAL '1 day'
);

