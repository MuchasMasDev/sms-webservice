import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Address } from 'nodemailer/lib/mailer';

interface SentMessageInfo {
  accepted: (string | Address)[];
  rejected: (string | Address)[];
  ehlo?: string[];
  envelopeTime?: number;
  messageTime?: number;
  messageSize?: number;
  response: string;
  envelope: {
    from: string | false;
    to: string[];
  };
  messageId: string;
}
interface MailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter<SentMessageInfo>;
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

    this.from = '"Equipo Muchas Más" <no-reply@muchasmas.org>';
  }

  // Método original para texto plano
  async sendMail(
    to: string,
    subject: string,
    text: string,
  ): Promise<SentMessageInfo> {
    try {
      const info = await this.transporter.sendMail({
        from: this.from,
        to,
        subject,
        text,
      });

      this.logger.log(`Email sent to ${to}: ${JSON.stringify(info)}`);
      return info;
    } catch (error: unknown) {
      this.logger.error(
        `Failed to send email to ${to}`,
        error instanceof Error ? error.stack : String(error),
      );
      throw error;
    }
  }

  // Nuevo método para HTML
  async sendHtmlMail(
    to: string,
    subject: string,
    html: string,
    text?: string,
  ): Promise<SentMessageInfo> {
    try {
      const info: SentMessageInfo = await this.transporter.sendMail({
        from: this.from,
        to,
        subject,
        html,
        text,
      });

      this.logger.log(`HTML Email sent to ${to}: ${info.messageId}`);
      return info;
    } catch (error: unknown) {
      this.logger.error(
        `Failed to send HTML email to ${to}`,
        error instanceof Error ? error.stack : String(error),
      );
      throw error;
    }
  }

  // Método versátil que acepta tanto texto como HTML
  async sendMailAdvanced(options: MailOptions): Promise<SentMessageInfo> {
    try {
      const info: SentMessageInfo = await this.transporter.sendMail({
        from: this.from,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
      });

      this.logger.log(
        `Advanced email sent to ${options.to}: ${info.messageId}`,
      );
      return info;
    } catch (error: unknown) {
      this.logger.error(
        `Failed to send advanced email to ${options.to}`,
        error instanceof Error ? error.stack : String(error),
      );
      throw error;
    }
  }
}
