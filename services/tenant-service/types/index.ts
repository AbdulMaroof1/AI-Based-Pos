export interface CreateTenantDto {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  isActive?: boolean;
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

