import { Request, Response, NextFunction } from 'express';
import { supabaseClient } from '../config/supabase.js';
import { authService } from '../services/authService.js';
import { StaffRole } from '../types.js';

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  role: StaffRole;
  restaurant_id: string | null;
  branch_ids: string[];
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

export async function verifyAuthToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or malformed Authorization header' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // 1. Try Supabase Auth token verification if client is configured
    if (supabaseClient) {
      const { data: { user: sbUser }, error } = await supabaseClient.auth.getUser(token);
      if (!error && sbUser) {
        // Resolve staff profile
        const staffProfile = await authService.resolveStaffProfileByEmail(sbUser.email || '');
        if (staffProfile) {
          req.user = staffProfile;
          return next();
        }
      }
    }

    // 2. Fallback to application internal verified sessions / service tokens
    const appUser = await authService.verifySessionToken(token);
    if (appUser) {
      req.user = appUser;
      return next();
    }

    return res.status(401).json({ error: 'Invalid, revoked, or expired authentication token' });
  } catch (err: any) {
    return res.status(401).json({ error: 'Authentication verification failed', details: err?.message });
  }
}

export function requireRole(...allowedRoles: StaffRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized: Authentication required' });
    }

    // Super Admin has universal authorization across all tenants
    if (req.user.role === 'super_admin') {
      return next();
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Forbidden: Role '${req.user.role}' lacks required permissions (${allowedRoles.join(', ')})`
      });
    }

    next();
  };
}

export function requireTenantAccess(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized: Authentication required' });
  }

  if (req.user.role === 'super_admin') {
    return next();
  }

  const requestedTenant =
    req.params.restaurantId ||
    req.query.restaurantId ||
    req.query.restaurant_id ||
    req.body.restaurantId ||
    req.body.restaurant_id ||
    req.headers['x-restaurant-id'];

  if (requestedTenant && req.user.restaurant_id !== requestedTenant) {
    return res.status(403).json({
      error: 'Forbidden: Access denied to tenant outside your organization'
    });
  }

  next();
}
