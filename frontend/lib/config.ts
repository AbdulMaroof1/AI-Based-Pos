import { ServiceConfig } from './types';

let cached: ServiceConfig | null = null;

export function getConfig(): ServiceConfig {
  if (cached) return cached;

  cached = {
    jwtSecret:
      process.env.JWT_SECRET ||
      'your-secret-key-change-in-production-min-32-chars-please-change-this',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '15m',
    refreshTokenSecret:
      process.env.REFRESH_TOKEN_SECRET ||
      'your-refresh-secret-change-in-production-min-32-chars-please-change-this',
    refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
    smtpHost: process.env.SMTP_HOST,
    smtpPort: process.env.SMTP_PORT
      ? parseInt(process.env.SMTP_PORT, 10)
      : undefined,
    smtpUser: process.env.SMTP_USER,
    smtpPass: process.env.SMTP_PASS,
    smtpFrom: process.env.SMTP_FROM || 'noreply@abmnext.com',
  };

  return cached;
}
