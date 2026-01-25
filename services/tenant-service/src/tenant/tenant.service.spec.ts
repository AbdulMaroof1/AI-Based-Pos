import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { TenantService } from './tenant.service';
import { PrismaService } from '../prisma/prisma.service';
import type { CreateTenantDto, CreateBranchDto } from '../../types';

describe('TenantService', () => {
  let service: TenantService;
  let prisma: PrismaService;

  const mockPrismaService = {
    tenant: {
      findUnique: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    branch: {
      findUnique: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TenantService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<TenantService>(TenantService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  describe('createTenant', () => {
    const createTenantDto: CreateTenantDto = {
      name: 'Test Tenant',
      email: 'tenant@example.com',
      phone: '1234567890',
      address: '123 Main St',
    };

    it('should create a tenant successfully', async () => {
      mockPrismaService.tenant.findUnique.mockResolvedValue(null);
      mockPrismaService.tenant.create.mockResolvedValue({
        id: 'tenant-id',
        ...createTenantDto,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await service.createTenant(createTenantDto);

      expect(result.name).toBe(createTenantDto.name);
      expect(result.email).toBe(createTenantDto.email);
      expect(mockPrismaService.tenant.create).toHaveBeenCalled();
    });

    it('should throw ConflictException if tenant email exists', async () => {
      mockPrismaService.tenant.findUnique.mockResolvedValue({
        id: 'existing-tenant-id',
        email: createTenantDto.email,
      });

      await expect(service.createTenant(createTenantDto)).rejects.toThrow(ConflictException);
      expect(mockPrismaService.tenant.create).not.toHaveBeenCalled();
    });
  });

  describe('getTenant', () => {
    it('should return a tenant by id', async () => {
      const mockTenant = {
        id: 'tenant-id',
        name: 'Test Tenant',
        email: 'tenant@example.com',
        phone: '1234567890',
        address: '123 Main St',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.tenant.findUnique.mockResolvedValue(mockTenant);

      const result = await service.getTenant('tenant-id');

      expect(result).toEqual(mockTenant);
      expect(mockPrismaService.tenant.findUnique).toHaveBeenCalledWith({
        where: { id: 'tenant-id' },
      });
    });

    it('should throw NotFoundException if tenant not found', async () => {
      mockPrismaService.tenant.findUnique.mockResolvedValue(null);

      await expect(service.getTenant('non-existent-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getTenants', () => {
    it('should return paginated tenants', async () => {
      const mockTenants = [
        {
          id: 'tenant-1',
          name: 'Tenant 1',
          email: 'tenant1@example.com',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrismaService.tenant.findMany.mockResolvedValue(mockTenants);
      mockPrismaService.tenant.count.mockResolvedValue(1);

      const result = await service.getTenants({ page: 1, limit: 10 });

      expect(result.data).toEqual(mockTenants);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });
  });

  describe('updateTenant', () => {
    it('should update a tenant', async () => {
      const existingTenant = {
        id: 'tenant-id',
        name: 'Old Name',
        email: 'old@example.com',
        isActive: true,
      };

      const updateDto = {
        name: 'New Name',
      };

      mockPrismaService.tenant.findUnique
        .mockResolvedValueOnce(existingTenant)
        .mockResolvedValueOnce(null);

      mockPrismaService.tenant.update.mockResolvedValue({
        ...existingTenant,
        ...updateDto,
      });

      const result = await service.updateTenant('tenant-id', updateDto);

      expect(result.name).toBe('New Name');
      expect(mockPrismaService.tenant.update).toHaveBeenCalled();
    });

    it('should throw NotFoundException if tenant not found', async () => {
      mockPrismaService.tenant.findUnique.mockResolvedValue(null);

      await expect(service.updateTenant('non-existent-id', {})).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe('createBranch', () => {
    const createBranchDto: CreateBranchDto = {
      tenantId: 'tenant-id',
      name: 'Branch 1',
      address: '456 Branch St',
    };

    it('should create a branch successfully', async () => {
      mockPrismaService.tenant.findUnique.mockResolvedValue({
        id: 'tenant-id',
        name: 'Test Tenant',
      });

      mockPrismaService.branch.create.mockResolvedValue({
        id: 'branch-id',
        ...createBranchDto,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await service.createBranch(createBranchDto);

      expect(result.name).toBe(createBranchDto.name);
      expect(result.tenantId).toBe(createBranchDto.tenantId);
    });

    it('should throw NotFoundException if tenant not found', async () => {
      mockPrismaService.tenant.findUnique.mockResolvedValue(null);

      await expect(service.createBranch(createBranchDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getBranches', () => {
    it('should return branches for a tenant', async () => {
      const mockBranches = [
        {
          id: 'branch-1',
          tenantId: 'tenant-id',
          name: 'Branch 1',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrismaService.tenant.findUnique.mockResolvedValue({
        id: 'tenant-id',
        name: 'Test Tenant',
      });

      mockPrismaService.branch.findMany.mockResolvedValue(mockBranches);

      const result = await service.getBranches('tenant-id');

      expect(result).toEqual(mockBranches);
    });
  });
});

