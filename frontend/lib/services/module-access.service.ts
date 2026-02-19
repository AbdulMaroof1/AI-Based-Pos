import { db } from '@/lib/db';
import { ModuleName, UpdateModulePermissionDto, TenantModulePermissions } from '@/lib/types';

export async function ensureModuleSeed(): Promise<void> {
  const count = await db.systemModuleConfig.count();
  if (count > 0) return;

  await db.systemModuleConfig.createMany({
    data: [
      {
        moduleName: 'ACCOUNTING',
        isActive: true,
        phase: 1,
        displayOrder: 1,
        label: 'Accounting',
        href: '/dashboard/accounting',
      },
      {
        moduleName: 'SETTINGS',
        isActive: true,
        phase: 0,
        displayOrder: 100,
        label: 'ABMNEXT ERP Settings',
        href: '/dashboard/settings',
      },
    ],
  });
}

export async function getActiveModules(): Promise<
  { moduleName: string; label: string; href: string; displayOrder: number }[]
> {
  await ensureModuleSeed();

  const configs = await db.systemModuleConfig.findMany({
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

export async function getModulePermissions(
  tenantId: string,
): Promise<TenantModulePermissions> {
  const permissions = await db.modulePermission.findMany({
    where: { tenantId },
  });

  const allModules = Object.values(ModuleName);
  const permissionMap = new Map(
    permissions.map((p) => [
      p.moduleName,
      { moduleName: p.moduleName, isEnabled: p.isEnabled },
    ]),
  );

  const allPermissions = allModules.map((moduleName) => {
    const existing = permissionMap.get(moduleName);
    return { moduleName, isEnabled: existing?.isEnabled ?? false };
  });

  return { tenantId, permissions: allPermissions };
}

export async function updateModulePermission(
  tenantId: string,
  moduleName: string,
  dto: UpdateModulePermissionDto,
): Promise<{ tenantId: string; moduleName: string; isEnabled: boolean }> {
  const now = new Date();

  const permission = await db.modulePermission.upsert({
    where: { tenantId_moduleName: { tenantId, moduleName } },
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
    moduleName: permission.moduleName,
    isEnabled: permission.isEnabled,
  };
}

export async function isModuleEnabled(
  tenantId: string,
  moduleName: string,
): Promise<boolean> {
  const permission = await db.modulePermission.findUnique({
    where: { tenantId_moduleName: { tenantId, moduleName } },
  });
  return permission?.isEnabled ?? false;
}

export async function enableModule(
  tenantId: string,
  moduleName: string,
  enabledBy?: string,
): Promise<void> {
  await updateModulePermission(tenantId, moduleName, {
    isEnabled: true,
    enabledBy,
  });
}

export async function disableModule(
  tenantId: string,
  moduleName: string,
  enabledBy?: string,
): Promise<void> {
  await updateModulePermission(tenantId, moduleName, {
    isEnabled: false,
    enabledBy,
  });
}

export async function setModuleActive(
  moduleName: string,
  isActive: boolean,
): Promise<void> {
  await db.systemModuleConfig.upsert({
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

export async function setupDefaultPermissionsForTenant(
  tenantId: string,
  enabledBy: string,
): Promise<void> {
  await ensureModuleSeed();

  const activeModules = await db.systemModuleConfig.findMany({
    where: { isActive: true },
  });

  const now = new Date();
  for (const mod of activeModules) {
    if (mod.moduleName === 'SETTINGS') continue;
    await db.modulePermission.upsert({
      where: { tenantId_moduleName: { tenantId, moduleName: mod.moduleName } },
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
