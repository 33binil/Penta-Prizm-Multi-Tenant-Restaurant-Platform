import { Router } from 'express';
import { adminController } from '../controllers/adminController.js';
import { verifyAuthToken, requireRole, requireTenantAccess } from '../middleware/auth.js';

export const adminRouter = Router();

// Protect all admin routes with authentication, tenant check, and role check
adminRouter.use(verifyAuthToken);
adminRouter.use(requireRole('restaurant_admin', 'manager', 'super_admin'));
adminRouter.use(requireTenantAccess);

// Dashboard
adminRouter.get('/dashboard', adminController.getDashboard);

// Menu CRUD
adminRouter.get('/menu', adminController.getMenu);
adminRouter.post('/menu', adminController.createMenuItem);
adminRouter.patch('/menu/:id', adminController.updateMenuItem);
adminRouter.delete('/menu/:id', adminController.deleteMenuItem);

// Branches and Tables
adminRouter.get('/branches', adminController.getBranches);
adminRouter.get('/tables', adminController.getTables);
adminRouter.post('/tables', adminController.createTable);
adminRouter.post('/tables/:id/qr', adminController.generateTableQR);

// Orders
adminRouter.get('/orders', adminController.getOrders);
adminRouter.patch('/orders/:id/status', adminController.updateOrderStatus);

// Restaurant profile updates
adminRouter.patch('/restaurant', adminController.updateRestaurant);
