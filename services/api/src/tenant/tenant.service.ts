import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ModuleAccessService } from '../module-access/module-access.service';
import type {
  CreateTenantDto,
  UpdateTenantDto,
  CreateBranchDto,
  UpdateBranchDto,
  TenantResponse,
  BranchResponse,
} from '../../types';
import { PaginationParams, PaginatedResponse } from '@pos/shared-types';

@Injectable()
export class TenantService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly moduleAccessService: ModuleAccessService,
  ) {}

  async createTenant(dto: CreateTenantDto): Promise<TenantResponse> {
    const existingTenant = await this.prisma.tenant.findUnique({
      where: { email: dto.email },
    });

    if (existingTenant) {
      throw new ConflictException('Tenant with this email already exists');
    }

    const now = new Date();
    const trialDays = dto.trialDays ?? 14;
    const trialEndAt = new Date(now);
    trialEndAt.setDate(trialEndAt.getDate() + trialDays);

    const tenant = await this.prisma.tenant.create({
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

    await this.moduleAccessService.setupDefaultPermissionsForTenant(tenant.id, tenant.email);

    return tenant;
  }

  async getTenant(id: string): Promise<TenantResponse> {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id },
    });

    if (!tenant) {
      throw new NotFoundException(`Tenant with ID ${id} not found`);
    }

    return tenant;
  }

  async getTenants(params?: PaginationParams): Promise<PaginatedResponse<TenantResponse>> {
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.tenant.findMany({
        skip,
        take: limit,
        orderBy: params?.sortBy
          ? { [params.sortBy]: params.sortOrder || 'asc' }
          : { createdAt: 'desc' },
      }),
      this.prisma.tenant.count(),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async updateTenant(id: string, dto: UpdateTenantDto): Promise<TenantResponse> {
    const tenant = await this.getTenant(id);

    if (dto.email && dto.email !== tenant.email) {
      const existingTenant = await this.prisma.tenant.findUnique({
        where: { email: dto.email },
      });

      if (existingTenant) {
        throw new ConflictException('Tenant with this email already exists');
      }
    }

    const updated = await this.prisma.tenant.update({
      where: { id },
      data: dto,
    });

    return updated;
  }

  async deleteTenant(id: string): Promise<void> {
    await this.getTenant(id);
    await this.prisma.tenant.delete({
      where: { id },
    });
  }

  async createBranch(dto: CreateBranchDto): Promise<BranchResponse> {
    await this.getTenant(dto.tenantId);

    const branch = await this.prisma.branch.create({
      data: {
        tenantId: dto.tenantId,
        name: dto.name,
        address: dto.address,
        phone: dto.phone,
        isActive: dto.isActive ?? true,
      },
    });

    return branch;
  }

  async getBranch(id: string): Promise<BranchResponse> {
    const branch = await this.prisma.branch.findUnique({
      where: { id },
    });

    if (!branch) {
      throw new NotFoundException(`Branch with ID ${id} not found`);
    }

    return branch;
  }

  async getBranches(tenantId: string): Promise<BranchResponse[]> {
    await this.getTenant(tenantId);

    const branches = await this.prisma.branch.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });

    return branches;
  }

  async updateBranch(id: string, dto: UpdateBranchDto): Promise<BranchResponse> {
    await this.getBranch(id);

    const updated = await this.prisma.branch.update({
      where: { id },
      data: dto,
    });

    return updated;
  }

  async deleteBranch(id: string): Promise<void> {
    await this.getBranch(id);
    await this.prisma.branch.delete({
      where: { id },
    });
  }
}
