import { Controller, Get, Put, Post, Body, Param, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ModuleAccessService } from './module-access.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { TrialGuard } from '../common/guards/trial.guard';

import { ModuleName } from '@pos/shared-types';
import type { UpdateModulePermissionDto } from '../../types';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

class UpdateModulePermissionRequest implements UpdateModulePermissionDto {
  @IsBoolean()
  isEnabled!: boolean;

  @IsOptional()
  @IsString()
  enabledBy?: string;
}

@Controller('modules')
@UseGuards(JwtAuthGuard, TrialGuard)
export class ModuleAccessController {
  constructor(private readonly moduleAccessService: ModuleAccessService) {}

  @Get('active')
  async getActiveModules() {
    const result = await this.moduleAccessService.getActiveModules();
    return { success: true, data: result };
  }

  @Put('config/:moduleName')
  @HttpCode(HttpStatus.OK)
  async setModuleActive(
    @Param('moduleName') moduleName: string,
    @Body() body: { isActive: boolean }
  ) {
    await this.moduleAccessService.setModuleActive(moduleName, body.isActive);
    return {
      success: true,
      message: `Module ${moduleName} ${body.isActive ? 'enabled' : 'disabled'}`,
    };
  }

  @Post('setup-tenant')
  @HttpCode(HttpStatus.OK)
  async setupTenant(@Body() body: { tenantId: string; enabledBy: string }) {
    await this.moduleAccessService.setupDefaultPermissionsForTenant(body.tenantId, body.enabledBy);
    return { success: true, message: 'Default modules enabled for tenant' };
  }

  @Get(':tenantId/permissions')
  async getModulePermissions(@Param('tenantId') tenantId: string) {
    const result = await this.moduleAccessService.getModulePermissions(tenantId);
    return { success: true, data: result };
  }

  @Put(':tenantId/permissions/:moduleName')
  @HttpCode(HttpStatus.OK)
  async updateModulePermission(
    @Param('tenantId') tenantId: string,
    @Param('moduleName') moduleName: ModuleName,
    @Body() dto: UpdateModulePermissionRequest
  ) {
    const result = await this.moduleAccessService.updateModulePermission(tenantId, moduleName, dto);
    return { success: true, data: result };
  }

  @Get(':tenantId/check/:moduleName')
  async checkModuleAccess(
    @Param('tenantId') tenantId: string,
    @Param('moduleName') moduleName: ModuleName
  ) {
    const isEnabled = await this.moduleAccessService.isModuleEnabled(tenantId, moduleName);
    return { success: true, data: { tenantId, moduleName, isEnabled } };
  }

  @Put(':tenantId/enable/:moduleName')
  @HttpCode(HttpStatus.OK)
  async enableModule(
    @Param('tenantId') tenantId: string,
    @Param('moduleName') moduleName: ModuleName,
    @Body() body?: { enabledBy?: string }
  ) {
    await this.moduleAccessService.enableModule(tenantId, moduleName, body?.enabledBy);
    return { success: true, message: `Module ${moduleName} enabled for tenant ${tenantId}` };
  }

  @Put(':tenantId/disable/:moduleName')
  @HttpCode(HttpStatus.OK)
  async disableModule(
    @Param('tenantId') tenantId: string,
    @Param('moduleName') moduleName: ModuleName,
    @Body() body?: { enabledBy?: string }
  ) {
    await this.moduleAccessService.disableModule(tenantId, moduleName, body?.enabledBy);
    return { success: true, message: `Module ${moduleName} disabled for tenant ${tenantId}` };
  }
}
