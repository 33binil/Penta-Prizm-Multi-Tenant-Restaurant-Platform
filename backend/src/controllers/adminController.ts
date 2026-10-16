import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { restaurantService } from '../services/restaurantService.js';
import { menuService } from '../services/menuService.js';
import { orderService } from '../services/orderService.js';
import { qrService } from '../services/qrService.js';
import { RestaurantTable } from '../types.js';

export const adminController = {
  // GET /api/admin/dashboard
  async getDashboard(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const restaurantId = req.user?.restaurant_id;
      if (!restaurantId) {
        return res.status(400).json({ error: 'User is not associated with a restaurant' });
      }

      const [restaurant, orders, { tables, branches }, qrTokens] = await Promise.all([
        restaurantService.getRestaurantById(restaurantId),
        orderService.getOrders(restaurantId),
        restaurantService.getBranchesAndTables(restaurantId),
        qrService.getQRTokens(restaurantId)
      ]);

      const today = new Date().toISOString().split('T')[0];
      const todayOrders = orders.filter(o => o.created_at.startsWith(today));
      const todaySales = todayOrders.reduce((sum, o) => sum + o.total, 0);

      res.json({
        restaurant,
        metrics: {
          totalOrders: orders.length,
          todayOrders: todayOrders.length,
          todaySales,
          activeTablesCount: tables.filter(t => t.status === 'active').length,
          totalTablesCount: tables.length,
          branchesCount: branches.length
        },
        recentOrders: orders.slice(0, 10),
        branches,
        tables,
        qrTokens
      });
    } catch (err) {
      next(err);
    }
  },

  // GET /api/admin/menu
  async getMenu(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const restaurantId = req.user?.restaurant_id;
      if (!restaurantId) return res.status(400).json({ error: 'No restaurant assigned' });

      const [categories, items] = await Promise.all([
        menuService.getAllCategories(restaurantId),
        menuService.getAllItems(restaurantId)
      ]);

      res.json({ categories, items });
    } catch (err) {
      next(err);
    }
  },

  // POST /api/admin/menu
  async createMenuItem(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const restaurantId = req.user?.restaurant_id;
      if (!restaurantId) return res.status(400).json({ error: 'No restaurant assigned' });

      const newItem = await menuService.createMenuItem({
        ...req.body,
        restaurant_id: restaurantId
      });

      res.status(201).json({ item: newItem });
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Failed to create menu item' });
    }
  },

  // PATCH /api/admin/menu/:id
  async updateMenuItem(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const updated = await menuService.updateMenuItem(id, req.body);
      if (!updated) return res.status(404).json({ error: 'Menu item not found' });
      res.json({ item: updated });
    } catch (err) {
      next(err);
    }
  },

  // DELETE /api/admin/menu/:id
  async deleteMenuItem(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const success = await menuService.deleteMenuItem(id);
      if (!success) return res.status(404).json({ error: 'Menu item not found' });
      res.json({ success: true, message: 'Menu item deleted' });
    } catch (err) {
      next(err);
    }
  },

  // GET /api/admin/branches
  async getBranches(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const restaurantId = req.user?.restaurant_id;
      if (!restaurantId) return res.status(400).json({ error: 'No restaurant assigned' });

      const { branches } = await restaurantService.getBranchesAndTables(restaurantId);
      res.json({ branches });
    } catch (err) {
      next(err);
    }
  },

  // GET /api/admin/tables
  async getTables(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const restaurantId = req.user?.restaurant_id;
      if (!restaurantId) return res.status(400).json({ error: 'No restaurant assigned' });

      const [{ tables }, qrTokens] = await Promise.all([
        restaurantService.getBranchesAndTables(restaurantId),
        qrService.getQRTokens(restaurantId)
      ]);

      res.json({ tables, qrTokens });
    } catch (err) {
      next(err);
    }
  },

  // POST /api/admin/tables
  async createTable(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const restaurantId = req.user?.restaurant_id;
      if (!restaurantId) return res.status(400).json({ error: 'No restaurant assigned' });

      const newTable: RestaurantTable = {
        id: `tbl_${Date.now().toString(36)}`,
        restaurant_id: restaurantId,
        branch_id: req.body.branchId || req.body.branch_id,
        table_number: req.body.tableNumber || req.body.table_number,
        label: req.body.label || `Table ${req.body.tableNumber}`,
        capacity: Number(req.body.capacity) || 4,
        location_area: req.body.locationArea || 'indoor',
        status: 'active',
        created_at: new Date().toISOString()
      };

      const table = await restaurantService.createTable(newTable);
      res.status(201).json({ table });
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Failed to create table' });
    }
  },

  // POST /api/admin/tables/:id/qr
  async generateTableQR(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const restaurantId = req.user?.restaurant_id;
      if (!restaurantId) return res.status(400).json({ error: 'No restaurant assigned' });

      const { id: tableId } = req.params;
      const { tables } = await restaurantService.getBranchesAndTables(restaurantId);
      const table = tables.find(t => t.id === tableId);
      if (!table) return res.status(404).json({ error: 'Table not found' });

      const restaurant = await restaurantService.getRestaurantById(restaurantId);
      if (!restaurant) return res.status(404).json({ error: 'Restaurant not found' });

      const qrToken = await qrService.generateTableQR({
        restaurantId,
        branchId: table.branch_id,
        tableId: table.id,
        restaurantSlug: restaurant.slug,
        tableNumber: table.table_number
      });

      res.json({ qrToken });
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Failed to generate QR' });
    }
  },

  // GET /api/admin/orders
  async getOrders(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const restaurantId = req.user?.restaurant_id;
      if (!restaurantId) return res.status(400).json({ error: 'No restaurant assigned' });

      const orders = await orderService.getOrders(restaurantId);
      res.json({ orders });
    } catch (err) {
      next(err);
    }
  },

  // PATCH /api/admin/orders/:id/status
  async updateOrderStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id: orderId } = req.params;
      const { status, note } = req.body;
      const updated = await orderService.updateOrderStatus(orderId, status, note, req.user?.name);
      if (!updated) return res.status(404).json({ error: 'Order not found' });
      res.json({ order: updated });
    } catch (err) {
      next(err);
    }
  },

  // PATCH /api/admin/restaurant
  async updateRestaurant(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const restaurantId = req.user?.restaurant_id;
      if (!restaurantId) return res.status(400).json({ error: 'No restaurant assigned' });

      const updated = await restaurantService.updateRestaurant(restaurantId, req.body);
      res.json({ restaurant: updated });
    } catch (err) {
      next(err);
    }
  }
};
