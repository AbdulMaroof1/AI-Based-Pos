# 🧪 API Test Commands

Copy and paste these commands to test all APIs. Make sure all 3 services are running first!

## ✅ Auth Service (Port 3000) - WORKING

### 1. Test Login Validation
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/auth/login" -Method Post -Body '{}' -ContentType "application/json"
```
Expected: Validation error (service is working)

### 2. Register User
```powershell
$body = @{
    email = "admin@test.com"
    password = "password123"
    firstName = "Admin"
    lastName = "User"
    role = "ADMIN"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/auth/register" -Method Post -Body $body -ContentType "application/json"
```
Expected: Returns user data with accessToken and refreshToken

### 3. Login
```powershell
$body = @{
    email = "admin@test.com"
    password = "password123"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/auth/login" -Method Post -Body $body -ContentType "application/json"
```
Expected: Returns tokens

### 4. Refresh Token
```powershell
# Use refreshToken from login response
$body = @{
    refreshToken = "your-refresh-token-here"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/auth/refresh" -Method Post -Body $body -ContentType "application/json"
```
Expected: Returns new accessToken

---

## 🏢 Tenant Service (Port 3001)

### 1. Create Tenant
```powershell
$body = @{
    name = "My Restaurant"
    email = "restaurant@example.com"
    phone = "1234567890"
    address = "123 Main St"
} | ConvertTo-Json

$tenant = Invoke-RestMethod -Uri "http://localhost:3001/tenants" -Method Post -Body $body -ContentType "application/json"
$tenantId = $tenant.data.id
Write-Host "Tenant ID: $tenantId"
```
Expected: Returns tenant with ID

### 2. Get All Tenants
```powershell
Invoke-RestMethod -Uri "http://localhost:3001/tenants" -Method Get
```
Expected: Returns list of tenants

### 3. Get Tenant by ID
```powershell
# Replace with actual tenant ID
Invoke-RestMethod -Uri "http://localhost:3001/tenants/YOUR-TENANT-ID" -Method Get
```
Expected: Returns single tenant

### 4. Update Tenant
```powershell
$body = @{
    name = "Updated Name"
    isActive = $true
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3001/tenants/YOUR-TENANT-ID" -Method Put -Body $body -ContentType "application/json"
```
Expected: Returns updated tenant

### 5. Create Branch
```powershell
$body = @{
    name = "Downtown Branch"
    address = "456 Branch St"
    phone = "0987654321"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3001/tenants/YOUR-TENANT-ID/branches" -Method Post -Body $body -ContentType "application/json"
```
Expected: Returns branch with ID

### 6. Get Branches
```powershell
Invoke-RestMethod -Uri "http://localhost:3001/tenants/YOUR-TENANT-ID/branches" -Method Get
```
Expected: Returns list of branches

### 7. Get Branch by ID
```powershell
Invoke-RestMethod -Uri "http://localhost:3001/tenants/branches/YOUR-BRANCH-ID" -Method Get
```
Expected: Returns single branch

---

## 🔒 Module Access Service (Port 3002)

### 1. Get Module Permissions
```powershell
Invoke-RestMethod -Uri "http://localhost:3002/modules/YOUR-TENANT-ID/permissions" -Method Get
```
Expected: Returns all module permissions

### 2. Enable Module
```powershell
$body = @{
    enabledBy = "YOUR-USER-ID"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3002/modules/YOUR-TENANT-ID/enable/POS" -Method Put -Body $body -ContentType "application/json"
```
Expected: Success message

### 3. Disable Module
```powershell
$body = @{
    enabledBy = "YOUR-USER-ID"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3002/modules/YOUR-TENANT-ID/disable/POS" -Method Put -Body $body -ContentType "application/json"
```
Expected: Success message

### 4. Check Module Access
```powershell
Invoke-RestMethod -Uri "http://localhost:3002/modules/YOUR-TENANT-ID/check/POS" -Method Get
```
Expected: Returns isEnabled status

### Available Module Names:
- `POS`
- `INVENTORY`
- `ACCOUNTING`
- `LOYALTY`
- `ECOMMERCE`
- `AI`
- `CRM`

---

## 🔄 Complete Workflow Test

```powershell
# Step 1: Create Tenant
$tenantBody = @{
    name = "Test Restaurant"
    email = "test@restaurant.com"
    phone = "1234567890"
} | ConvertTo-Json
$tenant = Invoke-RestMethod -Uri "http://localhost:3001/tenants" -Method Post -Body $tenantBody -ContentType "application/json"
$tenantId = $tenant.data.id
Write-Host "Tenant ID: $tenantId"

# Step 2: Register Admin
$registerBody = @{
    email = "admin@test.com"
    password = "password123"
    firstName = "Admin"
    lastName = "User"
    role = "ADMIN"
    tenantId = $tenantId
} | ConvertTo-Json
$user = Invoke-RestMethod -Uri "http://localhost:3000/auth/register" -Method Post -Body $registerBody -ContentType "application/json"
$userId = $user.data.user.id
Write-Host "User ID: $userId"

# Step 3: Enable POS Module
$enableBody = @{
    enabledBy = $userId
} | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:3002/modules/$tenantId/enable/POS" -Method Put -Body $enableBody -ContentType "application/json"

# Step 4: Check Permissions
Invoke-RestMethod -Uri "http://localhost:3002/modules/$tenantId/permissions" -Method Get
```

---

## 📊 Quick Status Check

```powershell
# Check Auth Service
try { Invoke-RestMethod -Uri "http://localhost:3000/auth/login" -Method Post -Body '{}' -ContentType "application/json" } catch { Write-Host "✅ Auth Service Running" }

# Check Tenant Service
try { Invoke-RestMethod -Uri "http://localhost:3001/tenants" -Method Get } catch { Write-Host "❌ Tenant Service Not Running" }

# Check Module Access Service
try { Invoke-RestMethod -Uri "http://localhost:3002/modules/test/permissions" -Method Get } catch { Write-Host "❌ Module Access Service Not Running" }
```

---

**Note:** Replace `YOUR-TENANT-ID`, `YOUR-USER-ID`, `YOUR-BRANCH-ID` with actual IDs from previous responses.

