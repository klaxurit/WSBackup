-- AddForeignKey
ALTER TABLE "pool_stats" ADD CONSTRAINT "pool_stats_token0Address_fkey" FOREIGN KEY ("token0Address") REFERENCES "tokens"("address") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pool_stats" ADD CONSTRAINT "pool_stats_token1Address_fkey" FOREIGN KEY ("token1Address") REFERENCES "tokens"("address") ON DELETE RESTRICT ON UPDATE CASCADE;
