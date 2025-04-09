import { Module } from '@nestjs/common';
import { ScholarsService } from './scholars.service';
import { ScholarsController } from './scholars.controller';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [ScholarsController],
  providers: [ScholarsService],
})
export class ScholarsModule {}
