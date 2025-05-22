import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailController } from './mail.controller';
import { MailTemplateService } from './mail-template.service';

@Module({
  providers: [MailService, MailTemplateService],
  controllers: [MailController],
})
export class MailModule {}
