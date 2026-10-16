import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { orderService } from '../services/orderService.js';
import { OrderStatus } from '../types.js';

export const kitchenController = {
  // GET /api/kitchen/orders
  async getActiveOrders(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const restaurantId = req.user?.restaurant_id;
      if (!restaurantId) return res.status(400).json({ error: 'No restaurant assigned to kitchen user' });

      const allOrders = await orderService.getOrders(restaurantId);
      // Filter for active kitchen ticket statuses
      const activeKitchenStatuses: OrderStatus[] = ['pending', 'accepted', 'preparing', 'ready'];
      const orders = allOrders.filter(o => activeKitchenStatuses.includes(o.status));

      res.json({ orders });
    } catch (err) {
      next(err);
    }
  },

  // PATCH /api/kitchen/orders/:id/status
  async updateOrderStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id: orderId } = req.params;
      const { status, note } = req.body;

      const allowedStatuses: OrderStatus[] = ['accepted', 'preparing', 'ready', 'served'];
      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({ error: `Kitchen cannot set status to '${status}'` });
      }

      const updated = await orderService.updateOrderStatus(
        orderId,
        status,
        note || `Status updated to ${status} by Kitchen staff`,
        req.user?.name || 'Kitchen Display System'
      );

      if (!updated) {
        return res.status(404).json({ error: 'Order not found' });
      }

      res.json({ order: updated });
    } catch (err) {
      next(err);
    }
  }
};
