import { Module } from '@nestjs/common';
import { PonderService } from './ponder.service';
import { PonderController } from './ponder.controller';

@Module({
  imports: [],
  providers: [PonderService],
  exports: [PonderService],
  controllers: [PonderController],
})
export class PonderModule {}
