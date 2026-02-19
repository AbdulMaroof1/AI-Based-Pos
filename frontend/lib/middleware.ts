import { NextRequest } from 'next/server';
import { verifyJwt } from './auth';
import { getConfig } from './config';
import { db } from './db';
import { ApiError } from './errors';
import { JwtPayload, UserRole } from './types';

export async function authenticate(req: NextRequest): Promise<JwtPayload> {
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    throw new ApiError('Missing or invalid authorization header', 401);
  }

  const token = authHeader.slice(7);
  try {
    const config = getConfig();
    return verifyJwt<JwtPayload>(token, config.jwtSecret);
  } catch {
    throw new ApiError('Invalid or expired token', 401);
  }
}

export function requireTenant(user: JwtPayload): string {
  if (user.role === UserRole.SUPER_ADMIN) return user.tenantId || 'ALL';
  if (!user.tenantId) throw new ApiError('Company context required', 403);
  return user.tenantId;
}

export async function requireActiveTrial(user: JwtPayload): Promise<void> {
  if (user.role === UserRole.SUPER_ADMIN) return;
  if (!user.tenantId) return;

  const tenant = await db.tenant.findUnique({
    where: { id: user.tenantId },
  });

  if (!tenant || !tenant.isActive) {
    throw new ApiError('Company is inactive', 403);
  }

  if (
    tenant.trialEndAt &&
    tenant.trialEndAt < new Date() &&
    tenant.plan === 'TRIAL'
  ) {
    throw new ApiError(
      'Trial period has ended. Please upgrade your plan.',
      403,
    );
  }
}

export async function requireModuleAccess(
  user: JwtPayload,
  moduleName: string,
): Promise<void> {
  if (user.role === UserRole.SUPER_ADMIN) return;
  if (!user.tenantId) throw new ApiError('Company context required', 403);

  const permission = await db.modulePermission.findUnique({
    where: {
      tenantId_moduleName: { tenantId: user.tenantId, moduleName },
    },
  });

  if (!permission?.isEnabled) {
    throw new ApiError(
      `Module ${moduleName} is not enabled for your company`,
      403,
    );
  }
}

export function requireSuperAdmin(user: JwtPayload): void {
  if (user.role !== UserRole.SUPER_ADMIN) {
    throw new ApiError('Super Admin access required', 403);
  }
}
