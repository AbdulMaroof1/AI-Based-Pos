# 🔧 Environment Setup Guide

## Step 1: Create .env File

```bash
# Copy the example
cp .env.example .env
```

Or create `.env` manually in the root directory.

## Step 2: Configure Database URL

Edit `.env` and set your PostgreSQL connection string:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/pos_db
```

### Examples:

**Local PostgreSQL (default):**
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/pos_db
```

**Custom user:**
```env
DATABASE_URL=postgresql://myuser:mypassword@localhost:5432/pos_db
```

**Remote database:**
```env
DATABASE_URL=postgresql://user:pass@hostname:5432/pos_db
```

## Step 3: Set JWT Secrets

Generate secure random strings for JWT secrets:

```bash
# On Linux/Mac
openssl rand -base64 32

# On Windows PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

Update `.env`:
```env
JWT_SECRET=your-generated-secret-here
REFRESH_TOKEN_SECRET=your-generated-refresh-secret-here
```

## Step 4: Verify .env File

Your `.env` should look like:

```env
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/pos_db

# JWT
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_SECRET=your-refresh-secret-change-in-production
REFRESH_TOKEN_EXPIRES_IN=7d

# Service Ports
PORT=3000
HOST=localhost
```

## Step 5: Create Database

```bash
# Using psql
psql -U postgres
CREATE DATABASE pos_db;
\q

# Or using createdb
createdb -U postgres pos_db
```

## Step 6: Test Connection

```bash
# Test PostgreSQL connection
psql $DATABASE_URL -c "SELECT version();"
```

## ✅ Ready!

Once `.env` is configured, you can:
- Run migrations: `pnpm db:migrate`
- Start services: `pnpm dev`

## 🐛 Troubleshooting

### "Environment variable not found: DATABASE_URL"

- Make sure `.env` file exists in the root directory
- Check that `DATABASE_URL` is set correctly
- Restart your terminal/IDE after creating `.env`

### "Connection refused"

- Check PostgreSQL is running: `pg_isready` or check services
- Verify database exists: `psql -U postgres -l`
- Check credentials in `DATABASE_URL`

### "Database does not exist"

```sql
-- Create it
CREATE DATABASE pos_db;
```

