import { Router } from 'express';
import {
  createCategory,
  deleteCategory,
  getCategory,
  listCategories,
  updateCategory
} from '../controllers/category.controller';
import { requireAdmin } from '../middleware/auth';

export const categoryRouter = Router();

categoryRouter.get('/', listCategories);
categoryRouter.get('/:id', getCategory);
categoryRouter.post('/', requireAdmin, createCategory);
categoryRouter.put('/:id', requireAdmin, updateCategory);
categoryRouter.delete('/:id', requireAdmin, deleteCategory);

