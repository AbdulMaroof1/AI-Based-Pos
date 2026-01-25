# AI-Based POS System - MVP

An AI-first, omnichannel POS system with modular microservices architecture.

## 🏗️ Architecture

- **Monorepo Structure**: pnpm workspaces
- **Services**: Microservices with strict API communication
- **Database**: PostgreSQL with Prisma ORM
- **Type Safety**: Strict TypeScript, no direct service imports
- **Testing**: Jest for unit and integration tests

## 📦 Services

### 1. Auth Service (Port 3000)
- User registration and authentication
- JWT token management
- Refresh token support

### 2. Tenant Service (Port 3001)
- Multi-tenant management
- Branch management per tenant

### 3. Module Access Control Service (Port 3002)
- Module permission management
- Enable/disable modules per tenant

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18.0.0
- pnpm >= 8.0.0
- PostgreSQL >= 14.0

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd AI-Based-Pos
```

2. Install dependencies
```bash
pnpm install
```

3. Set up environment variables
```bash
cp .env.example .env
# Edit .env with your database credentials
```

4. Set up databases
```bash
# For each service, generate Prisma client and run migrations
cd services/auth-service && pnpm db:generate && pnpm db:migrate
cd ../tenant-service && pnpm db:generate && pnpm db:migrate
cd ../module-access-service && pnpm db:generate && pnpm db:migrate
```

5. Build all packages
```bash
pnpm build
```

6. Run services
```bash
# Run all services in parallel
pnpm dev

# Or run individually
cd services/auth-service && pnpm dev
cd services/tenant-service && pnpm dev
cd services/module-access-service && pnpm dev
```

## 🧪 Testing

Run tests for all services:
```bash
pnpm test
```

Run tests for a specific service:
```bash
cd services/auth-service && pnpm test
```

## 📡 API Endpoints

### Auth Service (http://localhost:3000)

#### Register User
```http
POST /auth/register
Content-Type: application/json

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

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Refresh Token
```http
POST /auth/refresh
Content-Type: application/json

{
  "refreshToken": "your-refresh-token"
}
```

### Tenant Service (http://localhost:3001)

#### Create Tenant
```http
POST /tenants
Content-Type: application/json

{
  "name": "Acme Restaurant",
  "email": "acme@example.com",
  "phone": "1234567890",
  "address": "123 Main St",
  "isActive": true
}
```

#### Get All Tenants
```http
GET /tenants?page=1&limit=10&sortBy=name&sortOrder=asc
```

#### Get Tenant by ID
```http
GET /tenants/:id
```

#### Update Tenant
```http
PUT /tenants/:id
Content-Type: application/json

{
  "name": "Updated Name",
  "isActive": false
}
```

#### Delete Tenant
```http
DELETE /tenants/:id
```

#### Create Branch
```http
POST /tenants/:tenantId/branches
Content-Type: application/json

{
  "name": "Downtown Branch",
  "address": "456 Branch St",
  "phone": "0987654321",
  "isActive": true
}
```

#### Get Branches
```http
GET /tenants/:tenantId/branches
```

#### Get Branch by ID
```http
GET /tenants/branches/:id
```

#### Update Branch
```http
PUT /tenants/branches/:id
Content-Type: application/json

{
  "name": "Updated Branch Name"
}
```

#### Delete Branch
```http
DELETE /tenants/branches/:id
```

### Module Access Control Service (http://localhost:3002)

#### Get Module Permissions
```http
GET /modules/:tenantId/permissions
```

#### Update Module Permission
```http
PUT /modules/:tenantId/permissions/:moduleName
Content-Type: application/json

{
  "isEnabled": true,
  "enabledBy": "admin-user-id"
}
```

#### Check Module Access
```http
GET /modules/:tenantId/check/:moduleName
```

#### Enable Module
```http
PUT /modules/:tenantId/enable/:moduleName
Content-Type: application/json

{
  "enabledBy": "admin-user-id"
}
```

#### Disable Module
```http
PUT /modules/:tenantId/disable/:moduleName
Content-Type: application/json

{
  "enabledBy": "admin-user-id"
}
```

### Available Module Names
- `POS`
- `INVENTORY`
- `ACCOUNTING`
- `LOYALTY`
- `ECOMMERCE`
- `AI`
- `CRM`

## 🔐 User Roles

- `SUPER_ADMIN` - Full system access
- `ADMIN` - Tenant-level admin
- `MANAGER` - Branch manager
- `CASHIER` - POS operator
- `STAFF` - General staff

## 📝 Example API Usage

### Complete Flow Example

1. **Create a Tenant**
```bash
curl -X POST http://localhost:3001/tenants \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Restaurant",
    "email": "restaurant@example.com",
    "phone": "1234567890"
  }'
```

2. **Register Admin User**
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@restaurant.com",
    "password": "securepassword123",
    "firstName": "Admin",
    "lastName": "User",
    "role": "ADMIN",
    "tenantId": "<tenant-id-from-step-1>"
  }'
```

3. **Enable POS Module**
```bash
curl -X PUT http://localhost:3002/modules/<tenant-id>/enable/POS \
  -H "Content-Type: application/json" \
  -d '{
    "enabledBy": "<admin-user-id>"
  }'
```

4. **Check Module Access**
```bash
curl http://localhost:3002/modules/<tenant-id>/check/POS
```

## 🧪 Test Cases

All services include comprehensive test suites:

- **Auth Service**: Registration, login, refresh token, error handling
- **Tenant Service**: CRUD operations, branch management, pagination
- **Module Access Service**: Permission management, enable/disable modules

Run tests:
```bash
pnpm test
```

## 📁 Project Structure

```
.
├── packages/
│   ├── shared-types/      # Shared TypeScript types
│   ├── api-client/        # HTTP client utilities
│   ├── utils/             # Shared utilities (JWT, password hashing)
│   └── config/            # Configuration management
├── services/
│   ├── auth-service/      # Authentication service
│   │   ├── src/           # Source code
│   │   ├── types/         # Service-specific types
│   │   └── infra/         # Infrastructure (Prisma)
│   ├── tenant-service/    # Tenant management service
│   └── module-access-service/  # Module access control
├── MILESTONES.md          # Development milestones
└── README.md              # This file
```

## 🔧 Development

### Adding a New Service

1. Create service folder in `services/`
2. Set up `package.json` with NestJS dependencies
3. Create `src/`, `types/`, and `infra/` folders
4. Set up Prisma schema in `infra/prisma/`
5. Implement service logic following existing patterns
6. Add test cases
7. Update this README with API endpoints

### Code Standards

- **Strict TypeScript**: No `any` types
- **No Direct Imports**: Services communicate via APIs only
- **Type Packages**: Use shared packages for types
- **Test Coverage**: All services must have test cases
- **Linting**: ESLint with strict rules

## 🐛 Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running
- Check `DATABASE_URL` in `.env`
- Run migrations: `pnpm db:migrate`

### Port Conflicts
- Services use ports 3000, 3001, 3002
- Change ports in service `main.ts` if needed

### Build Errors
- Run `pnpm install` in root
- Build shared packages first: `cd packages/shared-types && pnpm build`
- Then build services

## 📄 License

[Your License Here]

## 👥 Contributors

[Your Team Here]

---

**Status**: Milestone 1 - Foundation & Infrastructure ✅

