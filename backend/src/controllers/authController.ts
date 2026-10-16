import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/authService.js';
import { validateLoginInput, validateRegisterAdminInput } from '../validators/index.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

export const authController = {
  // POST /api/auth/login
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const validation = validateLoginInput(req.body);
      if (!validation.valid) {
        return res.status(400).json({ error: validation.error });
      }

      const { email, password, restaurantId } = req.body;
      const { token, user } = await authService.login(email, password, restaurantId);

      res.json({ token, user });
    } catch (err: any) {
      res.status(401).json({ error: err.message || 'Authentication failed' });
    }
  },

  // POST /api/auth/register (Restaurant Admin Onboarding Only)
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      if (req.body.role === 'kitchen_staff' || req.body.role === 'chef') {
        return res.status(403).json({
          error: 'Kitchen staff accounts cannot self-register. Please request an invitation from your restaurant administrator.'
        });
      }

      const validation = validateRegisterAdminInput(req.body);
      if (!validation.valid) {
        return res.status(400).json({ error: validation.error });
      }

      const result = await authService.registerAdmin(req.body);
      res.status(201).json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Registration failed' });
    }
  },

  // POST /api/auth/logout
  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        await authService.logout(token);
      }
      res.json({ success: true, message: 'Logged out successfully' });
    } catch (err) {
      next(err);
    }
  },

  // GET /api/auth/me
  async me(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }
      res.json({ user: req.user });
    } catch (err) {
      next(err);
    }
  }
};
