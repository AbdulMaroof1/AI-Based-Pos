import { Test, TestingModule } from '@nestjs/testing';
import { OrderService } from './order.service';
import { PrismaService } from '../prisma/prisma.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import type { CreateOrderDto } from '../../types';
import { OrderType, OrderStatus } from '../../types';
import { Decimal } from '@prisma/client/runtime/library';

describe('OrderService', () => {
  let service: OrderService;
  let prisma: PrismaService;

  const mockPrismaService = {
    order: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      deleteMany: jest.fn(),
    },
    orderItem: {
      deleteMany: jest.fn(),
    },
    table: {
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<OrderService>(OrderService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  describe('createOrder', () => {
    const createOrderDto: CreateOrderDto = {
      branchId: 'branch-id',
      orderType: OrderType.DINE_IN,
      items: [
        {
          productId: 'product-1',
          quantity: 2,
          price: 10.0,
        },
      ],
    };

    it('should create an order successfully', async () => {
      const mockOrder = {
        id: 'order-id',
        ...createOrderDto,
        tableId: null,
        status: OrderStatus.PENDING,
        customerId: null,
        subtotal: new Decimal(20),
        tax: new Decimal(2),
        serviceCharge: new Decimal(1),
        discount: new Decimal(0),
        total: new Decimal(23),
        notes: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        items: [
          {
            id: 'item-id',
            orderId: 'order-id',
            productId: 'product-1',
            quantity: 2,
            price: new Decimal(10),
            subtotal: new Decimal(20),
            modifiers: [],
            notes: null,
          },
        ],
      };

      mockPrismaService.order.create.mockResolvedValue(mockOrder);

      const result = await service.createOrder(createOrderDto);

      expect(result.items.length).toBe(1);
      expect(result.total).toBe(23);
    });

    it('should throw BadRequestException if no items', async () => {
      await expect(
        service.createOrder({ ...createOrderDto, items: [] })
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('splitBill', () => {
    it('should split an order successfully', async () => {
      const mockOrder = {
        id: 'order-id',
        branchId: 'branch-id',
        tableId: 'table-id',
        orderType: OrderType.DINE_IN,
        status: OrderStatus.PENDING,
        customerId: null,
        subtotal: new Decimal(100),
        tax: new Decimal(10),
        serviceCharge: new Decimal(5),
        discount: new Decimal(0),
        total: new Decimal(115),
        items: [
          {
            id: 'item-1',
            orderId: 'order-id',
            productId: 'product-1',
            quantity: 1,
            price: new Decimal(50),
            subtotal: new Decimal(50),
            modifiers: [],
            notes: null,
          },
          {
            id: 'item-2',
            orderId: 'order-id',
            productId: 'product-2',
            quantity: 1,
            price: new Decimal(50),
            subtotal: new Decimal(50),
            modifiers: [],
            notes: null,
          },
        ],
      };

      mockPrismaService.order.findUnique.mockResolvedValue(mockOrder);
      mockPrismaService.orderItem.deleteMany.mockResolvedValue({ count: 1 });
      mockPrismaService.order.create.mockResolvedValue({
        ...mockOrder,
        id: 'new-order-id',
        items: [mockOrder.items[0]],
      });
      mockPrismaService.order.update.mockResolvedValue({
        ...mockOrder,
        items: [mockOrder.items[1]],
      });

      const result = await service.splitBill({
        orderId: 'order-id',
        items: ['item-1'],
      });

      expect(result.length).toBe(2);
    });
  });
});

