import { Module } from '@nestjs/common';
import { PosController } from './pos.controller';
import { PosService } from './pos.service';
import { TableService } from './table.service';
import { OrderService } from './order.service';
import { PaymentService } from './payment.service';
import { KotService } from './kot.service';

@Module({
  controllers: [PosController],
  providers: [PosService, TableService, OrderService, PaymentService, KotService],
})
export class PosModule {}

