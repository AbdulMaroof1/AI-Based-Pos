import { db } from '@/lib/db';
import { sendOtpEmail, sendPasswordResetEmail } from '@/lib/email';
import { hashPassword, comparePassword, signJwt, signPayload, verifyJwt } from '@/lib/auth';
import { getConfig } from '@/lib/config';
import { ApiError } from '@/lib/errors';
import { UserRole, AuthResponse } from '@/lib/types';
import { createTenant } from './tenant.service';
import { setupDefaultPermissionsForTenant } from './module-access.service';

const OTP_EXPIRY_MINUTES = 10;
const SETUP_TOKEN_EXPIRY = '15m';

export async function register(dto: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  tenantId?: string;
  branchId?: string;
}): Promise<AuthResponse> {
  const existing = await db.user.findUnique({ where: { email: dto.email } });
  if (existing) throw new ApiError('User with this email already exists', 409);

  const hashed = await hashPassword(dto.password);
  const user = await db.user.create({
    data: {
      email: dto.email,
      password: hashed,
      firstName: dto.firstName,
      lastName: dto.lastName,
      role: dto.role,
      tenantId: dto.tenantId,
      branchId: dto.branchId,
    },
  });

  return generateAuthResponse(user);
}

export async function login(dto: {
  email: string;
  password: string;
}): Promise<AuthResponse> {
  const user = await db.user.findUnique({ where: { email: dto.email } });
  if (!user || !user.isActive) throw new ApiError('Invalid credentials', 401);

  if (!user.password) {
    throw new ApiError(
      'This account uses OTP login. Please use the email verification flow.',
      401,
    );
  }

  const valid = await comparePassword(dto.password, user.password);
  if (!valid) throw new ApiError('Invalid credentials', 401);

  if (user.tenantId && user.role !== UserRole.SUPER_ADMIN) {
    const tenant = await db.tenant.findUnique({ where: { id: user.tenantId } });
    if (tenant && !tenant.isActive) {
      throw new ApiError('Company account is inactive', 401);
    }
    if (tenant?.trialEndAt && tenant.trialEndAt < new Date() && tenant.plan === 'TRIAL') {
      throw new ApiError('Trial period has ended. Please upgrade your plan.', 401);
    }
  }

  return generateAuthResponse(user);
}

export async function requestOtp(email: string): Promise<void> {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + OTP_EXPIRY_MINUTES);

  await db.otpVerification.deleteMany({ where: { email } });
  await db.otpVerification.create({ data: { email, code, expiresAt } });
  await sendOtpEmail(email, code);
}

export async function verifyOtp(dto: { email: string; code: string }) {
  const record = await db.otpVerification.findFirst({
    where: { email: dto.email },
    orderBy: { createdAt: 'desc' },
  });

  if (!record || record.expiresAt < new Date()) {
    throw new ApiError('Invalid or expired verification code', 401);
  }
  if (record.code !== dto.code) {
    throw new ApiError('Invalid verification code', 401);
  }

  await db.otpVerification.delete({ where: { id: record.id } });

  const existingUser = await db.user.findUnique({ where: { email: dto.email } });
  if (existingUser?.isActive) {
    return { needsSetup: false, ...(await generateAuthResponse(existingUser)) };
  }

  const config = getConfig();
  const setupToken = signPayload(
    { email: dto.email, purpose: 'setup' },
    config.jwtSecret,
    SETUP_TOKEN_EXPIRY,
  );

  return { needsSetup: true, setupToken };
}

export async function setupAccount(
  dto: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    country: string;
    companyName: string;
    phone?: string;
  },
  setupToken: string,
): Promise<AuthResponse> {
  const config = getConfig();
  const payload = verifyJwt<{ email: string; purpose: string }>(
    setupToken,
    config.jwtSecret,
  );

  if (payload.purpose !== 'setup' || payload.email !== dto.email) {
    throw new ApiError('Invalid setup token', 401);
  }

  const existing = await db.user.findUnique({ where: { email: dto.email } });
  if (existing) throw new ApiError('User with this email already exists', 409);

  const tenant = await createTenant({
    name: dto.companyName,
    email: dto.email,
    phone: dto.phone,
    address: dto.country,
    trialDays: 14,
  });

  await setupDefaultPermissionsForTenant(tenant.id, dto.email);

  const hashed = await hashPassword(dto.password);
  const user = await db.user.create({
    data: {
      email: dto.email,
      password: hashed,
      firstName: dto.firstName,
      lastName: dto.lastName,
      phone: dto.phone ?? null,
      country: dto.country,
      role: UserRole.ADMIN,
      tenantId: tenant.id,
    },
  });

  return generateAuthResponse(user);
}

export async function forgotPassword(email: string): Promise<void> {
  const user = await db.user.findUnique({ where: { email } });
  if (!user || !user.password) return;

  const config = getConfig();
  const resetToken = signPayload(
    { email, purpose: 'password-reset' },
    config.jwtSecret,
    '1h',
  );

  await db.passwordResetToken.deleteMany({ where: { email } });
  await db.passwordResetToken.create({
    data: {
      email,
      token: resetToken,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    },
  });

  await sendPasswordResetEmail(email, resetToken);
}

export async function resetPassword(
  token: string,
  newPassword: string,
): Promise<void> {
  const record = await db.passwordResetToken.findFirst({
    where: { token },
    orderBy: { createdAt: 'desc' },
  });

  if (!record || record.expiresAt < new Date()) {
    throw new ApiError('Invalid or expired reset token', 401);
  }

  const config = getConfig();
  const payload = verifyJwt<{ email: string; purpose: string }>(
    token,
    config.jwtSecret,
  );

  if (payload.purpose !== 'password-reset' || payload.email !== record.email) {
    throw new ApiError('Invalid reset token', 401);
  }

  const hashed = await hashPassword(newPassword);
  await db.$transaction([
    db.user.update({
      where: { email: record.email },
      data: { password: hashed },
    }),
    db.passwordResetToken.deleteMany({ where: { email: record.email } }),
  ]);
}

export async function refreshToken(
  refreshTokenValue: string,
): Promise<{ accessToken: string }> {
  const record = await db.refreshToken.findUnique({
    where: { token: refreshTokenValue },
    include: { user: true },
  });

  if (!record || record.expiresAt < new Date()) {
    throw new ApiError('Invalid or expired refresh token', 401);
  }
  if (!record.user.isActive) {
    throw new ApiError('User is inactive', 401);
  }

  const config = getConfig();
  const accessToken = signJwt(
    {
      userId: record.user.id,
      email: record.user.email,
      role: record.user.role as UserRole,
      tenantId: record.user.tenantId || undefined,
      branchId: record.user.branchId || undefined,
    },
    config.jwtSecret,
    config.jwtExpiresIn,
  );

  return { accessToken };
}

async function generateAuthResponse(user: {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: string;
  tenantId: string | null;
  branchId: string | null;
}): Promise<AuthResponse> {
  const config = getConfig();

  const accessToken = signJwt(
    {
      userId: user.id,
      email: user.email,
      role: user.role as UserRole,
      tenantId: user.tenantId || undefined,
      branchId: user.branchId || undefined,
    },
    config.jwtSecret,
    config.jwtExpiresIn,
  );

  const refreshTokenValue = signJwt(
    {
      userId: user.id,
      email: user.email,
      role: user.role as UserRole,
      tenantId: user.tenantId || undefined,
      branchId: user.branchId || undefined,
    },
    config.refreshTokenSecret,
    config.refreshTokenExpiresIn,
  );

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await db.refreshToken.deleteMany({ where: { userId: user.id } });
  await db.refreshToken.create({
    data: { userId: user.id, token: refreshTokenValue, expiresAt },
  });

  return {
    accessToken,
    refreshToken: refreshTokenValue,
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName ?? '',
      lastName: user.lastName ?? '',
      role: user.role as UserRole,
      tenantId: user.tenantId || undefined,
      branchId: user.branchId || undefined,
    },
  };
}
