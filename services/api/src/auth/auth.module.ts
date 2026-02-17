import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TenantModule } from '../tenant/tenant.module';
import { ModuleAccessModule } from '../module-access/module-access.module';

@Module({
  imports: [TenantModule, ModuleAccessModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
