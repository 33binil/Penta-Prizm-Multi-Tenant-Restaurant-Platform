import { Request, Response, NextFunction } from 'express';
import { restaurantService } from '../services/restaurantService.js';
import { qrService } from '../services/qrService.js';
import { menuService } from '../services/menuService.js';
import { orderService } from '../services/orderService.js';
import { validateQRTokenInput, validateOrderInput } from '../validators/index.js';

export const publicController = {
  // GET /api/public/restaurant or /api/public/website
  async getRestaurant(req: Request, res: Response, next: NextFunction) {
    try {
      const hostname = (req.query.hostname as string) || req.hostname;
      const slug = (req.query.slug as string) || (req.query.tenant as string);
      const restaurantId = req.query.restaurantId as string;

      const restaurant = await restaurantService.resolveTenant({ hostname, slug, restaurantId });
      if (!restaurant) {
        return res.status(404).json({ error: 'Restaurant tenant not found' });
      }

      res.json({ restaurant });
    } catch (err) {
      next(err);
    }
  },

  // POST /api/public/qr/validate
  async validateQR(req: Request, res: Response, next: NextFunction) {
    try {
      const validation = validateQRTokenInput(req.body);
      if (!validation.valid) {
        return res.status(400).json({ error: validation.error });
      }

      const session = await qrService.validateQRToken(req.body.token);
      res.json({ session });
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'QR Validation failed' });
    }
  },

  // GET /api/public/menu?restaurantId=...
  async getMenu(req: Request, res: Response, next: NextFunction) {
    try {
      const restaurantId = (req.query.restaurantId || req.query.restaurant_id) as string;
      if (!restaurantId) {
        return res.status(400).json({ error: 'restaurantId is required' });
      }

      const { categories, items } = await menuService.getPublicMenu(restaurantId);
      res.json({ categories, items });
    } catch (err) {
      next(err);
    }
  },

  // POST /api/public/orders
  async createOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const validation = validateOrderInput(req.body);
      if (!validation.valid) {
        return res.status(400).json({ error: validation.error });
      }

      const order = await orderService.createOrder(req.body);
      res.status(201).json({ order, trackingUrl: `/track/${order.tracking_token}` });
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Order creation failed' });
    }
  },

  // GET /api/public/orders/:trackingToken
  async getOrderByTrackingToken(req: Request, res: Response, next: NextFunction) {
    try {
      const { trackingToken } = req.params;
      const order = await orderService.getOrderByTrackingToken(trackingToken);
      if (!order) {
        return res.status(404).json({ error: 'Order not found with provided tracking token' });
      }
      res.json({ order });
    } catch (err) {
      next(err);
    }
  }
};
