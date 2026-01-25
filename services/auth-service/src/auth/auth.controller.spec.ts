import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserRole } from '@pos/shared-types';

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
    refreshToken: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should register a user', async () => {
      const dto = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        role: UserRole.ADMIN,
      };

      const expectedResult = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        user: {
          id: 'user-id',
          ...dto,
        },
      };

      mockAuthService.register.mockResolvedValue(expectedResult);

      const result = await controller.register(dto);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(expectedResult);
      expect(mockAuthService.register).toHaveBeenCalledWith(dto);
    });
  });

  describe('login', () => {
    it('should login a user', async () => {
      const dto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const expectedResult = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        user: {
          id: 'user-id',
          email: dto.email,
          firstName: 'Test',
          lastName: 'User',
          role: UserRole.ADMIN,
        },
      };

      mockAuthService.login.mockResolvedValue(expectedResult);

      const result = await controller.login(dto);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(expectedResult);
      expect(mockAuthService.login).toHaveBeenCalledWith(dto);
    });
  });

  describe('refreshToken', () => {
    it('should refresh access token', async () => {
      const dto = {
        refreshToken: 'refresh-token',
      };

      const expectedResult = {
        accessToken: 'new-access-token',
      };

      mockAuthService.refreshToken.mockResolvedValue(expectedResult);

      const result = await controller.refreshToken(dto);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(expectedResult);
      expect(mockAuthService.refreshToken).toHaveBeenCalledWith(dto);
    });
  });
});

