import { db } from '@/lib/db';
import { ApiError } from '@/lib/errors';
import { setupDefaultPermissionsForTenant } from './module-access.service';
import type {
  CreateTenantDto,
  UpdateTenantDto,
  CreateBranchDto,
  TenantResponse,
  BranchResponse,
  PaginationParams,
  PaginatedResponse,
} from '@/lib/types';

export async function createTenant(
  dto: CreateTenantDto,
): Promise<TenantResponse> {
  const existing = await db.tenant.findUnique({ where: { email: dto.email } });
  if (existing) throw new ApiError('Tenant with this email already exists', 409);

  const now = new Date();
  const trialDays = dto.trialDays ?? 14;
  const trialEndAt = new Date(now);
  trialEndAt.setDate(trialEndAt.getDate() + trialDays);

  const tenant = await db.tenant.create({
    data: {
      name: dto.name,
      email: dto.email,
      phone: dto.phone,
      address: dto.address,
      isActive: dto.isActive ?? true,
      plan: dto.plan ?? 'TRIAL',
      trialStartAt: now,
      trialEndAt,
    },
  });

  await setupDefaultPermissionsForTenant(tenant.id, tenant.email);
  return tenant;
}

export async function getTenant(id: string): Promise<TenantResponse> {
  const tenant = await db.tenant.findUnique({ where: { id } });
  if (!tenant) throw new ApiError(`Tenant with ID ${id} not found`, 404);
  return tenant;
}

export async function getTenants(
  params?: PaginationParams,
): Promise<PaginatedResponse<TenantResponse>> {
  const page = params?.page || 1;
  const limit = params?.limit || 10;
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    db.tenant.findMany({
      skip,
      take: limit,
      orderBy: params?.sortBy
        ? { [params.sortBy]: params.sortOrder || 'asc' }
        : { createdAt: 'desc' },
    }),
    db.tenant.count(),
  ]);

  return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function updateTenant(
  id: string,
  dto: UpdateTenantDto,
): Promise<TenantResponse> {
  const tenant = await getTenant(id);

  if (dto.email && dto.email !== tenant.email) {
    const dup = await db.tenant.findUnique({ where: { email: dto.email } });
    if (dup) throw new ApiError('Tenant with this email already exists', 409);
  }

  return db.tenant.update({ where: { id }, data: dto });
}

export async function deleteTenant(id: string): Promise<void> {
  await getTenant(id);
  await db.tenant.delete({ where: { id } });
}

export async function createBranch(
  dto: CreateBranchDto,
): Promise<BranchResponse> {
  await getTenant(dto.tenantId);
  return db.branch.create({
    data: {
      tenantId: dto.tenantId,
      name: dto.name,
      address: dto.address,
      phone: dto.phone,
      isActive: dto.isActive ?? true,
    },
  });
}

export async function getBranches(
  tenantId: string,
): Promise<BranchResponse[]> {
  await getTenant(tenantId);
  return db.branch.findMany({
    where: { tenantId },
    orderBy: { createdAt: 'desc' },
  });
}
