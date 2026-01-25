# 🚀 How to Run the Project

Complete guide to get your AI-Based POS system up and running.

## 📋 Prerequisites

Before running, make sure you have:

- ✅ **Node.js** >= 18.0.0 (`node --version`)
- ✅ **pnpm** >= 8.0.0 (`pnpm --version`)
- ✅ **PostgreSQL** >= 14.0 (running and accessible)
- ✅ **Dependencies installed** (`pnpm install`)

## 🔧 Step 1: Environment Setup

### 1.1 Create Environment File

```bash
# Copy the example file
cp .env.example .env
```

### 1.2 Configure Environment Variables

Edit `.env` file with your database credentials:

```env
# Database (REQUIRED)
DATABASE_URL=postgresql://username:password@localhost:5432/pos_db

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_SECRET=your-super-secret-refresh-key-change-in-production
REFRESH_TOKEN_EXPIRES_IN=7d

# Service Ports (optional, defaults shown)
PORT=3000
HOST=localhost
```

**Important Notes:**
- Replace `username`, `password`, and `pos_db` with your PostgreSQL credentials
- Change JWT secrets to secure random strings in production
- Each service uses `PORT + service_index` (3000, 3001, 3002)

## 🗄️ Step 2: Database Setup

### 2.1 Create Database

```sql
-- Connect to PostgreSQL
psql -U postgres

-- Create database
CREATE DATABASE pos_db;

-- Exit
\q
```

### 2.2 Run Migrations

Generate Prisma clients and run migrations for each service:

```bash
# Generate Prisma clients
pnpm db:generate

# Run migrations (creates tables)
pnpm --filter '@pos/auth-service' db:migrate
pnpm --filter '@pos/tenant-service' db:migrate
pnpm --filter '@pos/module-access-service' db:migrate
```

**Note:** You'll be prompted to name each migration. Use descriptive names like:
- `init_auth_schema`
- `init_tenant_schema`
- `init_module_access_schema`

## 🏗️ Step 3: Build Project

Build all packages and services:

```bash
pnpm build
```

This will:
1. Build shared packages (`@pos/shared-types`, `@pos/config`, etc.)
2. Build all services (`auth-service`, `tenant-service`, `module-access-service`)

## ▶️ Step 4: Run Services

### Option A: Run All Services in Parallel (Recommended)

```bash
pnpm dev
```

This starts all three services simultaneously:
- **Auth Service**: http://localhost:3000
- **Tenant Service**: http://localhost:3001
- **Module Access Service**: http://localhost:3002

### Option B: Run Services Individually

**Terminal 1 - Auth Service:**
```bash
cd services/auth-service
pnpm dev
```

**Terminal 2 - Tenant Service:**
```bash
cd services/tenant-service
pnpm dev
```

**Terminal 3 - Module Access Service:**
```bash
cd services/module-access-service
pnpm dev
```

## ✅ Step 5: Verify Services Are Running

### Check Service Health

Open your browser or use curl:

```bash
# Auth Service
curl http://localhost:3000/auth/login
# Should return validation error (service is running)

# Tenant Service
curl http://localhost:3001/tenants
# Should return empty array or tenants

# Module Access Service
curl http://localhost:3002/modules/test-tenant-id/permissions
# Should return permissions structure
```

### Expected Output

When services start successfully, you should see:

```
Auth Service running on http://localhost:3000
Tenant Service running on http://localhost:3001
Module Access Service running on http://localhost:3002
```

## 🧪 Step 6: Test the APIs

### Quick Test Workflow

1. **Create a Tenant:**
```bash
curl -X POST http://localhost:3001/tenants \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Restaurant",
    "email": "test@restaurant.com",
    "phone": "1234567890"
  }'
```

2. **Register an Admin User:**
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@restaurant.com",
    "password": "password123",
    "firstName": "Admin",
    "lastName": "User",
    "role": "ADMIN",
    "tenantId": "<tenant-id-from-step-1>"
  }'
```

3. **Login:**
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@restaurant.com",
    "password": "password123"
  }'
```

4. **Enable POS Module:**
```bash
curl -X PUT http://localhost:3002/modules/<tenant-id>/enable/POS \
  -H "Content-Type: application/json" \
  -d '{
    "enabledBy": "<admin-user-id>"
  }'
```

See `API_URLS.md` for complete API documentation.

## 🐛 Troubleshooting

### Services Won't Start

**Error: "Port already in use"**
```bash
# Find process using port
# Windows:
netstat -ano | findstr :3000

# Kill process or change port in service's main.ts
```

**Error: "Cannot connect to database"**
- Check PostgreSQL is running: `pg_isready` or check services
- Verify `DATABASE_URL` in `.env` is correct
- Ensure database exists: `psql -U postgres -l`

**Error: "Prisma Client not generated"**
```bash
pnpm db:generate
```

### Build Errors

**Error: "Cannot find module '@pos/shared-types'"**
```bash
# Rebuild packages first
pnpm build:packages
# Then build services
pnpm build:services
```

**Error: "TypeScript errors"**
```bash
# Clean and rebuild
rm -rf node_modules packages/*/node_modules services/*/node_modules
pnpm install
pnpm build
```

### Database Migration Issues

**Error: "Migration failed"**
```bash
# Reset database (WARNING: Deletes all data)
pnpm --filter '@pos/auth-service' db:migrate reset
pnpm --filter '@pos/tenant-service' db:migrate reset
pnpm --filter '@pos/module-access-service' db:migrate reset
```

## 📝 Development Workflow

### Making Changes

1. **Edit code** in `services/` or `packages/`
2. **Services auto-reload** (if using `pnpm dev`)
3. **Rebuild if needed**: `pnpm build`

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests for specific service
cd services/auth-service
pnpm test
```

### Database Management

```bash
# Open Prisma Studio (visual database editor)
cd services/auth-service
pnpm db:studio
```

## 🎯 Next Steps After Running

1. ✅ **Test all APIs** using `API_URLS.md`
2. ✅ **Create test data** (tenants, users, permissions)
3. ✅ **Run test suite**: `pnpm test`
4. ✅ **Start building Milestone 2** (POS Service)

## 📚 Additional Resources

- **API Documentation**: See `API_DOCUMENTATION.md`
- **Quick API Reference**: See `API_URLS.md`
- **Setup Details**: See `SETUP.md`
- **Milestones**: See `MILESTONES.md`

---

**Happy Coding! 🚀**

