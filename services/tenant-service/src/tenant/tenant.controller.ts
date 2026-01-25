import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    Query,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { TenantService } from './tenant.service';
import type {
    CreateTenantDto,
    UpdateTenantDto,
    CreateBranchDto,
    UpdateBranchDto,
} from '../../types';
import { IsString, IsEmail, IsOptional, IsBoolean, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

class CreateTenantRequest implements CreateTenantDto {
    @IsString()
    name!: string;

    @IsEmail()
    email!: string;

    @IsOptional()
    @IsString()
    phone?: string;

    @IsOptional()
    @IsString()
    address?: string;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}

class UpdateTenantRequest implements UpdateTenantDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsEmail()
    email?: string;

    @IsOptional()
    @IsString()
    phone?: string;

    @IsOptional()
    @IsString()
    address?: string;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}

class CreateBranchRequest implements CreateBranchDto {
    @IsString()
    tenantId!: string;

    @IsString()
    name!: string;

    @IsOptional()
    @IsString()
    address?: string;

    @IsOptional()
    @IsString()
    phone?: string;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}

class UpdateBranchRequest implements UpdateBranchDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    address?: string;

    @IsOptional()
    @IsString()
    phone?: string;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}

class PaginationQuery {
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    limit?: number;

    @IsOptional()
    @IsString()
    sortBy?: string;

    @IsOptional()
    @IsString()
    sortOrder?: 'asc' | 'desc';
}

@Controller('tenants')
export class TenantController {
    constructor(private readonly tenantService: TenantService) { }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async createTenant(@Body() dto: CreateTenantRequest) {
        const result = await this.tenantService.createTenant(dto);
        return {
            success: true,
            data: result,
        };
    }

    @Get()
    async getTenants(@Query() query: PaginationQuery) {
        const result = await this.tenantService.getTenants(query);
        return {
            success: true,
            data: result,
        };
    }

    @Get(':id')
    async getTenant(@Param('id') id: string) {
        const result = await this.tenantService.getTenant(id);
        return {
            success: true,
            data: result,
        };
    }

    @Put(':id')
    async updateTenant(@Param('id') id: string, @Body() dto: UpdateTenantRequest) {
        const result = await this.tenantService.updateTenant(id, dto);
        return {
            success: true,
            data: result,
        };
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async deleteTenant(@Param('id') id: string) {
        await this.tenantService.deleteTenant(id);
    }

    @Post(':tenantId/branches')
    @HttpCode(HttpStatus.CREATED)
    async createBranch(@Param('tenantId') tenantId: string, @Body() dto: CreateBranchRequest) {
        const result = await this.tenantService.createBranch({ ...dto, tenantId });
        return {
            success: true,
            data: result,
        };
    }

    @Get(':tenantId/branches')
    async getBranches(@Param('tenantId') tenantId: string) {
        const result = await this.tenantService.getBranches(tenantId);
        return {
            success: true,
            data: result,
        };
    }

    @Get('branches/:id')
    async getBranch(@Param('id') id: string) {
        const result = await this.tenantService.getBranch(id);
        return {
            success: true,
            data: result,
        };
    }

    @Put('branches/:id')
    async updateBranch(@Param('id') id: string, @Body() dto: UpdateBranchRequest) {
        const result = await this.tenantService.updateBranch(id, dto);
        return {
            success: true,
            data: result,
        };
    }

    @Delete('branches/:id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async deleteBranch(@Param('id') id: string) {
        await this.tenantService.deleteBranch(id);
    }
}

