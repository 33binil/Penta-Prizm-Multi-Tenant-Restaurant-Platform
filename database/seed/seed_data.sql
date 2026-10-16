-- ============================================================================
-- PENTA PRIZM — MULTI-TENANT RESTAURANT SAAS PLATFORM
-- Database Seed Data: Plans, Tenants, Branches, Tables, QR Tokens, Menu, Staff
-- Target: PostgreSQL 15+ / Supabase PostgreSQL
-- ============================================================================

-- 1. Subscription Plans
INSERT INTO subscription_plans (id, name, code, tagline, price_monthly, max_branches, max_tables, max_staff, transaction_fee_percent, features)
VALUES
('plan_starter', 'Starter Café', 'starter', 'Ideal for independent coffee shops and single-location cafés', 49.00, 1, 20, 5, 1.50, '["Single location", "QR Table Ordering", "Kitchen Display System", "Daily Sales Reports", "Standard Support"]'::jsonb),
('plan_growth', 'Growth Restaurant', 'growth', 'Built for high-volume bistros and multi-station restaurants', 129.00, 3, 60, 20, 0.90, '["Up to 3 branches", "Custom Domain Support", "Advanced Staff Roles", "Real-time KDS Sound Alerts", "Exportable Accounting Reports", "Priority 24/7 Support"]'::jsonb),
('plan_enterprise', 'Enterprise Fleet', 'enterprise', 'Complete governance for restaurant groups and franchise networks', 299.00, 25, 500, 100, 0.40, '["Multi-branch franchise mesh", "Dedicated SLA", "White-label custom portal", "API Webhooks & POS Sync", "Custom Financial Auditing"]'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- 2. Restaurants (Tenants)
INSERT INTO restaurants (id, name, slug, subdomain, custom_domain, domain_verified, logo_url, brand_color, accent_color, currency, currency_symbol, tax_rate_percent, service_charge_percent, status, description, tagline, phone, email, address, opening_hours, hero_image_url, is_ordering_enabled, allowed_payment_methods, website_settings)
VALUES
('rest_velvet', 'Velvet Roast Café', 'velvet-roast', 'velvet-roast', 'www.velvetroastcafe.com', true, '☕', '#7c2d12', '#c2410c', 'USD', '$', 8.50, 5.00, 'active', 'Artisanal roastery and sourdough brunch kitchen dedicated to sustainable single-origin coffees and seasonal local fare.', 'Crafted Coffee & Farm-to-Table Brunch', '+1 (555) 234-5678', 'hello@velvetroastcafe.com', '742 Evergreen Promenade, Arts District, Portland, OR 97209', 'Daily: 7:00 AM – 6:00 PM', '/assets/images/hero_cafe_ambiance_1792076061364.jpg', true, '["counter", "table", "online"]'::jsonb, '{"hero_title": "Awaken Your Senses with Direct-Trade Coffee", "hero_subtitle": "Freshly roasted single-origin espresso and slow-fermented organic pastries crafted with patience and devotion.", "about_text": "Founded in 2019, Velvet Roast Café began with a single vintage roaster and a dream: to celebrate coffee farmers with unmatched transparency and care.", "chef_note": "Every weekend brunch plate is sourced within 50 miles from Willamette Valley regenerative growers."}'::jsonb),
('rest_saffron', 'Saffron & Sage Bistro', 'saffron-sage', 'saffron-sage', 'bistro.saffronandsage.com', true, '🌿', '#065f46', '#059669', 'USD', '$', 9.00, 4.00, 'active', 'Contemporary Mediterranean-Californian small plates and botanical cocktail bar overlooking the scenic marina waterfront.', 'Modern Mediterranean Small Plates & Botanical Bar', '+1 (555) 987-6543', 'reservations@saffronandsage.com', '12 Waterfront Esplanade, Suite 104, San Francisco, CA 94105', 'Tue–Sun: 11:30 AM – 11:00 PM (Closed Mon)', '/assets/images/food_truffle_pasta_1792076063325.jpg', true, '["counter", "table", "online"]'::jsonb, '{"hero_title": "Sun-Drenched Flavors of the Mediterranean Coast", "hero_subtitle": "Wood-fired hearth dishes, hand-rolled pastas, and cold-pressed olive oils shared family-style under olive trees.", "about_text": "Executive Chef Julian Thorne curates a seasonal tasting narrative spanning the Grecian isles, Sicilian coastline, and Coastal California.", "chef_note": "Our saffron is harvested by hand in Kozani and imported weekly for maximum floral vibrancy."}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- 3. Branches
INSERT INTO branches (id, restaurant_id, name, code, address, phone, opening_hours, status)
VALUES
('br_velvet_main', 'rest_velvet', 'Arts District Roastery (Flagship)', 'PDX-MAIN', '742 Evergreen Promenade, Portland, OR 97209', '+1 (555) 234-5678', '7:00 AM – 6:00 PM', 'active'),
('br_velvet_downtown', 'rest_velvet', 'Pioneer Square Espresso Bar', 'PDX-DT', '310 SW Yamhill St, Portland, OR 97204', '+1 (555) 234-5679', '6:30 AM – 4:00 PM', 'active'),
('br_saffron_marina', 'rest_saffron', 'Embarcadero Waterfront', 'SFO-MB', '12 Waterfront Esplanade, San Francisco, CA 94105', '+1 (555) 987-6543', '11:30 AM – 11:00 PM', 'active')
ON CONFLICT (id) DO NOTHING;

-- 4. Restaurant Tables
INSERT INTO restaurant_tables (id, restaurant_id, branch_id, table_number, label, capacity, location_area, status)
VALUES
('tbl_vr_01', 'rest_velvet', 'br_velvet_main', '01', 'Table 01 — Window Nook', 2, 'indoor', 'active'),
('tbl_vr_02', 'rest_velvet', 'br_velvet_main', '02', 'Table 02 — Main Atrium', 4, 'indoor', 'active'),
('tbl_vr_03', 'rest_velvet', 'br_velvet_main', '03', 'Table 03 — Sunny Terrace', 4, 'patio', 'active'),
('tbl_vr_04', 'rest_velvet', 'br_velvet_main', '04', 'Table 04 — Bar Counter', 1, 'bar', 'active'),
('tbl_vr_05', 'rest_velvet', 'br_velvet_main', '05', 'Table 05 — Garden Courtyard', 6, 'patio', 'active'),
('tbl_ss_01', 'rest_saffron', 'br_saffron_marina', '101', 'Table 101 — Harbor View', 4, 'terrace', 'active'),
('tbl_ss_02', 'rest_saffron', 'br_saffron_marina', '102', 'Table 102 — Hearth Booth', 6, 'indoor', 'active')
ON CONFLICT (id) DO NOTHING;

-- 5. Secure QR Tokens (Cryptographic Opaque Tokens)
INSERT INTO qr_tokens (id, restaurant_id, branch_id, table_id, token_opaque, token_hash, status, scan_count)
VALUES
('qr_vr_01', 'rest_velvet', 'br_velvet_main', 'tbl_vr_01', 'PZ-VELVET-T01-9F3A8C', 'sha256_hash_vr01', 'active', 42),
('qr_vr_02', 'rest_velvet', 'br_velvet_main', 'tbl_vr_02', 'PZ-VELVET-T02-4D7B1E', 'sha256_hash_vr02', 'active', 89),
('qr_vr_03', 'rest_velvet', 'br_velvet_main', 'tbl_vr_03', 'PZ-VELVET-T03-8E2C5A', 'sha256_hash_vr03', 'active', 64),
('qr_vr_04', 'rest_velvet', 'br_velvet_main', 'tbl_vr_04', 'PZ-VELVET-T04-1C9F4B', 'sha256_hash_vr04', 'active', 19),
('qr_vr_05', 'rest_velvet', 'br_velvet_main', 'tbl_vr_05', 'PZ-VELVET-T05-7B3E6D', 'sha256_hash_vr05', 'active', 55),
('qr_ss_01', 'rest_saffron', 'br_saffron_marina', 'tbl_ss_01', 'PZ-SAFFRON-T101-3A5D9F', 'sha256_hash_ss01', 'active', 112),
('qr_ss_02', 'rest_saffron', 'br_saffron_marina', 'tbl_ss_02', 'PZ-SAFFRON-T102-6B8E2C', 'sha256_hash_ss02', 'active', 97)
ON CONFLICT (id) DO NOTHING;

-- 6. Menu Categories
INSERT INTO menu_categories (id, restaurant_id, name, description, sort_order, is_visible)
VALUES
('cat_vr_coffee', 'rest_velvet', 'Specialty Espresso & Brews', 'Single-origin beans roasted on-site with notes of bergamot, dark chocolate, and candied pecan.', 1, true),
('cat_vr_brunch', 'rest_velvet', 'Artisan Brunch & Bowls', 'Scratch-baked sourdough, pasture-raised poached eggs, and seasonal farm produce.', 2, true),
('cat_vr_bakery', 'rest_velvet', 'Pastry & Dessert Studio', 'Laminated morning viennoiserie, Basque tarts, and seasonal wild berry creations.', 3, true),
('cat_ss_tapas', 'rest_saffron', 'Mediterranean Crudo & Tapas', 'Cold-pressed Sicilian oils, Spanish cured delicacies, and wild catch crudo.', 1, true),
('cat_ss_mains', 'rest_saffron', 'Wood-Fired Hearth & Pastas', 'Extruded daily bronze-die pastas and charred embers from the olive wood hearth.', 2, true)
ON CONFLICT (id) DO NOTHING;

-- 7. Staff Members
INSERT INTO staff_members (id, restaurant_id, name, email, role, branch_ids, is_active)
VALUES
('usr_superadmin', NULL, 'Penta Prizm Platform Owner', 'admin@pentaprizm.app', 'super_admin', '[]'::jsonb, true),
('usr_elena', 'rest_velvet', 'Elena Rostova', 'elena@velvetroastcafe.com', 'restaurant_admin', '["br_velvet_main", "br_velvet_downtown"]'::jsonb, true),
('usr_marco', 'rest_velvet', 'Marco Silva', 'marco@velvetroastcafe.com', 'manager', '["br_velvet_main"]'::jsonb, true),
('usr_aria', 'rest_velvet', 'Aria Chen', 'aria@velvetroastcafe.com', 'kitchen_staff', '["br_velvet_main"]'::jsonb, true),
('usr_julian', 'rest_saffron', 'Julian Thorne', 'julian@saffronandsage.com', 'restaurant_admin', '["br_saffron_marina"]'::jsonb, true),
('usr_dante', 'rest_saffron', 'Dante Rossi', 'dante@saffronandsage.com', 'kitchen_staff', '["br_saffron_marina"]'::jsonb, true)
ON CONFLICT (id) DO NOTHING;
