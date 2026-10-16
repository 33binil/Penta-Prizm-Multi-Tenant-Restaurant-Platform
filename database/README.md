# Penta Prizm Database Architecture & Migrations

This directory contains the database migration and seed definitions for the **Penta Prizm Multi-Tenant Restaurant SaaS Platform**, designed for Supabase PostgreSQL.

---

## Architecture Overview

- **Engine**: PostgreSQL 15+ (Hosted on Supabase)
- **Multi-Tenancy Model**: Shared-database, tenant-isolated via `restaurant_id` foreign keys and Row Level Security (RLS).
- **Authentication**: Supabase Auth (`auth.users`) linked to `staff_members` with RBAC (`super_admin`, `restaurant_admin`, `manager`, `kitchen_staff`).
- **Realtime**: Supabase Realtime replication on `orders` for live updates on KDS (Kitchen Display System) and customer order tracking.

---

## Directory Structure

```text
database/
├── migrations/
│   └── 001_initial_schema.sql    # Schema, foreign keys, constraints, indexes & RLS policies
├── seed/
│   └── seed_data.sql             # Plans, tenants, branches, tables, QR tokens & staff
└── README.md
```

---

## Applying Migrations to Supabase

### Option A: Supabase Dashboard (Recommended for quick setup)
1. Go to your Supabase Project at [https://supabase.com/dashboard](https://supabase.com/dashboard).
2. Open the **SQL Editor** from the left navigation.
3. Paste and run `migrations/001_initial_schema.sql`.
4. Paste and run `seed/seed_data.sql`.

### Option B: Supabase CLI
```bash
# Link your local project to your remote Supabase project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

---

## Row Level Security (RLS) Summary

| Table | Public Access | Authenticated Staff / Service Role |
| :--- | :--- | :--- |
| `restaurants` | `SELECT` where `status = 'active'` | Full access to own restaurant |
| `branches` | `SELECT` where `status = 'active'` | Full access to own restaurant branches |
| `restaurant_tables` | `SELECT` where `status = 'active'` | Full access to own restaurant tables |
| `qr_tokens` | Opaque lookup via backend API | Full management via Admin API |
| `menu_categories` | `SELECT` where `is_visible = TRUE` | Full CRUD for own restaurant |
| `menu_items` | `SELECT` where `is_available = TRUE`| Full CRUD for own restaurant |
| `orders` | Read by customer `tracking_token` | Admin/Kitchen read/write for own restaurant |
| `staff_members` | No public access | Tenant admin & super admin management |
| `audit_logs` | No public access | Append-only server logging |

---

## Supabase Storage Setup (Image Uploads)

Create a public Storage bucket named `restaurant-assets`:
1. Navigate to **Storage** > **New Bucket**.
2. Name: `restaurant-assets`.
3. Set bucket to **Public**.
4. Configure RLS Policy:
   - Allow `SELECT` for public (`anon`).
   - Allow `INSERT`/`UPDATE` for authenticated staff members.
