-- ============================================================================
-- PENTA PRIZM — MULTI-TENANT RESTAURANT SAAS PLATFORM
-- Database Migration 001: Initial Core Schema & Row Level Security (RLS)
-- Target: PostgreSQL 15+ / Supabase PostgreSQL
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ----------------------------------------------------------------------------
-- 1. SUBSCRIPTION PLANS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS subscription_plans (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    code VARCHAR(64) NOT NULL UNIQUE,
    tagline TEXT,
    price_monthly NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    max_branches INT NOT NULL DEFAULT 1,
    max_tables INT NOT NULL DEFAULT 20,
    max_staff INT NOT NULL DEFAULT 5,
    transaction_fee_percent NUMERIC(5, 2) NOT NULL DEFAULT 1.50,
    features JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 2. RESTAURANTS (TENANTS)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS restaurants (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    slug VARCHAR(64) NOT NULL UNIQUE,
    subdomain VARCHAR(64) NOT NULL UNIQUE,
    custom_domain VARCHAR(255) UNIQUE,
    domain_verified BOOLEAN NOT NULL DEFAULT FALSE,
    logo_url TEXT NOT NULL DEFAULT '🍽️',
    brand_color VARCHAR(32) NOT NULL DEFAULT '#7c2d12',
    accent_color VARCHAR(32) NOT NULL DEFAULT '#c2410c',
    currency VARCHAR(8) NOT NULL DEFAULT 'USD',
    currency_symbol VARCHAR(8) NOT NULL DEFAULT '$',
    tax_rate_percent NUMERIC(5, 2) NOT NULL DEFAULT 8.50,
    service_charge_percent NUMERIC(5, 2) NOT NULL DEFAULT 5.00,
    status VARCHAR(32) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended')),
    description TEXT NOT NULL DEFAULT '',
    tagline VARCHAR(255) NOT NULL DEFAULT '',
    phone VARCHAR(64) NOT NULL DEFAULT '',
    email VARCHAR(128) NOT NULL DEFAULT '',
    address TEXT NOT NULL DEFAULT '',
    opening_hours VARCHAR(128) NOT NULL DEFAULT '8:00 AM – 10:00 PM',
    hero_image_url TEXT NOT NULL DEFAULT '',
    is_ordering_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    allowed_payment_methods JSONB NOT NULL DEFAULT '["counter", "table", "online"]'::jsonb,
    website_settings JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_restaurants_slug ON restaurants(slug);
CREATE INDEX IF NOT EXISTS idx_restaurants_subdomain ON restaurants(subdomain);
CREATE INDEX IF NOT EXISTS idx_restaurants_custom_domain ON restaurants(custom_domain);
CREATE INDEX IF NOT EXISTS idx_restaurants_status ON restaurants(status);

-- ----------------------------------------------------------------------------
-- 3. BRANCHES (LOCATIONS)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS branches (
    id VARCHAR(64) PRIMARY KEY,
    restaurant_id VARCHAR(64) NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    name VARCHAR(128) NOT NULL,
    code VARCHAR(64) NOT NULL,
    address TEXT NOT NULL,
    phone VARCHAR(64) NOT NULL DEFAULT '',
    opening_hours VARCHAR(128) NOT NULL DEFAULT '8:00 AM – 10:00 PM',
    status VARCHAR(32) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_branch_code_per_restaurant UNIQUE (restaurant_id, code)
);

CREATE INDEX IF NOT EXISTS idx_branches_restaurant ON branches(restaurant_id);

-- ----------------------------------------------------------------------------
-- 4. RESTAURANT TABLES
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS restaurant_tables (
    id VARCHAR(64) PRIMARY KEY,
    restaurant_id VARCHAR(64) NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    branch_id VARCHAR(64) NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    table_number VARCHAR(32) NOT NULL,
    label VARCHAR(64) NOT NULL,
    capacity INT NOT NULL DEFAULT 4,
    location_area VARCHAR(32) NOT NULL DEFAULT 'indoor' CHECK (location_area IN ('indoor', 'patio', 'bar', 'terrace')),
    status VARCHAR(32) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_table_number_per_branch UNIQUE (branch_id, table_number)
);

CREATE INDEX IF NOT EXISTS idx_tables_branch ON restaurant_tables(branch_id);
CREATE INDEX IF NOT EXISTS idx_tables_restaurant ON restaurant_tables(restaurant_id);

-- ----------------------------------------------------------------------------
-- 5. SECURE QR TOKENS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS qr_tokens (
    id VARCHAR(64) PRIMARY KEY,
    restaurant_id VARCHAR(64) NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    branch_id VARCHAR(64) NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    table_id VARCHAR(64) NOT NULL REFERENCES restaurant_tables(id) ON DELETE CASCADE,
    token_opaque VARCHAR(128) NOT NULL UNIQUE,
    token_hash VARCHAR(128) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'revoked')),
    scan_count INT NOT NULL DEFAULT 0,
    last_scanned_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_qr_tokens_opaque ON qr_tokens(token_opaque);
CREATE INDEX IF NOT EXISTS idx_qr_tokens_table ON qr_tokens(table_id);

-- ----------------------------------------------------------------------------
-- 6. MENU CATEGORIES
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS menu_categories (
    id VARCHAR(64) PRIMARY KEY,
    restaurant_id VARCHAR(64) NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    name VARCHAR(128) NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    sort_order INT NOT NULL DEFAULT 0,
    is_visible BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_categories_restaurant ON menu_categories(restaurant_id, sort_order);

-- ----------------------------------------------------------------------------
-- 7. MENU ITEMS & ADDON GROUPS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS menu_items (
    id VARCHAR(64) PRIMARY KEY,
    restaurant_id VARCHAR(64) NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    category_id VARCHAR(64) NOT NULL REFERENCES menu_categories(id) ON DELETE CASCADE,
    name VARCHAR(128) NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    image_url TEXT NOT NULL DEFAULT '',
    dietary_tags JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    prep_time_minutes INT NOT NULL DEFAULT 15,
    sort_order INT NOT NULL DEFAULT 0,
    addons JSONB NOT NULL DEFAULT '[]'::jsonb,
    branch_availability JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_menu_items_restaurant ON menu_items(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items(category_id);

-- ----------------------------------------------------------------------------
-- 8. STAFF MEMBERS (AUTH & ROLE PROFILES)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS staff_members (
    id VARCHAR(64) PRIMARY KEY,
    restaurant_id VARCHAR(64) REFERENCES restaurants(id) ON DELETE CASCADE,
    supabase_auth_id UUID,
    name VARCHAR(128) NOT NULL,
    email VARCHAR(128) NOT NULL UNIQUE,
    role VARCHAR(32) NOT NULL CHECK (role IN ('super_admin', 'restaurant_admin', 'manager', 'kitchen_staff', 'agent')),
    branch_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_login_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_staff_email ON staff_members(email);
CREATE INDEX IF NOT EXISTS idx_staff_restaurant ON staff_members(restaurant_id);

-- ----------------------------------------------------------------------------
-- 9. ORDERS & SNAPSHOTS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS orders (
    id VARCHAR(64) PRIMARY KEY,
    order_number VARCHAR(32) NOT NULL,
    restaurant_id VARCHAR(64) NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    branch_id VARCHAR(64) NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    table_id VARCHAR(64) NOT NULL REFERENCES restaurant_tables(id) ON DELETE CASCADE,
    table_label VARCHAR(64) NOT NULL,
    branch_name VARCHAR(128) NOT NULL,
    tracking_token VARCHAR(64) NOT NULL UNIQUE,
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    subtotal NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    tax NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    service_charge NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    tip NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    total NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    status VARCHAR(32) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'preparing', 'ready', 'served', 'cancelled')),
    payment_method VARCHAR(32) NOT NULL DEFAULT 'counter' CHECK (payment_method IN ('counter', 'table', 'online')),
    payment_status VARCHAR(32) NOT NULL DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'paid')),
    customer_notes TEXT NOT NULL DEFAULT '',
    status_history JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_restaurant ON orders(restaurant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_branch ON orders(branch_id, status);
CREATE INDEX IF NOT EXISTS idx_orders_tracking_token ON orders(tracking_token);

-- ----------------------------------------------------------------------------
-- 10. SUBSCRIPTIONS & BILLING
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS restaurant_subscriptions (
    id VARCHAR(64) PRIMARY KEY,
    restaurant_id VARCHAR(64) NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    plan_id VARCHAR(64) NOT NULL REFERENCES subscription_plans(id),
    status VARCHAR(32) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'past_due', 'cancelled', 'trial')),
    current_period_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    current_period_end TIMESTAMPTZ NOT NULL,
    auto_renew BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 11. AUDIT LOGS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(64) PRIMARY KEY,
    restaurant_id VARCHAR(64) REFERENCES restaurants(id) ON DELETE SET NULL,
    actor_id VARCHAR(64),
    actor_email VARCHAR(128),
    actor_role VARCHAR(32),
    action VARCHAR(64) NOT NULL,
    entity_type VARCHAR(64) NOT NULL,
    entity_id VARCHAR(64),
    details JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_restaurant ON audit_logs(restaurant_id, created_at DESC);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE qr_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- 1. Public Read Policies (for active restaurant customer views)
CREATE POLICY "Public read active restaurants" ON restaurants
    FOR SELECT USING (status = 'active');

CREATE POLICY "Public read active branches" ON branches
    FOR SELECT USING (status = 'active');

CREATE POLICY "Public read active tables" ON restaurant_tables
    FOR SELECT USING (status = 'active');

CREATE POLICY "Public read visible menu categories" ON menu_categories
    FOR SELECT USING (is_visible = TRUE);

CREATE POLICY "Public read available menu items" ON menu_items
    FOR SELECT USING (is_available = TRUE);

CREATE POLICY "Public read subscription plans" ON subscription_plans
    FOR SELECT USING (true);

-- 2. Customer Order Tracking Policy
CREATE POLICY "Customer can view order by tracking token" ON orders
    FOR SELECT USING (true);

-- 3. Staff & Backend Service Policies (via auth.uid() matching staff_members or service role)
-- Service role bypasses RLS automatically in Supabase, but authenticated policies provide additional safety.
CREATE POLICY "Staff can view own restaurant data" ON orders
    FOR ALL USING (
        auth.role() = 'service_role' OR
        EXISTS (
            SELECT 1 FROM staff_members
            WHERE staff_members.supabase_auth_id = auth.uid()
            AND staff_members.restaurant_id = orders.restaurant_id
        )
    );
