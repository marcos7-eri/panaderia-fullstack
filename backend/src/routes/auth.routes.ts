import { Router } from 'express';
import { currentUser, login } from '../controllers/auth.controller';
import { requireAdmin } from '../middleware/auth';

export const authRouter = Router();

authRouter.post('/login', login);
authRouter.get('/me', requireAdmin, currentUser);

