import { db } from '@/lib/db';
import { ApiError } from '@/lib/errors';
import { Decimal } from '@prisma/client/runtime/library';

const LEAD_STATUSES = ['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST'] as const;
const LEAD_SOURCES = ['WEBSITE', 'REFERRAL', 'SOCIAL_MEDIA', 'EMAIL', 'COLD_CALL', 'ADVERTISEMENT', 'OTHER'] as const;
const ACTIVITY_TYPES = ['NOTE', 'CALL', 'EMAIL', 'MEETING', 'TASK'] as const;

type LeadStatus = (typeof LEAD_STATUSES)[number];

function ensureTenantId(tenantId: string | undefined): string {
  if (!tenantId) throw new ApiError('Company context required', 403);
  return tenantId;
}

// --------------- Leads ---------------

export async function getLeads(
  tenantId: string | undefined,
  options?: { status?: string; source?: string; search?: string; page?: number; limit?: number },
) {
  const tid = ensureTenantId(tenantId);
  const page = options?.page || 1;
  const limit = options?.limit || 50;

  const where: Record<string, unknown> = { tenantId: tid };
  if (options?.status) where.status = options.status;
  if (options?.source) where.source = options.source;
  if (options?.search) {
    where.OR = [
      { name: { contains: options.search, mode: 'insensitive' } },
      { email: { contains: options.search, mode: 'insensitive' } },
      { company: { contains: options.search, mode: 'insensitive' } },
    ];
  }

  const [leads, total] = await Promise.all([
    db.lead.findMany({
      where,
      orderBy: [{ createdAt: 'desc' }],
      skip: (page - 1) * limit,
      take: limit,
      include: { customer: { select: { id: true, name: true } } },
    }),
    db.lead.count({ where }),
  ]);

  return { leads, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function getLead(tenantId: string | undefined, id: string) {
  const tid = ensureTenantId(tenantId);
  const lead = await db.lead.findFirst({
    where: { id, tenantId: tid },
    include: {
      customer: { select: { id: true, name: true, email: true } },
      activities: { orderBy: { createdAt: 'desc' }, take: 50 },
    },
  });
  if (!lead) throw new ApiError('Lead not found', 404);
  return lead;
}

export async function createLead(
  tenantId: string | undefined,
  data: {
    name: string;
    email?: string;
    phone?: string;
    company?: string;
    source?: string;
    assignedTo?: string;
    expectedRevenue?: number;
    notes?: string;
  },
) {
  const tid = ensureTenantId(tenantId);

  if (!data.name?.trim()) throw new ApiError('Lead name is required', 400);
  if (data.source && !LEAD_SOURCES.includes(data.source as (typeof LEAD_SOURCES)[number])) {
    throw new ApiError(`Invalid source. Must be one of: ${LEAD_SOURCES.join(', ')}`, 400);
  }

  return db.lead.create({
    data: {
      tenantId: tid,
      name: data.name.trim(),
      email: data.email?.trim() || null,
      phone: data.phone?.trim() || null,
      company: data.company?.trim() || null,
      source: data.source || 'OTHER',
      assignedTo: data.assignedTo || null,
      expectedRevenue: data.expectedRevenue ? new Decimal(data.expectedRevenue) : null,
      notes: data.notes || null,
      status: 'NEW',
    },
  });
}

export async function updateLead(
  tenantId: string | undefined,
  id: string,
  data: {
    name?: string;
    email?: string;
    phone?: string;
    company?: string;
    source?: string;
    assignedTo?: string;
    expectedRevenue?: number;
    notes?: string;
  },
) {
  const tid = ensureTenantId(tenantId);
  const lead = await db.lead.findFirst({ where: { id, tenantId: tid } });
  if (!lead) throw new ApiError('Lead not found', 404);
  if (lead.status === 'WON' || lead.status === 'LOST') {
    throw new ApiError('Cannot edit a closed lead', 400);
  }

  if (data.source && !LEAD_SOURCES.includes(data.source as (typeof LEAD_SOURCES)[number])) {
    throw new ApiError(`Invalid source. Must be one of: ${LEAD_SOURCES.join(', ')}`, 400);
  }

  const updateData: Record<string, unknown> = {};
  if (data.name !== undefined) updateData.name = data.name.trim();
  if (data.email !== undefined) updateData.email = data.email.trim() || null;
  if (data.phone !== undefined) updateData.phone = data.phone.trim() || null;
  if (data.company !== undefined) updateData.company = data.company.trim() || null;
  if (data.source !== undefined) updateData.source = data.source;
  if (data.assignedTo !== undefined) updateData.assignedTo = data.assignedTo || null;
  if (data.expectedRevenue !== undefined) updateData.expectedRevenue = data.expectedRevenue ? new Decimal(data.expectedRevenue) : null;
  if (data.notes !== undefined) updateData.notes = data.notes || null;

  return db.lead.update({ where: { id }, data: updateData });
}

export async function updateLeadStatus(tenantId: string | undefined, id: string, status: string) {
  const tid = ensureTenantId(tenantId);
  const lead = await db.lead.findFirst({ where: { id, tenantId: tid } });
  if (!lead) throw new ApiError('Lead not found', 404);

  if (!LEAD_STATUSES.includes(status as LeadStatus)) {
    throw new ApiError(`Invalid status. Must be one of: ${LEAD_STATUSES.join(', ')}`, 400);
  }

  if (lead.status === 'WON' || lead.status === 'LOST') {
    throw new ApiError('Cannot change status of a closed lead', 400);
  }

  return db.lead.update({ where: { id }, data: { status } });
}

export async function deleteLead(tenantId: string | undefined, id: string) {
  const tid = ensureTenantId(tenantId);
  const lead = await db.lead.findFirst({ where: { id, tenantId: tid } });
  if (!lead) throw new ApiError('Lead not found', 404);
  if (lead.customerId) throw new ApiError('Cannot delete a converted lead', 400);
  await db.lead.delete({ where: { id } });
  return { deleted: true };
}

// --------------- Lead Pipeline Stats ---------------

export async function getLeadPipelineStats(tenantId: string | undefined) {
  const tid = ensureTenantId(tenantId);

  const counts = await db.lead.groupBy({
    by: ['status'],
    where: { tenantId: tid },
    _count: true,
  });

  const revenue = await db.lead.groupBy({
    by: ['status'],
    where: { tenantId: tid, expectedRevenue: { not: null } },
    _sum: { expectedRevenue: true },
  });

  const revenueMap = new Map(revenue.map((r) => [r.status, Number(r._sum.expectedRevenue || 0)]));

  const pipeline = LEAD_STATUSES.map((status) => {
    const found = counts.find((c) => c.status === status);
    return {
      status,
      count: found?._count || 0,
      expectedRevenue: revenueMap.get(status) || 0,
    };
  });

  const total = counts.reduce((s, c) => s + c._count, 0);

  return { pipeline, total };
}

// --------------- Activities ---------------

export async function getLeadActivities(tenantId: string | undefined, leadId: string) {
  const tid = ensureTenantId(tenantId);
  const lead = await db.lead.findFirst({ where: { id: leadId, tenantId: tid } });
  if (!lead) throw new ApiError('Lead not found', 404);

  return db.leadActivity.findMany({
    where: { leadId },
    orderBy: { createdAt: 'desc' },
  });
}

export async function addLeadActivity(
  tenantId: string | undefined,
  leadId: string,
  data: { type: string; description: string; createdBy?: string },
) {
  const tid = ensureTenantId(tenantId);
  const lead = await db.lead.findFirst({ where: { id: leadId, tenantId: tid } });
  if (!lead) throw new ApiError('Lead not found', 404);

  if (!ACTIVITY_TYPES.includes(data.type as (typeof ACTIVITY_TYPES)[number])) {
    throw new ApiError(`Invalid activity type. Must be one of: ${ACTIVITY_TYPES.join(', ')}`, 400);
  }
  if (!data.description?.trim()) throw new ApiError('Activity description is required', 400);

  return db.leadActivity.create({
    data: {
      leadId,
      type: data.type,
      description: data.description.trim(),
      createdBy: data.createdBy || null,
    },
  });
}

// --------------- Convert Lead to Customer ---------------

export async function convertLeadToCustomer(
  tenantId: string | undefined,
  leadId: string,
  overrides?: { name?: string; email?: string; phone?: string; company?: string; address?: string },
) {
  const tid = ensureTenantId(tenantId);
  const lead = await db.lead.findFirst({ where: { id: leadId, tenantId: tid } });
  if (!lead) throw new ApiError('Lead not found', 404);
  if (lead.customerId) throw new ApiError('Lead is already converted', 400);
  if (lead.status === 'LOST') throw new ApiError('Cannot convert a lost lead', 400);

  const customer = await db.customer.create({
    data: {
      tenantId: tid,
      name: overrides?.name || lead.name,
      email: overrides?.email || lead.email,
      phone: overrides?.phone || lead.phone,
      company: overrides?.company || lead.company,
      address: overrides?.address || null,
    },
  });

  await db.lead.update({
    where: { id: leadId },
    data: { status: 'WON', convertedAt: new Date(), customerId: customer.id },
  });

  await db.leadActivity.create({
    data: {
      leadId,
      type: 'NOTE',
      description: `Lead converted to customer: ${customer.name}`,
    },
  });

  return customer;
}

// --------------- Customers ---------------

export async function getCustomers(
  tenantId: string | undefined,
  options?: { search?: string; page?: number; limit?: number },
) {
  const tid = ensureTenantId(tenantId);
  const page = options?.page || 1;
  const limit = options?.limit || 50;

  const where: Record<string, unknown> = { tenantId: tid, isActive: true };
  if (options?.search) {
    where.OR = [
      { name: { contains: options.search, mode: 'insensitive' } },
      { email: { contains: options.search, mode: 'insensitive' } },
      { company: { contains: options.search, mode: 'insensitive' } },
    ];
  }

  const [customers, total] = await Promise.all([
    db.customer.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: { leads: { select: { id: true, name: true, status: true } } },
    }),
    db.customer.count({ where }),
  ]);

  return { customers, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function getCustomer(tenantId: string | undefined, id: string) {
  const tid = ensureTenantId(tenantId);
  const customer = await db.customer.findFirst({
    where: { id, tenantId: tid },
    include: { leads: { select: { id: true, name: true, status: true, createdAt: true } } },
  });
  if (!customer) throw new ApiError('Customer not found', 404);
  return customer;
}

export { LEAD_STATUSES, LEAD_SOURCES, ACTIVITY_TYPES };
