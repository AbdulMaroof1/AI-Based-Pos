# ABMNEXT ERP — Architecture Overview

## Why Each Service Runs on a Different Port

The system uses a **microservices architecture**. Each backend service runs as an independent process on its own port:

| Service | Port | Purpose |
|---------|------|---------|
| Auth Service | 3000 | Authentication, OTP, user management |
| Tenant Service | 3001 | Companies/tenants, branches |
| Module Access Service | 3002 | Module permissions per tenant, active modules |
| POS Service | 3003 | Point of Sale operations |
| Frontend | 3007 | Next.js app |

### Benefits

1. **Independent scaling** — Scale only the services that need more capacity
2. **Fault isolation** — A failure in one service does not bring down others
3. **Independent deployment** — Deploy or roll back a single service
4. **Technology flexibility** — Each service can use different tools if needed
5. **Clear boundaries** — Each service owns its data; communication is via HTTP APIs

### Communication

- Services talk to each other via **HTTP APIs** (REST)
- The frontend calls each service directly using `NEXT_PUBLIC_*_SERVICE_URL` environment variables
- For server-to-server calls (e.g. Auth → Tenant), use `TENANT_SERVICE_URL`, `MODULE_ACCESS_SERVICE_URL` in `.env`

### In Production

- Use a reverse proxy (e.g. NGINX) or API Gateway to expose a single domain
- Route `/auth/*` → Auth Service, `/tenants/*` → Tenant Service, etc.
- Or run all behind Kubernetes/Docker with service discovery
