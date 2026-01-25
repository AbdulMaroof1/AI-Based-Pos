import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PasswordUtil, JwtUtil } from '@pos/utils';
import { getConfig } from '@pos/config';
import { UserRole } from '@pos/shared-types';
import type { CreateUserDto, LoginDto, AuthResponse, RefreshTokenDto } from '../../types';

@Injectable()
export class AuthService {
  private readonly config = getConfig();

  constructor(private readonly prisma: PrismaService) {}

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

    const isPasswordValid = await PasswordUtil.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateAuthResponse(user);
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
    firstName: string;
    lastName: string;
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
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    // Delete old refresh tokens for this user to prevent duplicates
    await this.prisma.refreshToken.deleteMany({
      where: {
        userId: user.id,
      },
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
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role as UserRole,
        tenantId: user.tenantId || undefined,
        branchId: user.branchId || undefined,
      },
    };
  }
}

