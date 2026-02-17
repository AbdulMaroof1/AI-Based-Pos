# SaaS ERP Platform — Master Milestone Document

**Document Date:** February 17, 2026  
**Purpose:** Defines module order, milestones, and development sequence for full-stack (API + UI) integration  
**Scope:** Complete SaaS ERP as per platform specification

---

## Development Approach

- **Unified delivery:** Each milestone delivers APIs, UI, and integration together
- **Full-stack per milestone:** No separate “API-only” or “UI-only” phases
- **Integration-first:** Each module is wired end-to-end before moving to the next
- **Foundation-first:** Core platform must be solid before business modules

---

## Module Order & Sequence

| Order | Module | Depends On | Rationale |
|-------|--------|------------|-----------|
| 1 | Phase 0 — SaaS Core | — | Foundation for all modules |
| 2 | Phase 1 — Accounting | Phase 0 | Central to Sales, Purchase, Inventory, Payroll |
| 3 | Phase 2 — CRM | Phase 0 | Customer/Lead data for Sales |
| 4 | Phase 3 — Sales | Phase 0, 1, 2 | Needs Accounting, CRM (customer) |
| 5 | Phase 4 — Purchase | Phase 0, 1 | Needs Accounting for vendor bills |
| 6 | Phase 5 — Inventory | Phase 0, 1, 3, 4 | Needs Accounting, Sales, Purchase |
| 7 | Phase 6 — Payroll | Phase 0, 1, 7 | Needs Accounting, HR |
| 8 | Phase 7 — HR | Phase 0 | Employee, attendance, leave for Payroll |
| 9 | Phase 8 — Manufacturing | Phase 0, 1, 5 | Needs Accounting, Inventory |

> **Note:** HR (7) is developed before Payroll (6) in implementation order, since Payroll depends on HR.

---

## Phase 0 — SaaS Core (Foundation)

**Module Order: 1st**

---

### Phase 0 — Priority & Flow

**First priority:** Companies and Vendors (SaaS customers) start their registration in the ERP system. The self-service registration flow is the entry point.

**Flow:**
1. Company/Vendor registers → creates Company + first Admin user in one flow
2. Company gets trial or paid plan
3. Company admin adds users, enables modules (within plan limits)
4. Super Admin views all companies later (separate admin portal/views)

**Super Admin (later stage):** Develop after companies can register. Super Admin can list, view, and manage all registered companies via APIs/UI.

---

### Milestone 0.1 — Company Registration & Authentication

**First priority — Company and Vendors start here.**

| # | Item | API | UI | Done |
|---|------|-----|-----|------|
| 0.1.1 | **Initial login screen** — Email-only, "Log in to your site on ABMNEXT ERP", Submit button | ☑ | ☑ | ☑ |
| 0.1.2 | **Request OTP** — `POST /auth/request-otp` — Send 6-digit OTP via SMTP to email | ☑ | — | ☑ |
| 0.1.3 | **OTP verification screen** — Email + Verification code inputs, Verify + Resend buttons | — | ☑ | ☑ |
| 0.1.4 | **Verify OTP** — `POST /auth/verify-otp` — Validate OTP, return temp token or user if exists | ☑ | — | ☑ |
| 0.1.5 | **Account setup screen** — First name, Last name, Email, Country, Phone; "Create account" button | — | ☑ | ☑ |
| 0.1.6 | **Setup account** — `POST /auth/setup-account` — Create user after OTP verification (with temp token) | ☑ | — | ☑ |
| 0.1.7 | SMTP email service for OTP delivery | ☑ | — | ☑ |
| 1 | Company registration (Company + first admin user in one flow) | ☑ | ☑ | ☑ |
| 2 | Registration fields: Company Name, Business Type, Industry, Country, Currency, Fiscal Year Start, Email, Password, Phone, Timezone | ☑ | ☑ | ☑ |
| 3 | After registration: auto-create default chart of accounts (when Accounting exists) | ☐ | — | ☐ |
| 4 | After registration: assign trial plan | ☑ | — | ☑ |
| 5 | Redirect to dashboard after registration | — | ☑ | ☑ |
| 6 | Login (email + password) — alternate to OTP | ☑ | ☑ | ☑ |
| 7 | JWT & refresh tokens | ☑ | ☑ | ☑ |
| 8 | Password reset (forgot password + reset flow) | ☑ | ☑ | ☑ |
| 9 | Email verification (optional, can add later) | ☐ | ☐ | ☐ |

**API + UI + Integration** — All items delivered together per milestone.

---

### Milestone 0.2 — Multi-Tenant Engine

| # | Item | API | UI | Done |
|---|------|-----|-----|------|
| 1 | Company isolation — `companyId` on all tenant-scoped data | ☑ | — | ☑ |
| 2 | `companyId` injection middleware (from JWT into request context) | ☑ | — | ☑ |
| 3 | Global tenant guard (block requests without valid company context) | ☑ | — | ☑ |
| 4 | All data queries scoped by `companyId` | ☑ | — | ☑ |

**API + UI + Integration** — Middleware/guards affect API; UI uses company context for all screens.

---

### Milestone 0.3 — Role-Based Access

| # | Item | API | UI | Done |
|---|------|-----|-----|------|
| 1 | Role model (e.g., Super Admin, Company Admin, Manager, User) | ☑ | ☑ | ☑ |
| 2 | Permission model (granular permissions per role) | ☐ | ☐ | ☐ |
| 3 | Module access — per-company module enable/disable | ☑ | ☑ | ☑ |
| 4 | Guard implementation: PermissionGuard | ☐ | — | ☐ |
| 5 | Guard implementation: ModuleAccessGuard | ☑ | — | ☑ |
| 6 | UI: Hide/disable menu items based on role & module access | — | ☑ | ☑ |

**API + UI + Integration** — Guards protect API; UI respects same rules.

---

### Milestone 0.4 — Subscription Engine

| # | Item | API | UI | Done |
|---|------|-----|-----|------|
| 1 | Plan management (e.g., Free Trial, Basic, Pro, Enterprise) | ☑ | ☐ | ☑ |
| 2 | Module activation tied to plan (which modules each plan includes) | ☑ | — | ☑ |
| 3 | Trial period: start date, end date, duration | ☑ | ☐ | ☑ |
| 4 | Trial expiry: block or limit access after trial ends | ☑ | ☑ | ☑ |
| 5 | Upgrade/downgrade plan (optional, can add later) | ☐ | ☐ | ☐ |

**API + UI + Integration** — Plan affects module access and company capabilities.

---

### Milestone 0.5 — Platform Admin (Super Owner)

**Develop at later stage — after companies can register and use the system.**

Super Admin can manage all SaaS customers (companies) via APIs. UI can follow.

| # | Item | API | UI | Done |
|---|------|-----|-----|------|
| 1 | **List companies** — `GET /admin/companies` (paginated, filterable) | ☐ | ☐ | ☐ |
| 2 | **View company detail** — `GET /admin/companies/:id` | ☐ | ☐ | ☐ |
| 3 | **Add/remove modules** per company — enable/disable modules for a company | ☐ | ☐ | ☐ |
| 4 | **Block free trial** — block or extend trial for a company | ☐ | ☐ | ☐ |
| 5 | **SaaS registration stats** — count of users created by each company | ☐ | ☐ | ☐ |
| 6 | **Suspend company** — block company access (login disabled) | ☐ | ☐ | ☐ |
| 7 | **View subscription status** per company (plan, trial end, etc.) | ☐ | ☐ | ☐ |
| 8 | **View logs/audit** — company-level activity or key actions | ☐ | ☐ | ☐ |
| 9 | **Impersonation mode** (read-only) — Super Admin views company data as that company | ☐ | ☐ | ☐ |

**Additional Super Admin ideas (add when needed):**
- Company onboarding status (setup completed or not)
- Last login per company
- Storage/usage metrics (if applicable)
- Billing/usage for metered plans

**API + UI + Integration** — Admin APIs first; Admin UI when ready.

---

### Phase 0 — Extra Items (Optional, Add as Needed)

| Item | When to add |
|------|-------------|
| Email verification on registration | If required for production |
| Company profile/settings screen (edit company details) | After 0.1 |
| Invite users (Company Admin invites team members) | After 0.3 |
| Company switch (multi-company user) | If users belong to multiple companies |

---

## Phase 1 — Accounting Engine

**Module Order: 2nd**

### Milestone 1.1 — Chart of Accounts
- Account creation
- Hierarchy (parent/child)
- Account types (Asset, Liability, Equity, Revenue, Expense)
- **API + UI + Integration**

### Milestone 1.2 — Journal Engine
- Journal creation
- Balanced validation (debits = credits)
- Posting mechanism
- Lock after post (no edit/delete)
- **API + UI + Integration**

### Milestone 1.3 — Period Locking
- Fiscal year configuration
- Period close
- No posting to locked period
- **API + UI + Integration**

### Milestone 1.4 — Reports
- Trial balance
- Ledger
- P&L (Profit & Loss)
- Balance Sheet
- **API + UI + Integration**

---

## Phase 2 — CRM

**Module Order: 3rd**

### Milestone 2.1 — Lead Management
- Lead CRUD
- Status pipeline (e.g., New → Qualified → Lost/Won)
- Activity tracking
- **API + UI + Integration**

### Milestone 2.2 — Convert Lead to Customer
- Convert lead to customer
- Integration with Sales module
- **API + UI + Integration**

---

## Phase 3 — Sales

**Module Order: 4th**

### Milestone 3.1 — Customer & Documents
- Customer (CRUD)
- Quotation
- Sales Order
- **API + UI + Integration**

### Milestone 3.2 — Delivery & Invoicing
- Delivery
- Invoice
- Partial payment
- Overpayment handling
- Credit note
- **API + UI + Integration**

### Milestone 3.3 — Accounting Event Integration
- Emit `invoice.posted` event
- Accounting listens and creates journal entries
- Event-driven, no direct service calls
- **API + UI + Integration**

---

## Phase 4 — Purchase

**Module Order: 5th**

### Milestone 4.1 — Vendor & Documents
- Vendor (CRUD)
- Purchase Requisition
- Purchase Order
- **API + UI + Integration**

### Milestone 4.2 — Receipt & Billing
- Goods Receipt
- Vendor Bill
- Payment
- **API + UI + Integration**

### Milestone 4.3 — Accounting Integration
- Emit `bill.posted` event
- Accounting listens and creates journal entries
- **API + UI + Integration**

---

## Phase 5 — Inventory

**Module Order: 6th**

### Milestone 5.1 — Master Data
- Product (CRUD)
- Warehouse
- Location
- **API + UI + Integration**

### Milestone 5.2 — Stock Movement Engine
- Internal transfer
- Adjustment
- Quarantine
- **API + UI + Integration**

### Milestone 5.3 — Accounting Integration
- COGS / Inventory valuation
- Accounting events for stock movements
- **API + UI + Integration**

---

## Phase 6 — Payroll

**Module Order: 8th** (after HR)

### Milestone 6.1 — Payroll Core
- Salary structure
- Payroll run
- Payslip
- **API + UI + Integration**

### Milestone 6.2 — Payment & Accounting
- Salary payment
- Accounting event (`payroll.processed`)
- **API + UI + Integration**

---

## Phase 7 — HR

**Module Order: 7th**

### Milestone 7.1 — Employee & Organization
- Employee (CRUD)
- Attendance
- Leave
- Department
- **API + UI + Integration**

---

## Phase 8 — Manufacturing

**Module Order: 9th**

### Milestone 8.1 — Manufacturing Core
- BOM (Bill of Materials)
- Work Order
- Raw consumption
- Production entry
- WIP accounting
- **API + UI + Integration**

---

## Cross-Cutting Milestones

### Infrastructure Milestone — Event System
- Event bus (e.g., NestJS EventEmitter2 or message queue)
- Standard event payload format
- Idempotency handling
- **Required before:** Milestone 3.3, 4.3, 5.3, 6.2

### Infrastructure Milestone — Workers
- BullMQ setup
- Workers: report generation, payroll processing, large journal postings, email
- **Can run in parallel with:** Phase 2–8 as needed

### Infrastructure Milestone — Caching & Scalability
- Redis: session, cache, rate limiting
- Indexing strategy: companyId, createdAt
- **Can run in parallel with:** Phase 2–8

---

## Summary: Milestone Count by Phase

| Phase | Milestones | Order |
|-------|------------|-------|
| Phase 0 — SaaS Core | 5 | 1st |
| Phase 1 — Accounting | 4 | 2nd |
| Phase 2 — CRM | 2 | 3rd |
| Phase 3 — Sales | 3 | 4th |
| Phase 4 — Purchase | 3 | 5th |
| Phase 5 — Inventory | 3 | 6th |
| Phase 6 — Payroll | 2 | 8th |
| Phase 7 — HR | 1 | 7th |
| Phase 8 — Manufacturing | 1 | 9th |
| **Infrastructure** | 3 | As needed |

**Total:** 27 milestone units (24 feature + 3 infrastructure)

---

## Next Steps

1. **Break into individual documents:** Each milestone above becomes a separate document with:
   - Acceptance criteria
   - API spec (endpoints, DTOs, responses)
   - UI spec (screens, components, flows)
   - Integration checklist
   - Test scenarios
   - Dependencies and prerequisites

2. **Sprint planning:** Map milestones to sprints based on team size and velocity

3. **Dependency graph:** Use this document as input for a visual dependency/sequence diagram

---

**Document Version:** 1.0  
**Last Updated:** February 17, 2026
