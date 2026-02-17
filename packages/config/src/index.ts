import { ServiceConfig } from '@pos/shared-types';

export function getConfig(): ServiceConfig {
  return {
    port: parseInt(process.env.PORT || '3000', 10),
    host: process.env.HOST || 'localhost',
    databaseUrl: process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/pos_db',
    jwtSecret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '15m',
    refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET || 'your-refresh-secret-change-in-production',
    refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
    smtpHost: process.env.SMTP_HOST,
    smtpPort: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : undefined,
    smtpUser: process.env.SMTP_USER,
    smtpPass: process.env.SMTP_PASS,
    smtpFrom: process.env.SMTP_FROM || 'noreply@abmnext.com',
    tenantServiceUrl: process.env.TENANT_SERVICE_URL || 'http://localhost:3001',
    moduleAccessServiceUrl: process.env.MODULE_ACCESS_SERVICE_URL || 'http://localhost:3002',
  };
}

