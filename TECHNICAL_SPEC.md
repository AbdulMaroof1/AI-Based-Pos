# SaaS ERP Platform — Technical Specification

**Document Date:** February 17, 2026  
**Purpose:** Shared reference for all agents and developers. Follow this spec for consistent implementation.  
**Companion:** `milestone_2_17_2026.md` (milestones & delivery order)

---

## 1. Tech Stack

### Backend
| Component | Technology |
|-----------|------------|
| Runtime | Node.js >= 18 |
| Framework | NestJS 10.x |
| Language | TypeScript (strict mode) |
| ORM | Prisma |
| Database | PostgreSQL |
| Validation | class-validator, class-transformer |
| Package Manager | pnpm (workspaces) |

### Frontend
| Component | Technology |
|-----------|------------|
| Framework | Next.js 14+ (App Router) |
| Language | TypeScript (strict mode) |
| State | Zustand |
| Forms | React Hook Form + Zod |
| Styling | Tailwind CSS |
| Icons | Lucide React |
| HTTP Client | Axios |

### Infrastructure (Planned)
| Component | Technology |
|-----------|------------|
| Message Queue / Workers | BullMQ |
| Cache / Session | Redis |
| Containers | Docker |
| Load Balancer | NGINX |

### Shared Packages (Monorepo)
| Package | Purpose |
|---------|---------|
| `@pos/shared-types` | Common types, interfaces, enums |
| `@pos/config` | Configuration management |
| `@pos/api-client` | HTTP client utilities |
| `@pos/utils` | Shared utilities (e.g. JWT, password hashing) |

---

## 2. Project Structure (Monorepo)

```
ai-based-pos/
├── package.json                 # Root workspace config
├── pnpm-workspace.yaml
├── TECHNICAL_SPEC.md             # This document
├── milestone_2_17_2026.md       # Milestone tracking
│
├── packages/
│   ├── shared-types/            # @pos/shared-types
│   ├── config/                  # @pos/config
│   ├── api-client/              # @pos/api-client
│   └── utils/                   # @pos/utils
│
├── services/                    # Backend microservices
│   ├── auth-service/
│   ├── tenant-service/          # → company-service (rename per scope)
│   ├── module-access-service/
│   ├── subscription-service/   # To be added
│   ├── accounting-service/     # To be added
│   ├── crm-service/            # To be added
│   ├── sales-service/          # To be added
│   ├── purchase-service/       # To be added
│   ├── inventory-service/      # To be added
│   ├── payroll-service/        # To be added
│   ├── hr-service/             # To be added
│   ├── manufacturing-service/  # To be added
│   └── platform-admin-service/  # To be added (or admin module in gateway)
│
├── frontend/                    # Next.js app
│
└── workers/                     # BullMQ workers (to be added)
```

---

## 3. Backend Folder Structure (Per Service)

Each NestJS service MUST follow this structure:

```
services/<service-name>/
├── package.json
├── tsconfig.json
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   │
│   ├── core/                    # Core cross-cutting concerns
│   │   └── (guards, filters, etc. if shared within service)
│   │
│   ├── common/                  # Shared within this service
│   │   ├── decorators/          # Custom decorators (@CompanyId(), @CurrentUser())
│   │   ├── guards/              # TenantGuard, PermissionGuard, ModuleAccessGuard
│   │   ├── filters/             # Exception filters
│   │   ├── interceptors/        # Logging, transform
│   │   ├── utils/               # Service-specific utilities
│   │   ├── constants/           # Constants
│   │   └── base/                # Base classes, interfaces
│   │
│   ├── modules/                 # Feature modules
│   │   ├── auth/
│   │   ├── company/
│   │   ├── subscription/
│   │   └── ...
│   │
│   └── prisma/                  # PrismaService
│
├── infra/
│   └── prisma/
│       ├── schema.prisma
│       └── migrations/
│
└── types/                       # Service-specific types (DTOs, responses)
```

### Rules for Backend
- **No business logic in controllers** — controllers only validate, call services, return response
- **No direct DB access across modules** — use Prisma within the same service only; cross-service = API or events
- **Strict DTO validation** — use class-validator on all incoming DTOs
- **Transactions for financial ops** — use `prisma.$transaction()` for orders, payments, journal entries
- **Index `companyId` and `createdAt`** on all tenant-scoped tables

---

## 4. Frontend Folder Structure

```
frontend/
├── package.json
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
│
├── app/
│   ├── layout.tsx
│   ├── page.tsx                 # Root redirect
│   │
│   ├── (auth)/                  # Auth route group
│   │   ├── login/
│   │   ├── register/
│   │   └── forgot-password/
│   │
│   ├── dashboard/
│   │   ├── layout.tsx           # Dashboard layout with sidebar
│   │   ├── page.tsx
│   │   ├── accounting/
│   │   ├── sales/
│   │   ├── purchase/
│   │   ├── inventory/
│   │   ├── crm/
│   │   ├── payroll/
│   │   ├── hr/
│   │   ├── manufacturing/
│   │   ├── settings/
│   │   └── ...
│   │
│   └── admin/                   # Super Admin (later)
│       ├── companies/
│       ├── logs/
│       └── ...
│
├── components/
│   ├── ui/                      # Reusable UI primitives
│   ├── forms/                   # Form components
│   ├── tables/                  # Data tables
│   ├── modals/                  # Modal dialogs
│   └── charts/                  # Charts (if any)
│
├── hooks/
│   └── useAuth.ts, etc.
│
├── lib/
│   ├── api-client.ts            # API client instance
│   ├── store.ts                 # Zustand store(s)
│   └── utils.ts
│
└── services/                    # API service layer (optional)
    └── auth.service.ts, etc.
```

### Rules for Frontend
- Use **App Router** (Next.js 13+)
- Use **server components** where possible; `'use client'` only when needed
- Respect **module access** — hide sidebar items for disabled modules
- Use **company context** — company switch in header when multi-company

---

## 5. Event-Driven Architecture

### Principles
1. **No circular dependencies** between services
2. **No direct service-to-service financial manipulation** — use events
3. **Events must be idempotent** — same event received twice = same result
4. **Standard event payload** — include `eventId`, `companyId`, `timestamp`, payload

### Event Flow
```
Source Service                Event                    Listener Service
─────────────────────────────────────────────────────────────────────────
Sales                    →  invoice.posted         →  Accounting
Purchase                 →  bill.posted           →  Accounting
Payroll                  →  payroll.processed      →  Accounting
Manufacturing            →  production.completed   →  Accounting, Inventory
```

### Implementation
- Use **NestJS EventEmitter2** (`@nestjs/event-emitter`) for in-process events
- Or use **BullMQ / Redis** for cross-service events (when services are separate processes)
- Event handlers use `@OnEvent('event.name')` decorator

### Event Payload Standard
```typescript
interface BaseEventPayload {
  eventId: string;      // UUID for idempotency
  companyId: string;
  timestamp: string;    // ISO 8601
  source: string;      // Service name
}

// Example: invoice.posted
interface InvoicePostedPayload extends BaseEventPayload {
  invoiceId: string;
  amount: number;
  currency: string;
  // ... invoice-specific fields
}
```

### Idempotency
- Store `eventId` in a processed-events table before handling
- If `eventId` already exists → skip processing
- Prevents duplicate journal entries, double deductions, etc.

---

## 6. Workers (BullMQ)

```
workers/
├── payroll.worker.ts        # Payroll processing
├── reporting.worker.ts      # Report generation
├── email.worker.ts          # Email notifications
└── journal.worker.ts        # Large journal postings
```

- Use BullMQ for long-running or batch jobs
- Do NOT run heavy work in request/response cycle
- Workers run as separate processes or containers

---

## 7. Database Guidelines

- **Per-service database** (current) or **shared DB with schema separation** (future option)
- **Prisma migrations** in `infra/prisma/migrations/`
- **Indexes:** `companyId`, `createdAt` on tenant-scoped tables
- **Partitioning:** Consider for large journal/ledger tables later
- **Read replicas:** For report-heavy queries (future)

---

## 8. API Conventions

### Response Format
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional message"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "statusCode": 400
}
```

### Pagination
```json
{
  "data": [ ... ],
  "total": 100,
  "page": 1,
  "limit": 10,
  "totalPages": 10
}
```

### Headers
- `Authorization: Bearer <accessToken>`
- `X-Company-Id` (optional, if not in JWT)

---

## 9. Code Rules

| Rule | Description |
|------|-------------|
| No AI comments | Do not leave AI-generated placeholder comments |
| No debug logs in production | Remove `console.log`; use proper logger |
| No business logic in controllers | Controllers delegate to services |
| No direct DB access across modules | Use APIs or events between services |
| Strict DTO validation | class-validator on all DTOs |
| Transactions for financial ops | Use `prisma.$transaction()` |
| Strict TypeScript | No `any`; enable strict null checks |

---

## 10. Agent Instructions

When working on this codebase:

1. **Read this document first** — follow tech stack, folder structure, and code rules
2. **Read `milestone_2_17_2026.md`** — understand which milestone you are implementing
3. **Use shared packages** — import from `@pos/shared-types`, `@pos/utils`, etc. Do not duplicate types
4. **Service communication** — use HTTP APIs or events; never import from another service directly
5. **Multi-tenant** — always scope by `companyId`; use tenant guard and middleware
6. **Events** — when adding integration (e.g. Sales → Accounting), use events; implement both emitter and listener
7. **Consistency** — match existing patterns (naming, structure, validation style)

---

**Document Version:** 1.0  
**Last Updated:** February 17, 2026
