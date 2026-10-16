export type TenantStatus = 'active' | 'suspended';
export type BranchStatus = 'active' | 'inactive';
export type TableStatus = 'active' | 'inactive';
export type QRTokenStatus = 'active' | 'revoked';
export type OrderStatus = 'pending' | 'accepted' | 'preparing' | 'ready' | 'served' | 'cancelled';
export type PaymentMethod = 'counter' | 'table' | 'online';
export type PaymentStatus = 'unpaid' | 'paid';
export type StaffRole = 'super_admin' | 'restaurant_admin' | 'manager' | 'kitchen_staff' | 'agent';

export interface Restaurant {
  id: string;
  name: string;
  slug: string;
  subdomain: string;
  custom_domain: string | null;
  domain_verified: boolean;
  logo_url: string;
  brand_color: string;
  accent_color: string;
  currency: string;
  currency_symbol: string;
  tax_rate_percent: number;
  service_charge_percent: number;
  status: TenantStatus;
  description: string;
  tagline: string;
  phone: string;
  email: string;
  address: string;
  opening_hours: string;
  hero_image_url: string;
  is_ordering_enabled: boolean;
  allowed_payment_methods: PaymentMethod[];
  website_settings: {
    hero_title: string;
    hero_subtitle: string;
    about_text: string;
    chef_note: string;
    social_instagram?: string;
    social_facebook?: string;
  };
  created_at: string;
  updated_at: string;
}

export interface Branch {
  id: string;
  restaurant_id: string;
  name: string;
  code: string;
  address: string;
  phone: string;
  opening_hours: string;
  status: BranchStatus;
  created_at: string;
}

export interface RestaurantTable {
  id: string;
  restaurant_id: string;
  branch_id: string;
  table_number: string;
  label: string;
  capacity: number;
  location_area: 'indoor' | 'patio' | 'bar' | 'terrace';
  status: TableStatus;
  created_at: string;
}

export interface QRToken {
  id: string;
  restaurant_id: string;
  branch_id: string;
  table_id: string;
  token_opaque: string;
  token_hash: string;
  status: QRTokenStatus;
  scan_count: number;
  last_scanned_at?: string;
  created_at: string;
}

export interface ValidatedQRSession {
  sessionId: string;
  restaurant: Restaurant;
  branch: Branch;
  table: RestaurantTable;
  tokenOpaque: string;
  expiresAt: string;
  createdAt: string;
}

export interface MenuCategory {
  id: string;
  restaurant_id: string;
  name: string;
  description: string;
  sort_order: number;
  is_visible: boolean;
  created_at: string;
}

export interface AddonOption {
  id: string;
  name: string;
  price: number;
}

export interface AddonGroup {
  id: string;
  name: string;
  required: boolean;
  min_selection: number;
  max_selection: number;
  options: AddonOption[];
}

export interface MenuItem {
  id: string;
  restaurant_id: string;
  category_id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  dietary_tags: ('vegetarian' | 'vegan' | 'gluten_free' | 'chef_special' | 'spicy')[];
  is_available: boolean;
  prep_time_minutes: number;
  sort_order: number;
  addons?: AddonGroup[];
  branch_availability?: Record<string, boolean>; // branch_id -> boolean
  created_at: string;
  updated_at: string;
}

export interface SelectedAddon {
  groupId: string;
  groupName: string;
  optionId: string;
  optionName: string;
  price: number;
}

export interface CartItem {
  cartItemId: string;
  menuItem: MenuItem;
  quantity: number;
  selectedAddons: SelectedAddon[];
  specialInstructions: string;
  unitPrice: number;
  totalPrice: number;
}

export interface OrderItemSnapshot {
  id: string;
  menu_item_id: string;
  name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  selected_addons: SelectedAddon[];
  special_instructions?: string;
}

export interface OrderStatusEvent {
  status: OrderStatus;
  timestamp: string;
  note?: string;
  actor_name?: string;
}

export interface Order {
  id: string;
  order_number: string;
  restaurant_id: string;
  branch_id: string;
  table_id: string;
  table_label: string;
  branch_name: string;
  tracking_token: string;
  customer_name?: string;
  customer_phone?: string;
  customer_note?: string;
  items: OrderItemSnapshot[];
  subtotal: number;
  tax_amount: number;
  service_charge: number;
  total_amount: number;
  currency_symbol: string;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  status: OrderStatus;
  cancellation_reason?: string;
  estimated_prep_minutes: number;
  created_at: string;
  updated_at: string;
  status_history: OrderStatusEvent[];
}

export interface StaffMember {
  id: string;
  restaurant_id: string;
  name: string;
  email: string;
  role: StaffRole;
  branch_ids: string[]; // empty means all branches
  status: 'active' | 'inactive';
  created_at: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  code: 'starter' | 'growth' | 'enterprise';
  tagline: string;
  price_monthly: number;
  max_branches: number;
  max_tables: number;
  max_staff: number;
  transaction_fee_percent: number;
  features: string[];
}

export interface RestaurantSubscription {
  id: string;
  restaurant_id: string;
  plan_id: string;
  status: 'trialing' | 'active' | 'past_due' | 'canceled';
  trial_ends_at: string;
  current_period_end: string;
}

export interface AuditLog {
  id: string;
  restaurant_id?: string;
  actor_name: string;
  actor_role: string;
  action: string;
  details: string;
  created_at: string;
}
