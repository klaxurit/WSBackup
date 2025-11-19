import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { LeaderboardController } from './leaderboard.controller';
import { LeaderboardService } from './leaderboard.service';
import { LeaderboardCalculatorService } from './leaderboard-calculator.service';
import { PonderGraphqlService } from './ponder-graphql.service';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [
    ScheduleModule.forRoot(), // Enable cron jobs
    DatabaseModule,
  ],
  controllers: [LeaderboardController],
  providers: [
    LeaderboardService,
    LeaderboardCalculatorService,
    PonderGraphqlService,
  ],
  exports: [LeaderboardService],
})
export class LeaderboardModule {}
