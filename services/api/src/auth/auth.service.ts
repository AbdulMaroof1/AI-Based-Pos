import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../common/email/email.service';
import { TenantService } from '../tenant/tenant.service';
import { ModuleAccessService } from '../module-access/module-access.service';
import { PasswordUtil, JwtUtil } from '@pos/utils';
import { getConfig } from '@pos/config';
import { UserRole } from '@pos/shared-types';
import type {
  CreateUserDto,
  LoginDto,
  AuthResponse,
  RefreshTokenDto,
  RequestOtpDto,
  VerifyOtpDto,
  SetupAccountDto,
  VerifyOtpResponse,
  SetupAccountResponse,
} from '../../types';

const OTP_EXPIRY_MINUTES = 10;
const SETUP_TOKEN_EXPIRY = '15m';

@Injectable()
export class AuthService {
  private readonly config = getConfig();

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
    private readonly tenantService: TenantService,
    private readonly moduleAccessService: ModuleAccessService,
  ) {}

  async register(dto: CreateUserDto): Promise<AuthResponse> {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await PasswordUtil.hash(dto.password);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        firstName: dto.firstName,
        lastName: dto.lastName,
        role: dto.role,
        tenantId: dto.tenantId,
        branchId: dto.branchId,
      },
    });

    return this.generateAuthResponse(user);
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.password) {
      throw new UnauthorizedException('This account uses OTP login. Please use the email verification flow.');
    }

    const isPasswordValid = await PasswordUtil.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.tenantId && user.role !== UserRole.SUPER_ADMIN) {
      const tenant = await this.prisma.tenant.findUnique({
        where: { id: user.tenantId },
      });
      if (tenant && !tenant.isActive) {
        throw new UnauthorizedException('Company account is inactive');
      }
      if (tenant?.trialEndAt && tenant.trialEndAt < new Date() && tenant.plan === 'TRIAL') {
        throw new UnauthorizedException('Trial period has ended. Please upgrade your plan.');
      }
    }

    return this.generateAuthResponse(user);
  }

  async requestOtp(dto: RequestOtpDto): Promise<{ success: boolean }> {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + OTP_EXPIRY_MINUTES);

    await this.prisma.otpVerification.deleteMany({
      where: { email: dto.email },
    });

    await this.prisma.otpVerification.create({
      data: { email: dto.email, code, expiresAt },
    });

    await this.emailService.sendOtpEmail(dto.email, code);
    return { success: true };
  }

  async verifyOtp(dto: VerifyOtpDto): Promise<VerifyOtpResponse> {
    const otpRecord = await this.prisma.otpVerification.findFirst({
      where: { email: dto.email },
      orderBy: { createdAt: 'desc' },
    });

    if (!otpRecord || otpRecord.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired verification code');
    }

    if (otpRecord.code !== dto.code) {
      throw new UnauthorizedException('Invalid verification code');
    }

    await this.prisma.otpVerification.delete({ where: { id: otpRecord.id } });

    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser?.isActive) {
      return {
        needsSetup: false,
        ...(await this.generateAuthResponse(existingUser)),
      };
    }

    const setupToken = JwtUtil.signPayload(
      { email: dto.email, purpose: 'setup' },
      this.config.jwtSecret,
      SETUP_TOKEN_EXPIRY,
    );

    return {
      needsSetup: true,
      setupToken,
    };
  }

  async setupAccount(dto: SetupAccountDto, setupToken: string): Promise<SetupAccountResponse> {
    const payload = JwtUtil.verify<{ email: string; purpose: string }>(
      setupToken,
      this.config.jwtSecret,
    );

    if (payload.purpose !== 'setup' || payload.email !== dto.email) {
      throw new UnauthorizedException('Invalid setup token');
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const tenant = await this.tenantService.createTenant({
      name: dto.companyName,
      email: dto.email,
      phone: dto.phone,
      address: dto.country,
      trialDays: 14,
    });

    await this.moduleAccessService.setupDefaultPermissionsForTenant(tenant.id, dto.email);

    const hashedPassword = await PasswordUtil.hash(dto.password);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone ?? null,
        country: dto.country,
        role: UserRole.ADMIN,
        tenantId: tenant.id,
      },
    });

    return this.generateAuthResponse(user);
  }

  async forgotPassword(email: string): Promise<{ success: boolean }> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.password) {
      return { success: true };
    }

    const resetToken = JwtUtil.signPayload(
      { email, purpose: 'password-reset' },
      this.config.jwtSecret,
      '1h',
    );

    await this.prisma.passwordResetToken.deleteMany({
      where: { email },
    });

    await this.prisma.passwordResetToken.create({
      data: {
        email,
        token: resetToken,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      },
    });

    await this.emailService.sendPasswordResetEmail(email, resetToken);
    return { success: true };
  }

  async resetPassword(token: string, newPassword: string): Promise<{ success: boolean }> {
    const record = await this.prisma.passwordResetToken.findFirst({
      where: { token },
      orderBy: { createdAt: 'desc' },
    });

    if (!record || record.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired reset token');
    }

    const payload = JwtUtil.verify<{ email: string; purpose: string }>(
      token,
      this.config.jwtSecret,
    );

    if (payload.purpose !== 'password-reset' || payload.email !== record.email) {
      throw new UnauthorizedException('Invalid reset token');
    }

    const hashedPassword = await PasswordUtil.hash(newPassword);

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { email: record.email },
        data: { password: hashedPassword },
      }),
      this.prisma.passwordResetToken.deleteMany({
        where: { email: record.email },
      }),
    ]);

    return { success: true };
  }

  async refreshToken(dto: RefreshTokenDto): Promise<{ accessToken: string }> {
    const tokenRecord = await this.prisma.refreshToken.findUnique({
      where: { token: dto.refreshToken },
      include: { user: true },
    });

    if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    if (!tokenRecord.user.isActive) {
      throw new UnauthorizedException('User is inactive');
    }

    const accessToken = JwtUtil.sign(
      {
        userId: tokenRecord.user.id,
        email: tokenRecord.user.email,
        role: tokenRecord.user.role as UserRole,
        tenantId: tokenRecord.user.tenantId || undefined,
        branchId: tokenRecord.user.branchId || undefined,
      },
      this.config.jwtSecret,
      this.config.jwtExpiresIn
    );

    return { accessToken };
  }

  private async generateAuthResponse(user: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    role: string;
    tenantId: string | null;
    branchId: string | null;
  }): Promise<AuthResponse> {
    const accessToken = JwtUtil.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role as UserRole,
        tenantId: user.tenantId || undefined,
        branchId: user.branchId || undefined,
      },
      this.config.jwtSecret,
      this.config.jwtExpiresIn
    );

    const refreshToken = JwtUtil.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role as UserRole,
        tenantId: user.tenantId || undefined,
        branchId: user.branchId || undefined,
      },
      this.config.refreshTokenSecret,
      this.config.refreshTokenExpiresIn
    );

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.prisma.refreshToken.deleteMany({
      where: { userId: user.id },
    });

    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: refreshToken,
        expiresAt,
      },
    });

    return {
      accessToken,
      refreshToken,
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
}
