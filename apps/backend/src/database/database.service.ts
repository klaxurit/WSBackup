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

  get poolStats() {
    return prisma.poolStatistic;
  }

  get client() {
    return prisma;
  }
}
