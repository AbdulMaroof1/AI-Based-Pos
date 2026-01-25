import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { TableService } from './table.service';
import { OrderService } from './order.service';
import { PaymentService } from './payment.service';
import { KotService } from './kot.service';
import type {
  CreateTableDto,
  UpdateTableDto,
  CreateOrderDto,
  SplitBillDto,
  MergeBillDto,
  ApplyDiscountDto,
  CreatePaymentDto,
  CreateKotDto,
  UpdateKotStatusDto,
} from '../../types';
import { TableStatus, OrderStatus, KotStatus, OrderType, PaymentMethod } from '../../types';
import {
  IsString,
  IsNumber,
  IsEnum,
  IsOptional,
  IsArray,
  ValidateNested,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

// DTOs
class CreateTableRequest implements CreateTableDto {
  @IsString()
  branchId!: string;

  @IsString()
  tableNumber!: string;

  @IsNumber()
  @Min(1)
  capacity!: number;

  @IsOptional()
  @IsEnum(TableStatus)
  status?: TableStatus;
}

class UpdateTableRequest implements UpdateTableDto {
  @IsOptional()
  @IsString()
  tableNumber?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  capacity?: number;

  @IsOptional()
  @IsEnum(TableStatus)
  status?: TableStatus;
}

class OrderItemRequest {
  @IsString()
  productId!: string;

  @IsNumber()
  @Min(1)
  quantity!: number;

  @IsNumber()
  @Min(0)
  price!: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  modifiers?: string[];

  @IsOptional()
  @IsString()
  notes?: string;
}

class CreateOrderRequest implements CreateOrderDto {
  @IsString()
  branchId!: string;

  @IsOptional()
  @IsString()
  tableId?: string;

  @IsEnum(OrderType)
  orderType!: OrderType;

  @IsOptional()
  @IsString()
  customerId?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemRequest)
  items!: OrderItemRequest[];

  @IsOptional()
  @IsString()
  notes?: string;
}

class SplitBillRequest implements SplitBillDto {
  @IsString()
  orderId!: string;

  @IsArray()
  @IsString({ each: true })
  items!: string[];
}

class MergeBillRequest implements MergeBillDto {
  @IsArray()
  @IsString({ each: true })
  orderIds!: string[];
}

class ApplyDiscountRequest implements ApplyDiscountDto {
  @IsString()
  orderId!: string;

  @IsEnum(['PERCENTAGE', 'FIXED'])
  discountType!: 'PERCENTAGE' | 'FIXED';

  @IsNumber()
  @Min(0)
  discountValue!: number;

  @IsOptional()
  @IsString()
  description?: string;
}

class CreatePaymentRequest implements CreatePaymentDto {
  @IsString()
  orderId!: string;

  @IsEnum(PaymentMethod)
  paymentMethod!: PaymentMethod;

  @IsNumber()
  @Min(0)
  amount!: number;

  @IsOptional()
  @IsString()
  reference?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

class CreateKotRequest implements CreateKotDto {
  @IsString()
  orderId!: string;

  @IsOptional()
  @IsString()
  kitchenId?: string;
}

class UpdateKotStatusRequest implements UpdateKotStatusDto {
  @IsEnum(KotStatus)
  status!: KotStatus;
}

@Controller('pos')
export class PosController {
  constructor(
    private readonly tableService: TableService,
    private readonly orderService: OrderService,
    private readonly paymentService: PaymentService,
    private readonly kotService: KotService
  ) {}

  // Table endpoints
  @Post('tables')
  @HttpCode(HttpStatus.CREATED)
  async createTable(@Body() dto: CreateTableRequest) {
    const result = await this.tableService.createTable(dto);
    return { success: true, data: result };
  }

  @Get('tables/:id')
  async getTable(@Param('id') id: string) {
    const result = await this.tableService.getTable(id);
    return { success: true, data: result };
  }

  @Get('tables/branch/:branchId')
  async getTablesByBranch(@Param('branchId') branchId: string) {
    const result = await this.tableService.getTablesByBranch(branchId);
    return { success: true, data: result };
  }

  @Put('tables/:id')
  async updateTable(@Param('id') id: string, @Body() dto: UpdateTableRequest) {
    const result = await this.tableService.updateTable(id, dto);
    return { success: true, data: result };
  }

  @Put('tables/:id/status')
  async updateTableStatus(
    @Param('id') id: string,
    @Body() body: { status: TableStatus }
  ) {
    const result = await this.tableService.updateTableStatus(id, body.status);
    return { success: true, data: result };
  }

  @Delete('tables/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteTable(@Param('id') id: string) {
    await this.tableService.deleteTable(id);
  }

  // Order endpoints
  @Post('orders')
  @HttpCode(HttpStatus.CREATED)
  async createOrder(@Body() dto: CreateOrderRequest) {
    const result = await this.orderService.createOrder(dto);
    return { success: true, data: result };
  }

  @Get('orders/:id')
  async getOrder(@Param('id') id: string) {
    const result = await this.orderService.getOrder(id);
    return { success: true, data: result };
  }

  @Get('orders/branch/:branchId')
  async getOrdersByBranch(
    @Param('branchId') branchId: string,
    @Query('status') status?: OrderStatus
  ) {
    const result = await this.orderService.getOrdersByBranch(branchId, status);
    return { success: true, data: result };
  }

  @Put('orders/:id/status')
  async updateOrderStatus(
    @Param('id') id: string,
    @Body() body: { status: OrderStatus }
  ) {
    const result = await this.orderService.updateOrderStatus(id, body.status);
    return { success: true, data: result };
  }

  @Post('orders/split')
  async splitBill(@Body() dto: SplitBillRequest) {
    const result = await this.orderService.splitBill(dto);
    return { success: true, data: result };
  }

  @Post('orders/merge')
  async mergeBills(@Body() dto: MergeBillRequest) {
    const result = await this.orderService.mergeBills(dto);
    return { success: true, data: result };
  }

  @Post('orders/discount')
  async applyDiscount(@Body() dto: ApplyDiscountRequest) {
    const result = await this.orderService.applyDiscount(dto);
    return { success: true, data: result };
  }

  // Payment endpoints
  @Post('payments')
  @HttpCode(HttpStatus.CREATED)
  async createPayment(@Body() dto: CreatePaymentRequest) {
    const result = await this.paymentService.createPayment(dto);
    return { success: true, data: result };
  }

  @Get('payments/order/:orderId')
  async getPaymentsByOrder(@Param('orderId') orderId: string) {
    const result = await this.paymentService.getPaymentsByOrder(orderId);
    return { success: true, data: result };
  }

  @Get('payments/:id')
  async getPayment(@Param('id') id: string) {
    const result = await this.paymentService.getPayment(id);
    return { success: true, data: result };
  }

  // KOT endpoints
  @Post('kot')
  @HttpCode(HttpStatus.CREATED)
  async createKot(@Body() dto: CreateKotRequest) {
    const result = await this.kotService.createKot(dto);
    return { success: true, data: result };
  }

  @Get('kot/:id')
  async getKot(@Param('id') id: string) {
    const result = await this.kotService.getKot(id);
    return { success: true, data: result };
  }

  @Get('kot/order/:orderId')
  async getKotByOrder(@Param('orderId') orderId: string) {
    const result = await this.kotService.getKotByOrder(orderId);
    return { success: true, data: result };
  }

  @Put('kot/:id/status')
  async updateKotStatus(
    @Param('id') id: string,
    @Body() dto: UpdateKotStatusRequest
  ) {
    const result = await this.kotService.updateKotStatus(id, dto);
    return { success: true, data: result };
  }
}

