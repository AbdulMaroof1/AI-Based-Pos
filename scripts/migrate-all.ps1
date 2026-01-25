# PowerShell script to run migrations for all services
# Usage: .\scripts\migrate-all.ps1

Write-Host "🗄️  Running database migrations for all services..." -ForegroundColor Green

# Check if .env exists
if (-not (Test-Path ".env")) {
    Write-Host "❌ Error: .env file not found!" -ForegroundColor Red
    Write-Host "Please create .env file from .env.example and configure DATABASE_URL" -ForegroundColor Yellow
    exit 1
}

# Auth Service
Write-Host "`n📦 Migrating Auth Service..." -ForegroundColor Cyan
Set-Location "services/auth-service"
pnpm db:migrate
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Auth Service migration failed!" -ForegroundColor Red
    Set-Location "../.."
    exit 1
}
Set-Location "../.."

# Tenant Service
Write-Host "`n📦 Migrating Tenant Service..." -ForegroundColor Cyan
Set-Location "services/tenant-service"
pnpm db:migrate
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Tenant Service migration failed!" -ForegroundColor Red
    Set-Location "../.."
    exit 1
}
Set-Location "../.."

# Module Access Service
Write-Host "`n📦 Migrating Module Access Service..." -ForegroundColor Cyan
Set-Location "services/module-access-service"
pnpm db:migrate
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Module Access Service migration failed!" -ForegroundColor Red
    Set-Location "../.."
    exit 1
}
Set-Location "../.."

Write-Host "`n✅ All migrations completed successfully!" -ForegroundColor Green

