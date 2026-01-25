# API URLs - Quick Reference

All API endpoints for testing the AI-Based POS system.

## 🔐 Auth Service (Port 3000)

**Base URL**: `http://localhost:3000`

### Register User
```
POST http://localhost:3000/auth/register
```

**Body:**
```json
{
  "email": "admin@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "role": "ADMIN"
}
```

### Login
```
POST http://localhost:3000/auth/login
```

**Body:**
```json
{
  "email": "admin@example.com",
  "password": "password123"
}
```

### Refresh Token
```
POST http://localhost:3000/auth/refresh
```

**Body:**
```json
{
  "refreshToken": "your-refresh-token"
}
```

---

## 🏢 Tenant Service (Port 3001)

**Base URL**: `http://localhost:3001`

### Create Tenant
```
POST http://localhost:3001/tenants
```

**Body:**
```json
{
  "name": "My Restaurant",
  "email": "restaurant@example.com",
  "phone": "1234567890",
  "address": "123 Main St"
}
```

### Get All Tenants
```
GET http://localhost:3001/tenants?page=1&limit=10
```

### Get Tenant by ID
```
GET http://localhost:3001/tenants/{tenantId}
```

### Update Tenant
```
PUT http://localhost:3001/tenants/{tenantId}
```

**Body:**
```json
{
  "name": "Updated Name",
  "isActive": true
}
```

### Delete Tenant
```
DELETE http://localhost:3001/tenants/{tenantId}
```

### Create Branch
```
POST http://localhost:3001/tenants/{tenantId}/branches
```

**Body:**
```json
{
  "name": "Downtown Branch",
  "address": "456 Branch St",
  "phone": "0987654321"
}
```

### Get Branches
```
GET http://localhost:3001/tenants/{tenantId}/branches
```

### Get Branch by ID
```
GET http://localhost:3001/tenants/branches/{branchId}
```

### Update Branch
```
PUT http://localhost:3001/tenants/branches/{branchId}
```

### Delete Branch
```
DELETE http://localhost:3001/tenants/branches/{branchId}
```

---

## 🔒 Module Access Control Service (Port 3002)

**Base URL**: `http://localhost:3002`

### Get Module Permissions
```
GET http://localhost:3002/modules/{tenantId}/permissions
```

### Update Module Permission
```
PUT http://localhost:3002/modules/{tenantId}/permissions/{moduleName}
```

**Body:**
```json
{
  "isEnabled": true,
  "enabledBy": "admin-user-id"
}
```

**Module Names:**
- `POS`
- `INVENTORY`
- `ACCOUNTING`
- `LOYALTY`
- `ECOMMERCE`
- `AI`
- `CRM`

### Check Module Access
```
GET http://localhost:3002/modules/{tenantId}/check/{moduleName}
```

### Enable Module
```
PUT http://localhost:3002/modules/{tenantId}/enable/{moduleName}
```

**Body:**
```json
{
  "enabledBy": "admin-user-id"
}
```

### Disable Module
```
PUT http://localhost:3002/modules/{tenantId}/disable/{moduleName}
```

**Body:**
```json
{
  "enabledBy": "admin-user-id"
}
```

---

## 🧪 Quick Test Script

### Using cURL

```bash
# 1. Create Tenant
curl -X POST http://localhost:3001/tenants \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Restaurant",
    "email": "test@restaurant.com",
    "phone": "1234567890"
  }'

# 2. Register Admin
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@restaurant.com",
    "password": "password123",
    "firstName": "Admin",
    "lastName": "User",
    "role": "ADMIN"
  }'

# 3. Enable POS Module (replace {tenantId} with actual ID)
curl -X PUT http://localhost:3002/modules/{tenantId}/enable/POS \
  -H "Content-Type: application/json" \
  -d '{
    "enabledBy": "admin-user-id"
  }'

# 4. Check Module Access
curl http://localhost:3002/modules/{tenantId}/check/POS
```

### Using Postman

Import these URLs into Postman:

1. **Auth Service Collection**
   - POST `http://localhost:3000/auth/register`
   - POST `http://localhost:3000/auth/login`
   - POST `http://localhost:3000/auth/refresh`

2. **Tenant Service Collection**
   - POST `http://localhost:3001/tenants`
   - GET `http://localhost:3001/tenants`
   - GET `http://localhost:3001/tenants/{id}`
   - PUT `http://localhost:3001/tenants/{id}`
   - DELETE `http://localhost:3001/tenants/{id}`
   - POST `http://localhost:3001/tenants/{tenantId}/branches`
   - GET `http://localhost:3001/tenants/{tenantId}/branches`

3. **Module Access Service Collection**
   - GET `http://localhost:3002/modules/{tenantId}/permissions`
   - PUT `http://localhost:3002/modules/{tenantId}/permissions/{moduleName}`
   - GET `http://localhost:3002/modules/{tenantId}/check/{moduleName}`
   - PUT `http://localhost:3002/modules/{tenantId}/enable/{moduleName}`
   - PUT `http://localhost:3002/modules/{tenantId}/disable/{moduleName}`

---

## 📊 Response Format

All APIs return:

**Success:**
```json
{
  "success": true,
  "data": { ... }
}
```

**Error:**
```json
{
  "success": false,
  "error": "Error message",
  "statusCode": 400
}
```

---

## ✅ Health Check

Test if services are running:

```bash
# Auth Service
curl http://localhost:3000/auth/login
# Should return validation error (service is running)

# Tenant Service
curl http://localhost:3001/tenants
# Should return empty array or tenants

# Module Access Service
curl http://localhost:3002/modules/test-tenant-id/permissions
# Should return permissions (even if tenant doesn't exist, service is running)
```

---

**Last Updated**: 2024

