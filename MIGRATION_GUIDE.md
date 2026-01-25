# 🗄️ Database Migration Guide

## Quick Migration

### Option 1: Run All Migrations (Recommended)

```bash
pnpm db:migrate
```

This runs migrations for all three services in sequence.

### Option 2: Run Individual Service Migrations

```bash
# Auth Service
pnpm db:migrate:auth

# Tenant Service
pnpm db:migrate:tenant

# Module Access Service
pnpm db:migrate:module
```

### Option 3: Use Migration Script

**Windows (PowerShell):**
```powershell
.\scripts\migrate-all.ps1
```

**Linux/Mac:**
```bash
./scripts/migrate-all.sh
```

## Before Running Migrations

### 1. Create .env File

```bash
# Copy example
cp .env.example .env
```

### 2. Configure DATABASE_URL

Edit `.env` and set your PostgreSQL connection:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/pos_db
```

**Default (if using default PostgreSQL setup):**
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/pos_db
```

### 3. Create Database

```sql
-- Connect to PostgreSQL
psql -U postgres

-- Create database
CREATE DATABASE pos_db;

-- Exit
\q
```

Or using createdb:
```bash
createdb -U postgres pos_db
```

## Running Migrations

### First Time Setup

When you run migrations for the first time, Prisma will:
1. Create a `_prisma_migrations` table
2. Create all tables from your schema
3. Ask you to name the migration

**Example migration names:**
- `init_auth_schema`
- `init_tenant_schema`
- `init_module_access_schema`

### Subsequent Migrations

After the first migration, you can:
- Make changes to `schema.prisma`
- Run `pnpm db:migrate` again
- Prisma will create a new migration with your changes

## Migration Commands

### Generate Prisma Client

```bash
# Generate for all services
pnpm db:generate

# Or individually
cd services/auth-service && pnpm db:generate
```

### Create Migration

```bash
# This is done automatically when you run db:migrate
# But you can also create empty migration:
cd services/auth-service
npx prisma migrate dev --schema=./infra/prisma/schema.prisma --create-only
```

### Apply Migrations (Production)

```bash
# In production, use migrate deploy (no prompts)
cd services/auth-service
npx prisma migrate deploy --schema=./infra/prisma/schema.prisma
```

### Reset Database (⚠️ Deletes All Data)

```bash
cd services/auth-service
npx prisma migrate reset --schema=./infra/prisma/schema.prisma
```

## Troubleshooting

### "Environment variable not found: DATABASE_URL"

- ✅ Check `.env` file exists in root directory
- ✅ Verify `DATABASE_URL` is set correctly
- ✅ Restart terminal after creating `.env`

### "Database does not exist"

```sql
CREATE DATABASE pos_db;
```

### "Connection refused"

- Check PostgreSQL is running
- Verify credentials in `DATABASE_URL`
- Check firewall settings

### "Migration already applied"

This is normal if you've run migrations before. Prisma tracks applied migrations.

## Migration Files Location

Migrations are stored in:
- `services/auth-service/infra/prisma/migrations/`
- `services/tenant-service/infra/prisma/migrations/`
- `services/module-access-service/infra/prisma/migrations/`

## Next Steps

After migrations:
1. ✅ Verify tables created: Use Prisma Studio
2. ✅ Start services: `pnpm dev`
3. ✅ Test APIs: See `API_URLS.md`

