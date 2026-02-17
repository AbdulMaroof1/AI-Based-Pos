import { Global, Module } from '@nestjs/common';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { TenantGuard } from './guards/tenant.guard';
import { TrialGuard } from './guards/trial.guard';
import { SuperAdminGuard } from './guards/super-admin.guard';
import { ModuleAccessGuard } from './guards/module-access.guard';
import { PrismaModule } from '../prisma/prisma.module';
import { ModuleAccessModule } from '../module-access/module-access.module';

@Global()
@Module({
  imports: [PrismaModule, ModuleAccessModule],
  providers: [JwtAuthGuard, TenantGuard, TrialGuard, SuperAdminGuard, ModuleAccessGuard],
  exports: [JwtAuthGuard, TenantGuard, TrialGuard, SuperAdminGuard, ModuleAccessGuard],
})
export class CommonModule {}
