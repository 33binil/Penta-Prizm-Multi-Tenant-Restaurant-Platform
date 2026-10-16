import { Router } from 'express';
import { authController } from '../controllers/authController.js';
import { verifyAuthToken } from '../middleware/auth.js';

export const authRouter = Router();

authRouter.post('/login', authController.login);
authRouter.post('/register', authController.register);
authRouter.post('/logout', authController.logout);
authRouter.get('/me', verifyAuthToken, authController.me);
