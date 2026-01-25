#!/bin/bash
# Bash script to run migrations for all services
# Usage: ./scripts/migrate-all.sh

echo "🗄️  Running database migrations for all services..."

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "❌ Error: .env file not found!"
    echo "Please create .env file from .env.example and configure DATABASE_URL"
    exit 1
fi

# Auth Service
echo ""
echo "📦 Migrating Auth Service..."
cd services/auth-service
pnpm db:migrate || exit 1
cd ../..

# Tenant Service
echo ""
echo "📦 Migrating Tenant Service..."
cd services/tenant-service
pnpm db:migrate || exit 1
cd ../..

# Module Access Service
echo ""
echo "📦 Migrating Module Access Service..."
cd services/module-access-service
pnpm db:migrate || exit 1
cd ../..

echo ""
echo "✅ All migrations completed successfully!"

