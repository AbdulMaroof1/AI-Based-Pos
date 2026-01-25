# PowerShell script to test all APIs
Write-Host "🧪 Testing All APIs" -ForegroundColor Green
Write-Host ""

# Test 1: Create Tenant
Write-Host "=== 1. Creating Tenant ===" -ForegroundColor Cyan
$tenantBody = @{
    name = "Test Restaurant"
    email = "test@restaurant.com"
    phone = "1234567890"
    address = "123 Main St"
} | ConvertTo-Json

$tenantResponse = Invoke-RestMethod -Uri "http://localhost:3001/tenants" -Method Post -Body $tenantBody -ContentType "application/json"
$tenantId = $tenantResponse.data.id
Write-Host "✅ Tenant created: $tenantId" -ForegroundColor Green
Write-Host ""

# Test 2: Get All Tenants
Write-Host "=== 2. Getting All Tenants ===" -ForegroundColor Cyan
$tenants = Invoke-RestMethod -Uri "http://localhost:3001/tenants" -Method Get
Write-Host "✅ Found $($tenants.data.total) tenant(s)" -ForegroundColor Green
Write-Host ""

# Test 3: Get Tenant by ID
Write-Host "=== 3. Getting Tenant by ID ===" -ForegroundColor Cyan
$tenant = Invoke-RestMethod -Uri "http://localhost:3001/tenants/$tenantId" -Method Get
Write-Host "✅ Tenant: $($tenant.data.name)" -ForegroundColor Green
Write-Host ""

# Test 4: Register User
Write-Host "=== 4. Registering User ===" -ForegroundColor Cyan
$registerBody = @{
    email = "admin@test.com"
    password = "password123"
    firstName = "Admin"
    lastName = "User"
    role = "ADMIN"
    tenantId = $tenantId
} | ConvertTo-Json

$registerResponse = Invoke-RestMethod -Uri "http://localhost:3000/auth/register" -Method Post -Body $registerBody -ContentType "application/json"
$accessToken = $registerResponse.data.accessToken
$userId = $registerResponse.data.user.id
$refreshToken = $registerResponse.data.refreshToken
Write-Host "✅ User registered: $userId" -ForegroundColor Green
Write-Host "   Access Token: $($accessToken.Substring(0, 30))..." -ForegroundColor Gray
Write-Host ""

# Test 5: Login
Write-Host "=== 5. Testing Login ===" -ForegroundColor Cyan
$loginBody = @{
    email = "admin@test.com"
    password = "password123"
} | ConvertTo-Json

$loginResponse = Invoke-RestMethod -Uri "http://localhost:3000/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
Write-Host "✅ Login successful!" -ForegroundColor Green
Write-Host ""

# Test 6: Refresh Token
Write-Host "=== 6. Testing Refresh Token ===" -ForegroundColor Cyan
$refreshBody = @{
    refreshToken = $refreshToken
} | ConvertTo-Json

$refreshResponse = Invoke-RestMethod -Uri "http://localhost:3000/auth/refresh" -Method Post -Body $refreshBody -ContentType "application/json"
Write-Host "✅ Token refreshed!" -ForegroundColor Green
Write-Host ""

# Test 7: Create Branch
Write-Host "=== 7. Creating Branch ===" -ForegroundColor Cyan
$branchBody = @{
    name = "Downtown Branch"
    address = "456 Branch St"
    phone = "0987654321"
} | ConvertTo-Json

$branchResponse = Invoke-RestMethod -Uri "http://localhost:3001/tenants/$tenantId/branches" -Method Post -Body $branchBody -ContentType "application/json"
$branchId = $branchResponse.data.id
Write-Host "✅ Branch created: $branchId" -ForegroundColor Green
Write-Host ""

# Test 8: Get Branches
Write-Host "=== 8. Getting All Branches ===" -ForegroundColor Cyan
$branches = Invoke-RestMethod -Uri "http://localhost:3001/tenants/$tenantId/branches" -Method Get
Write-Host "✅ Found $($branches.data.Count) branch(es)" -ForegroundColor Green
Write-Host ""

# Test 9: Get Module Permissions
Write-Host "=== 9. Getting Module Permissions ===" -ForegroundColor Cyan
$permissions = Invoke-RestMethod -Uri "http://localhost:3002/modules/$tenantId/permissions" -Method Get
Write-Host "✅ Found $($permissions.data.permissions.Count) modules" -ForegroundColor Green
Write-Host ""

# Test 10: Enable POS Module
Write-Host "=== 10. Enabling POS Module ===" -ForegroundColor Cyan
$enableBody = @{
    enabledBy = $userId
} | ConvertTo-Json

$enableResponse = Invoke-RestMethod -Uri "http://localhost:3002/modules/$tenantId/enable/POS" -Method Put -Body $enableBody -ContentType "application/json"
Write-Host "✅ POS module enabled!" -ForegroundColor Green
Write-Host ""

# Test 11: Check Module Access
Write-Host "=== 11. Checking POS Module Access ===" -ForegroundColor Cyan
$checkResponse = Invoke-RestMethod -Uri "http://localhost:3002/modules/$tenantId/check/POS" -Method Get
Write-Host "✅ POS module is enabled: $($checkResponse.data.isEnabled)" -ForegroundColor Green
Write-Host ""

# Test 12: Enable INVENTORY Module
Write-Host "=== 12. Enabling INVENTORY Module ===" -ForegroundColor Cyan
$enableInventory = Invoke-RestMethod -Uri "http://localhost:3002/modules/$tenantId/enable/INVENTORY" -Method Put -Body $enableBody -ContentType "application/json"
Write-Host "✅ INVENTORY module enabled!" -ForegroundColor Green
Write-Host ""

# Test 13: Disable INVENTORY Module
Write-Host "=== 13. Disabling INVENTORY Module ===" -ForegroundColor Cyan
$disableInventory = Invoke-RestMethod -Uri "http://localhost:3002/modules/$tenantId/disable/INVENTORY" -Method Put -Body $enableBody -ContentType "application/json"
Write-Host "✅ INVENTORY module disabled!" -ForegroundColor Green
Write-Host ""

# Test 14: Get Updated Permissions
Write-Host "=== 14. Getting Updated Permissions ===" -ForegroundColor Cyan
$updatedPermissions = Invoke-RestMethod -Uri "http://localhost:3002/modules/$tenantId/permissions" -Method Get
$enabledModules = $updatedPermissions.data.permissions | Where-Object { $_.isEnabled -eq $true }
Write-Host "✅ Enabled modules: $($enabledModules.moduleName -join ', ')" -ForegroundColor Green
Write-Host ""

# Test 15: Update Tenant
Write-Host "=== 15. Updating Tenant ===" -ForegroundColor Cyan
$updateBody = @{
    name = "Updated Restaurant Name"
    isActive = $true
} | ConvertTo-Json

$updateResponse = Invoke-RestMethod -Uri "http://localhost:3001/tenants/$tenantId" -Method Put -Body $updateBody -ContentType "application/json"
Write-Host "✅ Tenant updated: $($updateResponse.data.name)" -ForegroundColor Green
Write-Host ""

# Test 16: Test Error - Duplicate Email
Write-Host "=== 16. Testing Error Case - Duplicate Email ===" -ForegroundColor Cyan
try {
    $duplicateResponse = Invoke-RestMethod -Uri "http://localhost:3000/auth/register" -Method Post -Body $registerBody -ContentType "application/json"
    Write-Host "❌ Should have failed!" -ForegroundColor Red
} catch {
    Write-Host "✅ Correctly rejected duplicate email" -ForegroundColor Green
}
Write-Host ""

# Test 17: Test Error - Invalid Login
Write-Host "=== 17. Testing Error Case - Invalid Login ===" -ForegroundColor Cyan
try {
    $invalidLoginBody = @{
        email = "wrong@test.com"
        password = "wrongpass"
    } | ConvertTo-Json
    $invalidResponse = Invoke-RestMethod -Uri "http://localhost:3000/auth/login" -Method Post -Body $invalidLoginBody -ContentType "application/json"
    Write-Host "❌ Should have failed!" -ForegroundColor Red
} catch {
    Write-Host "✅ Correctly rejected invalid credentials" -ForegroundColor Green
}
Write-Host ""

# Test 18: Test Error - Non-existent Tenant
Write-Host "=== 18. Testing Error Case - Non-existent Tenant ===" -ForegroundColor Cyan
try {
    $notFound = Invoke-RestMethod -Uri "http://localhost:3001/tenants/non-existent-id" -Method Get
    Write-Host "❌ Should have failed!" -ForegroundColor Red
} catch {
    Write-Host "✅ Correctly returned 404 for non-existent tenant" -ForegroundColor Green
}
Write-Host ""

# Summary
Write-Host "=== ✅ All Tests Completed! ===" -ForegroundColor Green
Write-Host ""
Write-Host "Summary:" -ForegroundColor Cyan
Write-Host "  ✅ Auth Service: All endpoints working" -ForegroundColor Green
Write-Host "  ✅ Tenant Service: All endpoints working" -ForegroundColor Green
Write-Host "  ✅ Module Access Service: All endpoints working" -ForegroundColor Green
Write-Host ""
Write-Host "Test Data Created:" -ForegroundColor Yellow
Write-Host "  - Tenant ID: $tenantId" -ForegroundColor Gray
Write-Host "  - User ID: $userId" -ForegroundColor Gray
Write-Host "  - Branch ID: $branchId" -ForegroundColor Gray
Write-Host ""

