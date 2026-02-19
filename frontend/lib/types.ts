export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  CASHIER = 'CASHIER',
  STAFF = 'STAFF',
}

export enum ModuleName {
  POS = 'POS',
  INVENTORY = 'INVENTORY',
  ACCOUNTING = 'ACCOUNTING',
  LOYALTY = 'LOYALTY',
  ECOMMERCE = 'ECOMMERCE',
  AI = 'AI',
  CRM = 'CRM',
}

export interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
  tenantId?: string;
  branchId?: string;
}

export interface ServiceConfig {
  jwtSecret: string;
  jwtExpiresIn: string;
  refreshTokenSecret: string;
  refreshTokenExpiresIn: string;
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPass?: string;
  smtpFrom?: string;
}

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

export interface SetupAccountDto {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  country: string;
  companyName: string;
  phone?: string;
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
