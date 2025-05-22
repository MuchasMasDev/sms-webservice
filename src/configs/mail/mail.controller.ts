import {
  BadRequestException,
  Body,
  Controller,
  InternalServerErrorException,
  Post,
} from '@nestjs/common';
import { MailService } from './mail.service';
import { MailTemplateService } from './mail-template.service';

@Controller('mailer')
export class MailController {
  constructor(
    private readonly mailService: MailService,
    private mailTemplateService: MailTemplateService,
  ) {}

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
  @Post('send/styled')
  async sendMailStyled(
    @Body()
    body: {
      to: string;
      subject?: string;
      userName?: string;
    },
  ) {
    const { to, userName } = body;

    const html = this.mailTemplateService.createWelcomeTemplate({
      activationUrl: 'https://google.com',
      mail: to,
      password: 'CYU2A23G',
    });

    const text = this.mailTemplateService.generateTextVersion(
      '¡Bienvenida al Sistema de Gestión de Becarias de Muchas Más!',
      `Hola ${userName}, nos alegra tenerte aquí...`,
      'Activar mi cuenta',
      'https://google.com',
    );

    if (!to) {
      throw new BadRequestException('Missing required fields');
    }

    try {
      const result = await this.mailService.sendHtmlMail(
        to,
        'Muchas Más - Bienvenida',
        html,
        text,
      );
      return { success: true, messageId: result.messageId };
    } catch (error) {
      // Log the error for debugging
      console.error('Error sending email:', error);
      throw new InternalServerErrorException('Failed to send email');
    }
  }
}
