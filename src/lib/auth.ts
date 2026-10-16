import { StaffMember, StaffRole, Restaurant } from '../types';
import { db } from './database';

const SESSION_STORAGE_KEY = 'pentaprizm_auth_session_v1';
const PASSWORDS_STORAGE_KEY = 'pentaprizm_passwords_v1';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: StaffRole;
  restaurant_id: string | null;
  branch_ids: string[];
  restaurant_name?: string;
}

export interface AuthSession {
  token: string;
  user: AuthUser;
  expires_at: string;
}

// Initial passwords map
const DEFAULT_PASSWORDS: Record<string, string> = {
  'elena@velvetroastcafe.com': 'password123',
  'marco@velvetroastcafe.com': 'password123',
  'aria@velvetroastcafe.com': 'password123',
  'julian@saffronandsage.com': 'password123',
  'dante@saffronandsage.com': 'password123',
  'admin@pentaprizm.app': 'password123'
};

type AuthListener = (user: AuthUser | null) => void;

class AuthService {
  private currentSession: AuthSession | null = null;
  private listeners: Set<AuthListener> = new Set();
  private userPasswords: Record<string, string>;

  constructor() {
    this.userPasswords = this.loadPasswords();
    this.currentSession = this.loadSession();
  }

  private loadPasswords(): Record<string, string> {
    try {
      const stored = localStorage.getItem(PASSWORDS_STORAGE_KEY);
      if (stored) {
        return { ...DEFAULT_PASSWORDS, ...JSON.parse(stored) };
      }
    } catch {}
    return { ...DEFAULT_PASSWORDS };
  }

  private savePasswords() {
    try {
      localStorage.setItem(PASSWORDS_STORAGE_KEY, JSON.stringify(this.userPasswords));
    } catch (e) {
      console.error('Failed to save passwords:', e);
    }
  }

  private loadSession(): AuthSession | null {
    try {
      const stored = localStorage.getItem(SESSION_STORAGE_KEY);
      if (stored) {
        const parsed: AuthSession = JSON.parse(stored);
        if (new Date(parsed.expires_at).getTime() > Date.now()) {
          return parsed;
        }
      }
    } catch {}
    return null;
  }

  private saveSession(session: AuthSession | null) {
    this.currentSession = session;
    try {
      if (session) {
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
      } else {
        localStorage.removeItem(SESSION_STORAGE_KEY);
      }
    } catch (e) {
      console.error('Failed to save session:', e);
    }
    this.notify(session?.user || null);
  }

  public subscribe(cb: AuthListener): () => void {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  private notify(user: AuthUser | null) {
    this.listeners.forEach((cb) => {
      try {
        cb(user);
      } catch (err) {
        console.error('Error in auth listener:', err);
      }
    });
  }

  public getCurrentUser(): AuthUser | null {
    if (this.currentSession && new Date(this.currentSession.expires_at).getTime() > Date.now()) {
      return this.currentSession.user;
    }
    return null;
  }

  public getSession(): AuthSession | null {
    return this.currentSession;
  }

  // Login handler with role and tenant verification
  public async login(params: {
    email: string;
    password: string;
    targetRestaurantId?: string;
    requiredPortal?: 'admin' | 'kitchen' | 'superadmin';
  }): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
    const email = params.email.trim().toLowerCase();
    const password = params.password;

    if (!email || !password) {
      return { success: false, error: 'Please enter both email and password.' };
    }

    // 1. Check Super Admin credential
    if (email === 'admin@pentaprizm.app') {
      const expectedPass = this.userPasswords[email] || 'password123';
      if (password !== expectedPass) {
        return { success: false, error: 'Invalid email or password.' };
      }

      const superUser: AuthUser = {
        id: 'usr_super_admin',
        name: 'Platform Super Admin',
        email: 'admin@pentaprizm.app',
        role: 'super_admin',
        restaurant_id: null,
        branch_ids: []
      };

      const session: AuthSession = {
        token: `tok_sa_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        user: superUser,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      };

      this.saveSession(session);
      return { success: true, user: superUser };
    }

    // 2. Reject Super Admin portal access if not super admin
    if (params.requiredPortal === 'superadmin') {
      return { success: false, error: 'Access Denied: Only platform super administrators may access this portal.' };
    }

    // 3. Find staff member in database
    const allStaff = db.getStaff(params.targetRestaurantId || '');
    // If targetRestaurantId is provided, look in that tenant's staff, or search across restaurants if target is not locked
    let staffMember = allStaff.find((s) => s.email.toLowerCase() === email);

    if (!staffMember) {
      // Search all restaurants
      const allRests = db.getAllRestaurants();
      for (const r of allRests) {
        const found = db.getStaff(r.id).find((s) => s.email.toLowerCase() === email);
        if (found) {
          staffMember = found;
          break;
        }
      }
    }

    if (!staffMember) {
      return { success: false, error: 'No account found with this email address.' };
    }

    if (staffMember.status !== 'active') {
      return { success: false, error: 'This staff account has been deactivated. Please contact your restaurant administrator.' };
    }

    // Check password
    const expectedPassword = this.userPasswords[email] || 'password123';
    if (password !== expectedPassword) {
      return { success: false, error: 'Invalid password. Please check your credentials.' };
    }

    // Check tenant isolation if target restaurant is specified
    if (params.targetRestaurantId && staffMember.restaurant_id !== params.targetRestaurantId) {
      const rest = db.getRestaurantById(staffMember.restaurant_id);
      return {
        success: false,
        error: `This account belongs to "${rest?.name || 'another restaurant'}". You cannot log into this restaurant.`
      };
    }

    const restaurant = db.getRestaurantById(staffMember.restaurant_id);
    if (!restaurant) {
      return { success: false, error: 'Restaurant record not found.' };
    }

    if (restaurant.status === 'suspended') {
      return { success: false, error: 'This restaurant tenant is currently suspended by platform administration.' };
    }

    // 4. Check portal authorization
    if (params.requiredPortal === 'admin') {
      // Must be restaurant_admin or manager
      if (staffMember.role !== 'restaurant_admin' && staffMember.role !== 'manager') {
        return {
          success: false,
          error: 'Access Denied: Kitchen staff accounts cannot access the Restaurant Admin dashboard. Please log in at /kitchen.'
        };
      }
    } else if (params.requiredPortal === 'kitchen') {
      // Must be kitchen_staff, manager, or restaurant_admin
      if (staffMember.role !== 'kitchen_staff' && staffMember.role !== 'manager' && staffMember.role !== 'restaurant_admin') {
        return {
          success: false,
          error: 'Access Denied: You do not have operational kitchen permissions for this restaurant.'
        };
      }
    }

    const authUser: AuthUser = {
      id: staffMember.id,
      name: staffMember.name,
      email: staffMember.email,
      role: staffMember.role,
      restaurant_id: staffMember.restaurant_id,
      branch_ids: staffMember.branch_ids,
      restaurant_name: restaurant.name
    };

    const session: AuthSession = {
      token: `tok_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      user: authUser,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    };

    this.saveSession(session);
    return { success: true, user: authUser };
  }

  // Register a new restaurant tenant and admin account
  public async registerRestaurantAdmin(params: {
    name: string;
    email: string;
    password: string;
    restaurantName: string;
    subdomain: string;
    planId?: string;
  }): Promise<{ success: boolean; user?: AuthUser; restaurant?: Restaurant; error?: string }> {
    const email = params.email.trim().toLowerCase();
    const name = params.name.trim();
    const restaurantName = params.restaurantName.trim();
    const subdomain = params.subdomain.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');

    if (!name || !email || !params.password || !restaurantName || !subdomain) {
      return { success: false, error: 'Please fill in all required registration fields.' };
    }

    if (params.password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters long.' };
    }

    // Check if subdomain is already used
    const existing = db.getAllRestaurants().find((r) => r.subdomain === subdomain || r.slug === subdomain);
    if (existing) {
      return { success: false, error: `Subdomain "${subdomain}" is already registered. Please choose another.` };
    }

    // Check if email already exists
    const existingStaff = db.getStaff('').find((s) => s.email.toLowerCase() === email);
    if (existingStaff) {
      return { success: false, error: 'An account with this email address already exists. Please sign in instead.' };
    }

    try {
      const newRestaurant = db.createTenant({
        name: restaurantName,
        slug: subdomain,
        subdomain,
        planId: params.planId || 'plan_growth',
        adminName: name,
        adminEmail: email
      });

      // Save password
      this.userPasswords[email] = params.password;
      this.savePasswords();

      // Find the newly created admin staff
      const staffList = db.getStaff(newRestaurant.id);
      const adminStaff = staffList.find((s) => s.email.toLowerCase() === email);

      const authUser: AuthUser = {
        id: adminStaff?.id || `stf_${Date.now()}`,
        name,
        email,
        role: 'restaurant_admin',
        restaurant_id: newRestaurant.id,
        branch_ids: [],
        restaurant_name: newRestaurant.name
      };

      const session: AuthSession = {
        token: `tok_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        user: authUser,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      };

      this.saveSession(session);
      return { success: true, user: authUser, restaurant: newRestaurant };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to register restaurant.' };
    }
  }

  public logout() {
    this.saveSession(null);
  }
}

export const auth = new AuthService();
