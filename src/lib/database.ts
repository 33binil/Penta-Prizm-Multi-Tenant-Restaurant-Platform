import {
  Restaurant,
  Branch,
  RestaurantTable,
  QRToken,
  ValidatedQRSession,
  MenuCategory,
  MenuItem,
  Order,
  OrderItemSnapshot,
  CartItem,
  StaffMember,
  SubscriptionPlan,
  RestaurantSubscription,
  AuditLog,
  OrderStatus,
  PaymentMethod
} from '../types';

// High-fidelity image assets generated for the platform
import heroCafeAmbiance from '../assets/images/hero_cafe_ambiance_1792076061364.jpg';
import foodArtisanBrunch from '../assets/images/food_artisan_brunch_1792076061615.jpg';
import foodTrufflePasta from '../assets/images/food_truffle_pasta_1792076063325.jpg';
import foodBerryCheesecake from '../assets/images/food_berry_cheesecake_1792076061677.jpg';

const STORAGE_KEY = 'pentaprizm_db_v1';

export interface DatabaseState {
  restaurants: Restaurant[];
  branches: Branch[];
  tables: RestaurantTable[];
  qrTokens: QRToken[];
  categories: MenuCategory[];
  menuItems: MenuItem[];
  orders: Order[];
  staff: StaffMember[];
  plans: SubscriptionPlan[];
  subscriptions: RestaurantSubscription[];
  auditLogs: AuditLog[];
}

// Initial Seed Data
const INITIAL_PLANS: SubscriptionPlan[] = [
  {
    id: 'plan_starter',
    name: 'Starter Café',
    code: 'starter',
    tagline: 'Ideal for independent coffee shops and single-location cafés',
    price_monthly: 49,
    max_branches: 1,
    max_tables: 20,
    max_staff: 5,
    transaction_fee_percent: 1.5,
    features: ['Single location', 'QR Table Ordering', 'Kitchen Display System', 'Daily Sales Reports', 'Standard Support']
  },
  {
    id: 'plan_growth',
    name: 'Growth Restaurant',
    code: 'growth',
    tagline: 'Built for high-volume bistros and multi-station restaurants',
    price_monthly: 129,
    max_branches: 3,
    max_tables: 60,
    max_staff: 20,
    transaction_fee_percent: 0.9,
    features: ['Up to 3 branches', 'Custom Domain Support', 'Advanced Staff Roles', 'Real-time KDS Sound Alerts', 'Exportable Accounting Reports', 'Priority 24/7 Support']
  },
  {
    id: 'plan_enterprise',
    name: 'Enterprise Fleet',
    code: 'enterprise',
    tagline: 'Complete governance for restaurant groups and franchise networks',
    price_monthly: 299,
    max_branches: 25,
    max_tables: 500,
    max_staff: 100,
    transaction_fee_percent: 0.4,
    features: ['Multi-branch franchise mesh', 'Dedicated SLA', 'White-label custom portal', 'API Webhooks & POS Sync', 'Custom Financial Auditing']
  }
];

const INITIAL_RESTAURANTS: Restaurant[] = [
  {
    id: 'rest_velvet',
    name: 'Velvet Roast Café',
    slug: 'velvet-roast',
    subdomain: 'velvet-roast',
    custom_domain: 'www.velvetroastcafe.com',
    domain_verified: true,
    logo_url: '☕',
    brand_color: '#7c2d12',
    accent_color: '#c2410c',
    currency: 'USD',
    currency_symbol: '$',
    tax_rate_percent: 8.5,
    service_charge_percent: 5.0,
    status: 'active',
    description: 'Artisanal roastery and sourdough brunch kitchen dedicated to sustainable single-origin coffees and seasonal local fare.',
    tagline: 'Crafted Coffee & Farm-to-Table Brunch',
    phone: '+1 (555) 234-5678',
    email: 'hello@velvetroastcafe.com',
    address: '142 Artisan Row, Downtown Quarter',
    opening_hours: 'Mon – Sun: 7:00 AM – 8:00 PM',
    hero_image_url: heroCafeAmbiance,
    is_ordering_enabled: true,
    allowed_payment_methods: ['counter', 'table'],
    website_settings: {
      hero_title: 'Savor Every Drop. Nourish Every Moment.',
      hero_subtitle: 'Artisan single-origin brews, house-baked sourdough pastries, and chef-curated morning delicacies.',
      about_text: 'Velvet Roast Café began with a single vintage roaster and a passion for slow extraction. Today, we source directly from organic cooperatives and hand-bake every brioche and sourdough loaf at dawn.',
      chef_note: 'Our signature avocado brioche tartine pairs impeccably with a double shot of Ethiopian Guji honey-processed espresso.',
      social_instagram: '@velvetroast',
      social_facebook: 'velvetroastcafe'
    },
    created_at: '2026-01-10T08:00:00Z',
    updated_at: '2026-03-15T10:30:00Z'
  },
  {
    id: 'rest_saffron',
    name: 'Saffron & Sage Bistro',
    slug: 'saffron-sage',
    subdomain: 'saffron-sage',
    custom_domain: 'bistro.saffronandsage.com',
    domain_verified: true,
    logo_url: '🌿',
    brand_color: '#065f46',
    accent_color: '#059669',
    currency: 'USD',
    currency_symbol: '$',
    tax_rate_percent: 9.0,
    service_charge_percent: 7.5,
    status: 'active',
    description: 'Contemporary Mediterranean culinary workshop focusing on handmade pasta, coastal seafood, and botanical pairings.',
    tagline: 'Modern Mediterranean & Natural Vines',
    phone: '+1 (555) 987-6543',
    email: 'bonjour@saffronandsage.com',
    address: '77 Marina Boulevard, Harbor Promenade',
    opening_hours: 'Tue – Sun: 11:30 AM – 10:30 PM',
    hero_image_url: foodTrufflePasta,
    is_ordering_enabled: true,
    allowed_payment_methods: ['counter', 'table', 'online'],
    website_settings: {
      hero_title: 'Coastal Sun, Rare Spices & Handcrafted Pasta.',
      hero_subtitle: 'Mediterranean culinary craftsmanship inspired by the sunlit coasts of Sicily and Provence.',
      about_text: 'Saffron & Sage brings heritage recipes to life with contemporary wood-fired finesse and hand-rolled pasta produced daily in our open kitchen.',
      chef_note: 'Try the hand-shaved black truffle tagliatelle with our house cultured butter and pecorino romano.',
      social_instagram: '@saffronsagebistro'
    },
    created_at: '2026-02-01T09:00:00Z',
    updated_at: '2026-03-20T14:15:00Z'
  }
];

const INITIAL_BRANCHES: Branch[] = [
  {
    id: 'br_velvet_downtown',
    restaurant_id: 'rest_velvet',
    name: 'Downtown Flagship',
    code: 'VR-DT',
    address: '142 Artisan Row, Downtown Quarter',
    phone: '+1 (555) 234-5678',
    opening_hours: 'Mon – Sun: 7:00 AM – 8:00 PM',
    status: 'active',
    created_at: '2026-01-10T08:00:00Z'
  },
  {
    id: 'br_velvet_uptown',
    restaurant_id: 'rest_velvet',
    name: 'Uptown Roastery & Garden',
    code: 'VR-UP',
    address: '88 Elm Street, Uptown Garden District',
    phone: '+1 (555) 234-5679',
    opening_hours: 'Tue – Sun: 8:00 AM – 6:00 PM',
    status: 'active',
    created_at: '2026-02-12T08:00:00Z'
  },
  {
    id: 'br_saffron_harbor',
    restaurant_id: 'rest_saffron',
    name: 'Harbor Promenade Main',
    code: 'SS-HP',
    address: '77 Marina Boulevard, Harbor Promenade',
    phone: '+1 (555) 987-6543',
    opening_hours: 'Tue – Sun: 11:30 AM – 10:30 PM',
    status: 'active',
    created_at: '2026-02-01T09:00:00Z'
  }
];

const INITIAL_TABLES: RestaurantTable[] = [
  // Velvet Downtown tables
  { id: 'tbl_vr_01', restaurant_id: 'rest_velvet', branch_id: 'br_velvet_downtown', table_number: '1', label: 'Table 1 (Window)', capacity: 2, location_area: 'indoor', status: 'active', created_at: '2026-01-10T08:00:00Z' },
  { id: 'tbl_vr_02', restaurant_id: 'rest_velvet', branch_id: 'br_velvet_downtown', table_number: '2', label: 'Table 2 (Window)', capacity: 2, location_area: 'indoor', status: 'active', created_at: '2026-01-10T08:00:00Z' },
  { id: 'tbl_vr_03', restaurant_id: 'rest_velvet', branch_id: 'br_velvet_downtown', table_number: '3', label: 'Table 3 (Banquette)', capacity: 4, location_area: 'indoor', status: 'active', created_at: '2026-01-10T08:00:00Z' },
  { id: 'tbl_vr_04', restaurant_id: 'rest_velvet', branch_id: 'br_velvet_downtown', table_number: '4', label: 'Table 4 (Center)', capacity: 4, location_area: 'indoor', status: 'active', created_at: '2026-01-10T08:00:00Z' },
  { id: 'tbl_vr_05', restaurant_id: 'rest_velvet', branch_id: 'br_velvet_downtown', table_number: '5', label: 'Table 5 (Patio Deck)', capacity: 4, location_area: 'patio', status: 'active', created_at: '2026-01-10T08:00:00Z' },
  { id: 'tbl_vr_06', restaurant_id: 'rest_velvet', branch_id: 'br_velvet_downtown', table_number: '6', label: 'Table 6 (Patio Garden)', capacity: 6, location_area: 'patio', status: 'active', created_at: '2026-01-10T08:00:00Z' },

  // Velvet Uptown tables
  { id: 'tbl_vr_u1', restaurant_id: 'rest_velvet', branch_id: 'br_velvet_uptown', table_number: '101', label: 'Garden Table 101', capacity: 4, location_area: 'terrace', status: 'active', created_at: '2026-02-12T08:00:00Z' },
  { id: 'tbl_vr_u2', restaurant_id: 'rest_velvet', branch_id: 'br_velvet_uptown', table_number: '102', label: 'Garden Table 102', capacity: 4, location_area: 'terrace', status: 'active', created_at: '2026-02-12T08:00:00Z' },

  // Saffron Harbor tables
  { id: 'tbl_ss_01', restaurant_id: 'rest_saffron', branch_id: 'br_saffron_harbor', table_number: '1', label: 'Harbor Table 1', capacity: 2, location_area: 'terrace', status: 'active', created_at: '2026-02-01T09:00:00Z' },
  { id: 'tbl_ss_02', restaurant_id: 'rest_saffron', branch_id: 'br_saffron_harbor', table_number: '2', label: 'Harbor Table 2', capacity: 4, location_area: 'terrace', status: 'active', created_at: '2026-02-01T09:00:00Z' },
  { id: 'tbl_ss_03', restaurant_id: 'rest_saffron', branch_id: 'br_saffron_harbor', table_number: '3', label: 'Dining Salon 3', capacity: 4, location_area: 'indoor', status: 'active', created_at: '2026-02-01T09:00:00Z' },
  { id: 'tbl_ss_04', restaurant_id: 'rest_saffron', branch_id: 'br_saffron_harbor', table_number: '4', label: 'Chef Booth 4', capacity: 6, location_area: 'indoor', status: 'active', created_at: '2026-02-01T09:00:00Z' }
];

// Cryptographically unguessable QR Tokens
const INITIAL_QR_TOKENS: QRToken[] = [
  { id: 'qr_vr_01', restaurant_id: 'rest_velvet', branch_id: 'br_velvet_downtown', table_id: 'tbl_vr_01', token_opaque: 'pzp_live_9a7f3e82c1b4d5e6a7c8b9d0', token_hash: 'h_vr01_9923', status: 'active', scan_count: 34, last_scanned_at: '2026-10-15T07:12:00Z', created_at: '2026-01-10T08:00:00Z' },
  { id: 'qr_vr_02', restaurant_id: 'rest_velvet', branch_id: 'br_velvet_downtown', table_id: 'tbl_vr_02', token_opaque: 'pzp_live_b2c4d6f8e0a1c3e5f7a9b1c3', token_hash: 'h_vr02_7482', status: 'active', scan_count: 28, last_scanned_at: '2026-10-15T06:45:00Z', created_at: '2026-01-10T08:00:00Z' },
  { id: 'qr_vr_03', restaurant_id: 'rest_velvet', branch_id: 'br_velvet_downtown', table_id: 'tbl_vr_03', token_opaque: 'pzp_live_f1e3d5c7b9a0f2e4d6c8b0a2', token_hash: 'h_vr03_3145', status: 'active', scan_count: 45, last_scanned_at: '2026-10-15T07:30:00Z', created_at: '2026-01-10T08:00:00Z' },
  { id: 'qr_vr_04', restaurant_id: 'rest_velvet', branch_id: 'br_velvet_downtown', table_id: 'tbl_vr_04', token_opaque: 'pzp_live_a3c5e7f9b1d2e4f6a8c0d2e4', token_hash: 'h_vr04_1829', status: 'active', scan_count: 19, last_scanned_at: '2026-10-14T19:20:00Z', created_at: '2026-01-10T08:00:00Z' },
  { id: 'qr_vr_05', restaurant_id: 'rest_velvet', branch_id: 'br_velvet_downtown', table_id: 'tbl_vr_05', token_opaque: 'pzp_live_e5f7a9c1d3e5f7a9b1c3d5e7', token_hash: 'h_vr05_4481', status: 'active', scan_count: 51, last_scanned_at: '2026-10-15T07:40:00Z', created_at: '2026-01-10T08:00:00Z' },
  { id: 'qr_vr_06', restaurant_id: 'rest_velvet', branch_id: 'br_velvet_downtown', table_id: 'tbl_vr_06', token_opaque: 'pzp_live_c7e9f1a3b5c7d9e1f3a5b7c9', token_hash: 'h_vr06_8832', status: 'active', scan_count: 12, last_scanned_at: '2026-10-14T18:15:00Z', created_at: '2026-01-10T08:00:00Z' },

  // Uptown
  { id: 'qr_vr_u1', restaurant_id: 'rest_velvet', branch_id: 'br_velvet_uptown', table_id: 'tbl_vr_u1', token_opaque: 'pzp_live_d8b0c2e4f6a8b0c2d4e6f8a0', token_hash: 'h_vru1_1120', status: 'active', scan_count: 15, last_scanned_at: '2026-10-14T15:20:00Z', created_at: '2026-02-12T08:00:00Z' },
  { id: 'qr_vr_u2', restaurant_id: 'rest_velvet', branch_id: 'br_velvet_uptown', table_id: 'tbl_vr_u2', token_opaque: 'pzp_live_1a2b3c4d5e6f7a8b9c0d1e2f', token_hash: 'h_vru2_9941', status: 'active', scan_count: 8, last_scanned_at: '2026-10-13T12:00:00Z', created_at: '2026-02-12T08:00:00Z' },

  // Saffron
  { id: 'qr_ss_01', restaurant_id: 'rest_saffron', branch_id: 'br_saffron_harbor', table_id: 'tbl_ss_01', token_opaque: 'pzp_live_8f7e6d5c4b3a2f1e0d9c8b7a', token_hash: 'h_ss01_5532', status: 'active', scan_count: 62, last_scanned_at: '2026-10-15T06:50:00Z', created_at: '2026-02-01T09:00:00Z' },
  { id: 'qr_ss_02', restaurant_id: 'rest_saffron', branch_id: 'br_saffron_harbor', table_id: 'tbl_ss_02', token_opaque: 'pzp_live_6c5b4a3f2e1d0c9b8a7f6e5d', token_hash: 'h_ss02_6671', status: 'active', scan_count: 48, last_scanned_at: '2026-10-15T07:10:00Z', created_at: '2026-02-01T09:00:00Z' },
  { id: 'qr_ss_03', restaurant_id: 'rest_saffron', branch_id: 'br_saffron_harbor', table_id: 'tbl_ss_03', token_opaque: 'pzp_live_4b3a2f1e0d9c8b7a6f5e4d3c', token_hash: 'h_ss03_7789', status: 'active', scan_count: 31, last_scanned_at: '2026-10-14T21:00:00Z', created_at: '2026-02-01T09:00:00Z' },
  { id: 'qr_ss_04', restaurant_id: 'rest_saffron', branch_id: 'br_saffron_harbor', table_id: 'tbl_ss_04', token_opaque: 'pzp_live_2e1d0c9b8a7f6e5d4c3b2a1f', token_hash: 'h_ss04_8812', status: 'active', scan_count: 18, last_scanned_at: '2026-10-14T20:45:00Z', created_at: '2026-02-01T09:00:00Z' }
];

const INITIAL_CATEGORIES: MenuCategory[] = [
  // Velvet Roast categories
  { id: 'cat_vr_coffee', restaurant_id: 'rest_velvet', name: 'Specialty Brews & Espresso', description: 'Single-origin microlots roasted in-house weekly', sort_order: 1, is_visible: true, created_at: '2026-01-10T08:00:00Z' },
  { id: 'cat_vr_brunch', restaurant_id: 'rest_velvet', name: 'Artisan Toast & Morning Plates', description: 'Freshly baked sourdough and organic farm eggs', sort_order: 2, is_visible: true, created_at: '2026-01-10T08:00:00Z' },
  { id: 'cat_vr_bakery', restaurant_id: 'rest_velvet', name: 'Pastries & Desserts', description: 'French viennoiserie and rustic tarts made daily at 5 AM', sort_order: 3, is_visible: true, created_at: '2026-01-10T08:00:00Z' },
  { id: 'cat_vr_beverages', restaurant_id: 'rest_velvet', name: 'Botanicals & Cold Refreshers', description: 'House kombucha, iced matcha and herbal tisanes', sort_order: 4, is_visible: true, created_at: '2026-01-10T08:00:00Z' },

  // Saffron Bistro categories
  { id: 'cat_ss_starters', restaurant_id: 'rest_saffron', name: 'Mezze & Antipasti', description: 'Crushed olives, wood-fired focaccia and artisan cheeses', sort_order: 1, is_visible: true, created_at: '2026-02-01T09:00:00Z' },
  { id: 'cat_ss_pasta', restaurant_id: 'rest_saffron', name: 'Handmade Pasta & Risotto', description: 'Extruded and hand-rolled pasta with seasonal truffles', sort_order: 2, is_visible: true, created_at: '2026-02-01T09:00:00Z' },
  { id: 'cat_ss_desserts', restaurant_id: 'rest_saffron', name: 'Dolci & Sweets', description: 'Basque burnt cakes and Sicilian pistachio gelatos', sort_order: 3, is_visible: true, created_at: '2026-02-01T09:00:00Z' }
];

const INITIAL_MENU_ITEMS: MenuItem[] = [
  // Velvet Roast Items
  {
    id: 'item_vr_avo',
    restaurant_id: 'rest_velvet',
    category_id: 'cat_vr_brunch',
    name: 'Avocado Tartine with Poached Farm Egg',
    description: 'Chunky Hass avocado, soft poached pasture-raised egg, Aleppo chili flakes, toasted seeds and herb oil on sourdough brioche.',
    price: 16.50,
    image_url: foodArtisanBrunch,
    dietary_tags: ['vegetarian', 'chef_special'],
    is_available: true,
    prep_time_minutes: 12,
    sort_order: 1,
    addons: [
      {
        id: 'ad_egg',
        name: 'Egg Preparation',
        required: false,
        min_selection: 0,
        max_selection: 1,
        options: [
          { id: 'opt_soft_poached', name: 'Extra Soft Poached Egg', price: 2.50 },
          { id: 'opt_scrambled', name: 'Substitute Scrambled Eggs', price: 1.00 }
        ]
      },
      {
        id: 'ad_sides',
        name: 'Gourmet Sides',
        required: false,
        min_selection: 0,
        max_selection: 2,
        options: [
          { id: 'opt_smoked_salmon', name: 'House Smoked Salmon (70g)', price: 5.50 },
          { id: 'opt_crispy_bacon', name: 'Applewood Smoked Bacon', price: 4.00 },
          { id: 'opt_mushrooms', name: 'Thyme Garlic Wild Mushrooms', price: 3.50 }
        ]
      }
    ],
    created_at: '2026-01-10T08:00:00Z',
    updated_at: '2026-03-01T10:00:00Z'
  },
  {
    id: 'item_vr_latte',
    restaurant_id: 'rest_velvet',
    category_id: 'cat_vr_coffee',
    name: 'Artisan Velvet Flat White / Latte',
    description: 'Double ristretto espresso pulled from our signature Guji single-origin roast, textured with silky micro-foam.',
    price: 5.75,
    image_url: foodArtisanBrunch,
    dietary_tags: ['vegetarian'],
    is_available: true,
    prep_time_minutes: 5,
    sort_order: 1,
    addons: [
      {
        id: 'ad_milk',
        name: 'Milk Choice',
        required: true,
        min_selection: 1,
        max_selection: 1,
        options: [
          { id: 'opt_whole_milk', name: 'Organic Whole Milk', price: 0.00 },
          { id: 'opt_oat_milk', name: 'Barista Oat Milk', price: 0.85 },
          { id: 'opt_almond_milk', name: 'House Almond Milk', price: 0.85 }
        ]
      },
      {
        id: 'ad_coffee_boost',
        name: 'Custom Roast Profile',
        required: false,
        min_selection: 0,
        max_selection: 1,
        options: [
          { id: 'opt_extra_shot', name: 'Extra Double Shot', price: 1.25 },
          { id: 'opt_vanilla_syrup', name: 'Bourbon Vanilla Bean Syrup', price: 0.75 }
        ]
      }
    ],
    created_at: '2026-01-10T08:00:00Z',
    updated_at: '2026-03-01T10:00:00Z'
  },
  {
    id: 'item_vr_cheesecake',
    restaurant_id: 'rest_velvet',
    category_id: 'cat_vr_bakery',
    name: 'Basque Burnt Cheesecake with Berry Coulis',
    description: 'Caramelized Basque cheesecake slice with silky molten center, wild blackberry & raspberry reduction, and fresh mint.',
    price: 9.50,
    image_url: foodBerryCheesecake,
    dietary_tags: ['vegetarian', 'gluten_free', 'chef_special'],
    is_available: true,
    prep_time_minutes: 4,
    sort_order: 1,
    created_at: '2026-01-10T08:00:00Z',
    updated_at: '2026-03-01T10:00:00Z'
  },
  {
    id: 'item_vr_shroom_toast',
    restaurant_id: 'rest_velvet',
    category_id: 'cat_vr_brunch',
    name: 'Pan-Roasted Morel & Chanterelle Toast',
    description: 'Wild forest mushrooms sautéed in cultured French butter with lemon thyme, whipped black garlic ricotta, on seeded rye.',
    price: 18.00,
    image_url: foodArtisanBrunch,
    dietary_tags: ['vegetarian'],
    is_available: true,
    prep_time_minutes: 14,
    sort_order: 2,
    created_at: '2026-01-10T08:00:00Z',
    updated_at: '2026-03-01T10:00:00Z'
  },
  {
    id: 'item_vr_coldbrew',
    restaurant_id: 'rest_velvet',
    category_id: 'cat_vr_coffee',
    name: '24-Hour Nitro Cold Brew',
    description: 'Cascara steeped cold brew infused with pure nitrogen for a velvety stout-like cascade with notes of dark cacao and dried cherry.',
    price: 6.25,
    image_url: foodArtisanBrunch,
    dietary_tags: ['vegan', 'gluten_free'],
    is_available: true,
    prep_time_minutes: 3,
    sort_order: 2,
    created_at: '2026-01-10T08:00:00Z',
    updated_at: '2026-03-01T10:00:00Z'
  },

  // Saffron Bistro Items
  {
    id: 'item_ss_truffle_pasta',
    restaurant_id: 'rest_saffron',
    category_id: 'cat_ss_pasta',
    name: 'Truffle Tagliatelle al Burro',
    description: 'Fresh hand-cut egg tagliatelle, 24-month Parmigiano-Reggiano, house churned cultured butter, and fresh shaved Norcia black winter truffle.',
    price: 28.00,
    image_url: foodTrufflePasta,
    dietary_tags: ['vegetarian', 'chef_special'],
    is_available: true,
    prep_time_minutes: 18,
    sort_order: 1,
    addons: [
      {
        id: 'ad_truffle',
        name: 'Truffle Supplement',
        required: false,
        min_selection: 0,
        max_selection: 1,
        options: [
          { id: 'opt_extra_truffle', name: 'Extra 5g Shaved Black Truffle', price: 9.00 }
        ]
      }
    ],
    created_at: '2026-02-01T09:00:00Z',
    updated_at: '2026-03-01T10:00:00Z'
  },
  {
    id: 'item_ss_cheesecake',
    restaurant_id: 'rest_saffron',
    category_id: 'cat_ss_desserts',
    name: 'Spanish Burnt Torta with Blood Orange Glaze',
    description: 'Smoky, creamy caramelized cheese torta topped with Sicilian blood orange syrup and candied zest.',
    price: 11.00,
    image_url: foodBerryCheesecake,
    dietary_tags: ['vegetarian'],
    is_available: true,
    prep_time_minutes: 5,
    sort_order: 1,
    created_at: '2026-02-01T09:00:00Z',
    updated_at: '2026-03-01T10:00:00Z'
  }
];

const INITIAL_STAFF: StaffMember[] = [
  { id: 'stf_vr_01', restaurant_id: 'rest_velvet', name: 'Elena Rostova', email: 'elena@velvetroastcafe.com', role: 'restaurant_admin', branch_ids: [], status: 'active', created_at: '2026-01-10T08:00:00Z' },
  { id: 'stf_vr_02', restaurant_id: 'rest_velvet', name: 'Marco Vance', email: 'marco@velvetroastcafe.com', role: 'kitchen_staff', branch_ids: ['br_velvet_downtown'], status: 'active', created_at: '2026-01-12T08:00:00Z' },
  { id: 'stf_vr_03', restaurant_id: 'rest_velvet', name: 'Aria Chen', email: 'aria@velvetroastcafe.com', role: 'manager', branch_ids: ['br_velvet_downtown'], status: 'active', created_at: '2026-01-15T08:00:00Z' },
  { id: 'stf_ss_01', restaurant_id: 'rest_saffron', name: 'Julian Morel', email: 'julian@saffronandsage.com', role: 'restaurant_admin', branch_ids: [], status: 'active', created_at: '2026-02-01T09:00:00Z' },
  { id: 'stf_ss_02', restaurant_id: 'rest_saffron', name: 'Dante Rossi', email: 'dante@saffronandsage.com', role: 'kitchen_staff', branch_ids: ['br_saffron_harbor'], status: 'active', created_at: '2026-02-05T09:00:00Z' }
];

const INITIAL_SUBSCRIPTIONS: RestaurantSubscription[] = [
  { id: 'sub_vr', restaurant_id: 'rest_velvet', plan_id: 'plan_growth', status: 'active', trial_ends_at: '2026-02-10T08:00:00Z', current_period_end: '2026-11-10T08:00:00Z' },
  { id: 'sub_ss', restaurant_id: 'rest_saffron', plan_id: 'plan_starter', status: 'active', trial_ends_at: '2026-03-01T09:00:00Z', current_period_end: '2026-11-01T09:00:00Z' }
];

const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord_vr_1041',
    order_number: 'VR-1041',
    restaurant_id: 'rest_velvet',
    branch_id: 'br_velvet_downtown',
    table_id: 'tbl_vr_01',
    table_label: 'Table 1 (Window)',
    branch_name: 'Downtown Flagship',
    tracking_token: 'trk_991827465',
    customer_name: 'Sophia M.',
    customer_phone: '+1 555-0192',
    customer_note: 'Warm oat milk please',
    items: [
      {
        id: 'oi_1',
        menu_item_id: 'item_vr_avo',
        name: 'Avocado Tartine with Poached Farm Egg',
        quantity: 1,
        unit_price: 16.50,
        total_price: 19.00,
        selected_addons: [{ groupId: 'ad_egg', groupName: 'Egg Preparation', optionId: 'opt_soft_poached', optionName: 'Extra Soft Poached Egg', price: 2.50 }]
      },
      {
        id: 'oi_2',
        menu_item_id: 'item_vr_latte',
        name: 'Artisan Velvet Flat White / Latte',
        quantity: 1,
        unit_price: 5.75,
        total_price: 6.60,
        selected_addons: [{ groupId: 'ad_milk', groupName: 'Milk Choice', optionId: 'opt_oat_milk', optionName: 'Barista Oat Milk', price: 0.85 }]
      }
    ],
    subtotal: 25.60,
    tax_amount: 2.18,
    service_charge: 1.28,
    total_amount: 29.06,
    currency_symbol: '$',
    payment_method: 'table',
    payment_status: 'unpaid',
    status: 'preparing',
    estimated_prep_minutes: 15,
    created_at: '2026-10-15T07:22:00Z',
    updated_at: '2026-10-15T07:25:00Z',
    status_history: [
      { status: 'pending', timestamp: '2026-10-15T07:22:00Z', actor_name: 'Guest Customer' },
      { status: 'accepted', timestamp: '2026-10-15T07:23:30Z', actor_name: 'Aria Chen (Manager)' },
      { status: 'preparing', timestamp: '2026-10-15T07:25:00Z', actor_name: 'Marco Vance (Kitchen)' }
    ]
  },
  {
    id: 'ord_vr_1040',
    order_number: 'VR-1040',
    restaurant_id: 'rest_velvet',
    branch_id: 'br_velvet_downtown',
    table_id: 'tbl_vr_03',
    table_label: 'Table 3 (Banquette)',
    branch_name: 'Downtown Flagship',
    tracking_token: 'trk_382910482',
    customer_name: 'Daniel L.',
    items: [
      {
        id: 'oi_3',
        menu_item_id: 'item_vr_cheesecake',
        name: 'Basque Burnt Cheesecake with Berry Coulis',
        quantity: 2,
        unit_price: 9.50,
        total_price: 19.00,
        selected_addons: []
      },
      {
        id: 'oi_4',
        menu_item_id: 'item_vr_coldbrew',
        name: '24-Hour Nitro Cold Brew',
        quantity: 2,
        unit_price: 6.25,
        total_price: 12.50,
        selected_addons: []
      }
    ],
    subtotal: 31.50,
    tax_amount: 2.68,
    service_charge: 1.58,
    total_amount: 35.76,
    currency_symbol: '$',
    payment_method: 'counter',
    payment_status: 'paid',
    status: 'ready',
    estimated_prep_minutes: 8,
    created_at: '2026-10-15T07:05:00Z',
    updated_at: '2026-10-15T07:18:00Z',
    status_history: [
      { status: 'pending', timestamp: '2026-10-15T07:05:00Z' },
      { status: 'accepted', timestamp: '2026-10-15T07:06:00Z' },
      { status: 'preparing', timestamp: '2026-10-15T07:08:00Z' },
      { status: 'ready', timestamp: '2026-10-15T07:18:00Z' }
    ]
  }
];

const INITIAL_AUDIT_LOGS: AuditLog[] = [
  { id: 'log_01', actor_name: 'Platform Super Admin', actor_role: 'super_admin', action: 'TENANT_ONBOARDED', details: 'Provisioned tenant Velvet Roast Café with Growth Subscription', created_at: '2026-01-10T08:00:00Z' },
  { id: 'log_02', restaurant_id: 'rest_velvet', actor_name: 'Elena Rostova', actor_role: 'restaurant_admin', action: 'QR_TOKENS_GENERATED', details: 'Generated 6 table QR codes for Downtown Flagship branch', created_at: '2026-01-10T08:30:00Z' },
  { id: 'log_03', restaurant_id: 'rest_velvet', actor_name: 'Elena Rostova', actor_role: 'restaurant_admin', action: 'CUSTOM_DOMAIN_VERIFIED', details: 'Verified DNS CNAME for www.velvetroastcafe.com', created_at: '2026-01-15T12:00:00Z' },
  { id: 'log_04', actor_name: 'Platform Super Admin', actor_role: 'super_admin', action: 'TENANT_ONBOARDED', details: 'Provisioned tenant Saffron & Sage Bistro with Starter Subscription', created_at: '2026-02-01T09:00:00Z' }
];

// Pub/Sub Listener Type
type ListenerCallback = (event: string, payload: any) => void;

class PentaPrizmDatabase {
  private state: DatabaseState;
  private listeners: Set<ListenerCallback> = new Set();

  constructor() {
    this.state = this.loadState();
  }

  private loadState(): DatabaseState {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Ensure essential arrays exist
        if (parsed.restaurants && parsed.restaurants.length > 0) {
          return parsed;
        }
      }
    } catch {
      // fallback
    }
    const initial: DatabaseState = {
      restaurants: INITIAL_RESTAURANTS,
      branches: INITIAL_BRANCHES,
      tables: INITIAL_TABLES,
      qrTokens: INITIAL_QR_TOKENS,
      categories: INITIAL_CATEGORIES,
      menuItems: INITIAL_MENU_ITEMS,
      orders: INITIAL_ORDERS,
      staff: INITIAL_STAFF,
      plans: INITIAL_PLANS,
      subscriptions: INITIAL_SUBSCRIPTIONS,
      auditLogs: INITIAL_AUDIT_LOGS
    };
    this.saveState(initial);
    return initial;
  }

  private saveState(state: DatabaseState) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('Failed to persist database state:', e);
    }
  }

  private persistAndNotify(event: string, payload: any) {
    this.saveState(this.state);
    this.notify(event, payload);
  }

  public subscribe(cb: ListenerCallback): () => void {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  private notify(event: string, payload: any) {
    this.listeners.forEach((cb) => {
      try {
        cb(event, payload);
      } catch (err) {
        console.error('Error in subscriber callback:', err);
      }
    });
  }

  public resetToFactory() {
    localStorage.removeItem(STORAGE_KEY);
    this.state = {
      restaurants: INITIAL_RESTAURANTS,
      branches: INITIAL_BRANCHES,
      tables: INITIAL_TABLES,
      qrTokens: INITIAL_QR_TOKENS,
      categories: INITIAL_CATEGORIES,
      menuItems: INITIAL_MENU_ITEMS,
      orders: INITIAL_ORDERS,
      staff: INITIAL_STAFF,
      plans: INITIAL_PLANS,
      subscriptions: INITIAL_SUBSCRIPTIONS,
      auditLogs: INITIAL_AUDIT_LOGS
    };
    this.saveState(this.state);
    this.notify('DATABASE_RESET', {});
  }

  // --- Tenant Resolution ---
  public resolveTenantByHostname(hostname: string): Restaurant | null {
    const cleanHost = hostname.toLowerCase().trim().replace(/^https?:\/\//, '').split(':')[0];
    
    // 1. Direct custom domain match
    const customMatch = this.state.restaurants.find(
      (r) => r.custom_domain && r.custom_domain.toLowerCase() === cleanHost
    );
    if (customMatch) return customMatch;

    // 2. Subdomain match (e.g. velvet-roast.pentaprizm.app or velvet-roast)
    if (cleanHost.includes('.pentaprizm.app')) {
      const sub = cleanHost.replace('.pentaprizm.app', '');
      const subMatch = this.state.restaurants.find((r) => r.subdomain === sub || r.slug === sub);
      if (subMatch) return subMatch;
    }

    // 3. Fallback direct slug match
    const slugMatch = this.state.restaurants.find((r) => r.slug === cleanHost || r.subdomain === cleanHost);
    if (slugMatch) return slugMatch;

    // Default to the first active restaurant for convenience if non-existent or localhost
    return this.state.restaurants[0] || null;
  }

  public getRestaurantById(id: string): Restaurant | null {
    return this.state.restaurants.find((r) => r.id === id) || null;
  }

  public getAllRestaurants(): Restaurant[] {
    return [...this.state.restaurants];
  }

  // --- Row Level Security (RLS) enforcement helper ---
  public assertTenantAccess(operatorRestaurantId: string | null, targetRestaurantId: string, role?: string) {
    if (role === 'super_admin') return true; // Super admin has global authorization
    if (!operatorRestaurantId || operatorRestaurantId !== targetRestaurantId) {
      throw new Error(`[RLS VIOLATION]: Tenant ${operatorRestaurantId || 'anonymous'} is denied access to tenant ${targetRestaurantId} records.`);
    }
    return true;
  }

  // --- QR Token Management & Validation ---
  public validateQRToken(tokenOpaque: string): { success: boolean; session?: ValidatedQRSession; error?: string } {
    if (!tokenOpaque || typeof tokenOpaque !== 'string') {
      return { success: false, error: 'Invalid QR token provided.' };
    }

    const qr = this.state.qrTokens.find((q) => q.token_opaque === tokenOpaque.trim());
    if (!qr) {
      return { success: false, error: 'Unrecognized table QR code. Please scan a valid table QR.' };
    }

    if (qr.status === 'revoked') {
      return { success: false, error: 'This QR code has been revoked or replaced by staff.' };
    }

    const restaurant = this.state.restaurants.find((r) => r.id === qr.restaurant_id);
    if (!restaurant) {
      return { success: false, error: 'Restaurant record could not be found.' };
    }

    if (restaurant.status !== 'active') {
      return { success: false, error: 'This restaurant is currently suspended or inactive.' };
    }

    const branch = this.state.branches.find((b) => b.id === qr.branch_id);
    if (!branch || branch.status !== 'active') {
      return { success: false, error: 'The restaurant branch associated with this table is currently closed.' };
    }

    const table = this.state.tables.find((t) => t.id === qr.table_id);
    if (!table || table.status !== 'active') {
      return { success: false, error: 'This table is currently inactive or being serviced.' };
    }

    // Update scan count and last scanned
    qr.scan_count += 1;
    qr.last_scanned_at = new Date().toISOString();
    this.saveState(this.state);

    const session: ValidatedQRSession = {
      sessionId: `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      restaurant,
      branch,
      table,
      tokenOpaque: qr.token_opaque,
      expiresAt: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(), // 4 hour dining session
      createdAt: new Date().toISOString()
    };

    return { success: true, session };
  }

  public getQRTokenForTable(tableId: string): QRToken | null {
    return this.state.qrTokens.find((q) => q.table_id === tableId && q.status === 'active') || null;
  }

  public regenerateQRToken(restaurantId: string, branchId: string, tableId: string): QRToken {
    // Revoke old tokens for this table
    this.state.qrTokens.forEach((q) => {
      if (q.table_id === tableId) {
        q.status = 'revoked';
      }
    });

    const randomSuffix = Array.from({ length: 24 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    const newToken: QRToken = {
      id: `qr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      restaurant_id: restaurantId,
      branch_id: branchId,
      table_id: tableId,
      token_opaque: `pzp_live_${randomSuffix}`,
      token_hash: `h_${Date.now()}`,
      status: 'active',
      scan_count: 0,
      created_at: new Date().toISOString()
    };

    this.state.qrTokens.push(newToken);
    this.persistAndNotify('QR_REGENERATED', { tableId, token: newToken });
    return newToken;
  }

  // --- Branch & Table Management ---
  public getBranches(restaurantId: string): Branch[] {
    return this.state.branches.filter((b) => b.restaurant_id === restaurantId);
  }

  public getTables(restaurantId: string, branchId?: string): RestaurantTable[] {
    return this.state.tables.filter((t) => {
      if (t.restaurant_id !== restaurantId) return false;
      if (branchId && t.branch_id !== branchId) return false;
      return true;
    });
  }

  public addTable(restaurantId: string, branchId: string, data: { table_number: string; label: string; capacity: number; location_area: RestaurantTable['location_area'] }): RestaurantTable {
    const table: RestaurantTable = {
      id: `tbl_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      restaurant_id: restaurantId,
      branch_id: branchId,
      table_number: data.table_number,
      label: data.label,
      capacity: data.capacity,
      location_area: data.location_area,
      status: 'active',
      created_at: new Date().toISOString()
    };
    this.state.tables.push(table);
    // Automatically generate QR code
    this.regenerateQRToken(restaurantId, branchId, table.id);
    this.persistAndNotify('TABLE_CREATED', table);
    return table;
  }

  public updateTable(tableId: string, updates: Partial<RestaurantTable>): RestaurantTable {
    const table = this.state.tables.find((t) => t.id === tableId);
    if (!table) throw new Error('Table not found');
    Object.assign(table, updates);
    this.persistAndNotify('TABLE_UPDATED', table);
    return table;
  }

  public deleteTable(tableId: string) {
    this.state.tables = this.state.tables.filter((t) => t.id !== tableId);
    this.state.qrTokens = this.state.qrTokens.filter((q) => q.table_id !== tableId);
    this.persistAndNotify('TABLE_DELETED', { tableId });
  }

  // --- Menu Management ---
  public getCategories(restaurantId: string): MenuCategory[] {
    return this.state.categories
      .filter((c) => c.restaurant_id === restaurantId && c.is_visible)
      .sort((a, b) => a.sort_order - b.sort_order);
  }

  public getAllCategories(restaurantId: string): MenuCategory[] {
    return this.state.categories
      .filter((c) => c.restaurant_id === restaurantId)
      .sort((a, b) => a.sort_order - b.sort_order);
  }

  public addCategory(restaurantId: string, name: string, description: string): MenuCategory {
    const category: MenuCategory = {
      id: `cat_${Date.now()}`,
      restaurant_id: restaurantId,
      name,
      description,
      sort_order: this.state.categories.length + 1,
      is_visible: true,
      created_at: new Date().toISOString()
    };
    this.state.categories.push(category);
    this.persistAndNotify('CATEGORY_CREATED', category);
    return category;
  }

  public updateCategory(categoryId: string, updates: Partial<MenuCategory>): MenuCategory {
    const cat = this.state.categories.find((c) => c.id === categoryId);
    if (!cat) throw new Error('Category not found');
    Object.assign(cat, updates);
    this.persistAndNotify('CATEGORY_UPDATED', cat);
    return cat;
  }

  public deleteCategory(categoryId: string) {
    this.state.categories = this.state.categories.filter((c) => c.id !== categoryId);
    this.persistAndNotify('CATEGORY_DELETED', { categoryId });
  }

  public getMenuItems(restaurantId: string, categoryId?: string): MenuItem[] {
    return this.state.menuItems
      .filter((item) => {
        if (item.restaurant_id !== restaurantId) return false;
        if (categoryId && item.category_id !== categoryId) return false;
        return true;
      })
      .sort((a, b) => a.sort_order - b.sort_order);
  }

  public toggleItemAvailability(itemId: string, restaurantId: string): MenuItem {
    this.assertTenantAccess(restaurantId, restaurantId);
    const item = this.state.menuItems.find((i) => i.id === itemId && i.restaurant_id === restaurantId);
    if (!item) throw new Error('Item not found');
    item.is_available = !item.is_available;
    item.updated_at = new Date().toISOString();
    this.persistAndNotify('ITEM_AVAILABILITY_CHANGED', item);
    return item;
  }

  public addMenuItem(restaurantId: string, data: Omit<MenuItem, 'id' | 'restaurant_id' | 'created_at' | 'updated_at'>): MenuItem {
    const item: MenuItem = {
      id: `item_${Date.now()}`,
      restaurant_id: restaurantId,
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.state.menuItems.push(item);
    this.persistAndNotify('ITEM_CREATED', item);
    return item;
  }

  public updateMenuItem(itemId: string, restaurantId: string, updates: Partial<MenuItem>): MenuItem {
    this.assertTenantAccess(restaurantId, restaurantId);
    const item = this.state.menuItems.find((i) => i.id === itemId && i.restaurant_id === restaurantId);
    if (!item) throw new Error('Item not found');
    Object.assign(item, updates, { updated_at: new Date().toISOString() });
    this.persistAndNotify('ITEM_UPDATED', item);
    return item;
  }

  public deleteMenuItem(itemId: string, restaurantId: string) {
    this.assertTenantAccess(restaurantId, restaurantId);
    this.state.menuItems = this.state.menuItems.filter((i) => !(i.id === itemId && i.restaurant_id === restaurantId));
    this.persistAndNotify('ITEM_DELETED', { itemId });
  }

  // --- Order Placement & Processing ---
  public createOrder(session: ValidatedQRSession, cartItems: CartItem[], orderMeta: { customerName?: string; customerPhone?: string; customerNote?: string; paymentMethod: PaymentMethod }): Order {
    if (!cartItems || cartItems.length === 0) {
      throw new Error('Cannot place an empty order.');
    }

    const restaurant = this.getRestaurantById(session.restaurant.id);
    if (!restaurant || restaurant.status !== 'active') {
      throw new Error('Restaurant is currently not accepting orders.');
    }

    // Revalidate each item against current database state (prevent client-side manipulation of price or availability)
    let calculatedSubtotal = 0;
    const snapshots: OrderItemSnapshot[] = [];

    for (const cartItem of cartItems) {
      const dbItem = this.state.menuItems.find((i) => i.id === cartItem.menuItem.id && i.restaurant_id === session.restaurant.id);
      if (!dbItem) {
        throw new Error(`Menu item '${cartItem.menuItem.name}' does not belong to this restaurant.`);
      }
      if (!dbItem.is_available) {
        throw new Error(`'${dbItem.name}' just became unavailable in the kitchen. Please remove it from your cart.`);
      }

      // Revalidate add-on prices
      let itemAddonSum = 0;
      if (cartItem.selectedAddons && cartItem.selectedAddons.length > 0) {
        cartItem.selectedAddons.forEach((sa) => {
          const group = dbItem.addons?.find((g) => g.id === sa.groupId);
          const option = group?.options.find((o) => o.id === sa.optionId);
          if (option) {
            itemAddonSum += option.price;
          }
        });
      }

      const unitTotal = dbItem.price + itemAddonSum;
      const lineTotal = unitTotal * cartItem.quantity;
      calculatedSubtotal += lineTotal;

      snapshots.push({
        id: `oi_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        menu_item_id: dbItem.id,
        name: dbItem.name,
        quantity: cartItem.quantity,
        unit_price: unitTotal,
        total_price: lineTotal,
        selected_addons: cartItem.selectedAddons,
        special_instructions: cartItem.specialInstructions
      });
    }

    const taxAmount = Number(((calculatedSubtotal * restaurant.tax_rate_percent) / 100).toFixed(2));
    const serviceCharge = Number(((calculatedSubtotal * restaurant.service_charge_percent) / 100).toFixed(2));
    const totalAmount = Number((calculatedSubtotal + taxAmount + serviceCharge).toFixed(2));

    // Scoped order number
    const count = this.state.orders.filter((o) => o.restaurant_id === restaurant.id).length + 1042;
    const prefix = restaurant.slug.split('-').map((s) => s[0].toUpperCase()).join('');
    const orderNumber = `${prefix}-${count}`;
    const trackingToken = `trk_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`;

    const newOrder: Order = {
      id: `ord_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      order_number: orderNumber,
      restaurant_id: restaurant.id,
      branch_id: session.branch.id,
      table_id: session.table.id,
      table_label: session.table.label,
      branch_name: session.branch.name,
      tracking_token: trackingToken,
      customer_name: orderMeta.customerName?.trim() || 'Dine-in Guest',
      customer_phone: orderMeta.customerPhone?.trim(),
      customer_note: orderMeta.customerNote?.trim(),
      items: snapshots,
      subtotal: calculatedSubtotal,
      tax_amount: taxAmount,
      service_charge: serviceCharge,
      total_amount: totalAmount,
      currency_symbol: restaurant.currency_symbol,
      payment_method: orderMeta.paymentMethod,
      payment_status: orderMeta.paymentMethod === 'online' ? 'paid' : 'unpaid',
      status: 'pending',
      estimated_prep_minutes: 15,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      status_history: [
        {
          status: 'pending',
          timestamp: new Date().toISOString(),
          actor_name: orderMeta.customerName?.trim() || 'Table QR Guest'
        }
      ]
    };

    this.state.orders.unshift(newOrder);
    this.persistAndNotify('ORDER_CREATED', newOrder);
    return newOrder;
  }

  public getOrders(restaurantId: string, branchId?: string, statusFilter?: OrderStatus): Order[] {
    return this.state.orders.filter((o) => {
      if (o.restaurant_id !== restaurantId) return false;
      if (branchId && o.branch_id !== branchId) return false;
      if (statusFilter && o.status !== statusFilter) return false;
      return true;
    });
  }

  public getOrderByTrackingToken(token: string): Order | null {
    return this.state.orders.find((o) => o.tracking_token === token.trim()) || null;
  }

  public updateOrderStatus(orderId: string, restaurantId: string, newStatus: OrderStatus, actorName: string = 'Staff', cancellationReason?: string): Order {
    this.assertTenantAccess(restaurantId, restaurantId);
    const order = this.state.orders.find((o) => o.id === orderId && o.restaurant_id === restaurantId);
    if (!order) throw new Error('Order not found');

    order.status = newStatus;
    if (newStatus === 'cancelled' && cancellationReason) {
      order.cancellation_reason = cancellationReason;
    }
    if (newStatus === 'served') {
      order.payment_status = 'paid';
    }
    order.updated_at = new Date().toISOString();
    order.status_history.push({
      status: newStatus,
      timestamp: new Date().toISOString(),
      actor_name: actorName,
      note: cancellationReason
    });

    this.persistAndNotify('ORDER_STATUS_CHANGED', order);
    return order;
  }

  // --- Restaurant Admin & Profile Updates ---
  public updateRestaurant(restaurantId: string, updates: Partial<Restaurant>): Restaurant {
    const restaurant = this.getRestaurantById(restaurantId);
    if (!restaurant) throw new Error('Restaurant not found');
    Object.assign(restaurant, updates, { updated_at: new Date().toISOString() });
    this.persistAndNotify('RESTAURANT_UPDATED', restaurant);
    return restaurant;
  }

  public updateBranch(branchId: string, restaurantId: string, updates: Partial<Branch>): Branch {
    this.assertTenantAccess(restaurantId, restaurantId);
    const branch = this.state.branches.find((b) => b.id === branchId && b.restaurant_id === restaurantId);
    if (!branch) throw new Error('Branch not found');
    Object.assign(branch, updates);
    this.persistAndNotify('BRANCH_UPDATED', branch);
    return branch;
  }

  // --- Staff Management ---
  public getStaff(restaurantId: string): StaffMember[] {
    return this.state.staff.filter((s) => s.restaurant_id === restaurantId);
  }

  public addStaff(restaurantId: string, data: Omit<StaffMember, 'id' | 'restaurant_id' | 'created_at'>): StaffMember {
    const member: StaffMember = {
      id: `stf_${Date.now()}`,
      restaurant_id: restaurantId,
      ...data,
      created_at: new Date().toISOString()
    };
    this.state.staff.push(member);
    this.persistAndNotify('STAFF_ADDED', member);
    return member;
  }

  public deleteStaff(staffId: string, restaurantId: string) {
    this.state.staff = this.state.staff.filter((s) => !(s.id === staffId && s.restaurant_id === restaurantId));
    this.persistAndNotify('STAFF_DELETED', { staffId });
  }

  // --- Super Admin Capabilities ---
  public getSuperAdminOverview() {
    const totalTenants = this.state.restaurants.length;
    const activeTenants = this.state.restaurants.filter((r) => r.status === 'active').length;
    const suspendedTenants = this.state.restaurants.filter((r) => r.status === 'suspended').length;
    const totalBranches = this.state.branches.length;
    const totalTables = this.state.tables.length;
    const totalOrders = this.state.orders.length;
    const totalGmv = this.state.orders.reduce((sum, o) => sum + (o.status !== 'cancelled' ? o.total_amount : 0), 0);
    const activeSubscriptions = this.state.subscriptions.filter((s) => s.status === 'active').length;

    return {
      totalTenants,
      activeTenants,
      suspendedTenants,
      totalBranches,
      totalTables,
      totalOrders,
      totalGmv,
      activeSubscriptions
    };
  }

  public getPlans(): SubscriptionPlan[] {
    return [...this.state.plans];
  }

  public getSubscriptions(): RestaurantSubscription[] {
    return [...this.state.subscriptions];
  }

  public createTenant(data: { name: string; slug: string; subdomain: string; custom_domain?: string; planId: string; adminName: string; adminEmail: string }): Restaurant {
    // Check uniqueness
    if (this.state.restaurants.some((r) => r.slug === data.slug || r.subdomain === data.subdomain)) {
      throw new Error(`Subdomain or slug '${data.subdomain}' is already registered.`);
    }

    const restId = `rest_${Date.now()}`;
    const newRestaurant: Restaurant = {
      id: restId,
      name: data.name,
      slug: data.slug,
      subdomain: data.subdomain,
      custom_domain: data.custom_domain || null,
      domain_verified: false,
      logo_url: '🍽️',
      brand_color: '#0f172a',
      accent_color: '#2563eb',
      currency: 'USD',
      currency_symbol: '$',
      tax_rate_percent: 8.0,
      service_charge_percent: 5.0,
      status: 'active',
      description: `${data.name} is a fine hospitality experience powered by Penta Prizm.`,
      tagline: 'Modern Dining & Table Ordering',
      phone: '+1 (555) 000-0000',
      email: data.adminEmail,
      address: '100 Main Street',
      opening_hours: 'Mon – Sun: 8:00 AM – 9:00 PM',
      hero_image_url: heroCafeAmbiance,
      is_ordering_enabled: true,
      allowed_payment_methods: ['counter', 'table'],
      website_settings: {
        hero_title: `Welcome to ${data.name}`,
        hero_subtitle: 'Artisanal dishes made with locally sourced organic ingredients.',
        about_text: 'Crafting memorable culinary experiences for every dining guest.',
        chef_note: 'Fresh seasonal ingredients prepared daily.'
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Create primary branch
    const branchId = `br_${Date.now()}`;
    const primaryBranch: Branch = {
      id: branchId,
      restaurant_id: restId,
      name: 'Main Location',
      code: 'MAIN-01',
      address: '100 Main Street',
      phone: '+1 (555) 000-0000',
      opening_hours: 'Mon – Sun: 8:00 AM – 9:00 PM',
      status: 'active',
      created_at: new Date().toISOString()
    };

    // Create 4 starter tables with QR codes
    const newTables: RestaurantTable[] = [];
    const newQrs: QRToken[] = [];
    for (let i = 1; i <= 4; i++) {
      const tblId = `tbl_${restId}_${i}`;
      newTables.push({
        id: tblId,
        restaurant_id: restId,
        branch_id: branchId,
        table_number: `${i}`,
        label: `Table ${i}`,
        capacity: i % 2 === 0 ? 4 : 2,
        location_area: 'indoor',
        status: 'active',
        created_at: new Date().toISOString()
      });

      const randomSuffix = Array.from({ length: 24 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
      newQrs.push({
        id: `qr_${restId}_${i}`,
        restaurant_id: restId,
        branch_id: branchId,
        table_id: tblId,
        token_opaque: `pzp_live_${randomSuffix}`,
        token_hash: `h_${Date.now()}_${i}`,
        status: 'active',
        scan_count: 0,
        created_at: new Date().toISOString()
      });
    }

    // Starter categories & sample item
    const catId = `cat_${restId}_main`;
    const starterCategory: MenuCategory = {
      id: catId,
      restaurant_id: restId,
      name: 'Signature Dishes',
      description: 'House specialties and popular guest favorites',
      sort_order: 1,
      is_visible: true,
      created_at: new Date().toISOString()
    };

    const starterItem: MenuItem = {
      id: `item_${restId}_1`,
      restaurant_id: restId,
      category_id: catId,
      name: 'Chef House Special Platter',
      description: 'Artisan sourdough, roasted heirloom vegetables, and farm fresh savory dip.',
      price: 18.00,
      image_url: foodArtisanBrunch,
      dietary_tags: ['vegetarian', 'chef_special'],
      is_available: true,
      prep_time_minutes: 12,
      sort_order: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Assign admin staff
    const adminStaff: StaffMember = {
      id: `stf_${restId}_admin`,
      restaurant_id: restId,
      name: data.adminName,
      email: data.adminEmail,
      role: 'restaurant_admin',
      branch_ids: [],
      status: 'active',
      created_at: new Date().toISOString()
    };

    // Assign subscription
    const subscription: RestaurantSubscription = {
      id: `sub_${restId}`,
      restaurant_id: restId,
      plan_id: data.planId,
      status: 'active',
      trial_ends_at: new Date(Date.now() + 14 * 24 * 3600 * 1000).toISOString(),
      current_period_end: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString()
    };

    // Audit log
    const audit: AuditLog = {
      id: `log_${Date.now()}`,
      restaurant_id: restId,
      actor_name: 'Platform Super Admin',
      actor_role: 'super_admin',
      action: 'TENANT_CREATED',
      details: `Provisioned tenant ${data.name} with subdomain ${data.subdomain}`,
      created_at: new Date().toISOString()
    };

    this.state.restaurants.push(newRestaurant);
    this.state.branches.push(primaryBranch);
    this.state.tables.push(...newTables);
    this.state.qrTokens.push(...newQrs);
    this.state.categories.push(starterCategory);
    this.state.menuItems.push(starterItem);
    this.state.staff.push(adminStaff);
    this.state.subscriptions.push(subscription);
    this.state.auditLogs.unshift(audit);

    this.persistAndNotify('TENANT_CREATED', newRestaurant);
    return newRestaurant;
  }

  public toggleTenantStatus(restaurantId: string): Restaurant {
    const restaurant = this.getRestaurantById(restaurantId);
    if (!restaurant) throw new Error('Restaurant not found');
    restaurant.status = restaurant.status === 'active' ? 'suspended' : 'active';
    restaurant.updated_at = new Date().toISOString();

    const audit: AuditLog = {
      id: `log_${Date.now()}`,
      restaurant_id: restaurantId,
      actor_name: 'Platform Super Admin',
      actor_role: 'super_admin',
      action: restaurant.status === 'active' ? 'TENANT_ACTIVATED' : 'TENANT_SUSPENDED',
      details: `Tenant ${restaurant.name} marked as ${restaurant.status}`,
      created_at: new Date().toISOString()
    };
    this.state.auditLogs.unshift(audit);

    this.persistAndNotify('TENANT_STATUS_CHANGED', restaurant);
    return restaurant;
  }

  public verifyCustomDomain(restaurantId: string): Restaurant {
    const restaurant = this.getRestaurantById(restaurantId);
    if (!restaurant) throw new Error('Restaurant not found');
    restaurant.domain_verified = true;
    restaurant.updated_at = new Date().toISOString();

    const audit: AuditLog = {
      id: `log_${Date.now()}`,
      restaurant_id: restaurantId,
      actor_name: 'Platform Super Admin',
      actor_role: 'super_admin',
      action: 'CUSTOM_DOMAIN_VERIFIED',
      details: `Verified custom domain ${restaurant.custom_domain} for ${restaurant.name}`,
      created_at: new Date().toISOString()
    };
    this.state.auditLogs.unshift(audit);

    this.persistAndNotify('DOMAIN_VERIFIED', restaurant);
    return restaurant;
  }

  public getAuditLogs(restaurantId?: string): AuditLog[] {
    if (restaurantId) {
      return this.state.auditLogs.filter((l) => l.restaurant_id === restaurantId);
    }
    return [...this.state.auditLogs];
  }
}

export const db = new PentaPrizmDatabase();
