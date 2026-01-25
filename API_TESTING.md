# 🧪 API Testing Guide

Quick guide to test all APIs after starting the services.

## 🚀 Start Services

### Option 1: Use the Script (Easiest)

```powershell
.\scripts\start-dev.ps1
```

This opens 3 separate PowerShell windows, one for each service.

### Option 2: Manual Start

**Terminal 1 - Auth Service:**
```powershell
$env:DATABASE_URL="postgresql://postgres:123456789@localhost:5432/pos_auth_db"
$env:PORT="3000"
cd services/auth-service
pnpm dev
```

**Terminal 2 - Tenant Service:**
```powershell
$env:DATABASE_URL="postgresql://postgres:123456789@localhost:5432/pos_tenant_db"
$env:PORT="3001"
cd services/tenant-service
pnpm dev
```

**Terminal 3 - Module Access Service:**
```powershell
$env:DATABASE_URL="postgresql://postgres:123456789@localhost:5432/pos_module_db"
$env:PORT="3002"
cd services/module-access-service
pnpm dev
```

## ✅ Verify Services Are Running

Wait 5-10 seconds, then test:

```bash
# Auth Service
curl http://localhost:3000/auth/login

# Tenant Service
curl http://localhost:3001/tenants

# Module Access Service
curl http://localhost:3002/modules/test/permissions
```

You should see responses (even if errors - that means services are running!).

## 🧪 Complete Test Workflow

### Step 1: Create a Tenant

```bash
curl -X POST http://localhost:3001/tenants \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"Test Restaurant\",
    \"email\": \"test@restaurant.com\",
    \"phone\": \"1234567890\",
    \"address\": \"123 Main St\"
  }"
```

**Save the `id` from the response!** (e.g., `"id": "abc-123-def"`)

### Step 2: Register an Admin User

Replace `<tenant-id>` with the ID from Step 1:

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"admin@restaurant.com\",
    \"password\": \"password123\",
    \"firstName\": \"Admin\",
    \"lastName\": \"User\",
    \"role\": \"ADMIN\",
    \"tenantId\": \"<tenant-id>\"
  }"
```

**Save the `accessToken` and `user.id` from the response!**

### Step 3: Login

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"admin@restaurant.com\",
    \"password\": \"password123\"
  }"
```

### Step 4: Enable POS Module

Replace `<tenant-id>` and `<admin-user-id>`:

```bash
curl -X PUT http://localhost:3002/modules/<tenant-id>/enable/POS \
  -H "Content-Type: application/json" \
  -d "{
    \"enabledBy\": \"<admin-user-id>\"
  }"
```

### Step 5: Check Module Permissions

```bash
curl http://localhost:3002/modules/<tenant-id>/permissions
```

### Step 6: Create a Branch

```bash
curl -X POST http://localhost:3001/tenants/<tenant-id>/branches \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"Downtown Branch\",
    \"address\": \"456 Branch St\",
    \"phone\": \"0987654321\"
  }"
```

## 📋 Quick Test Commands (Copy & Paste)

### Test All Endpoints

```bash
# 1. Get all tenants
curl http://localhost:3001/tenants

# 2. Register user (replace tenant-id)
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123","firstName":"Test","lastName":"User","role":"ADMIN"}'

# 3. Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}'

# 4. Get module permissions (replace tenant-id)
curl http://localhost:3002/modules/<tenant-id>/permissions

# 5. Enable a module (replace tenant-id)
curl -X PUT http://localhost:3002/modules/<tenant-id>/enable/POS \
  -H "Content-Type: application/json" \
  -d '{"enabledBy":"admin-id"}'
```

## 🛠️ Using Postman

1. **Import Collection:**
   - Create new collection "AI-Based POS"
   - Add requests for each endpoint

2. **Set Base URLs:**
   - Auth: `http://localhost:3000`
   - Tenant: `http://localhost:3001`
   - Module: `http://localhost:3002`

3. **Test Flow:**
   - Create Tenant → Save tenant ID
   - Register User → Save user ID and token
   - Enable Module → Use tenant ID and user ID
   - Check Permissions → Use tenant ID

## 🌐 Using Browser

Some endpoints work in browser (GET requests):

- http://localhost:3001/tenants
- http://localhost:3002/modules/{tenant-id}/permissions
- http://localhost:3002/modules/{tenant-id}/check/POS

## 📊 Expected Responses

### Success Response:
```json
{
  "success": true,
  "data": { ... }
}
```

### Error Response:
```json
{
  "success": false,
  "error": "Error message",
  "statusCode": 400
}
```

## 🐛 Troubleshooting

### "Connection refused"
- Services not started yet - wait a few more seconds
- Check services are running in their windows

### "Cannot GET /"
- Service is running but endpoint doesn't exist
- Check the URL is correct

### "Validation error"
- Check request body format
- Ensure all required fields are present

### "Database error"
- Check database is running
- Verify DATABASE_URL is correct in service window

## ✅ Success Checklist

- [ ] All 3 services started without errors
- [ ] Can access http://localhost:3000, 3001, 3002
- [ ] Created a tenant successfully
- [ ] Registered a user successfully
- [ ] Logged in and got JWT token
- [ ] Enabled a module successfully
- [ ] Checked module permissions

---

**Happy Testing! 🚀**

