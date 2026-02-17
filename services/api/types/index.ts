import { UserRole } from '@pos/shared-types';

export interface CreateTenantDto {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  isActive?: boolean;
  plan?: string;
  trialDays?: number;
}

export interface UpdateTenantDto {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  isActive?: boolean;
}

export interface CreateBranchDto {
  tenantId: string;
  name: string;
  address?: string;
  phone?: string;
  isActive?: boolean;
}

export interface UpdateBranchDto {
  name?: string;
  address?: string;
  phone?: string;
  isActive?: boolean;
}

export interface TenantResponse {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface BranchResponse {
  id: string;
  tenantId: string;
  name: string;
  address: string | null;
  phone: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateModulePermissionDto {
  isEnabled: boolean;
  enabledBy?: string;
}

export interface TenantModulePermissions {
  tenantId: string;
  permissions: { moduleName: string; isEnabled: boolean }[];
}

export interface RequestOtpDto {
  email: string;
}

export interface VerifyOtpDto {
  email: string;
  code: string;
}

export interface SetupAccountDto {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  country: string;
  companyName: string;
  phone?: string;
}

export interface CreateUserDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  tenantId?: string;
  branchId?: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    tenantId?: string;
    branchId?: string;
  };
}

export interface RefreshTokenDto {
  refreshToken: string;
}

export interface VerifyOtpResponse {
  needsSetup: boolean;
  setupToken?: string;
  accessToken?: string;
  refreshToken?: string;
  user?: AuthResponse['user'];
}

export interface SetupAccountResponse extends AuthResponse {}
