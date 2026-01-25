import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type {
  CreateTableDto,
  UpdateTableDto,
  TableResponse,
} from '../../types';
import { TableStatus } from '../../types';

@Injectable()
export class TableService {
  constructor(private readonly prisma: PrismaService) {}

  async createTable(dto: CreateTableDto): Promise<TableResponse> {
    // Check if table number already exists in branch
    const existing = await this.prisma.table.findFirst({
      where: {
        branchId: dto.branchId,
        tableNumber: dto.tableNumber,
      },
    });

    if (existing) {
      throw new ConflictException(
        `Table ${dto.tableNumber} already exists in this branch`
      );
    }

    const table = await this.prisma.table.create({
      data: {
        branchId: dto.branchId,
        tableNumber: dto.tableNumber,
        capacity: dto.capacity,
        status: dto.status || TableStatus.AVAILABLE,
      },
    });

    return this.mapToResponse(table);
  }

  async getTable(id: string): Promise<TableResponse> {
    const table = await this.prisma.table.findUnique({
      where: { id },
    });

    if (!table) {
      throw new NotFoundException(`Table with ID ${id} not found`);
    }

    return this.mapToResponse(table);
  }

  async getTablesByBranch(branchId: string): Promise<TableResponse[]> {
    const tables = await this.prisma.table.findMany({
      where: { branchId },
      orderBy: { tableNumber: 'asc' },
    });

    return tables.map((t) => this.mapToResponse(t));
  }

  async updateTable(id: string, dto: UpdateTableDto): Promise<TableResponse> {
    await this.getTable(id);

    if (dto.tableNumber) {
      const table = await this.getTable(id);
      const existing = await this.prisma.table.findFirst({
        where: {
          branchId: table.branchId,
          tableNumber: dto.tableNumber,
          id: { not: id },
        },
      });

      if (existing) {
        throw new ConflictException(
          `Table ${dto.tableNumber} already exists in this branch`
        );
      }
    }

    const updated = await this.prisma.table.update({
      where: { id },
      data: dto,
    });

    return this.mapToResponse(updated);
  }

  async updateTableStatus(
    id: string,
    status: TableStatus
  ): Promise<TableResponse> {
    await this.getTable(id);

    const updated = await this.prisma.table.update({
      where: { id },
      data: { status },
    });

    return this.mapToResponse(updated);
  }

  async deleteTable(id: string): Promise<void> {
    await this.getTable(id);
    await this.prisma.table.delete({
      where: { id },
    });
  }

  private mapToResponse(table: {
    id: string;
    branchId: string;
    tableNumber: string;
    capacity: number;
    status: string;
    currentOrderId: string | null;
    createdAt: Date;
    updatedAt: Date;
  }): TableResponse {
    return {
      id: table.id,
      branchId: table.branchId,
      tableNumber: table.tableNumber,
      capacity: table.capacity,
      status: table.status as TableStatus,
      currentOrderId: table.currentOrderId,
      createdAt: table.createdAt,
      updatedAt: table.updatedAt,
    };
  }
}

