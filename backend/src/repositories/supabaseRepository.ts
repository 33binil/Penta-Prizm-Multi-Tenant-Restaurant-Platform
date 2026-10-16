import { supabaseAdminClient } from '../config/supabase.js';
import {
  Restaurant,
  Branch,
  RestaurantTable,
  QRToken,
  MenuCategory,
  MenuItem,
  Order,
  StaffMember,
  SubscriptionPlan,
  RestaurantSubscription,
  AuditLog,
  OrderStatus
} from '../types.js';

// Standalone in-memory seed store fallback for immediate offline/test execution
class MemoryStore {
  restaurants: Restaurant[] = [
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
      address: '742 Evergreen Promenade, Arts District, Portland, OR 97209',
      opening_hours: 'Daily: 7:00 AM – 6:00 PM',
      hero_image_url: '/assets/images/hero_cafe_ambiance_1792076061364.jpg',
      is_ordering_enabled: true,
      allowed_payment_methods: ['counter', 'table', 'online'],
      website_settings: {
        hero_title: 'Awaken Your Senses with Direct-Trade Coffee',
        hero_subtitle: 'Freshly roasted single-origin espresso and slow-fermented organic pastries crafted with patience and devotion.',
        about_text: 'Founded in 2019, Velvet Roast Café began with a single vintage roaster and a dream: to celebrate coffee farmers with unmatched transparency and care.',
        chef_note: 'Every weekend brunch plate is sourced within 50 miles from Willamette Valley regenerative growers.'
      },
      created_at: '2025-01-15T08:00:00Z',
      updated_at: '2025-01-15T08:00:00Z'
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
      service_charge_percent: 4.0,
      status: 'active',
      description: 'Contemporary Mediterranean-Californian small plates and botanical cocktail bar overlooking the scenic marina waterfront.',
      tagline: 'Modern Mediterranean Small Plates & Botanical Bar',
      phone: '+1 (555) 987-6543',
      email: 'reservations@saffronandsage.com',
      address: '12 Waterfront Esplanade, Suite 104, San Francisco, CA 94105',
      opening_hours: 'Tue–Sun: 11:30 AM – 11:00 PM (Closed Mon)',
      hero_image_url: '/assets/images/food_truffle_pasta_1792076063325.jpg',
      is_ordering_enabled: true,
      allowed_payment_methods: ['counter', 'table', 'online'],
      website_settings: {
        hero_title: 'Sun-Drenched Flavors of the Mediterranean Coast',
        hero_subtitle: 'Wood-fired hearth dishes, hand-rolled pastas, and cold-pressed olive oils shared family-style under olive trees.',
        about_text: 'Executive Chef Julian Thorne curates a seasonal tasting narrative spanning the Grecian isles, Sicilian coastline, and Coastal California.',
        chef_note: 'Our saffron is harvested by hand in Kozani and imported weekly for maximum floral vibrancy.'
      },
      created_at: '2025-02-01T10:00:00Z',
      updated_at: '2025-02-01T10:00:00Z'
    }
  ];

  branches: Branch[] = [
    {
      id: 'br_velvet_main',
      restaurant_id: 'rest_velvet',
      name: 'Arts District Roastery (Flagship)',
      code: 'PDX-MAIN',
      address: '742 Evergreen Promenade, Portland, OR 97209',
      phone: '+1 (555) 234-5678',
      opening_hours: '7:00 AM – 6:00 PM',
      status: 'active',
      created_at: '2025-01-15T08:00:00Z'
    },
    {
      id: 'br_velvet_downtown',
      restaurant_id: 'rest_velvet',
      name: 'Pioneer Square Espresso Bar',
      code: 'PDX-DT',
      address: '310 SW Yamhill St, Portland, OR 97204',
      phone: '+1 (555) 234-5679',
      opening_hours: '6:30 AM – 4:00 PM',
      status: 'active',
      created_at: '2025-02-10T08:00:00Z'
    },
    {
      id: 'br_saffron_marina',
      restaurant_id: 'rest_saffron',
      name: 'Embarcadero Waterfront',
      code: 'SFO-MB',
      address: '12 Waterfront Esplanade, San Francisco, CA 94105',
      phone: '+1 (555) 987-6543',
      opening_hours: '11:30 AM – 11:00 PM',
      status: 'active',
      created_at: '2025-02-01T10:00:00Z'
    }
  ];

  tables: RestaurantTable[] = [
    { id: 'tbl_vr_01', restaurant_id: 'rest_velvet', branch_id: 'br_velvet_main', table_number: '01', label: 'Table 01 — Window Nook', capacity: 2, location_area: 'indoor', status: 'active', created_at: '2025-01-15T08:00:00Z' },
    { id: 'tbl_vr_02', restaurant_id: 'rest_velvet', branch_id: 'br_velvet_main', table_number: '02', label: 'Table 02 — Main Atrium', capacity: 4, location_area: 'indoor', status: 'active', created_at: '2025-01-15T08:00:00Z' },
    { id: 'tbl_vr_03', restaurant_id: 'rest_velvet', branch_id: 'br_velvet_main', table_number: '03', label: 'Table 03 — Sunny Terrace', capacity: 4, location_area: 'patio', status: 'active', created_at: '2025-01-15T08:00:00Z' },
    { id: 'tbl_vr_04', restaurant_id: 'rest_velvet', branch_id: 'br_velvet_main', table_number: '04', label: 'Table 04 — Bar Counter', capacity: 1, location_area: 'bar', status: 'active', created_at: '2025-01-15T08:00:00Z' },
    { id: 'tbl_vr_05', restaurant_id: 'rest_velvet', branch_id: 'br_velvet_main', table_number: '05', label: 'Table 05 — Garden Courtyard', capacity: 6, location_area: 'patio', status: 'active', created_at: '2025-01-15T08:00:00Z' },
    { id: 'tbl_ss_01', restaurant_id: 'rest_saffron', branch_id: 'br_saffron_marina', table_number: '101', label: 'Table 101 — Harbor View', capacity: 4, location_area: 'terrace', status: 'active', created_at: '2025-02-01T10:00:00Z' },
    { id: 'tbl_ss_02', restaurant_id: 'rest_saffron', branch_id: 'br_saffron_marina', table_number: '102', label: 'Table 102 — Hearth Booth', capacity: 6, location_area: 'indoor', status: 'active', created_at: '2025-02-01T10:00:00Z' }
  ];

  qrTokens: QRToken[] = [
    { id: 'qr_vr_01', restaurant_id: 'rest_velvet', branch_id: 'br_velvet_main', table_id: 'tbl_vr_01', token_opaque: 'PZ-VELVET-T01-9F3A8C', token_hash: 'hash_vr01', status: 'active', scan_count: 42, created_at: '2025-01-15T08:00:00Z' },
    { id: 'qr_vr_02', restaurant_id: 'rest_velvet', branch_id: 'br_velvet_main', table_id: 'tbl_vr_02', token_opaque: 'PZ-VELVET-T02-4D7B1E', token_hash: 'hash_vr02', status: 'active', scan_count: 89, created_at: '2025-01-15T08:00:00Z' },
    { id: 'qr_vr_03', restaurant_id: 'rest_velvet', branch_id: 'br_velvet_main', table_id: 'tbl_vr_03', token_opaque: 'PZ-VELVET-T03-8E2C5A', token_hash: 'hash_vr03', status: 'active', scan_count: 64, created_at: '2025-01-15T08:00:00Z' },
    { id: 'qr_vr_04', restaurant_id: 'rest_velvet', branch_id: 'br_velvet_main', table_id: 'tbl_vr_04', token_opaque: 'PZ-VELVET-T04-1C9F4B', token_hash: 'hash_vr04', status: 'active', scan_count: 19, created_at: '2025-01-15T08:00:00Z' },
    { id: 'qr_vr_05', restaurant_id: 'rest_velvet', branch_id: 'br_velvet_main', table_id: 'tbl_vr_05', token_opaque: 'PZ-VELVET-T05-7B3E6D', token_hash: 'hash_vr05', status: 'active', scan_count: 55, created_at: '2025-01-15T08:00:00Z' },
    { id: 'qr_ss_01', restaurant_id: 'rest_saffron', branch_id: 'br_saffron_marina', table_id: 'tbl_ss_01', token_opaque: 'PZ-SAFFRON-T101-3A5D9F', token_hash: 'hash_ss01', status: 'active', scan_count: 112, created_at: '2025-02-01T10:00:00Z' },
    { id: 'qr_ss_02', restaurant_id: 'rest_saffron', branch_id: 'br_saffron_marina', table_id: 'tbl_ss_02', token_opaque: 'PZ-SAFFRON-T102-6B8E2C', token_hash: 'hash_ss02', status: 'active', scan_count: 97, created_at: '2025-02-01T10:00:00Z' }
  ];

  categories: MenuCategory[] = [
    { id: 'cat_vr_coffee', restaurant_id: 'rest_velvet', name: 'Specialty Espresso & Brews', description: 'Single-origin beans roasted on-site', sort_order: 1, is_visible: true, created_at: '2025-01-15T08:00:00Z' },
    { id: 'cat_vr_brunch', restaurant_id: 'rest_velvet', name: 'Artisan Brunch & Bowls', description: 'Scratch-baked sourdough and farm eggs', sort_order: 2, is_visible: true, created_at: '2025-01-15T08:00:00Z' },
    { id: 'cat_vr_bakery', restaurant_id: 'rest_velvet', name: 'Pastry & Dessert Studio', description: 'Laminated morning viennoiserie', sort_order: 3, is_visible: true, created_at: '2025-01-15T08:00:00Z' },
    { id: 'cat_ss_tapas', restaurant_id: 'rest_saffron', name: 'Mediterranean Crudo & Tapas', description: 'Cold-pressed oils and wild catch', sort_order: 1, is_visible: true, created_at: '2025-02-01T10:00:00Z' },
    { id: 'cat_ss_mains', restaurant_id: 'rest_saffron', name: 'Wood-Fired Hearth & Pastas', description: 'Extruded daily bronze-die pastas', sort_order: 2, is_visible: true, created_at: '2025-02-01T10:00:00Z' }
  ];

  menuItems: MenuItem[] = [
    {
      id: 'item_cortado',
      restaurant_id: 'rest_velvet',
      category_id: 'cat_vr_coffee',
      name: 'Single-Origin Ethiopian Cortado',
      description: 'Equal parts textured microfoam milk and double extraction of Yirgacheffe washed Heirloom beans.',
      price: 5.25,
      image_url: '/assets/images/hero_cafe_ambiance_1792076061364.jpg',
      dietary_tags: ['vegetarian'],
      is_available: true,
      prep_time_minutes: 5,
      sort_order: 1,
      created_at: '2025-01-15T08:00:00Z',
      updated_at: '2025-01-15T08:00:00Z'
    },
    {
      id: 'item_avocado_toast',
      restaurant_id: 'rest_velvet',
      category_id: 'cat_vr_brunch',
      name: 'Avocado Tartine on House Sourdough',
      description: 'Crushed Haas avocado, shaved radish, pickled shallots, biodynamic poached egg, zaatar, microgreens.',
      price: 15.50,
      image_url: '/assets/images/food_artisan_brunch_1792076061615.jpg',
      dietary_tags: ['vegetarian', 'chef_special'],
      is_available: true,
      prep_time_minutes: 12,
      sort_order: 1,
      created_at: '2025-01-15T08:00:00Z',
      updated_at: '2025-01-15T08:00:00Z'
    },
    {
      id: 'item_cheesecake',
      restaurant_id: 'rest_velvet',
      category_id: 'cat_vr_bakery',
      name: 'Basque Burnt Cheesecake & Blackberry Compote',
      description: 'Caramelized crust with ultra-creamy interior, infused with Madagascar vanilla bean and Oregon berries.',
      price: 9.75,
      image_url: '/assets/images/food_berry_cheesecake_1792076061677.jpg',
      dietary_tags: ['vegetarian', 'gluten_free'],
      is_available: true,
      prep_time_minutes: 4,
      sort_order: 1,
      created_at: '2025-01-15T08:00:00Z',
      updated_at: '2025-01-15T08:00:00Z'
    },
    {
      id: 'item_truffle_tagliatelle',
      restaurant_id: 'rest_saffron',
      category_id: 'cat_ss_mains',
      name: 'Black Truffle Hand-Cut Tagliatelle',
      description: 'Hand-extruded semolina ribbons, cultured butter emulsion, 36-month Parmigiano-Reggiano, fresh Umbrian black truffle.',
      price: 28.00,
      image_url: '/assets/images/food_truffle_pasta_1792076063325.jpg',
      dietary_tags: ['vegetarian', 'chef_special'],
      is_available: true,
      prep_time_minutes: 18,
      sort_order: 1,
      created_at: '2025-02-01T10:00:00Z',
      updated_at: '2025-02-01T10:00:00Z'
    }
  ];

  orders: Order[] = [];

  staff: StaffMember[] = [
    { id: 'usr_superadmin', restaurant_id: null, name: 'Penta Prizm Platform Owner', email: 'admin@pentaprizm.app', role: 'super_admin', branch_ids: [], is_active: true, created_at: '2025-01-01T00:00:00Z' },
    { id: 'usr_elena', restaurant_id: 'rest_velvet', name: 'Elena Rostova', email: 'elena@velvetroastcafe.com', role: 'restaurant_admin', branch_ids: ['br_velvet_main', 'br_velvet_downtown'], is_active: true, created_at: '2025-01-15T08:00:00Z' },
    { id: 'usr_marco', restaurant_id: 'rest_velvet', name: 'Marco Silva', email: 'marco@velvetroastcafe.com', role: 'manager', branch_ids: ['br_velvet_main'], is_active: true, created_at: '2025-01-15T08:00:00Z' },
    { id: 'usr_aria', restaurant_id: 'rest_velvet', name: 'Aria Chen', email: 'aria@velvetroastcafe.com', role: 'kitchen_staff', branch_ids: ['br_velvet_main'], is_active: true, created_at: '2025-01-15T08:00:00Z' },
    { id: 'usr_julian', restaurant_id: 'rest_saffron', name: 'Julian Thorne', email: 'julian@saffronandsage.com', role: 'restaurant_admin', branch_ids: ['br_saffron_marina'], is_active: true, created_at: '2025-02-01T10:00:00Z' },
    { id: 'usr_dante', restaurant_id: 'rest_saffron', name: 'Dante Rossi', email: 'dante@saffronandsage.com', role: 'kitchen_staff', branch_ids: ['br_saffron_marina'], is_active: true, created_at: '2025-02-01T10:00:00Z' }
  ];

  plans: SubscriptionPlan[] = [
    { id: 'plan_starter', name: 'Starter Café', code: 'starter', tagline: 'Ideal for independent coffee shops', price_monthly: 49, max_branches: 1, max_tables: 20, max_staff: 5, transaction_fee_percent: 1.5, features: ['Single location', 'QR Table Ordering', 'Kitchen Display System', 'Daily Sales Reports'] },
    { id: 'plan_growth', name: 'Growth Restaurant', code: 'growth', tagline: 'Built for high-volume bistros', price_monthly: 129, max_branches: 3, max_tables: 60, max_staff: 20, transaction_fee_percent: 0.9, features: ['Up to 3 branches', 'Custom Domain Support', 'Advanced Staff Roles', 'Real-time KDS Alerts'] },
    { id: 'plan_enterprise', name: 'Enterprise Fleet', code: 'enterprise', tagline: 'Complete governance for franchise networks', price_monthly: 299, max_branches: 25, max_tables: 500, max_staff: 100, transaction_fee_percent: 0.4, features: ['Multi-branch franchise mesh', 'Dedicated SLA', 'White-label custom portal', 'API POS Sync'] }
  ];

  subscriptions: RestaurantSubscription[] = [
    { id: 'sub_vr', restaurant_id: 'rest_velvet', plan_id: 'plan_growth', status: 'active', current_period_start: '2025-01-01T00:00:00Z', current_period_end: '2026-01-01T00:00:00Z', auto_renew: true, created_at: '2025-01-01T00:00:00Z' },
    { id: 'sub_ss', restaurant_id: 'rest_saffron', plan_id: 'plan_enterprise', status: 'active', current_period_start: '2025-02-01T00:00:00Z', current_period_end: '2026-02-01T00:00:00Z', auto_renew: true, created_at: '2025-02-01T00:00:00Z' }
  ];

  auditLogs: AuditLog[] = [];
}

const memory = new MemoryStore();

export const supabaseRepository = {
  // Restaurants
  async getAllRestaurants(): Promise<Restaurant[]> {
    if (supabaseAdminClient) {
      const { data, error } = await supabaseAdminClient.from('restaurants').select('*');
      if (!error && data && data.length > 0) return data as Restaurant[];
    }
    return memory.restaurants;
  },

  async getRestaurantById(id: string): Promise<Restaurant | null> {
    if (supabaseAdminClient) {
      const { data, error } = await supabaseAdminClient.from('restaurants').select('*').eq('id', id).maybeSingle();
      if (!error && data) return data as Restaurant;
    }
    return memory.restaurants.find(r => r.id === id) || null;
  },

  async getRestaurantBySlug(slug: string): Promise<Restaurant | null> {
    if (supabaseAdminClient) {
      const { data, error } = await supabaseAdminClient.from('restaurants').select('*').eq('slug', slug).maybeSingle();
      if (!error && data) return data as Restaurant;
    }
    return memory.restaurants.find(r => r.slug === slug || r.subdomain === slug) || null;
  },

  async getRestaurantByHostname(hostname: string): Promise<Restaurant | null> {
    const cleanHost = hostname.toLowerCase();
    if (supabaseAdminClient) {
      const { data, error } = await supabaseAdminClient.from('restaurants').select('*').eq('custom_domain', cleanHost).maybeSingle();
      if (!error && data) return data as Restaurant;
    }
    return memory.restaurants.find(r => r.custom_domain?.toLowerCase() === cleanHost || cleanHost.includes(r.subdomain.toLowerCase())) || null;
  },

  async createRestaurant(rest: Restaurant): Promise<Restaurant> {
    if (supabaseAdminClient) {
      const { data, error } = await supabaseAdminClient.from('restaurants').insert(rest).select().maybeSingle();
      if (!error && data) return data as Restaurant;
    }
    memory.restaurants.push(rest);
    return rest;
  },

  async updateRestaurant(id: string, updates: Partial<Restaurant>): Promise<Restaurant | null> {
    if (supabaseAdminClient) {
      const { data, error } = await supabaseAdminClient.from('restaurants').update(updates).eq('id', id).select().maybeSingle();
      if (!error && data) return data as Restaurant;
    }
    const idx = memory.restaurants.findIndex(r => r.id === id);
    if (idx !== -1) {
      memory.restaurants[idx] = { ...memory.restaurants[idx], ...updates, updated_at: new Date().toISOString() };
      return memory.restaurants[idx];
    }
    return null;
  },

  // Branches & Tables
  async getBranchesByRestaurant(restaurantId: string): Promise<Branch[]> {
    if (supabaseAdminClient) {
      const { data, error } = await supabaseAdminClient.from('branches').select('*').eq('restaurant_id', restaurantId);
      if (!error && data) return data as Branch[];
    }
    return memory.branches.filter(b => b.restaurant_id === restaurantId);
  },

  async getTablesByRestaurant(restaurantId: string): Promise<RestaurantTable[]> {
    if (supabaseAdminClient) {
      const { data, error } = await supabaseAdminClient.from('restaurant_tables').select('*').eq('restaurant_id', restaurantId);
      if (!error && data) return data as RestaurantTable[];
    }
    return memory.tables.filter(t => t.restaurant_id === restaurantId);
  },

  async createTable(table: RestaurantTable): Promise<RestaurantTable> {
    if (supabaseAdminClient) {
      const { data, error } = await supabaseAdminClient.from('restaurant_tables').insert(table).select().maybeSingle();
      if (!error && data) return data as RestaurantTable;
    }
    memory.tables.push(table);
    return table;
  },

  // QR Tokens
  async getQRTokenByOpaque(tokenOpaque: string): Promise<QRToken | null> {
    if (supabaseAdminClient) {
      const { data, error } = await supabaseAdminClient.from('qr_tokens').select('*').eq('token_opaque', tokenOpaque).maybeSingle();
      if (!error && data) return data as QRToken;
    }
    return memory.qrTokens.find(q => q.token_opaque === tokenOpaque && q.status === 'active') || null;
  },

  async getQRTokensByRestaurant(restaurantId: string): Promise<QRToken[]> {
    if (supabaseAdminClient) {
      const { data, error } = await supabaseAdminClient.from('qr_tokens').select('*').eq('restaurant_id', restaurantId);
      if (!error && data) return data as QRToken[];
    }
    return memory.qrTokens.filter(q => q.restaurant_id === restaurantId);
  },

  async upsertQRToken(token: QRToken): Promise<QRToken> {
    if (supabaseAdminClient) {
      const { data, error } = await supabaseAdminClient.from('qr_tokens').upsert(token).select().maybeSingle();
      if (!error && data) return data as QRToken;
    }
    const idx = memory.qrTokens.findIndex(q => q.table_id === token.table_id);
    if (idx !== -1) {
      memory.qrTokens[idx] = token;
    } else {
      memory.qrTokens.push(token);
    }
    return token;
  },

  async incrementQRScan(tokenOpaque: string): Promise<void> {
    if (supabaseAdminClient) {
      await supabaseAdminClient.rpc('increment_qr_scan', { opaque_token: tokenOpaque });
    }
    const t = memory.qrTokens.find(q => q.token_opaque === tokenOpaque);
    if (t) {
      t.scan_count += 1;
      t.last_scanned_at = new Date().toISOString();
    }
  },

  // Menu Categories & Items
  async getCategoriesByRestaurant(restaurantId: string): Promise<MenuCategory[]> {
    if (supabaseAdminClient) {
      const { data, error } = await supabaseAdminClient.from('menu_categories').select('*').eq('restaurant_id', restaurantId).order('sort_order');
      if (!error && data) return data as MenuCategory[];
    }
    return memory.categories.filter(c => c.restaurant_id === restaurantId);
  },

  async getMenuItemsByRestaurant(restaurantId: string): Promise<MenuItem[]> {
    if (supabaseAdminClient) {
      const { data, error } = await supabaseAdminClient.from('menu_items').select('*').eq('restaurant_id', restaurantId).order('sort_order');
      if (!error && data) return data as MenuItem[];
    }
    return memory.menuItems.filter(m => m.restaurant_id === restaurantId);
  },

  async createMenuItem(item: MenuItem): Promise<MenuItem> {
    if (supabaseAdminClient) {
      const { data, error } = await supabaseAdminClient.from('menu_items').insert(item).select().maybeSingle();
      if (!error && data) return data as MenuItem;
    }
    memory.menuItems.push(item);
    return item;
  },

  async updateMenuItem(id: string, updates: Partial<MenuItem>): Promise<MenuItem | null> {
    if (supabaseAdminClient) {
      const { data, error } = await supabaseAdminClient.from('menu_items').update(updates).eq('id', id).select().maybeSingle();
      if (!error && data) return data as MenuItem;
    }
    const idx = memory.menuItems.findIndex(m => m.id === id);
    if (idx !== -1) {
      memory.menuItems[idx] = { ...memory.menuItems[idx], ...updates, updated_at: new Date().toISOString() };
      return memory.menuItems[idx];
    }
    return null;
  },

  async deleteMenuItem(id: string): Promise<boolean> {
    if (supabaseAdminClient) {
      const { error } = await supabaseAdminClient.from('menu_items').delete().eq('id', id);
      return !error;
    }
    const initialLen = memory.menuItems.length;
    memory.menuItems = memory.menuItems.filter(m => m.id !== id);
    return memory.menuItems.length < initialLen;
  },

  // Orders
  async createOrder(order: Order): Promise<Order> {
    if (supabaseAdminClient) {
      const { data, error } = await supabaseAdminClient.from('orders').insert(order).select().maybeSingle();
      if (!error && data) return data as Order;
    }
    memory.orders.unshift(order);
    return order;
  },

  async getOrdersByRestaurant(restaurantId: string): Promise<Order[]> {
    if (supabaseAdminClient) {
      const { data, error } = await supabaseAdminClient.from('orders').select('*').eq('restaurant_id', restaurantId).order('created_at', { ascending: false });
      if (!error && data) return data as Order[];
    }
    return memory.orders.filter(o => o.restaurant_id === restaurantId);
  },

  async getOrderByTrackingToken(trackingToken: string): Promise<Order | null> {
    if (supabaseAdminClient) {
      const { data, error } = await supabaseAdminClient.from('orders').select('*').eq('tracking_token', trackingToken).maybeSingle();
      if (!error && data) return data as Order;
    }
    return memory.orders.find(o => o.tracking_token === trackingToken) || null;
  },

  async updateOrderStatus(orderId: string, status: OrderStatus, note?: string, actorName?: string): Promise<Order | null> {
    const statusEvent = { status, timestamp: new Date().toISOString(), note, actor_name: actorName };
    const order = memory.orders.find(o => o.id === orderId);
    if (order) {
      order.status = status;
      order.status_history.push(statusEvent);
      order.updated_at = new Date().toISOString();
      if (supabaseAdminClient) {
        await supabaseAdminClient.from('orders').update({
          status,
          status_history: order.status_history,
          updated_at: order.updated_at
        }).eq('id', orderId);
      }
      return order;
    }
    return null;
  },

  // Staff & Subscriptions
  async getStaffByEmail(email: string): Promise<StaffMember | null> {
    if (supabaseAdminClient) {
      const { data, error } = await supabaseAdminClient.from('staff_members').select('*').eq('email', email).maybeSingle();
      if (!error && data) return data as StaffMember;
    }
    return memory.staff.find(s => s.email.toLowerCase() === email.toLowerCase()) || null;
  },

  async createStaff(staff: StaffMember): Promise<StaffMember> {
    if (supabaseAdminClient) {
      const { data, error } = await supabaseAdminClient.from('staff_members').insert(staff).select().maybeSingle();
      if (!error && data) return data as StaffMember;
    }
    memory.staff.push(staff);
    return staff;
  },

  async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    if (supabaseAdminClient) {
      const { data, error } = await supabaseAdminClient.from('subscription_plans').select('*');
      if (!error && data) return data as SubscriptionPlan[];
    }
    return memory.plans;
  },

  async getSubscriptions(): Promise<RestaurantSubscription[]> {
    return memory.subscriptions;
  },

  async addAuditLog(log: AuditLog): Promise<void> {
    memory.auditLogs.unshift(log);
  }
};
