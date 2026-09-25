import { Router } from 'express';
import {
  createProduct,
  deleteProduct,
  getProduct,
  listProducts,
  updateProduct
} from '../controllers/product.controller';
import { requireAdmin } from '../middleware/auth';

export const productRouter = Router();

productRouter.get('/', listProducts);
productRouter.get('/:id', getProduct);
productRouter.post('/', requireAdmin, createProduct);
productRouter.put('/:id', requireAdmin, updateProduct);
productRouter.delete('/:id', requireAdmin, deleteProduct);

