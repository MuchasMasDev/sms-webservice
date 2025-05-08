import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter;
  private from: string;

  constructor(private configService: ConfigService) {
    const port: number = parseInt(
      this.configService.get<string>('SMTP_PORT') || '465',
    );
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('SMTP_HOST'),
      port: port,
      secure: port === 465,
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASS'),
      },
      logger: true,
      debug: true,
    });

    this.from =
      this.configService.get<string>('SMTP_FROM') ||
      '"Muchas Más" <no-reply@muchasmas.org>';
  }

  async sendMail(to: string, subject: string, text: string) {
    try {
      const info = await this.transporter.sendMail({
        from: this.from,
        to,
        subject,
        text,
      });

      this.logger.log(`Email sent to ${to}: ${info.messageId}`);
      return info;
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}`, error.stack);
      throw error;
    }
  }
}
