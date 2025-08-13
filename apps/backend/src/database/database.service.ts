import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { connectDB, disconnectDB, prisma } from '@repo/db';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await connectDB();
  }
  async onModuleDestroy() {
    await disconnectDB();
  }

  get token() {
    return prisma.token;
  }

  get tokenPrice() {
    return prisma.tokenPrice;
  }

  get tokenDailyStats() {
    return prisma.tokenDailyStats;
  }

  get poolStats() {
    return prisma.poolStats;
  }

  get client() {
    return prisma;
  }
}
