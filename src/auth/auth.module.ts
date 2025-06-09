import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MailService } from 'src/configs/mail/mail.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategy';
import { MailTemplateService } from 'src/configs/mail/mail-template.service';

@Module({
  providers: [AuthService, JwtStrategy, MailService, MailTemplateService],
  exports: [AuthService],
  controllers: [AuthController],
  imports: [JwtModule.register({})],
})
export class AuthModule {}
