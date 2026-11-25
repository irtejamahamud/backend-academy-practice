import { Inject, Injectable, Logger } from '@nestjs/common';
import nodemailer, { type Transporter } from 'nodemailer';
import { ENV } from '../../config/config.module.js';
import type { Env } from '../../config/env.js';
import { accountExistsEmail, passwordResetEmail, verificationEmail, type EmailContent } from './templates.js';

/**
 * Sends transactional email over SMTP (Mailpit in development). When no
 * SMTP_URL is configured, outside production, messages are logged instead
 * so the flows remain usable locally.
 */
@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly transport: Transporter | null;

  constructor(@Inject(ENV) private readonly env: Env) {
    this.transport = env.SMTP_URL ? nodemailer.createTransport(env.SMTP_URL) : null;
    if (!this.transport && env.NODE_ENV === 'production') {
      throw new Error('SMTP_URL must be configured in production');
    }
  }

  link(path: string, token: string): string {
    const url = new URL(path, this.env.WEB_ORIGIN);
    url.searchParams.set('token', token);
    return url.toString();
  }

  sendVerification(to: string, name: string, token: string): Promise<void> {
    return this.send(to, verificationEmail(name, this.link('/verify-email', token)));
  }

  sendPasswordReset(to: string, name: string, token: string): Promise<void> {
    return this.send(to, passwordResetEmail(name, this.link('/reset-password', token)));
  }

  sendAccountExists(to: string, name: string): Promise<void> {
    return this.send(to, accountExistsEmail(name, new URL('/login', this.env.WEB_ORIGIN).toString()));
  }

  private async send(to: string, content: EmailContent): Promise<void> {
    if (!this.transport) {
      this.logger.log(`[dev mail] to=${to} subject="${content.subject}"\n${content.text}`);
      return;
    }
    try {
      await this.transport.sendMail({ from: this.env.MAIL_FROM, to, ...content });
    } catch (err) {
      // Delivery failures must not change the HTTP response (that would leak account existence).
      this.logger.error({ err, to }, 'Failed to send email');
    }
  }
}
