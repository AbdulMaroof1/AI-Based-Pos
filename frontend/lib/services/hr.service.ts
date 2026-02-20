import { db } from '@/lib/db';
import { ApiError } from '@/lib/errors';
import { Decimal } from '@prisma/client/runtime/library';

function tid(tenantId: string | undefined): string {
  if (!tenantId) throw new ApiError('Company context required', 403);
  return tenantId;
}

// ===================== DEPARTMENTS =====================

export async function getDepartments(tenantId: string | undefined, options?: { search?: string; activeOnly?: boolean }) {
  const t = tid(tenantId);
  const where: Record<string, unknown> = { tenantId: t };
  if (options?.search) {
    where.OR = [
      { name: { contains: options.search, mode: 'insensitive' } },
      { code: { contains: options.search, mode: 'insensitive' } },
    ];
  }
  if (options?.activeOnly) where.isActive = true;
  return db.department.findMany({ where, orderBy: { name: 'asc' } });
}

export async function getDepartment(tenantId: string | undefined, id: string) {
  const t = tid(tenantId);
  const d = await db.department.findFirst({ where: { id, tenantId: t } });
  if (!d) throw new ApiError('Department not found', 404);
  return d;
}

export async function createDepartment(
  tenantId: string | undefined,
  data: { name: string; code: string; isActive?: boolean },
) {
  const t = tid(tenantId);
  if (!data.name?.trim()) throw new ApiError('Department name is required', 400);
  if (!data.code?.trim()) throw new ApiError('Department code is required', 400);
  return db.department.create({ data: { tenantId: t, name: data.name, code: data.code, isActive: data.isActive ?? true } });
}

export async function updateDepartment(tenantId: string | undefined, id: string, data: Record<string, unknown>) {
  const t = tid(tenantId);
  const d = await db.department.findFirst({ where: { id, tenantId: t } });
  if (!d) throw new ApiError('Department not found', 404);
  return db.department.update({ where: { id }, data });
}

// ===================== EMPLOYEES =====================

async function nextEmployeeNumber(tenantId: string): Promise<string> {
  const count = await db.employee.count({ where: { tenantId } });
  return `EMP${String(count + 1).padStart(5, '0')}`;
}

export async function getEmployees(tenantId: string | undefined, options?: { search?: string; departmentId?: string; status?: string }) {
  const t = tid(tenantId);
  const where: Record<string, unknown> = { tenantId: t };
  if (options?.search) {
    where.OR = [
      { firstName: { contains: options.search, mode: 'insensitive' } },
      { lastName: { contains: options.search, mode: 'insensitive' } },
      { employeeNumber: { contains: options.search, mode: 'insensitive' } },
      { email: { contains: options.search, mode: 'insensitive' } },
    ];
  }
  if (options?.departmentId) where.departmentId = options.departmentId;
  if (options?.status) where.status = options.status;
  return db.employee.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: { department: { select: { id: true, name: true, code: true } } },
  });
}

export async function getEmployee(tenantId: string | undefined, id: string) {
  const t = tid(tenantId);
  const e = await db.employee.findFirst({
    where: { id, tenantId: t },
    include: { department: true },
  });
  if (!e) throw new ApiError('Employee not found', 404);
  return e;
}

export async function createEmployee(
  tenantId: string | undefined,
  data: {
    departmentId?: string;
    employeeNumber?: string;
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    dateOfBirth?: string;
    dateOfJoining?: string;
    designation?: string;
    status?: string;
  },
) {
  const t = tid(tenantId);
  if (!data.firstName?.trim() || !data.lastName?.trim()) throw new ApiError('First and last name are required', 400);
  const employeeNumber = data.employeeNumber || (await nextEmployeeNumber(t));
  return db.employee.create({
    data: {
      tenantId: t,
      departmentId: data.departmentId || null,
      employeeNumber,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email || null,
      phone: data.phone || null,
      dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
      dateOfJoining: data.dateOfJoining ? new Date(data.dateOfJoining) : null,
      designation: data.designation || null,
      status: data.status || 'ACTIVE',
    },
    include: { department: { select: { id: true, name: true, code: true } } },
  });
}

export async function updateEmployee(tenantId: string | undefined, id: string, data: Record<string, unknown>) {
  const t = tid(tenantId);
  const e = await db.employee.findFirst({ where: { id, tenantId: t } });
  if (!e) throw new ApiError('Employee not found', 404);
  const clean: Record<string, unknown> = {};
  if (data.dateOfBirth !== undefined) clean.dateOfBirth = data.dateOfBirth ? new Date(data.dateOfBirth as string) : null;
  if (data.dateOfJoining !== undefined) clean.dateOfJoining = data.dateOfJoining ? new Date(data.dateOfJoining as string) : null;
  const { dateOfBirth, dateOfJoining, ...rest } = data;
  Object.assign(clean, rest);
  return db.employee.update({ where: { id }, data: clean });
}

// ===================== ATTENDANCE =====================

export async function getAttendance(
  tenantId: string | undefined,
  options?: { employeeId?: string; from?: string; to?: string; status?: string },
) {
  const t = tid(tenantId);
  const where: Record<string, unknown> = { tenantId: t };
  if (options?.employeeId) where.employeeId = options.employeeId;
  if (options?.from || options?.to) {
    where.date = {};
    if (options.from) (where.date as Record<string, Date>).gte = new Date(options.from);
    if (options.to) (where.date as Record<string, Date>).lte = new Date(options.to);
  }
  if (options?.status) where.status = options.status;
  return db.attendance.findMany({
    where,
    orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
    include: { employee: { select: { id: true, employeeNumber: true, firstName: true, lastName: true } } },
  });
}

export async function getAttendanceRecord(tenantId: string | undefined, id: string) {
  const t = tid(tenantId);
  const a = await db.attendance.findFirst({
    where: { id, tenantId: t },
    include: { employee: true },
  });
  if (!a) throw new ApiError('Attendance record not found', 404);
  return a;
}

export async function upsertAttendance(
  tenantId: string | undefined,
  data: {
    employeeId: string;
    date: string;
    checkIn?: string;
    checkOut?: string;
    status?: string;
    notes?: string;
  },
) {
  const t = tid(tenantId);
  const date = new Date(data.date);
  const payload = {
    tenantId: t,
    employeeId: data.employeeId,
    date,
    checkIn: data.checkIn ? new Date(data.checkIn) : null,
    checkOut: data.checkOut ? new Date(data.checkOut) : null,
    status: data.status || 'PRESENT',
    notes: data.notes || null,
  };
  const existing = await db.attendance.findFirst({
    where: { tenantId: t, employeeId: data.employeeId, date },
  });
  if (existing) {
    return db.attendance.update({
      where: { id: existing.id },
      data: { ...payload, date: undefined } as Record<string, unknown>,
    });
  }
  return db.attendance.create({ data: payload });
}

export async function bulkUpsertAttendance(
  tenantId: string | undefined,
  date: string,
  records: { employeeId: string; status?: string; checkIn?: string; checkOut?: string; notes?: string }[],
) {
  const t = tid(tenantId);
  const d = new Date(date);
  const results = [];
  for (const r of records) {
    const existing = await db.attendance.findFirst({
      where: { tenantId: t, employeeId: r.employeeId, date: d },
    });
    const payload = {
      tenantId: t,
      employeeId: r.employeeId,
      date: d,
      status: r.status || 'PRESENT',
      checkIn: r.checkIn ? new Date(r.checkIn) : null,
      checkOut: r.checkOut ? new Date(r.checkOut) : null,
      notes: r.notes || null,
    };
    if (existing) {
      results.push(await db.attendance.update({ where: { id: existing.id }, data: payload }));
    } else {
      results.push(await db.attendance.create({ data: payload }));
    }
  }
  return results;
}

// ===================== LEAVE =====================

export async function getLeaves(
  tenantId: string | undefined,
  options?: { employeeId?: string; status?: string; from?: string; to?: string },
) {
  const t = tid(tenantId);
  const where: Record<string, unknown> = { tenantId: t };
  if (options?.employeeId) where.employeeId = options.employeeId;
  if (options?.status) where.status = options.status;
  if (options?.from || options?.to) {
    where.AND = [];
    if (options.from) (where.AND as Record<string, unknown>[]).push({ endDate: { gte: new Date(options.from) } });
    if (options.to) (where.AND as Record<string, unknown>[]).push({ startDate: { lte: new Date(options.to) } });
  }
  return db.leave.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: { employee: { select: { id: true, employeeNumber: true, firstName: true, lastName: true } } },
  });
}

export async function getLeave(tenantId: string | undefined, id: string) {
  const t = tid(tenantId);
  const l = await db.leave.findFirst({
    where: { id, tenantId: t },
    include: { employee: true },
  });
  if (!l) throw new ApiError('Leave record not found', 404);
  return l;
}

export async function createLeave(
  tenantId: string | undefined,
  data: {
    employeeId: string;
    leaveType: string;
    startDate: string;
    endDate: string;
    days: number;
    reason?: string;
  },
) {
  const t = tid(tenantId);
  if (!data.employeeId || !data.leaveType || !data.startDate || !data.endDate || data.days == null) {
    throw new ApiError('employeeId, leaveType, startDate, endDate and days are required', 400);
  }
  return db.leave.create({
    data: {
      tenantId: t,
      employeeId: data.employeeId,
      leaveType: data.leaveType,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      days: new Decimal(data.days),
      reason: data.reason || null,
    },
    include: { employee: { select: { id: true, employeeNumber: true, firstName: true, lastName: true } } },
  });
}

export async function updateLeaveStatus(
  tenantId: string | undefined,
  id: string,
  status: 'APPROVED' | 'REJECTED',
  approvedBy?: string,
) {
  const t = tid(tenantId);
  const l = await db.leave.findFirst({ where: { id, tenantId: t } });
  if (!l) throw new ApiError('Leave record not found', 404);
  return db.leave.update({
    where: { id },
    data: { status, approvedBy: approvedBy || null, approvedAt: new Date() },
  });
}

// ===================== SUMMARY =====================

export async function getHrSummary(tenantId: string | undefined) {
  const t = tid(tenantId);
  const [departments, employees, todayPresent, pendingLeaves] = await Promise.all([
    db.department.count({ where: { tenantId: t, isActive: true } }),
    db.employee.count({ where: { tenantId: t, status: 'ACTIVE' } }),
    db.attendance.count({
      where: {
        tenantId: t,
        date: { gte: new Date(new Date().setHours(0, 0, 0, 0)), lte: new Date() },
        status: 'PRESENT',
      },
    }),
    db.leave.count({ where: { tenantId: t, status: 'PENDING' } }),
  ]);
  return { departments, employees, todayPresent, pendingLeaves };
}
