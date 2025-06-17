import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import indexerConfig from './indexer/config/indexer.config';
import { IndexerModule } from './indexer/indexer.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [indexerConfig],
    }),
    IndexerModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
