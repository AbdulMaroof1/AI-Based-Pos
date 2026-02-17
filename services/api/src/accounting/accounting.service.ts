import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Decimal } from '@prisma/client/runtime/library';

const ACCOUNT_TYPES = ['ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE'] as const;

@Injectable()
export class AccountingService {
  constructor(private readonly prisma: PrismaService) {}

  private ensureTenantId(tenantId: string | undefined): string {
    if (!tenantId) {
      throw new ForbiddenException('Company context required for accounting');
    }
    return tenantId;
  }

  async getFiscalYears(tenantId: string | undefined) {
    const tid = this.ensureTenantId(tenantId);
    return this.prisma.fiscalYear.findMany({
      where: { tenantId: tid },
      orderBy: { startDate: 'desc' },
    });
  }

  async createFiscalYear(
    tenantId: string | undefined,
    data: { name: string; startDate: Date; endDate: Date }
  ) {
    const tid = this.ensureTenantId(tenantId);
    return this.prisma.fiscalYear.create({
      data: {
        tenantId: tid,
        name: data.name,
        startDate: data.startDate,
        endDate: data.endDate,
      },
    });
  }

  async getAccounts(tenantId: string | undefined) {
    const tid = this.ensureTenantId(tenantId);
    return this.prisma.account.findMany({
      where: { tenantId: tid, isActive: true },
      orderBy: { code: 'asc' },
      include: { parent: { select: { id: true, code: true, name: true } } },
    });
  }

  async createAccount(
    tenantId: string | undefined,
    data: { code: string; name: string; accountType: string; parentId?: string }
  ) {
    const tid = this.ensureTenantId(tenantId);
    if (!ACCOUNT_TYPES.includes(data.accountType as (typeof ACCOUNT_TYPES)[number])) {
      throw new ForbiddenException(
        `Invalid account type. Must be one of: ${ACCOUNT_TYPES.join(', ')}`
      );
    }
    return this.prisma.account.create({
      data: {
        tenantId: tid,
        code: data.code,
        name: data.name,
        accountType: data.accountType,
        parentId: data.parentId || null,
      },
    });
  }

  async getJournalEntries(tenantId: string | undefined, fiscalYearId?: string) {
    const tid = this.ensureTenantId(tenantId);
    const where: { tenantId: string; fiscalYearId?: string } = { tenantId: tid };
    if (fiscalYearId) where.fiscalYearId = fiscalYearId;
    return this.prisma.journalEntry.findMany({
      where,
      orderBy: { date: 'desc', createdAt: 'desc' },
      include: {
        lines: {
          include: { account: { select: { id: true, code: true, name: true } } },
        },
      },
    });
  }

  async createJournalEntry(
    tenantId: string | undefined,
    data: {
      fiscalYearId: string;
      date: Date;
      reference?: string;
      memo?: string;
      lines: { accountId: string; debit: number; credit: number; memo?: string }[];
    }
  ) {
    const tid = this.ensureTenantId(tenantId);

    let totalDebit = 0;
    let totalCredit = 0;
    for (const line of data.lines) {
      totalDebit += line.debit;
      totalCredit += line.credit;
    }
    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      throw new ForbiddenException('Journal entry must balance (debits = credits)');
    }

    const fiscalYear = await this.prisma.fiscalYear.findFirst({
      where: { id: data.fiscalYearId, tenantId: tid },
    });
    if (!fiscalYear) throw new NotFoundException('Fiscal year not found');
    if (fiscalYear.isLocked) {
      throw new ForbiddenException('Cannot post to locked fiscal year');
    }

    if (
      data.date < fiscalYear.startDate ||
      data.date > fiscalYear.endDate
    ) {
      throw new ForbiddenException('Entry date must be within fiscal year range');
    }

    return this.prisma.journalEntry.create({
      data: {
        tenantId: tid,
        fiscalYearId: data.fiscalYearId,
        date: data.date,
        reference: data.reference,
        memo: data.memo,
        lines: {
          create: data.lines.map((l) => ({
            accountId: l.accountId,
            debit: new Decimal(l.debit),
            credit: new Decimal(l.credit),
            memo: l.memo,
          })),
        },
      },
      include: {
        lines: {
          include: { account: { select: { id: true, code: true, name: true } } },
        },
      },
    });
  }

  async getInvoicingSummary(tenantId: string | undefined, _fiscalYearId?: string) {
    this.ensureTenantId(tenantId);
    return {
      outgoingBills: 0,
      incomingBills: 0,
      incomingPayment: 0,
      outgoingPayment: 0,
    };
  }
}
