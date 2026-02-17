import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ModuleName } from '@pos/shared-types';
import type { UpdateModulePermissionDto, TenantModulePermissions } from '../../types';

@Injectable()
export class ModuleAccessService implements OnModuleInit {
  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit(): Promise<void> {
    await this.ensureActiveModulesSeed();
    await this.backfillTenantModulePermissions();
  }

  private async backfillTenantModulePermissions(): Promise<void> {
    const tenants = await this.prisma.tenant.findMany({ select: { id: true, email: true } });
    const activeModules = await this.prisma.systemModuleConfig.findMany({
      where: { isActive: true },
    });
    for (const tenant of tenants) {
      const count = await this.prisma.modulePermission.count({
        where: { tenantId: tenant.id },
      });
      if (count > 0) continue;
      const now = new Date();
      for (const mod of activeModules) {
        if (mod.moduleName === 'SETTINGS') continue;
        await this.prisma.modulePermission.upsert({
          where: {
            tenantId_moduleName: { tenantId: tenant.id, moduleName: mod.moduleName },
          },
          update: {},
          create: {
            tenantId: tenant.id,
            moduleName: mod.moduleName,
            isEnabled: true,
            enabledAt: now,
            enabledBy: tenant.email,
          },
        });
      }
    }
  }

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
        tenantId_moduleName: { tenantId, moduleName },
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

  async isModuleEnabled(tenantId: string, moduleName: string): Promise<boolean> {
    const permission = await this.prisma.modulePermission.findUnique({
      where: {
        tenantId_moduleName: { tenantId, moduleName: moduleName as ModuleName },
      },
    });
    return permission?.isEnabled ?? false;
  }

  async enableModule(tenantId: string, moduleName: ModuleName, enabledBy?: string): Promise<void> {
    await this.updateModulePermission(tenantId, moduleName, { isEnabled: true, enabledBy });
  }

  async disableModule(tenantId: string, moduleName: ModuleName, enabledBy?: string): Promise<void> {
    await this.updateModulePermission(tenantId, moduleName, { isEnabled: false, enabledBy });
  }

  async setModuleActive(moduleName: string, isActive: boolean): Promise<void> {
    await this.prisma.systemModuleConfig.upsert({
      where: { moduleName },
      update: { isActive },
      create: {
        moduleName,
        isActive,
        phase: 0,
        displayOrder: 0,
        label: moduleName,
        href: `/dashboard/${moduleName.toLowerCase()}`,
      },
    });
  }

  async getActiveModules(): Promise<{ moduleName: string; label: string; href: string; displayOrder: number }[]> {
    const configs = await this.prisma.systemModuleConfig.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' },
    });
    return configs.map((c) => ({
      moduleName: c.moduleName,
      label: c.label,
      href: c.href,
      displayOrder: c.displayOrder,
    }));
  }

  async setupDefaultPermissionsForTenant(tenantId: string, enabledBy: string): Promise<void> {
    const activeModules = await this.prisma.systemModuleConfig.findMany({
      where: { isActive: true },
    });
    const now = new Date();
    for (const mod of activeModules) {
      if (mod.moduleName === 'SETTINGS') continue;
      await this.prisma.modulePermission.upsert({
        where: {
          tenantId_moduleName: { tenantId, moduleName: mod.moduleName },
        },
        update: {},
        create: {
          tenantId,
          moduleName: mod.moduleName,
          isEnabled: true,
          enabledAt: now,
          enabledBy,
        },
      });
    }
  }

  async ensureActiveModulesSeed(): Promise<void> {
    const count = await this.prisma.systemModuleConfig.count();
    if (count > 0) return;

    await this.prisma.systemModuleConfig.createMany({
      data: [
        { moduleName: 'ACCOUNTING', isActive: true, phase: 1, displayOrder: 1, label: 'Accounting', href: '/dashboard/accounting' },
        { moduleName: 'SETTINGS', isActive: true, phase: 0, displayOrder: 100, label: 'ABMNEXT ERP Settings', href: '/dashboard/settings' },
      ],
    });
  }
}
