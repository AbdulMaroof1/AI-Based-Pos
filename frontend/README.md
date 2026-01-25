# Frontend - Next.js Application

This is the frontend application for the AI-Based POS System, built with Next.js 14, TypeScript, and Tailwind CSS.

## Features

- **Authentication**: Login and registration
- **Admin Dashboard**: Manage tenants and module access
- **POS Interface**: Table management and order processing
- **Zoho CRM Style**: UI follows Zoho CRM design patterns

## Getting Started

### Prerequisites

- Node.js 18+ and pnpm installed
- All backend services running (Auth, Tenant, Module Access, POS)

### Installation

```bash
pnpm install
```

### Environment Variables

Create a `.env.local` file in the `frontend` directory:

```env
NEXT_PUBLIC_AUTH_SERVICE_URL=http://localhost:3000
NEXT_PUBLIC_TENANT_SERVICE_URL=http://localhost:3001
NEXT_PUBLIC_MODULE_ACCESS_SERVICE_URL=http://localhost:3002
NEXT_PUBLIC_POS_SERVICE_URL=http://localhost:3003
```

### Run Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

**Note**: The frontend runs on port 3000, which conflicts with the Auth Service. You may need to change the frontend port:

```bash
pnpm dev -p 3004
```

Or update the backend services to use different ports.

## Pages

- `/` - Redirects to login or dashboard
- `/login` - Authentication page
- `/dashboard` - Main admin dashboard
- `/dashboard/tenants` - Tenant management
- `/dashboard/modules` - Module access control
- `/pos` - POS interface

## Project Structure

```
frontend/
├── app/              # Next.js app directory
│   ├── dashboard/    # Admin dashboard pages
│   ├── pos/          # POS interface pages
│   └── login/        # Authentication page
├── lib/              # Utilities and API client
└── components/       # Reusable components (to be added)
```

## API Integration

The frontend uses the `apiClient` from `lib/api-client.ts` to communicate with backend services. All API calls include authentication tokens automatically.

