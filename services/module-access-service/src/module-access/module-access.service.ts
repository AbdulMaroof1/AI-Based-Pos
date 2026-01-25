import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ModuleName } from '@pos/shared-types';
import type { UpdateModulePermissionDto, TenantModulePermissions } from '../../types';

@Injectable()
export class ModuleAccessService {
  constructor(private readonly prisma: PrismaService) {}

  async getModulePermissions(tenantId: string): Promise<TenantModulePermissions> {
    const permissions = await this.prisma.modulePermission.findMany({
      where: { tenantId },
    });

    const allModules = Object.values(ModuleName);
    const permissionMap = new Map(
      permissions.map((p) => [p.moduleName, { moduleName: p.moduleName, isEnabled: p.isEnabled }])
    );

    const allPermissions = allModules.map((moduleName) => {
      const existing = permissionMap.get(moduleName);
      return {
        moduleName,
        isEnabled: existing?.isEnabled ?? false,
      };
    });

    return {
      tenantId,
      permissions: allPermissions,
    };
  }

  async updateModulePermission(
    tenantId: string,
    moduleName: ModuleName,
    dto: UpdateModulePermissionDto
  ): Promise<{ tenantId: string; moduleName: ModuleName; isEnabled: boolean }> {
    const now = new Date();

    const permission = await this.prisma.modulePermission.upsert({
      where: {
        tenantId_moduleName: {
          tenantId,
          moduleName,
        },
      },
      update: {
        isEnabled: dto.isEnabled,
        enabledAt: dto.isEnabled ? now : undefined,
        disabledAt: dto.isEnabled ? undefined : now,
        enabledBy: dto.enabledBy,
        updatedAt: now,
      },
      create: {
        tenantId,
        moduleName,
        isEnabled: dto.isEnabled,
        enabledAt: dto.isEnabled ? now : undefined,
        disabledAt: dto.isEnabled ? undefined : now,
        enabledBy: dto.enabledBy,
      },
    });

    return {
      tenantId: permission.tenantId,
      moduleName: permission.moduleName as ModuleName,
      isEnabled: permission.isEnabled,
    };
  }

  async isModuleEnabled(tenantId: string, moduleName: ModuleName): Promise<boolean> {
    const permission = await this.prisma.modulePermission.findUnique({
      where: {
        tenantId_moduleName: {
          tenantId,
          moduleName,
        },
      },
    });

    return permission?.isEnabled ?? false;
  }

  async enableModule(
    tenantId: string,
    moduleName: ModuleName,
    enabledBy?: string
  ): Promise<void> {
    await this.updateModulePermission(tenantId, moduleName, {
      isEnabled: true,
      enabledBy,
    });
  }

  async disableModule(
    tenantId: string,
    moduleName: ModuleName,
    enabledBy?: string
  ): Promise<void> {
    await this.updateModulePermission(tenantId, moduleName, {
      isEnabled: false,
      enabledBy,
    });
  }

  async getEnabledModules(tenantId: string): Promise<ModuleName[]> {
    const permissions = await this.prisma.modulePermission.findMany({
      where: {
        tenantId,
        isEnabled: true,
      },
    });

    return permissions.map((p) => p.moduleName as ModuleName);
  }
}

