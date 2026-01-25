import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { CreatePaymentDto, PaymentResponse } from '../../types';
import { PaymentStatus, PaymentMethod } from '../../types';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class PaymentService {
  constructor(private readonly prisma: PrismaService) {}

  async createPayment(dto: CreatePaymentDto): Promise<PaymentResponse> {
    const order = await this.prisma.order.findUnique({
      where: { id: dto.orderId },
      include: {
        payments: true,
      },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${dto.orderId} not found`);
    }

    // Calculate total paid
    const totalPaid = order.payments
      .filter((p) => p.status === PaymentStatus.COMPLETED)
      .reduce((sum, p) => sum.plus(p.amount), new Decimal(0));

    const remaining = order.total.minus(totalPaid);

    if (dto.amount > remaining.toNumber()) {
      throw new BadRequestException(
        `Payment amount (${dto.amount}) exceeds remaining balance (${remaining.toNumber()})`
      );
    }

    const payment = await this.prisma.payment.create({
      data: {
        orderId: dto.orderId,
        paymentMethod: dto.paymentMethod,
        amount: new Decimal(dto.amount),
        status: PaymentStatus.COMPLETED, // Auto-complete for now
        reference: dto.reference || null,
        notes: dto.notes || null,
      },
    });

    // Update order status if fully paid
    const newTotalPaid = totalPaid.plus(payment.amount);
    if (newTotalPaid.gte(order.total)) {
      await this.prisma.order.update({
        where: { id: dto.orderId },
        data: { status: 'COMPLETED' },
      });
    }

    return this.mapToResponse(payment);
  }

  async getPaymentsByOrder(orderId: string): Promise<PaymentResponse[]> {
    const payments = await this.prisma.payment.findMany({
      where: { orderId },
      orderBy: { createdAt: 'desc' },
    });

    return payments.map((p) => this.mapToResponse(p));
  }

  async getPayment(id: string): Promise<PaymentResponse> {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
    });

    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }

    return this.mapToResponse(payment);
  }

  private mapToResponse(payment: {
    id: string;
    orderId: string;
    paymentMethod: string;
    amount: Decimal;
    status: string;
    reference: string | null;
    notes: string | null;
    createdAt: Date;
  }): PaymentResponse {
    return {
      id: payment.id,
      orderId: payment.orderId,
      paymentMethod: payment.paymentMethod as PaymentMethod,
      amount: payment.amount.toNumber(),
      status: payment.status as PaymentStatus,
      reference: payment.reference,
      notes: payment.notes,
      createdAt: payment.createdAt,
    };
  }
}

