import { Module } from '@nestjs/common';
import { LogbookService } from './logbook.service';
import { LogbookController } from './logbook.controller';

@Module({
  providers: [LogbookService],
  controllers: [LogbookController]
})
export class LogbookModule {}
