import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type {
  CreateOrderDto,
  SplitBillDto,
  MergeBillDto,
  ApplyDiscountDto,
  OrderResponse,
} from '../../types';
import { OrderStatus, OrderType } from '../../types';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class OrderService {
  constructor(private readonly prisma: PrismaService) {}

  async createOrder(dto: CreateOrderDto): Promise<OrderResponse> {
    if (dto.items.length === 0) {
      throw new BadRequestException('Order must have at least one item');
    }

    // Calculate totals
    let subtotal = new Decimal(0);
    const orderItems = dto.items.map((item) => {
      const itemSubtotal = new Decimal(item.price).times(item.quantity);
      subtotal = subtotal.plus(itemSubtotal);
      return {
        productId: item.productId,
        quantity: item.quantity,
        price: new Decimal(item.price),
        subtotal: itemSubtotal,
        modifiers: item.modifiers || [],
        notes: item.notes || null,
      };
    });

    const tax = subtotal.times(0.1); // 10% tax (configurable later)
    const serviceCharge = subtotal.times(0.05); // 5% service charge (configurable later)
    const discount = new Decimal(0);
    const total = subtotal.plus(tax).plus(serviceCharge).minus(discount);

    // Create order with items
    const order = await this.prisma.order.create({
      data: {
        branchId: dto.branchId,
        tableId: dto.tableId || null,
        orderType: dto.orderType,
        status: OrderStatus.PENDING,
        customerId: dto.customerId || null,
        subtotal,
        tax,
        serviceCharge,
        discount,
        total,
        notes: dto.notes || null,
        items: {
          create: orderItems,
        },
      },
      include: {
        items: true,
      },
    });

    // Update table status if dine-in
    if (dto.tableId && dto.orderType === OrderType.DINE_IN) {
      await this.prisma.table.update({
        where: { id: dto.tableId },
        data: {
          status: 'OCCUPIED',
          currentOrderId: order.id,
        },
      });
    }

    return this.mapToResponse(order);
  }

  async getOrder(id: string): Promise<OrderResponse> {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
      },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    return this.mapToResponse(order);
  }

  async getOrdersByBranch(
    branchId: string,
    status?: OrderStatus
  ): Promise<OrderResponse[]> {
    const orders = await this.prisma.order.findMany({
      where: {
        branchId,
        ...(status && { status }),
      },
      include: {
        items: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return orders.map((o) => this.mapToResponse(o));
  }

  async updateOrderStatus(
    id: string,
    status: OrderStatus
  ): Promise<OrderResponse> {
    const order = await this.getOrder(id);

    const updated = await this.prisma.order.update({
      where: { id },
      data: { status },
      include: {
        items: true,
      },
    });

    // Update table status if order is completed
    if (status === OrderStatus.COMPLETED && order.tableId) {
      await this.prisma.table.update({
        where: { id: order.tableId },
        data: {
          status: 'AVAILABLE',
          currentOrderId: null,
        },
      });
    }

    return this.mapToResponse(updated);
  }

  async splitBill(dto: SplitBillDto): Promise<OrderResponse[]> {
    const originalOrder = await this.getOrder(dto.orderId);

    // Get items to split
    const itemsToSplit = originalOrder.items.filter((item) =>
      dto.items.includes(item.id)
    );

    if (itemsToSplit.length === 0) {
      throw new BadRequestException('No items selected for split');
    }

    // Calculate totals for new order
    let newSubtotal = new Decimal(0);
    itemsToSplit.forEach((item) => {
      newSubtotal = newSubtotal.plus(item.subtotal);
    });

    const tax = newSubtotal.times(0.1);
    const serviceCharge = newSubtotal.times(0.05);
    const total = newSubtotal.plus(tax).plus(serviceCharge);

    // Create new order with split items
    const newOrder = await this.prisma.order.create({
      data: {
        branchId: originalOrder.branchId,
        tableId: originalOrder.tableId,
        orderType: originalOrder.orderType as OrderType,
        status: OrderStatus.PENDING,
        customerId: originalOrder.customerId,
        subtotal: newSubtotal,
        tax,
        serviceCharge,
        discount: new Decimal(0),
        total,
        items: {
          create: itemsToSplit.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            subtotal: item.subtotal,
            modifiers: item.modifiers,
            notes: item.notes,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    // Remove split items from original order and recalculate
    const remainingItems = originalOrder.items.filter(
      (item) => !dto.items.includes(item.id)
    );

    let remainingSubtotal = new Decimal(0);
    remainingItems.forEach((item) => {
      remainingSubtotal = remainingSubtotal.plus(item.subtotal);
    });

    const remainingTax = remainingSubtotal.times(0.1);
    const remainingServiceCharge = remainingSubtotal.times(0.05);
    const remainingTotal = remainingSubtotal
      .plus(remainingTax)
      .plus(remainingServiceCharge)
      .minus(originalOrder.discount);

    // Delete split items and update original order
    await this.prisma.orderItem.deleteMany({
      where: {
        id: { in: dto.items },
      },
    });

    const updatedOrder = await this.prisma.order.update({
      where: { id: dto.orderId },
      data: {
        subtotal: remainingSubtotal,
        tax: remainingTax,
        serviceCharge: remainingServiceCharge,
        total: remainingTotal,
      },
      include: {
        items: true,
      },
    });

    return [this.mapToResponse(updatedOrder), this.mapToResponse(newOrder)];
  }

  async mergeBills(dto: MergeBillDto): Promise<OrderResponse> {
    if (dto.orderIds.length < 2) {
      throw new BadRequestException('Need at least 2 orders to merge');
    }

    const orders = await Promise.all(
      dto.orderIds.map((id) => this.getOrder(id))
    );

    // Verify all orders are from same branch and table
    const branchId = orders[0].branchId;
    const tableId = orders[0].tableId;

    if (
      !orders.every((o) => o.branchId === branchId) ||
      !orders.every((o) => o.tableId === tableId)
    ) {
      throw new BadRequestException(
        'All orders must be from the same branch and table'
      );
    }

    // Calculate merged totals
    let mergedSubtotal = new Decimal(0);
    let mergedTax = new Decimal(0);
    let mergedServiceCharge = new Decimal(0);
    let mergedDiscount = new Decimal(0);

    orders.forEach((order) => {
      mergedSubtotal = mergedSubtotal.plus(order.subtotal);
      mergedTax = mergedTax.plus(order.tax);
      mergedServiceCharge = mergedServiceCharge.plus(order.serviceCharge);
      mergedDiscount = mergedDiscount.plus(order.discount);
    });

    const mergedTotal = mergedSubtotal
      .plus(mergedTax)
      .plus(mergedServiceCharge)
      .minus(mergedDiscount);

    // Get all items from all orders
    const allItems = orders.flatMap((order) => order.items);

    // Create merged order
    const mergedOrder = await this.prisma.order.create({
      data: {
        branchId,
        tableId,
        orderType: orders[0].orderType as OrderType,
        status: OrderStatus.PENDING,
        customerId: orders[0].customerId,
        subtotal: mergedSubtotal,
        tax: mergedTax,
        serviceCharge: mergedServiceCharge,
        discount: mergedDiscount,
        total: mergedTotal,
        items: {
          create: allItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            subtotal: item.subtotal,
            modifiers: item.modifiers,
            notes: item.notes,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    // Delete original orders (cascade will delete items)
    await this.prisma.order.deleteMany({
      where: {
        id: { in: dto.orderIds },
      },
    });

    return this.mapToResponse(mergedOrder);
  }

  async applyDiscount(dto: ApplyDiscountDto): Promise<OrderResponse> {
    const order = await this.getOrder(dto.orderId);

    let discountAmount: Decimal;
    const subtotalDecimal = new Decimal(order.subtotal);
    if (dto.discountType === 'PERCENTAGE') {
      discountAmount = subtotalDecimal.times(dto.discountValue / 100);
    } else {
      discountAmount = new Decimal(dto.discountValue);
    }

    // Don't allow discount more than subtotal
    if (discountAmount.gt(subtotalDecimal)) {
      discountAmount = subtotalDecimal;
    }

    const newTotal = subtotalDecimal
      .plus(new Decimal(order.tax))
      .plus(new Decimal(order.serviceCharge))
      .minus(discountAmount);

    const updated = await this.prisma.order.update({
      where: { id: dto.orderId },
      data: {
        discount: discountAmount,
        total: newTotal,
      },
      include: {
        items: true,
      },
    });

    return this.mapToResponse(updated);
  }

  private mapToResponse(order: {
    id: string;
    branchId: string;
    tableId: string | null;
    orderType: string;
    status: string;
    customerId: string | null;
    subtotal: Decimal;
    tax: Decimal;
    serviceCharge: Decimal;
    discount: Decimal;
    total: Decimal;
    notes: string | null;
    createdAt: Date;
    updatedAt: Date;
    items: {
      id: string;
      orderId: string;
      productId: string;
      quantity: number;
      price: Decimal;
      subtotal: Decimal;
      modifiers: string[];
      notes: string | null;
    }[];
  }): OrderResponse {
    return {
      id: order.id,
      branchId: order.branchId,
      tableId: order.tableId,
      orderType: order.orderType as OrderType,
      status: order.status as OrderStatus,
      customerId: order.customerId,
      subtotal: order.subtotal.toNumber(),
      tax: order.tax.toNumber(),
      serviceCharge: order.serviceCharge.toNumber(),
      discount: order.discount.toNumber(),
      total: order.total.toNumber(),
      items: order.items.map((item) => ({
        id: item.id,
        orderId: item.orderId,
        productId: item.productId,
        quantity: item.quantity,
        price: item.price.toNumber(),
        subtotal: item.subtotal.toNumber(),
        modifiers: item.modifiers,
        notes: item.notes,
      })),
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
  }
}

