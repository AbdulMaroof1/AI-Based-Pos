import { Test, TestingModule } from '@nestjs/testing';
import { TableService } from './table.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, ConflictException } from '@nestjs/common';
import type { CreateTableDto } from '../../types';
import { TableStatus } from '../../types';

describe('TableService', () => {
  let service: TableService;
  let prisma: PrismaService;

  const mockPrismaService = {
    table: {
      findFirst: jest.fn(),
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TableService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<TableService>(TableService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  describe('createTable', () => {
    const createTableDto: CreateTableDto = {
      branchId: 'branch-id',
      tableNumber: 'T1',
      capacity: 4,
    };

    it('should create a table successfully', async () => {
      mockPrismaService.table.findFirst.mockResolvedValue(null);
      mockPrismaService.table.create.mockResolvedValue({
        id: 'table-id',
        ...createTableDto,
        status: TableStatus.AVAILABLE,
        currentOrderId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await service.createTable(createTableDto);

      expect(result.tableNumber).toBe(createTableDto.tableNumber);
      expect(result.capacity).toBe(createTableDto.capacity);
    });

    it('should throw ConflictException if table number exists', async () => {
      mockPrismaService.table.findFirst.mockResolvedValue({
        id: 'existing-table-id',
        tableNumber: createTableDto.tableNumber,
      });

      await expect(service.createTable(createTableDto)).rejects.toThrow(
        ConflictException
      );
    });
  });

  describe('getTable', () => {
    it('should return a table by id', async () => {
      const mockTable = {
        id: 'table-id',
        branchId: 'branch-id',
        tableNumber: 'T1',
        capacity: 4,
        status: TableStatus.AVAILABLE,
        currentOrderId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.table.findUnique.mockResolvedValue(mockTable);

      const result = await service.getTable('table-id');

      expect(result.id).toBe('table-id');
    });

    it('should throw NotFoundException if table not found', async () => {
      mockPrismaService.table.findUnique.mockResolvedValue(null);

      await expect(service.getTable('non-existent-id')).rejects.toThrow(
        NotFoundException
      );
    });
  });
});

