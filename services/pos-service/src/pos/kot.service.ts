import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type {
  CreateKotDto,
  UpdateKotStatusDto,
  KotResponse,
} from '../../types';
import { KotStatus } from '../../types';

@Injectable()
export class KotService {
  constructor(private readonly prisma: PrismaService) {}

  async createKot(dto: CreateKotDto): Promise<KotResponse> {
    const order = await this.prisma.order.findUnique({
      where: { id: dto.orderId },
      include: {
        items: true,
        kot: true,
      },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${dto.orderId} not found`);
    }

    if (order.kot) {
      throw new NotFoundException(`KOT already exists for order ${dto.orderId}`);
    }

    // Create KOT with items
    const kot = await this.prisma.kot.create({
      data: {
        orderId: dto.orderId,
        kitchenId: dto.kitchenId || null,
        status: KotStatus.PENDING,
        items: {
          create: order.items.map((item) => ({
            orderItemId: item.id,
            productName: `Product-${item.productId}`, // Will be replaced with actual product name from Inventory API
            quantity: item.quantity,
            status: KotStatus.PENDING,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    return this.mapToResponse(kot);
  }

  async getKot(id: string): Promise<KotResponse> {
    const kot = await this.prisma.kot.findUnique({
      where: { id },
      include: {
        items: true,
      },
    });

    if (!kot) {
      throw new NotFoundException(`KOT with ID ${id} not found`);
    }

    return this.mapToResponse(kot);
  }

  async getKotByOrder(orderId: string): Promise<KotResponse> {
    const kot = await this.prisma.kot.findUnique({
      where: { orderId },
      include: {
        items: true,
      },
    });

    if (!kot) {
      throw new NotFoundException(`KOT for order ${orderId} not found`);
    }

    return this.mapToResponse(kot);
  }

  async updateKotStatus(
    id: string,
    dto: UpdateKotStatusDto
  ): Promise<KotResponse> {
    await this.getKot(id);

    const updated = await this.prisma.kot.update({
      where: { id },
      data: { status: dto.status },
      include: {
        items: true,
      },
    });

    return this.mapToResponse(updated);
  }

  async updateKotItemStatus(
    kotId: string,
    itemId: string,
    status: KotStatus
  ): Promise<KotResponse> {
    await this.getKot(kotId);

    await this.prisma.kotItem.update({
      where: { id: itemId },
      data: { status },
    });

    return this.getKot(kotId);
  }

  private mapToResponse(kot: {
    id: string;
    orderId: string;
    kitchenId: string | null;
    status: string;
    createdAt: Date;
    updatedAt: Date;
    items: {
      id: string;
      kotId: string;
      orderItemId: string;
      productName: string;
      quantity: number;
      status: string;
    }[];
  }): KotResponse {
    return {
      id: kot.id,
      orderId: kot.orderId,
      kitchenId: kot.kitchenId,
      status: kot.status as KotStatus,
      items: kot.items.map((item) => ({
        id: item.id,
        kotId: item.kotId,
        orderItemId: item.orderItemId,
        productName: item.productName,
        quantity: item.quantity,
        status: item.status as KotStatus,
      })),
      createdAt: kot.createdAt,
      updatedAt: kot.updatedAt,
    };
  }
}

