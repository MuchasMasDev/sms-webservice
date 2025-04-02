import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigsModule } from './configs/configs.module';
import { AuthModule } from './auth/auth.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { LoggingInterceptor } from './configs/interceptors/logging.interceptor';
import { ScholarsModule } from './scholars/scholars.module';

@Module({
  imports: [ConfigsModule, AuthModule, ScholarsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
