import { Module } from '@nestjs/common';
import { ScholarsService } from './scholars.service';
import { ScholarsController } from './scholars.controller';
import { AuthModule } from 'src/auth/auth.module';
import { MunicipalitiesModule } from './municipalities/municipalities.module';
import { BanksModule } from './banks/banks.module';

@Module({
  imports: [AuthModule, MunicipalitiesModule, BanksModule],
  controllers: [ScholarsController],
  providers: [ScholarsService],
})
export class ScholarsModule {}
