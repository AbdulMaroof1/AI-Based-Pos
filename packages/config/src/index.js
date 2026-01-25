"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getConfig = getConfig;
function getConfig() {
    return {
        port: parseInt(process.env.PORT || '3000', 10),
        host: process.env.HOST || 'localhost',
        databaseUrl: process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/pos_db',
        jwtSecret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
        jwtExpiresIn: process.env.JWT_EXPIRES_IN || '15m',
        refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET || 'your-refresh-secret-change-in-production',
        refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
    };
}
//# sourceMappingURL=index.js.map