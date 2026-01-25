import { ModuleName } from '@pos/shared-types';

export interface ModulePermission {
  tenantId: string;
  moduleName: ModuleName;
  isEnabled: boolean;
  enabledAt?: Date;
  disabledAt?: Date;
  enabledBy?: string;
}

export interface UpdateModulePermissionDto {
  isEnabled: boolean;
  enabledBy?: string;
}

export interface TenantModulePermissions {
  tenantId: string;
  permissions: {
    moduleName: ModuleName;
    isEnabled: boolean;
  }[];
}

