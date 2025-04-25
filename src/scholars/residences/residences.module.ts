import { Module } from '@nestjs/common';
import { ResidencesService } from './residences.service';
import { ResidencesController } from './residences.controller';

@Module({
  providers: [ResidencesService],
  controllers: [ResidencesController]
})
export class ResidencesModule {}
