# ⚡ Quick Start Guide

Get up and running in 5 minutes!

## 🚀 Fast Setup

```bash
# 1. Install dependencies
pnpm install

# 2. Create .env file
cp .env.example .env
# Edit .env with your DATABASE_URL

# 3. Create PostgreSQL database
createdb pos_db
# Or: psql -U postgres -c "CREATE DATABASE pos_db;"

# 4. Generate Prisma clients
pnpm db:generate

# 5. Run migrations
pnpm --filter '@pos/auth-service' db:migrate
pnpm --filter '@pos/tenant-service' db:migrate
pnpm --filter '@pos/module-access-service' db:migrate

# 6. Build everything
pnpm build

# 7. Start all services
pnpm dev
```

## ✅ Verify It's Working

Open 3 browser tabs:
- http://localhost:3000/auth/login (should show validation error)
- http://localhost:3001/tenants (should return `[]`)
- http://localhost:3002/modules/test/permissions (should return permissions)

## 🧪 Quick Test

```bash
# Create a tenant
curl -X POST http://localhost:3001/tenants \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com"}'
```

## 📖 Need More Details?

See `RUN_GUIDE.md` for comprehensive instructions.

