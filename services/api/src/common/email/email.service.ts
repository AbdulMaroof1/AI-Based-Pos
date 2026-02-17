import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';
import { getConfig } from '@pos/config';

@Injectable()
export class EmailService {
  private transporter: Transporter | null = null;

  constructor() {
    const config = getConfig();
    if (config.smtpHost && config.smtpPort) {
      this.transporter = nodemailer.createTransport({
        host: config.smtpHost,
        port: config.smtpPort,
        secure: config.smtpPort === 465,
        auth: config.smtpUser && config.smtpPass
          ? { user: config.smtpUser, pass: config.smtpPass }
          : undefined,
      });
    }
  }

  async sendOtpEmail(to: string, code: string): Promise<void> {
    const config = getConfig();
    if (!this.transporter) {
      console.log(`[DEV] SMTP not configured. OTP for ${to}: ${code}`);
      return;
    }

    await this.transporter.sendMail({
      from: config.smtpFrom || 'noreply@abmnext.com',
      to,
      subject: `Your ABMNEXT ERP verification code: ${code}`,
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h2>ABMNEXT ERP</h2>
          <p>Your verification code is:</p>
          <p style="font-size: 24px; font-weight: bold; letter-spacing: 4px;">${code}</p>
          <p style="color: #666;">This code expires in 10 minutes. Do not share it with anyone.</p>
        </div>
      `,
    });
  }

  async sendPasswordResetEmail(to: string, resetToken: string): Promise<void> {
    const config = getConfig();
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const resetUrl = `${baseUrl}/reset-password?token=${encodeURIComponent(resetToken)}`;

    if (!this.transporter) {
      console.log(`[DEV] SMTP not configured. Reset link for ${to}: ${resetUrl}`);
      return;
    }

    await this.transporter.sendMail({
      from: config.smtpFrom || 'noreply@abmnext.com',
      to,
      subject: 'Reset your ABMNEXT ERP password',
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h2>ABMNEXT ERP</h2>
          <p>You requested a password reset. Click the link below to set a new password:</p>
          <p><a href="${resetUrl}" style="color: #2563eb;">Reset password</a></p>
          <p style="color: #666;">This link expires in 1 hour. If you did not request this, ignore this email.</p>
        </div>
      `,
    });
  }
}
