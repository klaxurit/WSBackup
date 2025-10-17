import { Module } from '@nestjs/common';
import { VaultsService } from './vaults.service';
import { VaultsController } from './vaults.controller';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    HttpModule,
    ConfigModule,
    ScheduleModule.forRoot(), // Enable cron jobs
  ],
  providers: [VaultsService],
  exports: [VaultsService],
  controllers: [VaultsController],
})
export class VaultsModule {}
