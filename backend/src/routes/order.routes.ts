import { Router } from 'express';
import {
  createOrder,
  getOrder,
  listOrders,
  trackOrder,
  updateOrderStatus
} from '../controllers/order.controller';
import { requireAdmin } from '../middleware/auth';

export const orderRouter = Router();

orderRouter.get('/', requireAdmin, listOrders);
orderRouter.get('/track', trackOrder);
orderRouter.get('/:id', requireAdmin, getOrder);
orderRouter.post('/', createOrder);
orderRouter.patch('/:id/status', requireAdmin, updateOrderStatus);

