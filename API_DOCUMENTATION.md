# API Documentation

Complete API reference for all services in the AI-Based POS system.

## Base URLs

- **Auth Service**: `http://localhost:3000`
- **Tenant Service**: `http://localhost:3001`
- **Module Access Service**: `http://localhost:3002`

## Response Format

All APIs return responses in this format:

```json
{
  "success": true,
  "data": { ... },
  "error": "optional error message",
  "message": "optional success message"
}
```

Error responses:
```json
{
  "success": false,
  "error": "Error message",
  "statusCode": 400
}
```

---

## 🔐 Auth Service

### POST /auth/register

Register a new user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "role": "ADMIN",
  "tenantId": "optional-tenant-id",
  "branchId": "optional-branch-id"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "accessToken": "jwt-access-token",
    "refreshToken": "jwt-refresh-token",
    "user": {
      "id": "user-id",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "ADMIN",
      "tenantId": "tenant-id",
      "branchId": "branch-id"
    }
  }
}
```

**Status Codes:**
- `201` - Created
- `409` - User already exists
- `400` - Validation error

---

### POST /auth/login

Authenticate a user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "accessToken": "jwt-access-token",
    "refreshToken": "jwt-refresh-token",
    "user": {
      "id": "user-id",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "ADMIN"
    }
  }
}
```

**Status Codes:**
- `200` - Success
- `401` - Invalid credentials
- `400` - Validation error

---

### POST /auth/refresh

Refresh access token using refresh token.

**Request Body:**
```json
{
  "refreshToken": "jwt-refresh-token"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "accessToken": "new-jwt-access-token"
  }
}
```

**Status Codes:**
- `200` - Success
- `401` - Invalid or expired refresh token

---

## 🏢 Tenant Service

### POST /tenants

Create a new tenant.

**Request Body:**
```json
{
  "name": "Acme Restaurant",
  "email": "acme@example.com",
  "phone": "1234567890",
  "address": "123 Main St",
  "isActive": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "tenant-id",
    "name": "Acme Restaurant",
    "email": "acme@example.com",
    "phone": "1234567890",
    "address": "123 Main St",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Status Codes:**
- `201` - Created
- `409` - Tenant with email already exists
- `400` - Validation error

---

### GET /tenants

Get all tenants with pagination.

**Query Parameters:**
- `page` (optional, default: 1) - Page number
- `limit` (optional, default: 10) - Items per page
- `sortBy` (optional) - Field to sort by
- `sortOrder` (optional, default: "asc") - "asc" or "desc"

**Example:**
```
GET /tenants?page=1&limit=10&sortBy=name&sortOrder=asc
```

**Response:**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "tenant-id",
        "name": "Acme Restaurant",
        "email": "acme@example.com",
        "isActive": true
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

---

### GET /tenants/:id

Get tenant by ID.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "tenant-id",
    "name": "Acme Restaurant",
    "email": "acme@example.com",
    "phone": "1234567890",
    "address": "123 Main St",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Status Codes:**
- `200` - Success
- `404` - Tenant not found

---

### PUT /tenants/:id

Update tenant.

**Request Body:**
```json
{
  "name": "Updated Name",
  "isActive": false
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "tenant-id",
    "name": "Updated Name",
    "isActive": false
  }
}
```

**Status Codes:**
- `200` - Success
- `404` - Tenant not found
- `409` - Email already exists (if changing email)

---

### DELETE /tenants/:id

Delete tenant.

**Status Codes:**
- `204` - Success
- `404` - Tenant not found

---

### POST /tenants/:tenantId/branches

Create a branch for a tenant.

**Request Body:**
```json
{
  "name": "Downtown Branch",
  "address": "456 Branch St",
  "phone": "0987654321",
  "isActive": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "branch-id",
    "tenantId": "tenant-id",
    "name": "Downtown Branch",
    "address": "456 Branch St",
    "phone": "0987654321",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Status Codes:**
- `201` - Created
- `404` - Tenant not found
- `400` - Validation error

---

### GET /tenants/:tenantId/branches

Get all branches for a tenant.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "branch-id",
      "tenantId": "tenant-id",
      "name": "Downtown Branch",
      "isActive": true
    }
  ]
}
```

---

### GET /tenants/branches/:id

Get branch by ID.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "branch-id",
    "tenantId": "tenant-id",
    "name": "Downtown Branch",
    "address": "456 Branch St",
    "phone": "0987654321",
    "isActive": true
  }
}
```

---

### PUT /tenants/branches/:id

Update branch.

**Request Body:**
```json
{
  "name": "Updated Branch Name",
  "isActive": false
}
```

---

### DELETE /tenants/branches/:id

Delete branch.

**Status Codes:**
- `204` - Success
- `404` - Branch not found

---

## 🔒 Module Access Control Service

### GET /modules/:tenantId/permissions

Get all module permissions for a tenant.

**Response:**
```json
{
  "success": true,
  "data": {
    "tenantId": "tenant-id",
    "permissions": [
      {
        "moduleName": "POS",
        "isEnabled": true
      },
      {
        "moduleName": "INVENTORY",
        "isEnabled": false
      },
      {
        "moduleName": "ACCOUNTING",
        "isEnabled": true
      }
    ]
  }
}
```

---

### PUT /modules/:tenantId/permissions/:moduleName

Update module permission.

**Path Parameters:**
- `tenantId` - Tenant ID
- `moduleName` - One of: `POS`, `INVENTORY`, `ACCOUNTING`, `LOYALTY`, `ECOMMERCE`, `AI`, `CRM`

**Request Body:**
```json
{
  "isEnabled": true,
  "enabledBy": "admin-user-id"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "tenantId": "tenant-id",
    "moduleName": "POS",
    "isEnabled": true
  }
}
```

---

### GET /modules/:tenantId/check/:moduleName

Check if a module is enabled for a tenant.

**Response:**
```json
{
  "success": true,
  "data": {
    "tenantId": "tenant-id",
    "moduleName": "POS",
    "isEnabled": true
  }
}
```

---

### PUT /modules/:tenantId/enable/:moduleName

Enable a module for a tenant.

**Request Body:**
```json
{
  "enabledBy": "admin-user-id"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Module POS enabled for tenant tenant-id"
}
```

---

### PUT /modules/:tenantId/disable/:moduleName

Disable a module for a tenant.

**Request Body:**
```json
{
  "enabledBy": "admin-user-id"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Module POS disabled for tenant tenant-id"
}
```

---

## 📝 Example cURL Commands

### Complete Workflow

```bash
# 1. Create Tenant
TENANT_RESPONSE=$(curl -s -X POST http://localhost:3001/tenants \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Restaurant",
    "email": "restaurant@example.com",
    "phone": "1234567890"
  }')

TENANT_ID=$(echo $TENANT_RESPONSE | jq -r '.data.id')

# 2. Register Admin User
USER_RESPONSE=$(curl -s -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"admin@restaurant.com\",
    \"password\": \"securepassword123\",
    \"firstName\": \"Admin\",
    \"lastName\": \"User\",
    \"role\": \"ADMIN\",
    \"tenantId\": \"$TENANT_ID\"
  }")

ACCESS_TOKEN=$(echo $USER_RESPONSE | jq -r '.data.accessToken')
USER_ID=$(echo $USER_RESPONSE | jq -r '.data.user.id')

# 3. Enable POS Module
curl -X PUT http://localhost:3002/modules/$TENANT_ID/enable/POS \
  -H "Content-Type: application/json" \
  -d "{
    \"enabledBy\": \"$USER_ID\"
  }"

# 4. Check Module Access
curl http://localhost:3002/modules/$TENANT_ID/check/POS

# 5. Get All Permissions
curl http://localhost:3002/modules/$TENANT_ID/permissions
```

---

## 🔍 Testing URLs

Use these URLs to test the APIs:

**Auth Service:**
- Register: `http://localhost:3000/auth/register`
- Login: `http://localhost:3000/auth/login`
- Refresh: `http://localhost:3000/auth/refresh`

**Tenant Service:**
- Create Tenant: `http://localhost:3001/tenants`
- Get Tenants: `http://localhost:3001/tenants`
- Get Tenant: `http://localhost:3001/tenants/{id}`
- Create Branch: `http://localhost:3001/tenants/{tenantId}/branches`

**Module Access Service:**
- Get Permissions: `http://localhost:3002/modules/{tenantId}/permissions`
- Enable Module: `http://localhost:3002/modules/{tenantId}/enable/{moduleName}`
- Check Access: `http://localhost:3002/modules/{tenantId}/check/{moduleName}`

---

**Last Updated**: 2024

