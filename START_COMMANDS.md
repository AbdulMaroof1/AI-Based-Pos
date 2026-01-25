# 🚀 Start Commands

Simple commands to start all services.

## Quick Start (All Services)

```bash
pnpm start
```

Or use npm:
```bash
npm start
```

This opens 3 separate PowerShell windows, one for each service.

**Note:** Each service has its own `.env` file with the correct DATABASE_URL.

## Start All Services

### Terminal 1 - Auth Service (Port 3000)

```powershell
$env:DATABASE_URL="postgresql://postgres:123456789@localhost:5432/pos_auth_db"
$env:PORT="3000"
cd services/auth-service
pnpm dev
```

### Terminal 2 - Tenant Service (Port 3001)

```powershell
$env:DATABASE_URL="postgresql://postgres:123456789@localhost:5432/pos_tenant_db"
$env:PORT="3001"
cd services/tenant-service
pnpm dev
```

### Terminal 3 - Module Access Service (Port 3002)

```powershell
$env:DATABASE_URL="postgresql://postgres:123456789@localhost:5432/pos_module_db"
$env:PORT="3002"
cd services/module-access-service
pnpm dev
```

## Test APIs

Once services are running, test with:

```bash
# Test Auth Service
curl http://localhost:3000/auth/login

# Test Tenant Service
curl http://localhost:3001/tenants

# Create a Tenant
curl -X POST http://localhost:3001/tenants -H "Content-Type: application/json" -d '{"name":"Test","email":"test@test.com"}'

# Register User
curl -X POST http://localhost:3000/auth/register -H "Content-Type: application/json" -d '{"email":"admin@test.com","password":"password123","firstName":"Admin","lastName":"User","role":"ADMIN"}'

# Login
curl -X POST http://localhost:3000/auth/login -H "Content-Type: application/json" -d '{"email":"admin@test.com","password":"password123"}'
```

## Service URLs

- Auth Service: http://localhost:3000
- Tenant Service: http://localhost:3001
- Module Access Service: http://localhost:3002

