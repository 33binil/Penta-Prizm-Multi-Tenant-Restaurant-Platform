import crypto from 'crypto';
import { supabaseRepository } from '../repositories/supabaseRepository.js';
import { StaffMember, StaffRole, Restaurant } from '../types.js';
import { AuthenticatedUser } from '../middleware/auth.js';

interface SessionData {
  user: AuthenticatedUser;
  expiresAt: number;
}

const activeSessions = new Map<string, SessionData>();

// Seed default credentials
const DEFAULT_PASSWORDS: Record<string, string> = {
  'admin@pentaprizm.app': 'password123',
  'elena@velvetroastcafe.com': 'password123',
  'marco@velvetroastcafe.com': 'password123',
  'aria@velvetroastcafe.com': 'password123',
  'julian@saffronandsage.com': 'password123',
  'dante@saffronandsage.com': 'password123'
};

export const authService = {
  async resolveStaffProfileByEmail(email: string): Promise<AuthenticatedUser | null> {
    const staff = await supabaseRepository.getStaffByEmail(email);
    if (!staff || !staff.is_active) return null;
    return {
      id: staff.id,
      email: staff.email,
      name: staff.name,
      role: staff.role,
      restaurant_id: staff.restaurant_id,
      branch_ids: staff.branch_ids
    };
  },

  async login(email: string, password: string, targetRestaurantId?: string): Promise<{ token: string; user: AuthenticatedUser }> {
    const cleanEmail = email.trim().toLowerCase();
    const expectedPassword = DEFAULT_PASSWORDS[cleanEmail];

    if (!expectedPassword || expectedPassword !== password) {
      throw new Error('Invalid email or password');
    }

    const staff = await supabaseRepository.getStaffByEmail(cleanEmail);
    if (!staff) {
      throw new Error('No staff account found for this email');
    }

    if (!staff.is_active) {
      throw new Error('This account has been deactivated. Contact your administrator.');
    }

    // Role-tenant scope verification
    if (staff.role !== 'super_admin' && targetRestaurantId && staff.restaurant_id !== targetRestaurantId) {
      throw new Error('Unauthorized: You do not have access to this restaurant workspace.');
    }

    const token = crypto.randomBytes(32).toString('hex');
    const user: AuthenticatedUser = {
      id: staff.id,
      email: staff.email,
      name: staff.name,
      role: staff.role,
      restaurant_id: staff.restaurant_id,
      branch_ids: staff.branch_ids
    };

    // Session valid for 24 hours
    activeSessions.set(token, {
      user,
      expiresAt: Date.now() + 24 * 60 * 60 * 1000
    });

    return { token, user };
  },

  async registerAdmin(params: {
    name: string;
    email: string;
    password: string;
    restaurantName: string;
    tagline?: string;
  }): Promise<{ token: string; user: AuthenticatedUser; restaurant: Restaurant }> {
    const cleanEmail = params.email.trim().toLowerCase();

    const existingStaff = await supabaseRepository.getStaffByEmail(cleanEmail);
    if (existingStaff) {
      throw new Error('An account with this email address already exists');
    }

    const slug = params.restaurantName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
    const restId = `rest_${Date.now().toString(36)}`;
    const branchId = `br_${Date.now().toString(36)}`;
    const staffId = `usr_${Date.now().toString(36)}`;

    const newRestaurant: Restaurant = {
      id: restId,
      name: params.restaurantName,
      slug,
      subdomain: slug,
      custom_domain: null,
      domain_verified: false,
      logo_url: '🍽️',
      brand_color: '#0f172a',
      accent_color: '#3b82f6',
      currency: 'USD',
      currency_symbol: '$',
      tax_rate_percent: 8.0,
      service_charge_percent: 0.0,
      status: 'active',
      description: params.tagline || 'Fresh gourmet dining experience',
      tagline: params.tagline || 'Artisanal Cuisine',
      phone: '',
      email: cleanEmail,
      address: '',
      opening_hours: '9:00 AM – 10:00 PM',
      hero_image_url: '/assets/images/hero_cafe_ambiance_1792076061364.jpg',
      is_ordering_enabled: true,
      allowed_payment_methods: ['counter', 'table', 'online'],
      website_settings: {
        hero_title: `Welcome to ${params.restaurantName}`,
        hero_subtitle: 'Handcrafted seasonal dishes made with locally sourced ingredients.',
        about_text: 'Passionate culinary artisans delivering remarkable hospitality.',
        chef_note: 'Prepared fresh to order every day.'
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    await supabaseRepository.createRestaurant(newRestaurant);

    // Initial branch
    await supabaseRepository.createTable({
      id: `tbl_${Date.now().toString(36)}_1`,
      restaurant_id: restId,
      branch_id: branchId,
      table_number: '01',
      label: 'Table 01 — Main Dining',
      capacity: 4,
      location_area: 'indoor',
      status: 'active',
      created_at: new Date().toISOString()
    });

    // Staff member
    const newStaff: StaffMember = {
      id: staffId,
      restaurant_id: restId,
      name: params.name,
      email: cleanEmail,
      role: 'restaurant_admin',
      branch_ids: [branchId],
      is_active: true,
      created_at: new Date().toISOString()
    };

    await supabaseRepository.createStaff(newStaff);
    DEFAULT_PASSWORDS[cleanEmail] = params.password;

    const token = crypto.randomBytes(32).toString('hex');
    const user: AuthenticatedUser = {
      id: newStaff.id,
      email: newStaff.email,
      name: newStaff.name,
      role: newStaff.role,
      restaurant_id: restId,
      branch_ids: newStaff.branch_ids
    };

    activeSessions.set(token, {
      user,
      expiresAt: Date.now() + 24 * 60 * 60 * 1000
    });

    return { token, user, restaurant: newRestaurant };
  },

  async verifySessionToken(token: string): Promise<AuthenticatedUser | null> {
    const session = activeSessions.get(token);
    if (!session) return null;
    if (session.expiresAt < Date.now()) {
      activeSessions.delete(token);
      return null;
    }
    return session.user;
  },

  async logout(token: string): Promise<void> {
    activeSessions.delete(token);
  }
};
