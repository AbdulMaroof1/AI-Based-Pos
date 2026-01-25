export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}
export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
export interface PaginationParams {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
export declare enum UserRole {
    SUPER_ADMIN = "SUPER_ADMIN",
    ADMIN = "ADMIN",
    MANAGER = "MANAGER",
    CASHIER = "CASHIER",
    STAFF = "STAFF"
}
export declare enum ModuleName {
    POS = "POS",
    INVENTORY = "INVENTORY",
    ACCOUNTING = "ACCOUNTING",
    LOYALTY = "LOYALTY",
    ECOMMERCE = "ECOMMERCE",
    AI = "AI",
    CRM = "CRM"
}
export interface JwtPayload {
    userId: string;
    email: string;
    role: UserRole;
    tenantId?: string;
    branchId?: string;
}
export interface ServiceConfig {
    port: number;
    host: string;
    databaseUrl: string;
    jwtSecret: string;
    jwtExpiresIn: string;
    refreshTokenSecret: string;
    refreshTokenExpiresIn: string;
}
//# sourceMappingURL=index.d.ts.map