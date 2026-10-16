# Penta Prizm — Multi-Tenant Restaurant SaaS Platform

Penta Prizm is an enterprise multi-tenant restaurant and café ordering SaaS platform featuring cryptographically verified QR table validation, live order management, a real-time Kitchen Display System (KDS), branch/table administration, and platform super admin governance.

The repository is structured as a production monorepo containing two decoupled, independently deployable applications sharing a single Supabase PostgreSQL database:

- **`frontend/`**: Vite + React 19 + Tailwind CSS single page application (SPA), configured for deployment on **Vercel**.
- **`backend/`**: Node.js + Express REST API Web Service with Supabase Auth verification and strict Row-Level Security, configured for deployment on **Render**.
- **`database/`**: PostgreSQL migrations, initial seed data, RLS security policies, and Supabase Storage bucket configurations.

---

## 1. Monorepo Directory Layout

```text
penta-prizm-restaurant-saas/
├── frontend/                     # Independent React/Vite frontend (Deploy to Vercel)
│   ├── public/                   # Static assets & images
│   ├── src/
│   │   ├── assets/               # Image assets and photography
│   │   ├── components/           # UI, Customer, Admin, Kitchen, SuperAdmin views
│   │   ├── lib/                  # Authentication, sound chime, QR helpers
│   │   ├── services/             # Centralized api.ts & supabaseClient.ts
│   │   ├── types/                # Shared TypeScript contracts
│   │   ├── App.tsx               # Route and tenant resolution
│   │   ├── index.css             # Tailwind CSS imports
│   │   └── main.tsx              # React DOM entry
│   ├── .env.example              # Frontend environment variables template
│   ├── index.html                # HTML document entry
│   ├── package.json              # Independent frontend dependencies
│   ├── tsconfig.json             # Frontend TypeScript configuration
│   └── vite.config.ts            # Vite bundler & proxy configuration
│
├── backend/                      # Independent Express REST API (Deploy to Render)
│   ├── src/
│   │   ├── config/               # Environment config & Supabase client initialization
│   │   ├── controllers/          # Public, Auth, Admin, Kitchen, SuperAdmin controllers
│   │   ├── middleware/           # CORS allowlist, auth/RBAC, error handling
│   │   ├── repositories/         # Supabase PostgreSQL queries with offline fallback
│   │   ├── routes/               # Modular Express routers (/health, /public, /auth, etc.)
│   │   ├── services/             # Business logic (QR validation, orders, auth, menus)
│   │   ├── utils/                # Token generation, hashing, credential-safe logger
│   │   ├── validators/           # Payload and input schema validators
│   │   ├── app.ts                # Express app setup and middleware pipeline
│   │   ├── server.ts             # Server entry point listening on 0.0.0.0
│   │   └── types.ts              # Backend domain models
│   ├── tests/                    # Health check and API test suites
│   ├── .env.example              # Backend environment variables template
│   ├── package.json              # Independent backend dependencies
│   └── tsconfig.json             # Backend TypeScript configuration
│
├── database/                     # Shared database definitions
│   ├── migrations/               # PostgreSQL schema & Row Level Security (RLS) policies
│   ├── seed/                     # Seed data for restaurants, tables, menus, staff
│   └── README.md                 # Migration guide and Storage bucket setup
│
├── server.ts                     # Root full-stack server for unified development
├── package.json                  # Root monorepo workspace configuration
├── tsconfig.json                 # Root TypeScript configuration
├── .gitignore                    # Monorepo ignore rules
└── README.md                     # Architecture and deployment manual
```

---

## 2. Local Development Setup

### Prerequisites
- Node.js 20+ or 22+
- npm 10+
- (Optional) A Supabase project for remote PostgreSQL database testing

### Option A: Unified Local Development (Single Command)
The root workspace can run the complete full-stack environment where Express handles `/api/*` REST endpoints and mounts the Vite frontend with hot reloading on port 3000:

```bash
# 1. Install root, frontend, and backend dependencies
npm install

# 2. Run the unified development server (Port 3000)
npm run dev
```

Visit `http://localhost:3000` in your browser.
Test the backend health check at `http://localhost:3000/api/health`.

### Option B: Running Frontend and Backend Independently

#### Run Backend Independently:
```bash
cd backend
npm install
cp .env.example .env
npm run dev
# Backend starts on http://0.0.0.0:5000
```

#### Run Frontend Independently:
```bash
cd frontend
npm install
cp .env.example .env
# Ensure VITE_API_URL=http://localhost:5000/api
npm run dev
# Frontend starts on http://localhost:3000
```

---

## 3. Database Setup (Supabase PostgreSQL)

1. Create a project at [supabase.com](https://supabase.com).
2. Open the **SQL Editor** in your Supabase dashboard.
3. Run the migration file:
   `database/migrations/001_initial_schema.sql`
4. Run the seed file:
   `database/seed/seed_data.sql`
5. In **Project Settings** > **API**, retrieve your:
   - **Project URL** (`SUPABASE_URL`)
   - **Anon Key** (`SUPABASE_ANON_KEY` / `VITE_SUPABASE_ANON_KEY`)
   - **Service Role Key** (`SUPABASE_SERVICE_ROLE_KEY` — *keep secret, server-only*)

---

## 4. Frontend Deployment on Vercel

1. Push your repository to GitHub / GitLab / Bitbucket.
2. In the [Vercel Dashboard](https://vercel.com/new), select **Import Project**.
3. In **Project Settings**:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click *Edit* and select **`frontend`**
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
4. Add **Environment Variables**:
   ```env
   VITE_API_URL=https://your-backend.onrender.com/api
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```
5. Click **Deploy**.
6. Configure your custom domains or subdomains in the Vercel Domain Manager.

---

## 5. Backend Deployment on Render

1. Log into [Render Dashboard](https://dashboard.render.com).
2. Click **New +** > **Web Service**.
3. Connect your repository.
4. Configure the service settings:
   - **Name**: `penta-prizm-backend`
   - **Region**: Closest to your users / database
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
5. Add **Environment Variables**:
   ```env
   NODE_ENV=production
   PORT=5000
   HOST=0.0.0.0
   FRONTEND_URL=https://your-frontend.vercel.app
   ALLOWED_ORIGINS=https://your-frontend.vercel.app,https://www.velvetroastcafe.com,https://bistro.saffronandsage.com
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your-supabase-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-server-only-service-role-key
   ```
6. Click **Create Web Service**.
7. Once deployed, verify:
   `curl https://your-backend.onrender.com/api/health`
   Should return: `{"status":"ok","service":"penta-prizm-backend", ...}`.

---

## 6. REST API Reference

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Service health status and uptime | Public |
| `GET` | `/api/public/restaurant` | Resolve tenant by domain/slug | Public |
| `POST` | `/api/public/qr/validate` | Cryptographic table QR validation | Public |
| `GET` | `/api/public/menu` | Public active category & menu items | Public |
| `POST` | `/api/public/orders` | Submit guest order with server recalculation | Public |
| `GET` | `/api/public/orders/:trackingToken` | Live order tracking status | Public |
| `POST` | `/api/auth/login` | Staff and admin login | Public |
| `POST` | `/api/auth/register` | Tenant admin onboarding registration | Public |
| `POST` | `/api/auth/logout` | Revoke session | Authenticated |
| `GET` | `/api/auth/me` | Fetch active user profile and tenant scope | Authenticated |
| `GET` | `/api/admin/dashboard` | Restaurant dashboard metrics & recent orders | Admin / Manager |
| `GET` | `/api/admin/menu` | Full restaurant menu CRUD list | Admin / Manager |
| `POST` | `/api/admin/menu` | Create new menu item | Admin / Manager |
| `PATCH` | `/api/admin/menu/:id` | Update menu item details or availability | Admin / Manager |
| `DELETE` | `/api/admin/menu/:id` | Delete menu item | Admin / Manager |
| `GET` | `/api/admin/tables` | List tables and associated QR tokens | Admin / Manager |
| `POST` | `/api/admin/tables` | Create new dining table | Admin / Manager |
| `POST` | `/api/admin/tables/:id/qr` | Generate/regenerate secure table QR code | Admin / Manager |
| `GET` | `/api/admin/orders` | View tenant orders with live status | Admin / Manager |
| `PATCH` | `/api/admin/orders/:id/status` | Update order progress | Admin / Manager |
| `PATCH` | `/api/admin/restaurant` | Update tenant profile & branding | Admin |
| `GET` | `/api/kitchen/orders` | Active kitchen order ticket queue | Kitchen / Admin |
| `PATCH` | `/api/kitchen/orders/:id/status` | Advance ticket status (preparing, ready, served) | Kitchen / Admin |
| `GET` | `/api/super-admin/restaurants` | Global tenant fleet list | Super Admin |
| `POST` | `/api/super-admin/restaurants` | Provision new tenant | Super Admin |
| `PATCH` | `/api/super-admin/restaurants/:id` | Tenant lifecycle management (suspend/activate) | Super Admin |
| `GET` | `/api/super-admin/metrics` | Platform MRR and multi-tenant telemetry | Super Admin |

---

## 7. Security & Business Rule Enforcement

1. **Server-Side Price Validation**:
   The frontend never provides trusted prices or totals. When `/api/public/orders` is called, the backend queries the database for each item ID, validates that the item belongs to the requested restaurant, re-checks current availability, sums up selected add-ons from verified database records, applies configured tax and service charges, and computes the tamper-proof final bill.

2. **Opaque QR Codes vs Table Numbers**:
   Tables are identified by randomized cryptographic tokens (e.g. `PZ-VELVET-T01-9F3A8C`). Plain, predictable table numbers (e.g., `1`, `2`) are never accepted as authorization credentials.

3. **Tenant Isolation**:
   Every protected API endpoint checks the user's authenticated `restaurant_id`. Cross-tenant requests (e.g., an admin from Restaurant A requesting data from Restaurant B) are blocked with HTTP `403 Forbidden`. Platform Super Admins have universal platform oversight.

4. **Role-Enforced Registration**:
   The public registration endpoint (`/api/auth/register`) only permits the controlled onboarding of new Restaurant Admin accounts and initial restaurants. Self-registration for kitchen staff is explicitly rejected (`403 Forbidden`), ensuring that kitchen personnel accounts can only be provisioned by authorized administrators.
