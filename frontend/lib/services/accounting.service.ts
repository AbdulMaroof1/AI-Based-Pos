import { db } from '@/lib/db';
import { ApiError } from '@/lib/errors';
import { Decimal } from '@prisma/client/runtime/library';

const ACCOUNT_TYPES = ['ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE'] as const;

function ensureTenantId(tenantId: string | undefined): string {
  if (!tenantId) throw new ApiError('Company context required for accounting', 403);
  return tenantId;
}

export async function getFiscalYears(tenantId: string | undefined) {
  const tid = ensureTenantId(tenantId);
  return db.fiscalYear.findMany({
    where: { tenantId: tid },
    orderBy: { startDate: 'desc' },
  });
}

export async function createFiscalYear(
  tenantId: string | undefined,
  data: { name: string; startDate: Date; endDate: Date },
) {
  const tid = ensureTenantId(tenantId);
  return db.fiscalYear.create({
    data: { tenantId: tid, name: data.name, startDate: data.startDate, endDate: data.endDate },
  });
}

export async function getAccounts(tenantId: string | undefined) {
  const tid = ensureTenantId(tenantId);
  return db.account.findMany({
    where: { tenantId: tid, isActive: true },
    orderBy: { code: 'asc' },
    include: { parent: { select: { id: true, code: true, name: true } } },
  });
}

export async function createAccount(
  tenantId: string | undefined,
  data: { code: string; name: string; accountType: string; parentId?: string },
) {
  const tid = ensureTenantId(tenantId);

  if (!ACCOUNT_TYPES.includes(data.accountType as (typeof ACCOUNT_TYPES)[number])) {
    throw new ApiError(
      `Invalid account type. Must be one of: ${ACCOUNT_TYPES.join(', ')}`,
      400,
    );
  }

  return db.account.create({
    data: {
      tenantId: tid,
      code: data.code,
      name: data.name,
      accountType: data.accountType,
      parentId: data.parentId || null,
    },
  });
}

export async function getJournalEntries(
  tenantId: string | undefined,
  fiscalYearId?: string,
) {
  const tid = ensureTenantId(tenantId);
  const where: { tenantId: string; fiscalYearId?: string } = { tenantId: tid };
  if (fiscalYearId) where.fiscalYearId = fiscalYearId;

  return db.journalEntry.findMany({
    where,
    orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
    include: {
      lines: {
        include: { account: { select: { id: true, code: true, name: true } } },
      },
    },
  });
}

export async function createJournalEntry(
  tenantId: string | undefined,
  data: {
    fiscalYearId: string;
    date: Date;
    reference?: string;
    memo?: string;
    lines: { accountId: string; debit: number; credit: number; memo?: string }[];
  },
) {
  const tid = ensureTenantId(tenantId);

  let totalDebit = 0;
  let totalCredit = 0;
  for (const line of data.lines) {
    totalDebit += line.debit;
    totalCredit += line.credit;
  }
  if (Math.abs(totalDebit - totalCredit) > 0.01) {
    throw new ApiError('Journal entry must balance (debits = credits)', 400);
  }

  const fiscalYear = await db.fiscalYear.findFirst({
    where: { id: data.fiscalYearId, tenantId: tid },
  });
  if (!fiscalYear) throw new ApiError('Fiscal year not found', 404);
  if (fiscalYear.isLocked) {
    throw new ApiError('Cannot post to locked fiscal year', 403);
  }
  if (data.date < fiscalYear.startDate || data.date > fiscalYear.endDate) {
    throw new ApiError('Entry date must be within fiscal year range', 400);
  }

  return db.journalEntry.create({
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

export async function getInvoicingSummary(
  tenantId: string | undefined,
  _fiscalYearId?: string,
) {
  ensureTenantId(tenantId);
  return {
    outgoingBills: 0,
    incomingBills: 0,
    incomingPayment: 0,
    outgoingPayment: 0,
  };
}
