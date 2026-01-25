import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { UserRole } from '@pos/shared-types';
import type { CreateUserDto, LoginDto } from '../../types';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    refreshToken: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  describe('register', () => {
    const createUserDto: CreateUserDto = {
      email: 'test@example.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User',
      role: UserRole.ADMIN,
    };

    it('should register a new user successfully', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue({
        id: 'user-id',
        ...createUserDto,
        password: 'hashed-password',
        tenantId: null,
        branchId: null,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      mockPrismaService.refreshToken.create.mockResolvedValue({});

      const result = await service.register(createUserDto);

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user.email).toBe(createUserDto.email);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: createUserDto.email },
      });
      expect(mockPrismaService.user.create).toHaveBeenCalled();
    });

    it('should throw ConflictException if user already exists', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'existing-user-id',
        email: createUserDto.email,
      });

      await expect(service.register(createUserDto)).rejects.toThrow(ConflictException);
      expect(mockPrismaService.user.create).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    const loginDto: LoginDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should login successfully with valid credentials', async () => {
      const mockUser = {
        id: 'user-id',
        email: loginDto.email,
        password: '$2b$10$hashedpassword',
        firstName: 'Test',
        lastName: 'User',
        role: UserRole.ADMIN,
        tenantId: null,
        branchId: null,
        isActive: true,
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.refreshToken.create.mockResolvedValue({});

      // Mock PasswordUtil.compare
      const passwordUtil = require('@pos/utils');
      jest.spyOn(passwordUtil.PasswordUtil, 'compare').mockResolvedValue(true);

      const result = await service.login(loginDto);

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user.email).toBe(loginDto.email);
    });

    it('should throw UnauthorizedException for invalid email', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for invalid password', async () => {
      const mockUser = {
        id: 'user-id',
        email: loginDto.email,
        password: '$2b$10$hashedpassword',
        firstName: 'Test',
        lastName: 'User',
        role: UserRole.ADMIN,
        tenantId: null,
        branchId: null,
        isActive: true,
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      // Mock PasswordUtil.compare to return false
      const passwordUtil = require('@pos/utils');
      jest.spyOn(passwordUtil.PasswordUtil, 'compare').mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for inactive user', async () => {
      const mockUser = {
        id: 'user-id',
        email: loginDto.email,
        password: '$2b$10$hashedpassword',
        firstName: 'Test',
        lastName: 'User',
        role: UserRole.ADMIN,
        tenantId: null,
        branchId: null,
        isActive: false,
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('refreshToken', () => {
    const refreshTokenDto = {
      refreshToken: 'valid-refresh-token',
    };

    it('should refresh access token successfully', async () => {
      const mockTokenRecord = {
        id: 'token-id',
        userId: 'user-id',
        token: refreshTokenDto.refreshToken,
        expiresAt: new Date(Date.now() + 86400000), // Future date
        user: {
          id: 'user-id',
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
          role: UserRole.ADMIN,
          tenantId: null,
          branchId: null,
          isActive: true,
        },
      };

      mockPrismaService.refreshToken.findUnique.mockResolvedValue(mockTokenRecord);

      const result = await service.refreshToken(refreshTokenDto);

      expect(result).toHaveProperty('accessToken');
      expect(typeof result.accessToken).toBe('string');
    });

    it('should throw UnauthorizedException for invalid token', async () => {
      mockPrismaService.refreshToken.findUnique.mockResolvedValue(null);

      await expect(service.refreshToken(refreshTokenDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for expired token', async () => {
      const mockTokenRecord = {
        id: 'token-id',
        userId: 'user-id',
        token: refreshTokenDto.refreshToken,
        expiresAt: new Date(Date.now() - 86400000), // Past date
        user: {
          id: 'user-id',
          email: 'test@example.com',
          role: UserRole.ADMIN,
          isActive: true,
        },
      };

      mockPrismaService.refreshToken.findUnique.mockResolvedValue(mockTokenRecord);

      await expect(service.refreshToken(refreshTokenDto)).rejects.toThrow(UnauthorizedException);
    });
  });
});

