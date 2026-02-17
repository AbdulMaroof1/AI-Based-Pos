# Start Commands — Modular Monolith (Single Port)

## Quick Start

**Terminal 1 — API (Port 3001)**
```bash
cd services/api
pnpm db:migrate   # Run once to create database
pnpm dev
```

**Terminal 2 — Frontend (Port 3007)**
```bash
cd frontend
pnpm dev
```

## Environment

Create `services/api/.env`:
```
DATABASE_URL=postgresql://postgres:123456789@localhost:5432/pos_db
PORT=3001
JWT_SECRET=your-secret-key-change-in-production
REFRESH_TOKEN_SECRET=your-refresh-secret-change-in-production
```

Create PostgreSQL database:
```sql
CREATE DATABASE pos_db;
```

## API Endpoints (all on http://localhost:3001)

| Path | Method | Description |
|------|--------|-------------|
| /auth/request-otp | POST | Send OTP to email |
| /auth/verify-otp | POST | Verify OTP |
| /auth/setup-account | POST | Create company + user |
| /auth/login | POST | Email/password login |
| /tenants | GET/POST | List/create tenants |
| /modules/active | GET | Active modules for app launcher |
| /modules/:tenantId/permissions | GET | Tenant module permissions |

## Frontend

Set `NEXT_PUBLIC_API_URL=http://localhost:3001` or rely on default.
