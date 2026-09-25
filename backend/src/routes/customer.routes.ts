import { Router } from 'express';
import {
  createCustomer,
  deleteCustomer,
  getCustomer,
  listCustomers,
  updateCustomer
} from '../controllers/customer.controller';
import { requireAdmin } from '../middleware/auth';

export const customerRouter = Router();

customerRouter.get('/', requireAdmin, listCustomers);
customerRouter.get('/:id', requireAdmin, getCustomer);
customerRouter.post('/', createCustomer);
customerRouter.put('/:id', requireAdmin, updateCustomer);
customerRouter.delete('/:id', requireAdmin, deleteCustomer);

