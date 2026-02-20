import { db } from '@/lib/db';
import { ApiError } from '@/lib/errors';
import { Decimal } from '@prisma/client/runtime/library';

const ACCOUNT_TYPES = ['ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE'] as const;

function ensureTenantId(tenantId: string | undefined): string {
  if (!tenantId) throw new ApiError('Company context required for accounting', 403);
  return tenantId;
}

// --------------- Fiscal Years ---------------

export async function getFiscalYears(tenantId: string | undefined) {
  const tid = ensureTenantId(tenantId);
  return db.fiscalYear.findMany({
    where: { tenantId: tid },
    orderBy: { startDate: 'desc' },
  });
}

export async function getFiscalYear(tenantId: string | undefined, id: string) {
  const tid = ensureTenantId(tenantId);
  const fy = await db.fiscalYear.findFirst({ where: { id, tenantId: tid } });
  if (!fy) throw new ApiError('Fiscal year not found', 404);
  return fy;
}

export async function createFiscalYear(
  tenantId: string | undefined,
  data: { name: string; startDate: Date; endDate: Date },
) {
  const tid = ensureTenantId(tenantId);
  if (data.endDate <= data.startDate) {
    throw new ApiError('End date must be after start date', 400);
  }
  return db.fiscalYear.create({
    data: { tenantId: tid, name: data.name, startDate: data.startDate, endDate: data.endDate },
  });
}

export async function lockFiscalYear(tenantId: string | undefined, id: string) {
  const tid = ensureTenantId(tenantId);
  const fy = await db.fiscalYear.findFirst({ where: { id, tenantId: tid } });
  if (!fy) throw new ApiError('Fiscal year not found', 404);
  if (fy.isLocked) throw new ApiError('Fiscal year is already locked', 400);

  const unposted = await db.journalEntry.count({
    where: { tenantId: tid, fiscalYearId: id, isPosted: false },
  });
  if (unposted > 0) {
    throw new ApiError(`Cannot lock: ${unposted} unposted journal entries remain`, 400);
  }

  return db.fiscalYear.update({ where: { id }, data: { isLocked: true } });
}

export async function unlockFiscalYear(tenantId: string | undefined, id: string) {
  const tid = ensureTenantId(tenantId);
  const fy = await db.fiscalYear.findFirst({ where: { id, tenantId: tid } });
  if (!fy) throw new ApiError('Fiscal year not found', 404);
  if (!fy.isLocked) throw new ApiError('Fiscal year is not locked', 400);
  return db.fiscalYear.update({ where: { id }, data: { isLocked: false } });
}

// --------------- Chart of Accounts ---------------

export async function getAccounts(tenantId: string | undefined) {
  const tid = ensureTenantId(tenantId);
  return db.account.findMany({
    where: { tenantId: tid, isActive: true },
    orderBy: { code: 'asc' },
    include: {
      parent: { select: { id: true, code: true, name: true } },
      children: { select: { id: true, code: true, name: true }, where: { isActive: true } },
    },
  });
}

export async function getAccount(tenantId: string | undefined, id: string) {
  const tid = ensureTenantId(tenantId);
  const account = await db.account.findFirst({
    where: { id, tenantId: tid },
    include: {
      parent: { select: { id: true, code: true, name: true } },
      children: { select: { id: true, code: true, name: true }, where: { isActive: true } },
    },
  });
  if (!account) throw new ApiError('Account not found', 404);
  return account;
}

export async function createAccount(
  tenantId: string | undefined,
  data: { code: string; name: string; accountType: string; parentId?: string },
) {
  const tid = ensureTenantId(tenantId);

  if (!ACCOUNT_TYPES.includes(data.accountType as (typeof ACCOUNT_TYPES)[number])) {
    throw new ApiError(`Invalid account type. Must be one of: ${ACCOUNT_TYPES.join(', ')}`, 400);
  }

  if (data.parentId) {
    const parent = await db.account.findFirst({
      where: { id: data.parentId, tenantId: tid, isActive: true },
    });
    if (!parent) throw new ApiError('Parent account not found', 404);
    if (parent.accountType !== data.accountType) {
      throw new ApiError('Child account must have the same type as parent', 400);
    }
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

export async function updateAccount(
  tenantId: string | undefined,
  id: string,
  data: { name?: string; parentId?: string | null; isActive?: boolean },
) {
  const tid = ensureTenantId(tenantId);
  const account = await db.account.findFirst({ where: { id, tenantId: tid } });
  if (!account) throw new ApiError('Account not found', 404);

  if (data.parentId) {
    const parent = await db.account.findFirst({
      where: { id: data.parentId, tenantId: tid, isActive: true },
    });
    if (!parent) throw new ApiError('Parent account not found', 404);
    if (parent.accountType !== account.accountType) {
      throw new ApiError('Parent must have the same account type', 400);
    }
    if (parent.id === id) throw new ApiError('Account cannot be its own parent', 400);
  }

  return db.account.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.parentId !== undefined && { parentId: data.parentId }),
      ...(data.isActive !== undefined && { isActive: data.isActive }),
    },
  });
}

// --------------- Journal Entries ---------------

export async function getJournalEntries(
  tenantId: string | undefined,
  fiscalYearId?: string,
) {
  const tid = ensureTenantId(tenantId);
  const where: Record<string, unknown> = { tenantId: tid };
  if (fiscalYearId) where.fiscalYearId = fiscalYearId;

  return db.journalEntry.findMany({
    where,
    orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
    include: {
      fiscalYear: { select: { id: true, name: true } },
      lines: {
        include: { account: { select: { id: true, code: true, name: true } } },
      },
    },
  });
}

export async function getJournalEntry(tenantId: string | undefined, id: string) {
  const tid = ensureTenantId(tenantId);
  const entry = await db.journalEntry.findFirst({
    where: { id, tenantId: tid },
    include: {
      fiscalYear: { select: { id: true, name: true, isLocked: true } },
      lines: {
        include: { account: { select: { id: true, code: true, name: true, accountType: true } } },
      },
    },
  });
  if (!entry) throw new ApiError('Journal entry not found', 404);
  return entry;
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

  if (!data.lines || data.lines.length < 2) {
    throw new ApiError('Journal entry must have at least 2 lines', 400);
  }

  let totalDebit = 0;
  let totalCredit = 0;
  for (const line of data.lines) {
    if (line.debit < 0 || line.credit < 0) throw new ApiError('Amounts cannot be negative', 400);
    if (line.debit > 0 && line.credit > 0) throw new ApiError('A line cannot have both debit and credit', 400);
    if (line.debit === 0 && line.credit === 0) throw new ApiError('A line must have a debit or credit amount', 400);
    totalDebit += line.debit;
    totalCredit += line.credit;
  }
  if (Math.abs(totalDebit - totalCredit) > 0.01) {
    throw new ApiError('Journal entry must balance (total debits must equal total credits)', 400);
  }

  const fiscalYear = await db.fiscalYear.findFirst({
    where: { id: data.fiscalYearId, tenantId: tid },
  });
  if (!fiscalYear) throw new ApiError('Fiscal year not found', 404);
  if (fiscalYear.isLocked) {
    throw new ApiError('Cannot create entries in a locked fiscal year', 403);
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
      fiscalYear: { select: { id: true, name: true } },
      lines: {
        include: { account: { select: { id: true, code: true, name: true } } },
      },
    },
  });
}

export async function postJournalEntry(tenantId: string | undefined, id: string) {
  const tid = ensureTenantId(tenantId);
  const entry = await db.journalEntry.findFirst({
    where: { id, tenantId: tid },
    include: { fiscalYear: true, lines: true },
  });
  if (!entry) throw new ApiError('Journal entry not found', 404);
  if (entry.isPosted) throw new ApiError('Journal entry is already posted', 400);
  if (entry.fiscalYear.isLocked) {
    throw new ApiError('Cannot post to a locked fiscal year', 403);
  }

  let totalDebit = 0;
  let totalCredit = 0;
  for (const line of entry.lines) {
    totalDebit += Number(line.debit);
    totalCredit += Number(line.credit);
  }
  if (Math.abs(totalDebit - totalCredit) > 0.01) {
    throw new ApiError('Cannot post: entry is not balanced', 400);
  }

  return db.journalEntry.update({
    where: { id },
    data: { isPosted: true, postedAt: new Date() },
    include: {
      fiscalYear: { select: { id: true, name: true } },
      lines: {
        include: { account: { select: { id: true, code: true, name: true } } },
      },
    },
  });
}

export async function deleteJournalEntry(tenantId: string | undefined, id: string) {
  const tid = ensureTenantId(tenantId);
  const entry = await db.journalEntry.findFirst({
    where: { id, tenantId: tid },
  });
  if (!entry) throw new ApiError('Journal entry not found', 404);
  if (entry.isPosted) throw new ApiError('Cannot delete a posted journal entry', 403);
  await db.journalEntry.delete({ where: { id } });
  return { deleted: true };
}

// --------------- Reports ---------------

export async function getTrialBalance(tenantId: string | undefined, fiscalYearId?: string) {
  const tid = ensureTenantId(tenantId);

  const accounts = await db.account.findMany({
    where: { tenantId: tid, isActive: true },
    orderBy: { code: 'asc' },
  });

  const journalFilter: Record<string, unknown> = { tenantId: tid, isPosted: true };
  if (fiscalYearId) journalFilter.fiscalYearId = fiscalYearId;

  const aggregated = await db.journalEntryLine.groupBy({
    by: ['accountId'],
    where: { journalEntry: journalFilter },
    _sum: { debit: true, credit: true },
  });

  const aggMap = new Map(aggregated.map((a) => [a.accountId, a]));

  let totalDebit = 0;
  let totalCredit = 0;

  const rows = accounts
    .map((account) => {
      const agg = aggMap.get(account.id);
      const debit = agg?._sum.debit ? Number(agg._sum.debit) : 0;
      const credit = agg?._sum.credit ? Number(agg._sum.credit) : 0;
      totalDebit += debit;
      totalCredit += credit;
      return {
        accountId: account.id,
        code: account.code,
        name: account.name,
        accountType: account.accountType,
        debit,
        credit,
        balance: debit - credit,
      };
    })
    .filter((r) => r.debit !== 0 || r.credit !== 0);

  return { rows, totalDebit, totalCredit };
}

export async function getLedger(
  tenantId: string | undefined,
  options: { accountId?: string; fiscalYearId?: string; startDate?: string; endDate?: string },
) {
  const tid = ensureTenantId(tenantId);

  const journalFilter: Record<string, unknown> = { tenantId: tid, isPosted: true };
  if (options.fiscalYearId) journalFilter.fiscalYearId = options.fiscalYearId;
  if (options.startDate || options.endDate) {
    const dateFilter: Record<string, Date> = {};
    if (options.startDate) dateFilter.gte = new Date(options.startDate);
    if (options.endDate) dateFilter.lte = new Date(options.endDate);
    journalFilter.date = dateFilter;
  }

  const lineFilter: Record<string, unknown> = { journalEntry: journalFilter };
  if (options.accountId) lineFilter.accountId = options.accountId;

  const lines = await db.journalEntryLine.findMany({
    where: lineFilter,
    include: {
      account: { select: { id: true, code: true, name: true, accountType: true } },
      journalEntry: { select: { id: true, date: true, reference: true, memo: true } },
    },
    orderBy: { journalEntry: { date: 'asc' } },
  });

  const grouped: Record<
    string,
    {
      accountId: string;
      code: string;
      name: string;
      accountType: string;
      entries: {
        journalEntryId: string;
        date: Date;
        reference: string | null;
        memo: string | null;
        debit: number;
        credit: number;
        balance: number;
      }[];
      totalDebit: number;
      totalCredit: number;
    }
  > = {};

  for (const line of lines) {
    const key = line.accountId;
    if (!grouped[key]) {
      grouped[key] = {
        accountId: line.account.id,
        code: line.account.code,
        name: line.account.name,
        accountType: line.account.accountType,
        entries: [],
        totalDebit: 0,
        totalCredit: 0,
      };
    }

    const debit = Number(line.debit);
    const credit = Number(line.credit);
    grouped[key].totalDebit += debit;
    grouped[key].totalCredit += credit;
    const balance = grouped[key].totalDebit - grouped[key].totalCredit;

    grouped[key].entries.push({
      journalEntryId: line.journalEntry.id,
      date: line.journalEntry.date,
      reference: line.journalEntry.reference,
      memo: line.memo || line.journalEntry.memo,
      debit,
      credit,
      balance,
    });
  }

  return Object.values(grouped).sort((a, b) => a.code.localeCompare(b.code));
}

export async function getProfitAndLoss(tenantId: string | undefined, fiscalYearId: string) {
  const tid = ensureTenantId(tenantId);

  const fiscalYear = await db.fiscalYear.findFirst({
    where: { id: fiscalYearId, tenantId: tid },
  });
  if (!fiscalYear) throw new ApiError('Fiscal year not found', 404);

  const accounts = await db.account.findMany({
    where: { tenantId: tid, isActive: true, accountType: { in: ['REVENUE', 'EXPENSE'] } },
    orderBy: { code: 'asc' },
  });

  const aggregated = await db.journalEntryLine.groupBy({
    by: ['accountId'],
    where: {
      journalEntry: { tenantId: tid, isPosted: true, fiscalYearId },
      accountId: { in: accounts.map((a) => a.id) },
    },
    _sum: { debit: true, credit: true },
  });

  const aggMap = new Map(aggregated.map((a) => [a.accountId, a]));

  const revenue: { accountId: string; code: string; name: string; amount: number }[] = [];
  const expenses: { accountId: string; code: string; name: string; amount: number }[] = [];
  let totalRevenue = 0;
  let totalExpenses = 0;

  for (const account of accounts) {
    const agg = aggMap.get(account.id);
    const debit = agg?._sum.debit ? Number(agg._sum.debit) : 0;
    const credit = agg?._sum.credit ? Number(agg._sum.credit) : 0;

    if (account.accountType === 'REVENUE') {
      const amount = credit - debit;
      if (amount !== 0) {
        revenue.push({ accountId: account.id, code: account.code, name: account.name, amount });
        totalRevenue += amount;
      }
    } else {
      const amount = debit - credit;
      if (amount !== 0) {
        expenses.push({ accountId: account.id, code: account.code, name: account.name, amount });
        totalExpenses += amount;
      }
    }
  }

  return {
    fiscalYear: { id: fiscalYear.id, name: fiscalYear.name, startDate: fiscalYear.startDate, endDate: fiscalYear.endDate },
    revenue,
    expenses,
    totalRevenue,
    totalExpenses,
    netIncome: totalRevenue - totalExpenses,
  };
}

export async function getBalanceSheet(tenantId: string | undefined, fiscalYearId: string) {
  const tid = ensureTenantId(tenantId);

  const fiscalYear = await db.fiscalYear.findFirst({
    where: { id: fiscalYearId, tenantId: tid },
  });
  if (!fiscalYear) throw new ApiError('Fiscal year not found', 404);

  const accounts = await db.account.findMany({
    where: { tenantId: tid, isActive: true },
    orderBy: { code: 'asc' },
  });

  const aggregated = await db.journalEntryLine.groupBy({
    by: ['accountId'],
    where: {
      journalEntry: { tenantId: tid, isPosted: true, fiscalYearId },
    },
    _sum: { debit: true, credit: true },
  });

  const aggMap = new Map(aggregated.map((a) => [a.accountId, a]));

  const assets: { accountId: string; code: string; name: string; amount: number }[] = [];
  const liabilities: { accountId: string; code: string; name: string; amount: number }[] = [];
  const equity: { accountId: string; code: string; name: string; amount: number }[] = [];
  let totalAssets = 0;
  let totalLiabilities = 0;
  let totalEquity = 0;
  let retainedEarnings = 0;

  for (const account of accounts) {
    const agg = aggMap.get(account.id);
    const debit = agg?._sum.debit ? Number(agg._sum.debit) : 0;
    const credit = agg?._sum.credit ? Number(agg._sum.credit) : 0;

    switch (account.accountType) {
      case 'ASSET': {
        const amount = debit - credit;
        if (amount !== 0) {
          assets.push({ accountId: account.id, code: account.code, name: account.name, amount });
          totalAssets += amount;
        }
        break;
      }
      case 'LIABILITY': {
        const amount = credit - debit;
        if (amount !== 0) {
          liabilities.push({ accountId: account.id, code: account.code, name: account.name, amount });
          totalLiabilities += amount;
        }
        break;
      }
      case 'EQUITY': {
        const amount = credit - debit;
        if (amount !== 0) {
          equity.push({ accountId: account.id, code: account.code, name: account.name, amount });
          totalEquity += amount;
        }
        break;
      }
      case 'REVENUE':
        retainedEarnings += credit - debit;
        break;
      case 'EXPENSE':
        retainedEarnings -= debit - credit;
        break;
    }
  }

  return {
    fiscalYear: { id: fiscalYear.id, name: fiscalYear.name, startDate: fiscalYear.startDate, endDate: fiscalYear.endDate },
    assets,
    liabilities,
    equity,
    retainedEarnings,
    totalAssets,
    totalLiabilities,
    totalEquity,
    totalLiabilitiesAndEquity: totalLiabilities + totalEquity + retainedEarnings,
  };
}

// --------------- Summary ---------------

export async function getInvoicingSummary(
  tenantId: string | undefined,
  fiscalYearId?: string,
) {
  const tid = ensureTenantId(tenantId);

  const journalFilter: Record<string, unknown> = { tenantId: tid, isPosted: true };
  if (fiscalYearId) journalFilter.fiscalYearId = fiscalYearId;

  const counts = await db.journalEntry.aggregate({
    where: journalFilter,
    _count: true,
  });

  const totals = await db.journalEntryLine.aggregate({
    where: { journalEntry: journalFilter },
    _sum: { debit: true, credit: true },
  });

  return {
    totalEntries: counts._count,
    totalDebit: totals._sum.debit ? Number(totals._sum.debit) : 0,
    totalCredit: totals._sum.credit ? Number(totals._sum.credit) : 0,
    outgoingBills: 0,
    incomingBills: 0,
    incomingPayment: 0,
    outgoingPayment: 0,
  };
}

// --------------- Starter Chart of Accounts ---------------

const STARTER_ACCOUNTS = [
  { code: '1000', name: 'Cash', accountType: 'ASSET' },
  { code: '1100', name: 'Bank Account', accountType: 'ASSET' },
  { code: '1200', name: 'Accounts Receivable', accountType: 'ASSET' },
  { code: '1300', name: 'Inventory', accountType: 'ASSET' },
  { code: '1400', name: 'Prepaid Expenses', accountType: 'ASSET' },
  { code: '2000', name: 'Accounts Payable', accountType: 'LIABILITY' },
  { code: '2100', name: 'Accrued Expenses', accountType: 'LIABILITY' },
  { code: '2200', name: 'Tax Payable', accountType: 'LIABILITY' },
  { code: '2300', name: 'Short-Term Loans', accountType: 'LIABILITY' },
  { code: '3000', name: 'Owner Equity', accountType: 'EQUITY' },
  { code: '3100', name: 'Retained Earnings', accountType: 'EQUITY' },
  { code: '4000', name: 'Sales Revenue', accountType: 'REVENUE' },
  { code: '4100', name: 'Service Revenue', accountType: 'REVENUE' },
  { code: '4200', name: 'Other Income', accountType: 'REVENUE' },
  { code: '5000', name: 'Cost of Goods Sold', accountType: 'EXPENSE' },
  { code: '5100', name: 'Purchase Expense', accountType: 'EXPENSE' },
  { code: '6000', name: 'Salaries & Wages', accountType: 'EXPENSE' },
  { code: '6100', name: 'Rent Expense', accountType: 'EXPENSE' },
  { code: '6200', name: 'Utilities', accountType: 'EXPENSE' },
  { code: '6300', name: 'Office Supplies', accountType: 'EXPENSE' },
  { code: '6400', name: 'Marketing & Advertising', accountType: 'EXPENSE' },
  { code: '6500', name: 'Depreciation', accountType: 'EXPENSE' },
  { code: '6900', name: 'Miscellaneous Expense', accountType: 'EXPENSE' },
];

export async function seedStarterAccounts(tenantId: string | undefined) {
  const tid = ensureTenantId(tenantId);
  const messages: string[] = [];

  const existing = await db.account.count({ where: { tenantId: tid } });
  let created = 0;
  if (existing === 0) {
    for (const acct of STARTER_ACCOUNTS) {
      await db.account.create({
        data: { tenantId: tid, code: acct.code, name: acct.name, accountType: acct.accountType },
      });
      created++;
    }
    messages.push(`Created ${created} accounts`);
  } else {
    let added = 0;
    for (const acct of STARTER_ACCOUNTS) {
      const exists = await db.account.findFirst({ where: { tenantId: tid, code: acct.code } });
      if (!exists) {
        await db.account.create({
          data: { tenantId: tid, code: acct.code, name: acct.name, accountType: acct.accountType },
        });
        added++;
      }
    }
    messages.push(added > 0 ? `Added ${added} missing accounts` : `All ${existing} accounts already exist`);
  }

  const currentYear = new Date().getFullYear();
  const nextYear = currentYear + 1;
  let fiscalYearsCreated = 0;
  for (const year of [currentYear, nextYear]) {
    const exists = await db.fiscalYear.findFirst({ where: { tenantId: tid, name: `FY ${year}` } });
    if (!exists) {
      await db.fiscalYear.create({
        data: {
          tenantId: tid,
          name: `FY ${year}`,
          startDate: new Date(`${year}-01-01`),
          endDate: new Date(`${year}-12-31`),
        },
      });
      fiscalYearsCreated++;
      messages.push(`Created fiscal year FY ${year}`);
    }
  }
  if (fiscalYearsCreated === 0) messages.push('Fiscal years already exist');

  return { created, fiscalYearsCreated, message: messages.join('. ') + '.' };
}
