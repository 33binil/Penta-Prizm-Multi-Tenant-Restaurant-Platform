import {
  Restaurant,
  Branch,
  RestaurantTable,
  QRToken,
  ValidatedQRSession,
  MenuCategory,
  MenuItem,
  Order,
  OrderStatus,
  SubscriptionPlan,
  RestaurantSubscription
} from '../types';

const API_BASE = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');

function getAuthToken(): string | null {
  try {
    const raw = localStorage.getItem('pentaprizm_auth_session_v1');
    if (raw) {
      const parsed = JSON.parse(raw);
      return parsed.token || null;
    }
  } catch {}
  return null;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  
  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const token = getAuthToken();
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(url, {
    ...options,
    headers
  });

  const contentType = response.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await response.json() : await response.text();

  if (!response.ok) {
    const errMsg = typeof data === 'object' && data && (data as any).error 
      ? (data as any).error 
      : `HTTP ${response.status}: ${response.statusText}`;
    throw new Error(errMsg);
  }

  return data as T;
}

export const api = {
  // Health
  async health(): Promise<{ status: string; service: string; timestamp: string; uptime: number }> {
    return request('/health');
  },

  // Public Endpoints
  async getPublicRestaurant(params: { hostname?: string; slug?: string; restaurantId?: string } = {}): Promise<{ restaurant: Restaurant }> {
    const query = new URLSearchParams();
    if (params.hostname) query.set('hostname', params.hostname);
    if (params.slug) query.set('slug', params.slug);
    if (params.restaurantId) query.set('restaurantId', params.restaurantId);
    return request(`/public/restaurant?${query.toString()}`);
  },

  async validateQRToken(token: string): Promise<{ session: ValidatedQRSession }> {
    return request('/public/qr/validate', {
      method: 'POST',
      body: JSON.stringify({ token })
    });
  },

  async getPublicMenu(restaurantId: string): Promise<{ categories: MenuCategory[]; items: MenuItem[] }> {
    return request(`/public/menu?restaurantId=${encodeURIComponent(restaurantId)}`);
  },

  async createOrder(payload: {
    restaurantId: string;
    branchId: string;
    tableId: string;
    tableLabel?: string;
    branchName?: string;
    items: any[];
    paymentMethod?: string;
    customerNotes?: string;
    tip?: number;
  }): Promise<{ order: Order; trackingUrl: string }> {
    return request('/public/orders', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  async getOrderByTrackingToken(trackingToken: string): Promise<{ order: Order }> {
    return request(`/public/orders/${encodeURIComponent(trackingToken)}`);
  },

  // Auth Endpoints
  async login(credentials: { email: string; password: string; restaurantId?: string }): Promise<{ token: string; user: any }> {
    return request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
  },

  async registerAdmin(payload: {
    name: string;
    email: string;
    password: string;
    restaurantName: string;
    tagline?: string;
  }): Promise<{ token: string; user: any; restaurant: Restaurant }> {
    return request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  async logout(): Promise<{ success: boolean }> {
    try {
      return await request('/auth/logout', { method: 'POST' });
    } catch {
      return { success: true };
    }
  },

  async getMe(): Promise<{ user: any }> {
    return request('/auth/me');
  },

  // Admin Endpoints
  async getAdminDashboard(): Promise<{
    restaurant: Restaurant;
    metrics: any;
    recentOrders: Order[];
    branches: Branch[];
    tables: RestaurantTable[];
    qrTokens: QRToken[];
  }> {
    return request('/admin/dashboard');
  },

  async getAdminMenu(): Promise<{ categories: MenuCategory[]; items: MenuItem[] }> {
    return request('/admin/menu');
  },

  async createMenuItem(item: Partial<MenuItem>): Promise<{ item: MenuItem }> {
    return request('/admin/menu', {
      method: 'POST',
      body: JSON.stringify(item)
    });
  },

  async updateMenuItem(id: string, updates: Partial<MenuItem>): Promise<{ item: MenuItem }> {
    return request(`/admin/menu/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify(updates)
    });
  },

  async deleteMenuItem(id: string): Promise<{ success: boolean }> {
    return request(`/admin/menu/${encodeURIComponent(id)}`, {
      method: 'DELETE'
    });
  },

  async getAdminBranches(): Promise<{ branches: Branch[] }> {
    return request('/admin/branches');
  },

  async getAdminTables(): Promise<{ tables: RestaurantTable[]; qrTokens: QRToken[] }> {
    return request('/admin/tables');
  },

  async createAdminTable(table: Partial<RestaurantTable>): Promise<{ table: RestaurantTable }> {
    return request('/admin/tables', {
      method: 'POST',
      body: JSON.stringify(table)
    });
  },

  async generateTableQR(tableId: string): Promise<{ qrToken: QRToken }> {
    return request(`/admin/tables/${encodeURIComponent(tableId)}/qr`, {
      method: 'POST'
    });
  },

  async getAdminOrders(): Promise<{ orders: Order[] }> {
    return request('/admin/orders');
  },

  async updateAdminOrderStatus(orderId: string, status: OrderStatus, note?: string): Promise<{ order: Order }> {
    return request(`/admin/orders/${encodeURIComponent(orderId)}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, note })
    });
  },

  async updateAdminRestaurant(updates: Partial<Restaurant>): Promise<{ restaurant: Restaurant }> {
    return request('/admin/restaurant', {
      method: 'PATCH',
      body: JSON.stringify(updates)
    });
  },

  // Kitchen Endpoints
  async getKitchenOrders(): Promise<{ orders: Order[] }> {
    return request('/kitchen/orders');
  },

  async updateKitchenOrderStatus(orderId: string, status: OrderStatus, note?: string): Promise<{ order: Order }> {
    return request(`/kitchen/orders/${encodeURIComponent(orderId)}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, note })
    });
  },

  // Super Admin Endpoints
  async getSuperAdminRestaurants(): Promise<{ restaurants: Restaurant[] }> {
    return request('/super-admin/restaurants');
  },

  async createSuperAdminRestaurant(payload: Partial<Restaurant>): Promise<{ restaurant: Restaurant }> {
    return request('/super-admin/restaurants', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  async updateSuperAdminRestaurant(id: string, payload: Partial<Restaurant>): Promise<{ restaurant: Restaurant }> {
    return request(`/super-admin/restaurants/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify(payload)
    });
  },

  async getSuperAdminMetrics(): Promise<{
    totalRestaurants: number;
    activeTenants: number;
    suspendedTenants: number;
    mrr: number;
    plans: SubscriptionPlan[];
    subscriptions: RestaurantSubscription[];
  }> {
    return request('/super-admin/metrics');
  },

  async getSuperAdminPlans(): Promise<{ plans: SubscriptionPlan[] }> {
    return request('/super-admin/plans');
  }
};
