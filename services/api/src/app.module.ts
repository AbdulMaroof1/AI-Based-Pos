import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { TenantModule } from './tenant/tenant.module';
import { ModuleAccessModule } from './module-access/module-access.module';
import { AccountingModule } from './accounting/accounting.module';
import { PrismaModule } from './prisma/prisma.module';
import { EmailModule } from './common/email/email.module';
import { CommonModule } from './common/common.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../../.env'],
    }),
    PrismaModule,
    EmailModule,
    CommonModule,
    TenantModule,
    ModuleAccessModule,
    AccountingModule,
    AuthModule,
  ],
})
export class AppModule {}
