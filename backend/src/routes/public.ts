import { Router } from 'express';
import { publicController } from '../controllers/publicController.js';

export const publicRouter = Router();

publicRouter.get('/restaurant', publicController.getRestaurant);
publicRouter.get('/website', publicController.getRestaurant);
publicRouter.post('/qr/validate', publicController.validateQR);
publicRouter.get('/menu', publicController.getMenu);
publicRouter.post('/orders', publicController.createOrder);
publicRouter.get('/orders/:trackingToken', publicController.getOrderByTrackingToken);
