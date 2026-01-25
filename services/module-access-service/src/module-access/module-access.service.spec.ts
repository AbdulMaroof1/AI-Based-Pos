import { Test, TestingModule } from '@nestjs/testing';
import { ModuleAccessService } from './module-access.service';
import { PrismaService } from '../prisma/prisma.service';
import { ModuleName } from '@pos/shared-types';

describe('ModuleAccessService', () => {
  let service: ModuleAccessService;
  let prisma: PrismaService;

  const mockPrismaService = {
    modulePermission: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      upsert: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ModuleAccessService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ModuleAccessService>(ModuleAccessService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  describe('getModulePermissions', () => {
    it('should return all module permissions for a tenant', async () => {
      const mockPermissions = [
        {
          tenantId: 'tenant-id',
          moduleName: ModuleName.POS,
          isEnabled: true,
        },
        {
          tenantId: 'tenant-id',
          moduleName: ModuleName.INVENTORY,
          isEnabled: false,
        },
      ];

      mockPrismaService.modulePermission.findMany.mockResolvedValue(mockPermissions);

      const result = await service.getModulePermissions('tenant-id');

      expect(result.tenantId).toBe('tenant-id');
      expect(result.permissions.length).toBeGreaterThan(0);
      expect(result.permissions.find((p) => p.moduleName === ModuleName.POS)?.isEnabled).toBe(true);
    });
  });

  describe('updateModulePermission', () => {
    it('should update module permission', async () => {
      const mockPermission = {
        tenantId: 'tenant-id',
        moduleName: ModuleName.POS,
        isEnabled: true,
      };

      mockPrismaService.modulePermission.upsert.mockResolvedValue(mockPermission);

      const result = await service.updateModulePermission('tenant-id', ModuleName.POS, {
        isEnabled: true,
        enabledBy: 'admin-id',
      });

      expect(result.isEnabled).toBe(true);
      expect(mockPrismaService.modulePermission.upsert).toHaveBeenCalled();
    });
  });

  describe('isModuleEnabled', () => {
    it('should return true if module is enabled', async () => {
      mockPrismaService.modulePermission.findUnique.mockResolvedValue({
        tenantId: 'tenant-id',
        moduleName: ModuleName.POS,
        isEnabled: true,
      });

      const result = await service.isModuleEnabled('tenant-id', ModuleName.POS);

      expect(result).toBe(true);
    });

    it('should return false if module is not enabled', async () => {
      mockPrismaService.modulePermission.findUnique.mockResolvedValue({
        tenantId: 'tenant-id',
        moduleName: ModuleName.POS,
        isEnabled: false,
      });

      const result = await service.isModuleEnabled('tenant-id', ModuleName.POS);

      expect(result).toBe(false);
    });

    it('should return false if permission does not exist', async () => {
      mockPrismaService.modulePermission.findUnique.mockResolvedValue(null);

      const result = await service.isModuleEnabled('tenant-id', ModuleName.POS);

      expect(result).toBe(false);
    });
  });

  describe('enableModule', () => {
    it('should enable a module', async () => {
      const mockPermission = {
        tenantId: 'tenant-id',
        moduleName: ModuleName.POS,
        isEnabled: true,
      };

      mockPrismaService.modulePermission.upsert.mockResolvedValue(mockPermission);

      await service.enableModule('tenant-id', ModuleName.POS, 'admin-id');

      expect(mockPrismaService.modulePermission.upsert).toHaveBeenCalledWith({
        where: {
          tenantId_moduleName: {
            tenantId: 'tenant-id',
            moduleName: ModuleName.POS,
          },
        },
        update: expect.objectContaining({
          isEnabled: true,
        }),
        create: expect.objectContaining({
          isEnabled: true,
        }),
      });
    });
  });

  describe('disableModule', () => {
    it('should disable a module', async () => {
      const mockPermission = {
        tenantId: 'tenant-id',
        moduleName: ModuleName.POS,
        isEnabled: false,
      };

      mockPrismaService.modulePermission.upsert.mockResolvedValue(mockPermission);

      await service.disableModule('tenant-id', ModuleName.POS, 'admin-id');

      expect(mockPrismaService.modulePermission.upsert).toHaveBeenCalledWith({
        where: {
          tenantId_moduleName: {
            tenantId: 'tenant-id',
            moduleName: ModuleName.POS,
          },
        },
        update: expect.objectContaining({
          isEnabled: false,
        }),
        create: expect.objectContaining({
          isEnabled: false,
        }),
      });
    });
  });
});

