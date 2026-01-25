import { UserRole } from '@pos/shared-types';
export interface CreateUserDto {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    tenantId?: string;
    branchId?: string;
}
export interface LoginDto {
    email: string;
    password: string;
}
export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    user: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        role: UserRole;
        tenantId?: string;
        branchId?: string;
    };
}
export interface RefreshTokenDto {
    refreshToken: string;
}
//# sourceMappingURL=index.d.ts.map