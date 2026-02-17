import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Req,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { AccountingService } from './accounting.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { TenantGuard } from '../common/guards/tenant.guard';
import { TrialGuard } from '../common/guards/trial.guard';
import { ModuleAccessGuard } from '../common/guards/module-access.guard';
import { RequireModule } from '../common/decorators/require-module.decorator';
import { IsString, IsOptional, IsArray, IsNumber, IsDateString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class CreateFiscalYearRequest {
  @IsString()
  name!: string;

  @IsDateString()
  startDate!: string;

  @IsDateString()
  endDate!: string;
}

class CreateAccountRequest {
  @IsString()
  code!: string;

  @IsString()
  name!: string;

  @IsString()
  accountType!: string;

  @IsOptional()
  @IsString()
  parentId?: string;
}

class JournalEntryLineRequest {
  @IsString()
  accountId!: string;

  @IsNumber()
  debit!: number;

  @IsNumber()
  credit!: number;

  @IsOptional()
  @IsString()
  memo?: string;
}

class CreateJournalEntryRequest {
  @IsString()
  fiscalYearId!: string;

  @IsDateString()
  date!: string;

  @IsOptional()
  @IsString()
  reference?: string;

  @IsOptional()
  @IsString()
  memo?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => JournalEntryLineRequest)
  lines!: JournalEntryLineRequest[];
}

@Controller('accounting')
@UseGuards(JwtAuthGuard, TenantGuard, TrialGuard, ModuleAccessGuard)
@RequireModule('ACCOUNTING')
export class AccountingController {
  constructor(private readonly accountingService: AccountingService) {}

  private getTenantId(req: { user?: { tenantId?: string }; tenantId?: string }): string | undefined {
    return req.tenantId ?? req.user?.tenantId;
  }

  @Get('fiscal-years')
  async getFiscalYears(@Req() req: unknown) {
    const tenantId = this.getTenantId(req as { user?: { tenantId?: string }; tenantId?: string });
    const result = await this.accountingService.getFiscalYears(tenantId);
    return { success: true, data: result };
  }

  @Post('fiscal-years')
  @HttpCode(HttpStatus.CREATED)
  async createFiscalYear(@Req() req: unknown, @Body() dto: CreateFiscalYearRequest) {
    const tenantId = this.getTenantId(req as { user?: { tenantId?: string }; tenantId?: string });
    const result = await this.accountingService.createFiscalYear(tenantId, {
      name: dto.name,
      startDate: new Date(dto.startDate),
      endDate: new Date(dto.endDate),
    });
    return { success: true, data: result };
  }

  @Get('accounts')
  async getAccounts(@Req() req: unknown) {
    const tenantId = this.getTenantId(req as { user?: { tenantId?: string }; tenantId?: string });
    const result = await this.accountingService.getAccounts(tenantId);
    return { success: true, data: result };
  }

  @Post('accounts')
  @HttpCode(HttpStatus.CREATED)
  async createAccount(@Req() req: unknown, @Body() dto: CreateAccountRequest) {
    const tenantId = this.getTenantId(req as { user?: { tenantId?: string }; tenantId?: string });
    const result = await this.accountingService.createAccount(tenantId, {
      code: dto.code,
      name: dto.name,
      accountType: dto.accountType,
      parentId: dto.parentId,
    });
    return { success: true, data: result };
  }

  @Get('journal-entries')
  async getJournalEntries(
    @Req() req: unknown,
    @Query('fiscalYearId') fiscalYearId?: string
  ) {
    const tenantId = this.getTenantId(req as { user?: { tenantId?: string }; tenantId?: string });
    const result = await this.accountingService.getJournalEntries(tenantId, fiscalYearId);
    return { success: true, data: result };
  }

  @Post('journal-entries')
  @HttpCode(HttpStatus.CREATED)
  async createJournalEntry(@Req() req: unknown, @Body() dto: CreateJournalEntryRequest) {
    const tenantId = this.getTenantId(req as { user?: { tenantId?: string }; tenantId?: string });
    const result = await this.accountingService.createJournalEntry(tenantId, {
      fiscalYearId: dto.fiscalYearId,
      date: new Date(dto.date),
      reference: dto.reference,
      memo: dto.memo,
      lines: dto.lines,
    });
    return { success: true, data: result };
  }

  @Get('invoicing-summary')
  async getInvoicingSummary(
    @Req() req: unknown,
    @Query('fiscalYearId') fiscalYearId?: string
  ) {
    const tenantId = this.getTenantId(req as { user?: { tenantId?: string }; tenantId?: string });
    const result = await this.accountingService.getInvoicingSummary(tenantId, fiscalYearId);
    return { success: true, data: result };
  }
}
