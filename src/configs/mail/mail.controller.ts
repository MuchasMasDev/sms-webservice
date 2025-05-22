import {
  BadRequestException,
  Body,
  Controller,
  InternalServerErrorException,
  Post,
} from '@nestjs/common';
import { MailService } from './mail.service';

@Controller('mailer')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Post('send')
  async sendMail(@Body() body: { to: string; subject: string; text: string }) {
    const { to, subject, text } = body;

    if (!to || !subject || !text) {
      throw new BadRequestException('Missing required fields');
    }

    try {
      const result = await this.mailService.sendHtmlMail(to, subject, text);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      // Log the error for debugging
      console.error('Error sending email:', error);
      throw new InternalServerErrorException('Failed to send email');
    }
  }
}
