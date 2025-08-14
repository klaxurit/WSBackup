import { Module } from '@nestjs/common';
import { PonderService } from './ponder.service';

@Module({
  imports: [],
  providers: [PonderService],
  exports: [PonderService],
})
export class PonderModule { }
