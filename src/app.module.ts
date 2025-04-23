import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigsModule } from './configs/configs.module';
import { AuthModule } from './auth/auth.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { LoggingInterceptor } from './configs/interceptors/logging.interceptor';
import { ScholarsModule } from './scholars/scholars.module';
import { LogbookModule } from './logbook/logbook.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [ConfigsModule, AuthModule, ScholarsModule, LogbookModule, UsersModule],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule {}
