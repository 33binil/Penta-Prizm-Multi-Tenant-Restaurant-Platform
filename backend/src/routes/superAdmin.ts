import { Router } from 'express';
import { superAdminController } from '../controllers/superAdminController.js';
import { verifyAuthToken, requireRole } from '../middleware/auth.js';

export const superAdminRouter = Router();

// Protect all super admin routes strictly for role 'super_admin'
superAdminRouter.use(verifyAuthToken);
superAdminRouter.use(requireRole('super_admin'));

superAdminRouter.get('/restaurants', superAdminController.getRestaurants);
superAdminRouter.post('/restaurants', superAdminController.createRestaurant);
superAdminRouter.patch('/restaurants/:id', superAdminController.updateRestaurant);
superAdminRouter.get('/metrics', superAdminController.getMetrics);
superAdminRouter.get('/plans', superAdminController.getPlans);
