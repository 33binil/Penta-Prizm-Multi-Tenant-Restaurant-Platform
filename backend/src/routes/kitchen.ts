import { Router } from 'express';
import { kitchenController } from '../controllers/kitchenController.js';
import { verifyAuthToken, requireRole, requireTenantAccess } from '../middleware/auth.js';

export const kitchenRouter = Router();

// Protect all kitchen routes
kitchenRouter.use(verifyAuthToken);
kitchenRouter.use(requireRole('kitchen_staff', 'manager', 'restaurant_admin', 'super_admin'));
kitchenRouter.use(requireTenantAccess);

kitchenRouter.get('/orders', kitchenController.getActiveOrders);
kitchenRouter.patch('/orders/:id/status', kitchenController.updateOrderStatus);
