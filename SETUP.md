# Setup Guide

Complete setup instructions for the AI-Based POS system.

## Prerequisites

1. **Node.js** >= 18.0.0
   ```bash
   node --version
   ```

2. **pnpm** >= 8.0.0
   ```bash
   npm install -g pnpm
   pnpm --version
   ```

3. **PostgreSQL** >= 14.0
   - Install PostgreSQL on your system
   - Create a database for the services
   ```sql
   CREATE DATABASE pos_db;
   ```

## Step-by-Step Setup

### 1. Clone and Install

```bash
# Clone the repository
git clone <repository-url>
cd AI-Based-Pos

# Install all dependencies
pnpm install
```

### 2. Environment Configuration

```bash
# Copy environment template
cp .env.example .env

# Edit .env file with your database credentials
# DATABASE_URL=postgresql://username:password@localhost:5432/pos_db
```

### 3. Database Setup

Each service has its own Prisma schema. You can either:
- Use separate databases for each service
- Use the same database with different schemas

**Option A: Same Database (Recommended for MVP)**

```bash
# Set DATABASE_URL in .env to point to the same database
# Each service will create its own tables
```

**Option B: Separate Databases**

```bash
# Create separate databases
createdb pos_auth_db
createdb pos_tenant_db
createdb pos_module_db

# Update each service's .env or use different DATABASE_URL per service
```

### 4. Generate Prisma Clients

```bash
# Build shared packages first
cd packages/shared-types && pnpm build
cd ../api-client && pnpm build
cd ../utils && pnpm build
cd ../config && pnpm build
cd ../..

# Generate Prisma clients for each service
cd services/auth-service && pnpm db:generate
cd ../tenant-service && pnpm db:generate
cd ../module-access-service && pnpm db:generate
cd ../..
```

### 5. Run Migrations

```bash
# Run migrations for each service
cd services/auth-service && pnpm db:migrate
cd ../tenant-service && pnpm db:migrate
cd ../module-access-service && pnpm db:migrate
cd ../..
```

### 6. Build All Packages

```bash
# Build everything
pnpm build
```

### 7. Run Services

**Option A: Run All Services in Parallel**

```bash
pnpm dev
```

**Option B: Run Services Individually**

Terminal 1:
```bash
cd services/auth-service
pnpm dev
```

Terminal 2:
```bash
cd services/tenant-service
pnpm dev
```

Terminal 3:
```bash
cd services/module-access-service
pnpm dev
```

### 8. Verify Services Are Running

- Auth Service: http://localhost:3000
- Tenant Service: http://localhost:3001
- Module Access Service: http://localhost:3002

Test with:
```bash
curl http://localhost:3000/auth/login
# Should return validation error (expected)
```

## Running Tests

```bash
# Run all tests
pnpm test

# Run tests for specific service
cd services/auth-service && pnpm test

# Run tests with coverage
cd services/auth-service && pnpm test:cov
```

## Troubleshooting

### Database Connection Issues

1. **Check PostgreSQL is running**
   ```bash
   # Linux/Mac
   sudo systemctl status postgresql
   
   # Windows
   # Check Services panel
   ```

2. **Verify DATABASE_URL**
   ```bash
   # Test connection
   psql $DATABASE_URL
   ```

3. **Check Prisma connection**
   ```bash
   cd services/auth-service
   npx prisma db pull
   ```

### Port Already in Use

If ports 3000, 3001, or 3002 are in use:

1. Find the process:
   ```bash
   # Linux/Mac
   lsof -i :3000
   
   # Windows
   netstat -ano | findstr :3000
   ```

2. Kill the process or change port in service's `main.ts`

### Build Errors

1. **Clear node_modules and reinstall**
   ```bash
   rm -rf node_modules packages/*/node_modules services/*/node_modules
   pnpm install
   ```

2. **Rebuild shared packages first**
   ```bash
   cd packages/shared-types && pnpm build
   cd ../api-client && pnpm build
   cd ../utils && pnpm build
   cd ../config && pnpm build
   ```

### Type Errors

1. **Ensure shared packages are built**
   ```bash
   pnpm build
   ```

2. **Check TypeScript configuration**
   ```bash
   pnpm exec tsc --noEmit
   ```

## Development Workflow

1. **Make changes to code**
2. **Run tests** to ensure nothing breaks
3. **Build packages** if you changed shared code
4. **Restart services** to see changes

## Next Steps

After setup is complete:

1. Create your first tenant
2. Register an admin user
3. Enable modules for the tenant
4. Start building additional services

See `API_DOCUMENTATION.md` for API usage examples.

