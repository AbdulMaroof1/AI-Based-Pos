import { Controller, Post, Body, HttpCode, HttpStatus, Headers, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import type {
  CreateUserDto,
  LoginDto,
  RefreshTokenDto,
  RequestOtpDto,
  VerifyOtpDto,
  SetupAccountDto,
} from '../../types';
import { IsEmail, IsString, MinLength, IsEnum, IsOptional } from 'class-validator';
import { UserRole } from '@pos/shared-types';

class RequestOtpRequest implements RequestOtpDto {
  @IsEmail()
  email!: string;
}

class VerifyOtpRequest implements VerifyOtpDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  code!: string;
}

class SetupAccountRequest implements SetupAccountDto {
  @IsString()
  firstName!: string;

  @IsString()
  lastName!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsString()
  country!: string;

  @IsString()
  companyName!: string;

  @IsOptional()
  @IsString()
  phone?: string;
}

class CreateUserRequest implements CreateUserDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsString()
  firstName!: string;

  @IsString()
  lastName!: string;

  @IsEnum(UserRole)
  role!: UserRole;

  @IsOptional()
  @IsString()
  tenantId?: string;

  @IsOptional()
  @IsString()
  branchId?: string;
}

class LoginRequest implements LoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  password!: string;
}

class RefreshTokenRequest implements RefreshTokenDto {
  @IsString()
  refreshToken!: string;
}

class ForgotPasswordRequest {
  @IsEmail()
  email!: string;
}

class ResetPasswordRequest {
  @IsString()
  token!: string;

  @IsString()
  @MinLength(8)
  newPassword!: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: CreateUserRequest) {
    const result = await this.authService.register(dto);
    return { success: true, data: result };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginRequest) {
    const result = await this.authService.login(dto);
    return { success: true, data: result };
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() dto: ForgotPasswordRequest) {
    const result = await this.authService.forgotPassword(dto.email);
    return { success: true, data: result };
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() dto: ResetPasswordRequest) {
    const result = await this.authService.resetPassword(dto.token, dto.newPassword);
    return { success: true, data: result };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Body() dto: RefreshTokenRequest) {
    const result = await this.authService.refreshToken(dto);
    return { success: true, data: result };
  }

  @Post('request-otp')
  @HttpCode(HttpStatus.OK)
  async requestOtp(@Body() dto: RequestOtpRequest) {
    await this.authService.requestOtp(dto);
    return { success: true, data: { message: 'Verification code sent to your email' } };
  }

  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  async verifyOtp(@Body() dto: VerifyOtpRequest) {
    const result = await this.authService.verifyOtp(dto);
    return { success: true, data: result };
  }

  @Post('setup-account')
  @HttpCode(HttpStatus.CREATED)
  async setupAccount(
    @Body() dto: SetupAccountRequest,
    @Headers('x-setup-token') setupToken: string,
  ) {
    if (!setupToken) {
      throw new UnauthorizedException('Setup token required');
    }
    const result = await this.authService.setupAccount(dto, setupToken);
    return { success: true, data: result };
  }
}
