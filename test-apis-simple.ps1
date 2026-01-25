# Simple API Test Script
Write-Host "🧪 Testing APIs - Simple Version" -ForegroundColor Green
Write-Host ""

# Test Auth Service
Write-Host "=== Auth Service Tests ===" -ForegroundColor Cyan

Write-Host "1. Testing login validation..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/auth/login" -Method Post -Body '{}' -ContentType "application/json" -ErrorAction Stop
} catch {
    Write-Host "✅ Validation working (expected error)" -ForegroundColor Green
}

Write-Host "`n2. Registering user..." -ForegroundColor Yellow
$registerBody = @{
    email = "test@example.com"
    password = "password123"
    firstName = "Test"
    lastName = "User"
    role = "ADMIN"
} | ConvertTo-Json

try {
    $register = Invoke-RestMethod -Uri "http://localhost:3000/auth/register" -Method Post -Body $registerBody -ContentType "application/json"
    Write-Host "✅ User registered: $($register.data.user.email)" -ForegroundColor Green
    $token = $register.data.accessToken
    Write-Host "   Token: $($token.Substring(0, 30))..." -ForegroundColor Gray
} catch {
    Write-Host "❌ Registration failed: $_" -ForegroundColor Red
}

Write-Host "`n3. Testing login..." -ForegroundColor Yellow
$loginBody = @{
    email = "test@example.com"
    password = "password123"
} | ConvertTo-Json

try {
    $login = Invoke-RestMethod -Uri "http://localhost:3000/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
    Write-Host "✅ Login successful!" -ForegroundColor Green
} catch {
    Write-Host "❌ Login failed: $_" -ForegroundColor Red
}

# Test Tenant Service (if running)
Write-Host "`n=== Tenant Service Tests ===" -ForegroundColor Cyan
Write-Host "1. Getting all tenants..." -ForegroundColor Yellow
try {
    $tenants = Invoke-RestMethod -Uri "http://localhost:3001/tenants" -Method Get
    Write-Host "✅ Found $($tenants.data.total) tenant(s)" -ForegroundColor Green
    
    if ($tenants.data.total -gt 0) {
        $tenantId = $tenants.data.data[0].id
        Write-Host "   Using tenant: $tenantId" -ForegroundColor Gray
        
        Write-Host "`n2. Creating branch..." -ForegroundColor Yellow
        $branchBody = @{
            name = "Test Branch"
            address = "123 Test St"
        } | ConvertTo-Json
        $branch = Invoke-RestMethod -Uri "http://localhost:3001/tenants/$tenantId/branches" -Method Post -Body $branchBody -ContentType "application/json"
        Write-Host "✅ Branch created: $($branch.data.name)" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Tenant Service not available: $_" -ForegroundColor Red
}

# Test Module Access Service (if running)
Write-Host "`n=== Module Access Service Tests ===" -ForegroundColor Cyan
Write-Host "1. Getting permissions (test tenant)..." -ForegroundColor Yellow
try {
    $perms = Invoke-RestMethod -Uri "http://localhost:3002/modules/test-tenant-id/permissions" -Method Get
    Write-Host "✅ Permissions retrieved" -ForegroundColor Green
    Write-Host "   Modules: $($perms.data.permissions.Count)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Module Access Service not available: $_" -ForegroundColor Red
}

Write-Host "`n=== ✅ Tests Complete ===" -ForegroundColor Green

